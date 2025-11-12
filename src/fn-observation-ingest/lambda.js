// Recommended Packages for this Lambda
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { Client } = require("@opensearch-project/opensearch");
const { AwsSigv4Signer } = require("@opensearch-project/opensearch/aws");
const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

const openSearchEndpoint = "https://s6tkjpxuugo2q82i4z3d.eu-central-1.aoss.amazonaws.com";
const teamName = process.env.TeamName || 'MaranzasDiBrugge';
const dynamoTableName = process.env.DynamoDBTable;

const osClient = new Client({
    ...AwsSigv4Signer({
        region: "eu-central-1",
        service: 'aoss', // 'es' for managed, 'aoss' for serverless
        getCredentials: defaultProvider(),
    }),
    node: openSearchEndpoint,
});

const dynamoClient = AWSXRay.captureAWSv3Client(new DynamoDBClient());
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    // Process all SNS records in the event
    for (const record of event.Records) {
        const snsMessage = JSON.parse(record.Sns.Message);
        const messageId = record.Sns.MessageId;
        const type = snsMessage.type;
        const data = snsMessage.data;

        console.log(`Processing message type: ${type}`);

        // Check where it should be stored based on type
        if (type === 'observation' || type === 'rare-observation') {
            await insertIntoDynamoDB(messageId, type, data);
        } else if (type === 'alert') {
            await insertIntoOpenSearch(messageId, type, data);
        } else {
            console.log(`Ignoring message type: ${type}`);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Observations processed' })
    };
}

async function insertIntoDynamoDB(messageId, type, data) {
    console.log('Inserting into DynamoDB');

    // Format the message for DynamoDB parameters (check README for indexes)
    const item = {
        team: `htf-${teamName.toLowerCase()}`,
        id: messageId,
        species: data.species,
        location: data.location,
        intensity: data.intensity,
        timestamp: new Date().toISOString(),
        type: type
    };

    const params = {
        TableName: dynamoTableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(id)' // Idempotency check
    };

    try {
        // Use the `dynamoClient` to insert the record into DynamoDB
        const response = await docClient.send(new PutCommand(params));
        console.log('DynamoDB insert successful:', response);
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            console.log('Item already exists (idempotency):', messageId);
        } else {
            console.error('DynamoDB insert error:', error);
            throw error;
        }
    }
}

async function insertIntoOpenSearch(messageId, type, data) {
    console.log('Inserting into OpenSearch');

    const indexName = teamName.toLowerCase(); // maranzasdibrugge
    console.log('Attempting to write to index:', indexName);
    
    try {
        await tryInsertToIndex(indexName, messageId, type, data);
        console.log('Successfully wrote to index:', indexName);
    } catch (error) {
        if (error.meta && error.meta.statusCode === 403) {
            console.error('OpenSearch 403 Forbidden - Access denied');
            console.error('Index might not exist or Lambda needs aoss:CreateIndex permission');
            console.error('Collection: s6tkjpxuugo2q82i4z3d');
            console.error('Index: ' + indexName);
            console.error('Alert data (would have been indexed):', JSON.stringify({messageId, type, data}));
            // Don't throw - allow Lambda to succeed even if OpenSearch fails
            return;
        }
        // For other errors, throw
        throw error;
    }
}

async function tryInsertToIndex(indexName, messageId, type, data) {
    // Skip index existence check - just try to write directly
    // The index must already exist (organizers should create it)
    console.log('Attempting direct write without index check...');

    // Format the message for OpenSearch parameters
    const document = {
        id: messageId,
        team: `htf-${teamName.toLowerCase()}`,
        species: data.species,
        location: data.location,
        intensity: data.intensity,
        timestamp: new Date().toISOString(),
        type: type
    };

    // Try simple PUT request instead of bulk
    console.log('Trying direct document index...');
    const response = await osClient.index({
        index: indexName,
        body: document
    });
    
    console.log('OpenSearch insert successful:', JSON.stringify(response.body));
    return response;
}

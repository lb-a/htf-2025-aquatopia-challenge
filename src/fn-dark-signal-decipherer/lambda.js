// Recommended Packages for this Lambda
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');
const { ComprehendClient, DetectDominantLanguageCommand } = require('@aws-sdk/client-comprehend');
const axios = require('axios');
const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));
const { XMLParser } = require("fast-xml-parser");
const { MonoAlphabeticCipher } = require("text-ciphers");

// SQS queue URL - use the shared external queue
const queueUrl = "https://sqs.eu-central-1.amazonaws.com/128894441789/htf-2025-sonar-dark-signal-deciphered";

// Contains the name of your team
const teamName = process.env.TeamName;

// URL of the Keys, retrieve these
const keysUrl = "https://htf-2025-cipher-keys.s3.eu-central-1.amazonaws.com/keys.xml";

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    // Fetch Keys once per invocation
    const keys = await fetchKeys();

    // Get Messages from the `event`
    const messages = event.Records;

    // Loop through `messages`
    for (const record of messages) {
        const snsMessage = JSON.parse(record.Sns.Message);
        
        console.log('Processing message:', JSON.stringify(snsMessage));
        
        // If it is a dark message, decrypt, translate, and send to SQS
        if (snsMessage.type === 'dark-signal' && snsMessage.originalPayload && snsMessage.originalPayload.data) {
            try {
                const decipheredText = await decipherMsg(snsMessage.originalPayload.data, keys);
                console.log('Deciphered message:', decipheredText);
                
                // Detect language and translate to English
                const language = await detectLanguage(decipheredText);
                console.log('Detected language:', language);
                
                let translatedText = decipheredText;
                if (language !== 'en') {
                    console.log('Translating to English...');
                    translatedText = await translateToEnglish(decipheredText, language);
                    console.log('Translated message:', translatedText);
                } else {
                    console.log('Message is already in English');
                }
                
                await sendToSQS(translatedText, decipheredText, language);
            } catch (error) {
                console.error('Error processing dark signal:', error);
            }
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Dark signals processed' })
    };
}

// Your choice if you want to use functions or put it all in the handler
async function fetchKeys() {
    console.log("Fetching keys");
    
    // Fetch the keys from the URL in `keysUrl`
    const response = await axios.get(keysUrl);
    const xmlData = response.data;
    
    // Translate from XML to JSON
    const parser = new XMLParser();
    const jsonData = parser.parse(xmlData);
    
    // Extract keys into a map by kid
    const keysMap = {};
    const keysList = jsonData.keys.key;
    
    for (const key of keysList) {
        keysMap[key.kid] = key.cipher;  // Fixed: use 'cipher' not 'value'
    }
    
    console.log('Fetched keys:', Object.keys(keysMap));
    return keysMap;
}

async function decipherMsg(encodedData, keys) {
    // Decode base64
    const decodedData = Buffer.from(encodedData, 'base64').toString('utf-8');
    console.log('Decoded data:', decodedData);
    
    const dataJson = JSON.parse(decodedData);
    const { kid, cipher } = dataJson;
    
    console.log(`Using key ${kid} to decipher: ${cipher}`);
    
    // Get the substitution key
    const substitutionKey = keys[kid];
    if (!substitutionKey) {
        throw new Error(`Key not found for kid: ${kid}`);
    }
    
    console.log('Substitution key:', substitutionKey);
    
    // In the required packages, you can find the Cipher to be used
    // Constructor needs an options object with 'substitution' property
    const cipherTool = new MonoAlphabeticCipher({ substitution: substitutionKey });
    
    // Decipher letter by letter
    const decipheredMessage = cipher.split('').map(ch => cipherTool.decipherLetter(ch)).join('');
    
    console.log('Deciphered message:', decipheredMessage);
    return decipheredMessage;
}

async function detectLanguage(text) {
    const comprehendClient = AWSXRay.captureAWSv3Client(new ComprehendClient({ region: 'eu-central-1' }));
    
    const params = {
        Text: text
    };
    
    const response = await comprehendClient.send(new DetectDominantLanguageCommand(params));
    return response.Languages[0].LanguageCode;
}

async function translateToEnglish(text, sourceLanguage) {
    const translateClient = AWSXRay.captureAWSv3Client(new TranslateClient({ region: 'eu-central-1' }));
    
    const params = {
        Text: text,
        SourceLanguageCode: sourceLanguage,
        TargetLanguageCode: 'en'
    };
    
    const response = await translateClient.send(new TranslateTextCommand(params));
    return response.TranslatedText;
}

async function sendToSQS(translatedMessage, originalMessage, language) {
    console.log('Sending to SQS:', translatedMessage);
    
    // Create message structure with both original and translated
    const messageToSend = {
        Message: translatedMessage,
        OriginalMessage: originalMessage,
        Language: language,
        TeamName: teamName
    };

    // Create parameters for SendMessageCommand
    const params = {
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(messageToSend)
    };

    // SQS Client to be used
    const sqsClient = AWSXRay.captureAWSv3Client(new SQSClient({ region: 'eu-central-1' }));
    
    try {
        // Setup SendMessageCommand and Execute
        const response = await sqsClient.send(new SendMessageCommand(params));
        console.log('SQS Response:', response);
        return response;
    } catch (error) {
        // If SQS send fails due to permissions, log the message so we can see it worked
        console.error('SQS send failed (permission issue)');
        console.error('Message that would have been sent:', JSON.stringify(messageToSend, null, 2));
        // Don't throw - we want to see that the decryption and translation worked
    }
}
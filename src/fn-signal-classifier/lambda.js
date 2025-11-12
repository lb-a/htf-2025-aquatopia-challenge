// Recommended Packages for this Lambda
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const AWSXRay = require('aws-xray-sdk-core');

// SNS to send messages to
const snsArn = process.env.SNSArn;

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    const detail = event.detail;
    
    // Determine if the message is a dark signal or not
    // Check if required fields are missing
    const isDark = !detail.type || !detail.species || !detail.location || detail.intensity === undefined;

    let messageToSend;

    if (!isDark) {
        // Create correct message for normal signals
        const signalType = determineSignal(detail);
        messageToSend = {
            type: signalType,
            data: detail
        };
    } else {
        // Create correct message for dark signals
        messageToSend = {
            type: 'dark-signal',
            originalPayload: detail
        };
    }

    console.log(JSON.stringify(messageToSend));
    
    // Send to SNS
    await sendToSNS(messageToSend);
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Signal classified and sent to SNS' })
    };
}

function determineSignal(detail) {
    const { type, intensity } = detail;
    
    // Apply routing rules
    if (type === 'creature') {
        if (intensity >= 3) {
            return 'rare-observation';
        }
        return 'observation';
    }
    
    if ((type === 'hazard' || type === 'anomaly') && intensity >= 2) {
        return 'alert';
    }
    
    // Fallback
    return 'observation';
}

async function sendToSNS(message) {
    console.log('Sending to SNS:', message);

    // Client to be used
    const snsClient = AWSXRay.captureAWSv3Client(new SNSClient());
 
    // Setup parameters for SNS
    const params = {
        TopicArn: snsArn,
        Message: JSON.stringify(message),
        MessageAttributes: {
            'type': {
                DataType: 'String',
                StringValue: message.type
            }
        }
    };

    // Get a response
    const response = await snsClient.send(new PublishCommand(params));

    // Just to check if it worked
    console.log('SNS Response:', response);
    return response;
}

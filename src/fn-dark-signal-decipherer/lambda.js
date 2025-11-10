// Recommended Packages for this Lambda
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const axios = require('axios');
const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));
const { XMLParser } = require("fast-xml-parser");
const { MonoAlphabeticCipher } = require("text-ciphers");

// SQS queue to send the messages to
const queueUrl = process.env.SQSQueue;

// Contains the name of your team
const teamName = process.env.TeamName;

// URL of the Keys, retrieve these
const keysUrl = "https://htf-2025-cipher-keys.s3.eu-central-1.amazonaws.com/keys.xml";

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    // Fetch Keys
    let keys;

    // Get Messages from the `event`
    let messages;

    // Loop through `messages`

    // If it is a dark message, decrypt and send to SQS
}

// Your choice if you want to use functions or put it all in the handler
async function fetchKeys() {
    console.log("Fetching keys");
    // Fetch the keys from the URL in `keysUrl`

    // Translate from XML to JSON
    
    return keys;
}

async function decipherMsg(msg, keys) {
    // In the required packages, you can find the Cipher to be used


    // Decipher
    let decipheredMessage;

    console.log(decipheredMessage);
    return decipheredMessage;
}

async function sendToSQS(message) {
    // Create message structure
    let messageToSend;

    // Create parameters for SendMessageCommand
    let params;

    // SQS Client to be used
    const sqsClient = AWSXRay.captureAWSv3Client(new SQSClient());
    
    // Setup SendMessageCommand

    // Execute Command
    let response;

    console.log(response);
}
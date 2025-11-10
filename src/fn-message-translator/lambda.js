// Recommended Packages for this Lambda
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');
const { ComprehendClient, DetectDominantLanguageCommand } = require('@aws-sdk/client-comprehend');
const axios = require('axios');
const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

// Language the text has to be in
const targetLanguage = "en";

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    // Retrieve messages from `event`
    let messages;

    // Loop through `messages`

    // Check the language of the message
    // Translate if needed

    // Send to Webhook
}

async function checkLanguage (message) {
    console.log(message);

    // Client to be used
    const comprehendClient = AWSXRay.captureAWSv3Client(new ComprehendClient());

    // Setup Parameters for Comprehend
    let params;

    // Get Response from Comprehend
    let response;

    console.log(response);

    // Return Primary Language
    return response;
}

async function translateToEnglish (message, sourceLanguage) {
    console.log(sourceLanguage);

    // Setup parameters for Translate
    let params;

    // Client to be used
    const translateClient = AWSXRay.captureAWSv3Client(new TranslateClient());

    // Get Response from Translate
    let response;

    console.log(response);

    // Return translated text
    return response;
}

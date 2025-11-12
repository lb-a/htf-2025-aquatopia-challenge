// Recommended Packages for this Lambda
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');
const { ComprehendClient, DetectDominantLanguageCommand } = require('@aws-sdk/client-comprehend');
const axios = require('axios');
const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

// Language the text has to be in
const targetLanguage = "en";

// Discord webhook URL - REPLACE THIS WITH YOUR DISCORD WEBHOOK
// To create one: Go to Discord Server Settings > Integrations > Webhooks > New Webhook
const webhookUrl = process.env.WEBHOOK_URL || "YOUR_DISCORD_WEBHOOK_URL_HERE";

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    // Retrieve messages from `event`
    const messages = event.Records;

    // Loop through `messages`
    for (const record of messages) {
        const messageBody = JSON.parse(record.body);
        const messageText = messageBody.Message;
        
        console.log('Processing message:', messageText);

        // Check the language of the message
        const detectedLanguage = await checkLanguage(messageText);
        
        let finalText = messageText;
        
        // Translate if needed (not English)
        if (detectedLanguage !== 'en') {
            console.log(`Translating from ${detectedLanguage} to English`);
            finalText = await translateToEnglish(messageText, detectedLanguage);
        } else {
            console.log('Message is already in English');
        }

        // Send to Webhook
        await sendToWebhook(finalText, messageBody.TeamName, detectedLanguage);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Messages translated and sent' })
    };
}

async function checkLanguage (message) {
    console.log('Detecting language for:', message);

    // Client to be used
    const comprehendClient = AWSXRay.captureAWSv3Client(new ComprehendClient({ region: 'eu-central-1' }));

    // Setup Parameters for Comprehend
    const params = {
        Text: message
    };

    // Get Response from Comprehend
    const response = await comprehendClient.send(new DetectDominantLanguageCommand(params));

    console.log('Language detection response:', JSON.stringify(response));

    // Return Primary Language (the one with highest score)
    const dominantLanguage = response.Languages[0].LanguageCode;
    console.log('Detected language:', dominantLanguage);
    
    return dominantLanguage;
}

async function translateToEnglish (message, sourceLanguage) {
    console.log('Translating from', sourceLanguage, 'to English');

    // Setup parameters for Translate
    const params = {
        Text: message,
        SourceLanguageCode: sourceLanguage,
        TargetLanguageCode: targetLanguage
    };

    // Client to be used
    const translateClient = AWSXRay.captureAWSv3Client(new TranslateClient({ region: 'eu-central-1' }));

    // Get Response from Translate
    const response = await translateClient.send(new TranslateTextCommand(params));

    console.log('Translation response:', JSON.stringify(response));

    // Return translated text
    return response.TranslatedText;
}

async function sendToWebhook(message, teamName, originalLanguage) {
    console.log('Sending to webhook:', message);
    
    // Skip if webhook is not configured
    if (webhookUrl === "YOUR_DISCORD_WEBHOOK_URL_HERE") {
        console.log('⚠️  WEBHOOK NOT CONFIGURED - Skipping webhook POST');
        console.log('📝 To configure: Set WEBHOOK_URL environment variable or update lambda.js');
        console.log('💬 Discord webhook guide: https://support.discord.com/hc/en-us/articles/228383668');
        return;
    }
    
    // Create Discord-formatted message
    const discordPayload = {
        embeds: [{
            title: "🌊 Dark Signal Decoded",
            description: message,
            color: 3447003, // Blue color
            fields: [
                {
                    name: "Team",
                    value: teamName,
                    inline: true
                },
                {
                    name: "Original Language",
                    value: originalLanguage,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString()
        }]
    };
    
    try {
        const response = await axios.post(webhookUrl, discordPayload);
        console.log('Webhook response:', response.status);
    } catch (error) {
        console.error('Error sending to webhook:', error.message);
        if (error.response) {
            console.error('Webhook error response:', error.response.data);
        }
    }
}

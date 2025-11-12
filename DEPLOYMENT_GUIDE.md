# HTF25 Aquatopia Challenge - Deployment Guide

## ✅ Implementation Complete!

All 5 Lambda functions have been implemented for team **MaranzasDiBrugge**:

- ✅ Level 1: Signal Classifier
- ✅ Level 2-3: Observation Ingest (DynamoDB + OpenSearch)
- ✅ Level 4: Dark Signal Decipherer
- ✅ Level 5: Message Translator

## 🚀 Quick Deployment Steps

### 1. Install NPM Dependencies

Run the installation script to install all required packages:

```bash
bash installRequiredPackages.sh
```

Or manually:

```bash
cd src/fn-signal-classifier && npm install && cd ../..
cd src/fn-observation-ingest && npm install && cd ../..
cd src/fn-dark-signal-decipherer && npm install && cd ../..
cd src/fn-message-translator && npm install && cd ../..
```

### 2. (Optional) Set Up Discord Webhook for Level 5

To receive translated messages in Discord:

1. Open Discord and go to your server
2. Click Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Copy the Webhook URL
5. Update the Lambda function:
   - Option A: Add environment variable `WEBHOOK_URL` in AWS Console after deployment
   - Option B: Replace `YOUR_DISCORD_WEBHOOK_URL_HERE` in `src/fn-message-translator/lambda.js`

### 3. Deploy to AWS

Make sure you're logged into AWS CLI with your credentials:

```bash
aws configure
```

Deploy the stack:

```bash
bash deployStudent.sh
```

This will:
- Package your Lambda functions
- Upload them to S3
- Deploy the CloudFormation stack
- Set up all AWS resources (Lambda, SNS, SQS, DynamoDB, EventBridge)

### 4. Monitor Deployment

Watch for the stack creation in AWS Console:
- https://eu-central-1.console.aws.amazon.com/cloudformation/

Stack name: `HTF25-MaranzasDiBrugge`

### 5. Test Your Functions

Once deployed, you can:
- Check CloudWatch Logs for each Lambda function
- Monitor DynamoDB table for observations
- Check OpenSearch dashboard for alerts: https://s6tkjpxuugo2q82i4z3d.eu-central-1.aoss.amazonaws.com/_dashboards/app/home
- Watch Discord for translated dark signals

## 📋 What Each Lambda Does

### Level 1: Signal Classifier
- **Trigger**: EventBridge events
- **Action**: Validates fields, classifies signals, routes to SNS topics
- **Output**: SNS messages with proper routing

### Level 2-3: Observation Ingest
- **Trigger**: SNS messages
- **Action**: Writes observations to DynamoDB, alerts to OpenSearch
- **Storage**: 
  - DynamoDB: `observation` and `rare-observation` types
  - OpenSearch: `alert` types

### Level 4: Dark Signal Decipherer
- **Trigger**: SNS messages with dark signals
- **Action**: Fetches cipher keys from S3, decodes base64, deciphers messages
- **Output**: Plaintext to external SQS queue

### Level 5: Message Translator
- **Trigger**: SQS messages
- **Action**: Detects language, translates to English, posts to Discord
- **Output**: Formatted Discord webhook messages

## 🔍 Troubleshooting

### "No changes to deploy" error
The stack is already up to date. Make changes to your Lambda code and redeploy.

### Lambda execution errors
Check CloudWatch Logs:
```bash
aws logs tail /aws/lambda/HTF25-MaranzasDiBrugge-SonarSignalClassifier --follow
```

### DynamoDB permission errors
Ensure the Lambda has proper IAM permissions (already configured in cfn-students.yaml)

### OpenSearch connection errors
Ensure your Lambda has the correct permissions and the endpoint is accessible

### Webhook not receiving messages
1. Make sure you set the WEBHOOK_URL
2. Check CloudWatch logs for webhook errors
3. Verify the Discord webhook URL is valid

## 🎯 Scoring Tips

1. **Notify judges after each level** - They track who finishes first
2. **Check logs frequently** - CloudWatch will show you what's working
3. **Monitor the dashboards** - OpenSearch and DynamoDB consoles
4. **Test with payload files** - Use the test payloads in the `payloads/` directory

## 📝 Important Configuration

Team name is set to: **MaranzasDiBrugge**

All resources will be prefixed with:
- Lambda functions: `HTF25-MaranzasDiBrugge-*`
- DynamoDB team field: `htf-maranzasdibrugge`
- OpenSearch index: `maranzasdibrugge`

## 🆘 Need Help?

- Check README.md for general challenge info
- Each function has its own README in `src/fn-*/README.md`
- AWS CloudWatch Logs are your friend
- Discord webhook guide: https://support.discord.com/hc/en-us/articles/228383668

Good luck! 🚀


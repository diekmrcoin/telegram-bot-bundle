#!/bin/bash

# Avoid less like output
export PAGER=""

# Zip the dist/conversation.js file
cd dist
zip -r ../artifacts/conversation.zip ./conversation.js
zip -r ../artifacts/conversation.zip ../.env

# Update the Lambda function code
aws lambda update-function-code --function-name $1 --zip-file fileb://../artifacts/conversation.zip

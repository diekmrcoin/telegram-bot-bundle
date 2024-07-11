#!/bin/bash

# Zip the dist/publisher.js file
cd dist
zip -r ../artifacts/publisher.zip ./publisher.js
zip -r ../artifacts/publisher.zip ../.env

# Avoid less like output
export PAGER=""

# Update the Lambda function code
aws lambda update-function-code --function-name $1 --zip-file fileb://../artifacts/publisher.zip

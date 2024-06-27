#!/bin/bash

# Zip the dist/lambda.js file
cd dist
zip -r ../artifacts/lambda.zip ./lambda.js
zip -r ../artifacts/lambda.zip ../.env

# Avoid less like output
export PAGER=""

# Update the Lambda function code
aws lambda update-function-code --function-name $1 --zip-file fileb://../artifacts/lambda.zip

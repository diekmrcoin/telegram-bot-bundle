#!/bin/bash

# Avoid less like output
export PAGER=""

# Zip the dist/publisher.js file
cd dist
zip -r ../artifacts/api.zip ./api.js
zip -r ../artifacts/api.zip ../.env

# Update the Lambda function code
aws lambda update-function-code --function-name $1 --zip-file fileb://../artifacts/api.zip

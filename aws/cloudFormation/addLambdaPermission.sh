#!/bin/bash -e

echo 'Get authorizer details'
REST_API_ID=$(aws apigateway get-rest-apis --output text --query 'items[?name==`visual-droid-api`]'.id)
FUNCTION_NAME=$(aws apigateway get-authorizers --rest-api-id $REST_API_ID --output text --query 'items[?name==`DefaultAuthorizer`]'.authorizerUri |  cut -d'/' -f4 | cut -d':' -f7)
AUTHORIZER_ID=$(aws apigateway get-authorizers --rest-api-id $REST_API_ID --output text --query 'items[?name==`DefaultAuthorizer`]'.id)
ACCOUNT_NUMBER=$(aws sts get-caller-identity --output text --query 'Account')

echo 'Set Lambda Permission'
SOURCE_ARN="arn:aws:execute-api:$AWS_REGION:$ACCOUNT_NUMBER:$REST_API_ID/authorizers/$AUTHORIZER_ID"
echo "Setting permission for lambda function $FUNCTION_NAME, for authorizer with source arn $SOURCE_ARN"

aws lambda add-permission \
  --function-name $FUNCTION_NAME \
  --statement-id "AllowExecutionFromAPIGateway" \
  --action "lambda:InvokeFunction" \
  --principal "apigateway.amazonaws.com" \
  --source-arn $SOURCE_ARN

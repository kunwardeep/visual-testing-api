#!/bin/bash -e

echo 'Get Rest Api Id'
REST_API_ID=$(aws apigateway get-rest-apis --output text --query 'items[?name==`visual-droid-api`]'.id)
ROLE_ARN=$(aws iam get-role --role-name ApiGatewayToCloudWatchLogsRole --output text --query Role.Arn)

echo "Add cloudwatch ARN role"
aws apigateway update-account \
    --patch-operations op='replace',path='/cloudwatchRoleArn',value=$ROLE_ARN

echo "Update Logging for - $REST_API_ID"
aws apigateway update-stage \
    --rest-api-id $REST_API_ID \
    --stage-name Prod \
    --patch-operations "op=replace,path=/*/*/logging/dataTrace,value=true" \
                       "op=replace,path=/*/*/logging/loglevel,value=ERROR"

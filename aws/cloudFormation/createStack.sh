#!/bin/bash -e

source 'aws/cloudFormation/setEnvironmentVariables.sh'

echo "Deploy cloudFormation tempalate for - $CLOUDFORMATION_STACK_SOURCE_CODE"
aws cloudformation deploy \
  --template-file ./aws/cloudFormation/s3code.template.yml \
  --stack-name $CLOUDFORMATION_STACK_SOURCE_CODE \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides CodeBucketName=$S3BUCKET_NAME_SOURCE_CODE

echo 'Upload code to s3 bucket'
./aws/cloudFormation/uploadSwagger.sh
./bin/ci_uploadCode.sh

echo "Update cloudFormation tempalate for - $CLOUDFORMATION_STACK_SOURCE_CODE"
aws cloudformation deploy \
  --template-file ./aws/cloudFormation/s3codeLambda.template.yml \
  --stack-name $CLOUDFORMATION_STACK_SOURCE_CODE \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides CodeBucketName=$S3BUCKET_NAME_SOURCE_CODE \
                        RoleName=$ROLE_NAME_SOURCE_CODE_STACK_ROLE

echo "Run cloudFormation tempalate for - $CLOUDFORMATION_STACK_IMAGES"
aws cloudformation deploy \
  --template-file ./aws/cloudFormation/serverless.template.yml \
  --stack-name $CLOUDFORMATION_STACK_IMAGES \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides CodeBucketName=$S3BUCKET_NAME_SOURCE_CODE \
                        ImageBucketName=$S3BUCKET_NAME_IMAGES \
                        RoleName=$ROLE_NAME_IMAGE_STACK_ROLE \
                        BasicAuthStringPassword=$VISUAL_DROID_PASSWORD

echo "Add Permissions"
source 'aws/cloudFormation/addLambdaPermission.sh'

echo "Add api gateway logging"
source 'aws/cloudFormation/addApiGatewayLogging.sh'

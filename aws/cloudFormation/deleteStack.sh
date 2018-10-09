#!/bin/bash -e

source 'aws/cloudFormation/setEnvironmentVariables.sh'

echo "Delete all objects in s3 bucket $S3BUCKET_NAME_IMAGES"
aws s3 rm s3://$S3BUCKET_NAME_IMAGES/ --recursive
echo "Delete s3 bucket $S3BUCKET_NAME_IMAGES"
aws s3api delete-bucket --bucket $S3BUCKET_NAME_IMAGES

echo "Delete all objects in s3 bucket $S3BUCKET_NAME_SOURCE_CODE"
aws s3 rm s3://$S3BUCKET_NAME_SOURCE_CODE --recursive
echo "Delete s3 bucket $S3BUCKET_NAME_SOURCE_CODE"
aws s3api delete-bucket --bucket $S3BUCKET_NAME_SOURCE_CODE

echo "Delete stack $CLOUDFORMATION_STACK_IMAGES"
aws cloudformation delete-stack --stack-name $CLOUDFORMATION_STACK_IMAGES
echo "Delete stack $CLOUDFORMATION_STACK_SOURCE_CODE"
aws cloudformation delete-stack --stack-name $CLOUDFORMATION_STACK_SOURCE_CODE

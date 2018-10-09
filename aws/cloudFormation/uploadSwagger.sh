#!/bin/bash -e

source 'aws/cloudFormation/setEnvironmentVariables.sh'

echo "Update Swagger..."
aws s3 cp aws/cloudFormation/swagger.yml s3://$S3BUCKET_NAME_SOURCE_CODE
echo "All Done"

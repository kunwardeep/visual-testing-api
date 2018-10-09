#!/bin/bash -e

source 'aws/cloudFormation/setEnvironmentVariables.sh'

echo "Zip Contents..."
zip -FSr visual-droid.zip src/ node_modules > /dev/null
echo "Upload Contents..."
aws s3 cp visual-droid.zip s3://$S3BUCKET_NAME_SOURCE_CODE
echo "All Done"

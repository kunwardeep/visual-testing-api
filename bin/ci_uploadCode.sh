#!/bin/bash -e

source 'aws/cloudFormation/setEnvironmentVariables.sh'

echo '--- Building docker image'
docker-compose build visual-droid-test

echo "--- Upload code to s3 bucket - $ACCOUNT_ALIAS"
docker-compose run --rm visual-droid-test \
  ./aws/cloudFormation/uploadCode.sh

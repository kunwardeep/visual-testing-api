#!/bin/bash -e

echo "Setting REST Api Id"
if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  echo "Your are not signed into an aws account "
  exit
fi

if [ -z "$REST_API_ID" ]; then
  export REST_API_ID=$(aws apigateway get-rest-apis --output text --query 'items[?name==`visual-droid-api`]'.id)
fi

if [ -z "$VISUAL_DROID_PASSWORD" ]; then
  export VISUAL_DROID_PASSWORD=$(aws ssm get-parameter \
                                  --name '/visual-droid/api/password' \
                                  --with-decryption --output text --query Parameter.Value)
fi

echo "Complete"

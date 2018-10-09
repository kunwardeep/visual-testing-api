#!/bin/bash -e

export ACCOUNT_ALIAS=$(aws iam list-account-aliases --output text --query AccountAliases)
echo "Setting Variables for $ACCOUNT_ALIAS"
CI_ACCOUNT_NAME="<your_ci_account_name>"
DEV_ACCOUNT_NAME="<your_dev_account_name>"

ACCOUNT_TYPE=""
if [[ "$ACCOUNT_ALIAS" == "$CI_ACCOUNT_NAME" ]]; then
  ACCOUNT_TYPE="CI"
elif [[ "$ACCOUNT_ALIAS" == "$DEV_ACCOUNT_NAME" ]]; then
  ACCOUNT_TYPE="DEV"
else
  echo "Unknown account name - $ACCOUNT_ALIAS. Valid options are $CI_ACCOUNT_NAME or $DEV_ACCOUNT_NAME "
  exit
fi

if [ -z "$CLOUDFORMATION_STACK_SOURCE_CODE" ]; then
  export CLOUDFORMATION_STACK_SOURCE_CODE=$(aws ssm get-parameter \
                                            --name "/visual-droid/api/CLOUDFORMATION_STACK_CAMP_${ACCOUNT_TYPE}_SOURCE_CODE" \
                                            --with-decryption --output text --query Parameter.Value)
fi

if [ -z "$CLOUDFORMATION_STACK_IMAGES" ]; then
  export CLOUDFORMATION_STACK_IMAGES=$(aws ssm get-parameter \
                                        --name "/visual-droid/api/CLOUDFORMATION_STACK_CAMP_${ACCOUNT_TYPE}_IMAGES" \
                                        --with-decryption --output text --query Parameter.Value)
fi

if [ -z "$S3BUCKET_NAME_SOURCE_CODE" ]; then
  export S3BUCKET_NAME_SOURCE_CODE=$(aws ssm get-parameter \
                                      --name "/visual-droid/api/S3BUCKET_NAME_CAMP_${ACCOUNT_TYPE}_SOURCE_CODE" \
                                      --with-decryption --output text --query Parameter.Value)

fi

if [ -z "$S3BUCKET_NAME_IMAGES" ]; then
  export S3BUCKET_NAME_IMAGES=$(aws ssm get-parameter \
                                  --name "/visual-droid/api/S3BUCKET_NAME_CAMP_${ACCOUNT_TYPE}_IMAGES" \
                                  --with-decryption --output text --query Parameter.Value)
fi

if [ -z "$CLOUDFORMATION_STACK_CI_ROLE" ]; then
  export CLOUDFORMATION_STACK_CI_ROLE=$(aws ssm get-parameter \
                                        --name "/visual-droid/api/CLOUDFORMATION_STACK_CAMP_${ACCOUNT_TYPE}_CI_ROLE" \
                                        --with-decryption --output text --query Parameter.Value)
fi

if [ -z "$ROLE_NAME_SOURCE_CODE_STACK_ROLE" ]; then
  export ROLE_NAME_SOURCE_CODE_STACK_ROLE=$(aws ssm get-parameter \
                                              --name "/visual-droid/api/ROLE_NAME_${ACCOUNT_TYPE}_SOURCE_CODE_STACK_ROLE" \
                                              --with-decryption --output text --query Parameter.Value)
fi

if [ -z "$ROLE_NAME_IMAGE_STACK_ROLE" ]; then
  export ROLE_NAME_IMAGE_STACK_ROLE=$(aws ssm get-parameter \
                                        --name "/visual-droid/api/ROLE_NAME_${ACCOUNT_TYPE}_IMAGE_STACK_ROLE" \
                                        --with-decryption --output text --query Parameter.Value)
fi

if [ -z "$ROLE_NAME_CI" ]; then
  export ROLE_NAME_CI=$(aws ssm get-parameter \
                        --name "/visual-droid/api/ROLE_NAME_${ACCOUNT_TYPE}_CI_ROLE" \
                        --with-decryption --output text --query Parameter.Value)
fi

if [ -z "$VISUAL_DROID_PASSWORD" ]; then
  export VISUAL_DROID_PASSWORD=$(aws ssm get-parameter \
                                  --name '/visual-droid/api/password' \
                                  --with-decryption --output text --query Parameter.Value)
fi

echo "Complete"

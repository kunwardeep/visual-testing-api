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

aws ssm put-parameter --type "SecureString" --overwrite \
                    --name "/visual-droid/api/password" \
                    --value "your-password-here"
aws ssm put-parameter --type "SecureString" --overwrite \
                    --name "/visual-droid/api/S3BUCKET_NAME_CAMP_${ACCOUNT_TYPE}_SOURCE_CODE" \
                    --value "S3BUCKET_NAME_CAMP_CI_SOURCE_CODE"
aws ssm put-parameter --type "SecureString" --overwrite \
                    --name "/visual-droid/api/S3BUCKET_NAME_CAMP${ACCOUNT_TYPE}IMAGES" \
                    --value "S3BUCKET_NAME_CAMP${ACCOUNT_TYPE}IMAGES"
aws ssm put-parameter --type "SecureString" --overwrite \
                    --name "/visual-droid/api/CLOUDFORMATION_STACK_CAMP${ACCOUNT_TYPE}SOURCE_CODE" \
                    --value "CLOUDFORMATION_STACK_CAMP${ACCOUNT_TYPE}SOURCE_CODE"
aws ssm put-parameter --type "SecureString" --overwrite \
                    --name "/visual-droid/api/CLOUDFORMATION_STACK_CAMP${ACCOUNT_TYPE}IMAGES" \
                    --value "CLOUDFORMATION_STACK_CAMP${ACCOUNT_TYPE}IMAGES"
aws ssm put-parameter --type "SecureString" --overwrite \
                    --name "/visual-droid/api/CLOUDFORMATION_STACK_CAMP${ACCOUNT_TYPE}CI_ROLE" \
                    --value "CLOUDFORMATION_STACK_CAMP${ACCOUNT_TYPE}CI_ROLE"
aws ssm put-parameter --type "SecureString" --overwrite \
                    --name "/visual-droid/api/ROLE_NAME${ACCOUNT_TYPE}SOURCE_CODE_STACK_ROLE" \
                    --value "ROLE_NAME${ACCOUNT_TYPE}SOURCE_CODE_STACK_ROLE"
aws ssm put-parameter --type "SecureString" --overwrite \
                    --name "/visual-droid/api/ROLE_NAME${ACCOUNT_TYPE}IMAGE_STACK_ROLE" \
                    --value "ROLE_NAME${ACCOUNT_TYPE}IMAGE_STACK_ROLE"
aws ssm put-parameter --type "SecureString" --overwrite \
                    --name "/visual-droid/api/ROLE_NAME${ACCOUNT_TYPE}CI_ROLE" \
                    --value "ROLE_NAME${ACCOUNT_TYPE}CI_ROLE"
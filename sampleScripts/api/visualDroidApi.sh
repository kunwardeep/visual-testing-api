#!/bin/bash
set -e
set -o pipefail

# <SET ENVIRONMENT VARIABLES HERE>

post_to_visual_droid(){
    URL=$1
    DATA=$2

    echo "Posting $DATA to visual droid - $URL" >&2
    curl --fail -s "$URL" --data "$DATA"  -H "Authorization: $AUTHORIZATION"
}

visual_droid_get_new_images(){
    DATA='{ "project": { "name": "'"$VISUAL_REGRESSION_PROJECT_NAME"'", "branchSha": "'"$BRANCH_SHA"'" } }'
    post_to_visual_droid "$LIST_OF_NEW_IMAGES_URL" "$DATA"
}

visual_droid_get_image_diffs(){
    DATA='{ "project": { "name": "'"$VISUAL_REGRESSION_PROJECT_NAME"'", "branchSha": "'"$BRANCH_SHA"'", "compareSha": "'"$COMPARE_SHA"'" } }'
    post_to_visual_droid "$LIST_OF_IMAGE_DIFF_URL" "$DATA"
}

visual_droid_get_test_status(){
    DATA='{ "project": { "name": "'"$VISUAL_REGRESSION_PROJECT_NAME"'", "branchSha": "'"$BRANCH_SHA"'" } }'
    post_to_visual_droid "$GET_TEST_STATUS_URL" "$DATA"
}

visual_droid_get_test_status_comparison_branch(){
    DATA='{ "project": { "name": "'"$VISUAL_REGRESSION_PROJECT_NAME"'", "branchSha": "'"$COMPARE_SHA"'" } }'
    post_to_visual_droid "$GET_TEST_STATUS_URL" "$DATA"
}

visual_droid_set_test_status(){
    TEST_STATUS=$1
    DATA='{ "project": { "name": "'"$VISUAL_REGRESSION_PROJECT_NAME"'", "branchSha": "'"$BRANCH_SHA"'" }, "testStatus": '"$TEST_STATUS"' }'
    post_to_visual_droid "$SET_TEST_STATUS_URL" "$DATA"
}

visual_droid_delete_folder(){
    DATA='{ "project": { "name": "'"$VISUAL_REGRESSION_PROJECT_NAME"'", "branchSha": "'"$BRANCH_SHA"'" } }'
    post_to_visual_droid "$DELETE_FOLDER_URL" "$DATA"
}

visual_droid_images_processed(){
    DATA='{ "project": { "name": "'"$VISUAL_REGRESSION_PROJECT_NAME"'", "branchSha": "'"$BRANCH_SHA"'" } }'
    post_to_visual_droid "$IMAGES_PROCESSED_URL" "$DATA"
}

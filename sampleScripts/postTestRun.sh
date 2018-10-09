#!/bin/bash
set -e
set -o pipefail

source ./api/visualDroidApi.sh
source ./api/gitHubApi.sh

# <SET ENVIRONMENT VARIABLES HERE>

images_processed(){
    RETRY_ATTEMPT=${1:-1}
    echo "RETRY ATTEMPT - $RETRY_ATTEMPT"
    RETRY_DELAY_SECONDS=5
    MAX_RETRY_ATTEMPT=5
    if [ "$RETRY_ATTEMPT" == "$MAX_RETRY_ATTEMPT" ]; then

        echo -e "
        $MUSTARD_COLOR
        --------------------------------------------------

        Visual Test did not finish comparing images. We tried to check the status $MAX_RETRY_ATTEMPT times, but were unsuccessful.
        Please try running the following command and then retry this step

        curl $RETRY_COMPARE_IMAGE_URL --header \"authorization: $AUTHORIZATION\" --data '{ \"project\": { \"name\": \"$VISUAL_REGRESSION_PROJECT_NAME\", \"branchSha\": \"$BRANCH_SHA\"}}'

        --------------------------------------------------
        $COLOR_OFF"
        exit 1
    fi

    EXPECTED_IMAGES_PROCESSED_STATUS='{"status":true}'
    IMAGES_PROCESSED=$(visual_droid_images_processed)
    if [ "$IMAGES_PROCESSED" != "$EXPECTED_IMAGES_PROCESSED_STATUS" ]; then
        echo $IMAGES_PROCESSED
        echo "Retry after $RETRY_DELAY_SECONDS seconds"
        sleep $RETRY_DELAY_SECONDS
        images_processed $(($RETRY_ATTEMPT + 1))
    else
        echo "All images processed"
    fi
}


check_status(){
    EXPECTED_TEST_STATUS='{"pass":true}'
    EXPECTED_NEW_IMAGES='{"metadataFilters":{},"images":[]}'
    EXPECTED_DIFF_IMAGES='{"metadataFilters":{},"images":[]}'

    echo '--- Getting Test Status'
    TEST_STATUS=$(visual_droid_get_test_status)
    if [ "$TEST_STATUS" != "$EXPECTED_TEST_STATUS" ]; then
        mkdir -p tmp/visual-test/
        NEW_IMAGES=$(visual_droid_get_new_images)
        if [ "$NEW_IMAGES" != "$EXPECTED_NEW_IMAGES" ]; then
            echo "Tests generated some new images"
            ./bin/newImages.sh > tmp/visual-test/newImages.html
            buildkite-agent artifact upload "tmp/visual-test/newImages.html"
        fi

        DIFF_IMAGES=$(visual_droid_get_image_diffs)
        if [ "$DIFF_IMAGES" != "$EXPECTED_DIFF_IMAGES" ]; then
            echo "Tests generated some image diffs"
            ./bin/diffImages.sh > tmp/visual-test/diffImages.html
            buildkite-agent artifact upload "tmp/visual-test/diffImages.html"
        fi

        post_status_to_github "failure" "Failed"

        MUSTARD_COLOR="\033[33m"
        COLOR_OFF="\033[0m"

        echo -e "
        $MUSTARD_COLOR
        --------------------------------------------------

        Visual Test detected changes to the screenshots in this build.
        Please inspect the build artifacts, and if these changes are acceptable,
        use the command below to approve them
        curl $SET_TEST_STATUS_URL --header \"authorization: $AUTHORIZATION\" --data '{ \"project\": { \"name\": \"$VISUAL_REGRESSION_PROJECT_NAME\", \"branchSha\": \"$BRANCH_SHA\"}, \"testStatus\":true}'

        --------------------------------------------------
        $COLOR_OFF"
        exit 1
    else
        echo "Images match"
        post_status_to_github "success" "Complete"
    fi
}

images_processed
check_status

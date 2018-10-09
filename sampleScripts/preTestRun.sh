#!/bin/bash
set -e
set -o pipefail

source ./api/visualDroidApi.sh
source ./api/gitHubApi.sh

# <SET ENVIRONMENT VARIABLES HERE>

EXPECTED_TEST_STATUS='{"pass":true}'

if [[ "$BRANCH_SHA" == "$COMPARE_SHA" && "$CURRENT_BRANCH" != "master" ]]; then
    echo "Can't compare the branch to itself. Branch and latest master SHA are the same."
    echo  "The visual tests will run once you have added new commits to your branch"
    exit 1
fi

echo "--- Check status of master build, SHA - $COMPARE_SHA"
TEST_STATUS=$(visual_droid_get_test_status_comparison_branch)

if [ "$TEST_STATUS" != "$EXPECTED_TEST_STATUS" ]; then

    post_status_to_github "failure" "Comparison branch failed"

    MUSTARD_COLOR="\033[33m"
    COLOR_OFF="\033[0m"

    echo "
    $MUSTARD_COLOR
    --------------------------------------------------

    Visual Test can not proceed as the branch you are trying to compare it to has
    not finished creating snapshots.

    Buildkite status  - https://buildkite.com/culture-amp/$BUILDKITE_PIPELINE_SLUG/builds?commit=$COMPARE_SHA
    Github comparison - https://github.com/cultureamp/$BUILDKITE_PIPELINE_SLUG/compare/master...cultureamp:$CURRENT_BRANCH

    Please re-run this step once you have checked the branch with SHA - $COMPARE_SHA

    --------------------------------------------------
    $COLOR_OFF"
    exit 1
else
    echo "Branch with SHA - $COMPARE_SHA exists."
fi

echo "--- Set Github status"
post_status_to_github "pending" "Started"

echo "--- Remove existing folder for this commit in visual droid"
visual_droid_delete_folder

echo "--- Set visual test status for this commit in visual droid"
visual_droid_set_test_status true

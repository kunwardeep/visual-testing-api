#!/bin/bash
set -e
set -o pipefail

# <SET ENVIRONMENT VARIABLES HERE>

# GITHUB_STATUS_ACCESS_TOKEN is stored on CI pipeline.

post_status_to_github(){
    STATUS=$1
    DESCRIPTION=$2

    CONTEXT='Visual Tests - Chrome'
    if [[ ${CROSS_BROWSER} = "true" ]]; then
        CONTEXT='Visual Tests - Cross Browser'
    fi

    echo "Setting the status - $STATUS and description - $DESCRIPTION with commit sha - $LAST_COMMIT_SHA and target url $GITHUB_STATUS_TARGET_URL"

    curl --fail -s "$GITHUB_URL" --header "authorization: Basic $GITHUB_STATUS_ACCESS_TOKEN" \
         --data '{"state": "'"$STATUS"'", "description": "'"$DESCRIPTION"'", "context": "'"$CONTEXT"'", "target_url": "'"$GITHUB_STATUS_TARGET_URL"'"}'
}

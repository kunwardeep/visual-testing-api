#!/bin/bash
set -e
set -o pipefail

source ./api/visualDroidApi.sh

echo '--- Set Test Status'
visual_droid_set_test_status true

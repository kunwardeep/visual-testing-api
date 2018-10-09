#!/bin/bash -e

echo '--- Building docker image'
docker-compose build visual-droid-test

echo '--- Running ci_runTest in Docker :docker:'
docker-compose run --rm visual-droid-test \
  npm run lint:local

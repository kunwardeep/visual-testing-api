#!/bin/bash -e

echo '--- Building docker image'
docker-compose build visual-droid-test

echo '--- Running integration test in Docker :docker:'
docker-compose run --rm visual-droid-test \
      /bin/bash -c "npm run test:integration:local"

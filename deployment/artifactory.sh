#!/bin/bash

# npm install because dependencies
npm install

# write config
echo '{"auth":"/var/lib/jenkins/.ssh/id_rsa"}' > ../conf.json
echo '{"build_version":'${BUILD_NUMBER}',"static_version":"[STATIC_VERSION]"}' > ../build.json

# execute grunt job
grunt pipeline --artifactory-version=${BUILD_NUMBER}


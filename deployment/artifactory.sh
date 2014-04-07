#!/bin/bash

# npm install because dependencies
npm install

# write config
echo '{"auth":"/var/lib/jenkins/.ssh/id_rsa"}' > conf.json

# execute grunt job
grunt pipeline --artifactory-version=${BUILD_NUMBER}

# remove zip files
rm arwen-static-${BUILD_NUMBER}.zip
rm arwen-dynamic-${BUILD_NUMBER}.zip

#!/bin/bash

# write config
echo '{"auth":"/var/lib/jenkins/.ssh/id_rsa"}' > ../conf.json
echo 'module.exports={version:"1.1.'${BUILD_NUMBER}'"};'> ../app/config/version.js
echo 'module.exports={revision:"test1234"};'> ../app/config/build.js

# execute grunt job
grunt pipeline --artifactory-version=${BUILD_NUMBER}
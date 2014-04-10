#!/bin/bash

# npm install because dependencies
npm install

# write config
echo '{"auth":"/var/lib/jenkins/.ssh/id_rsa"}' > ../conf.json
echo 'module.exports={deploy:{version:1.1."'${BUILD_NUMBER}'",revision:"[VERSION_FILES]"}};'> ../app/config/build.js

# execute grunt job
grunt pipeline --artifactory-version=${BUILD_NUMBER}


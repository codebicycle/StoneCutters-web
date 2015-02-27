#!/bin/bash

#replacing build.js value with a timestamp
export TIMESTAMP
TIMESTAMP=`date +%s`

# write config
echo '{"auth":"/var/lib/jenkins/.ssh/id_rsa"}' > ../conf.json
echo 'module.exports={version:"1.1.'${BUILD_NUMBER}'"};'> ../app/config/version.js
echo 'module.exports={revision:"'${TIMESTAMP}'"};'> ../app/config/build.js

# execute grunt job
grunt pipeline --artifactory-version=${BUILD_NUMBER}
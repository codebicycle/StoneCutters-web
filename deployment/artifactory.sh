#!/bin/bash

# npm install because dependencies
sudo npm install

# write config
echo '{"auth":"/var/lib/jenkins/.ssh/id_rsa"}' > conf.json

# execute grunt job
sudo grunt pipeline --artifactory-version=${BUILD_NUMBER}


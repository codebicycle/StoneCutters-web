#!/bin/bash
npm install
echo '{"auth":"/var/lib/jenkins/.ssh/id_rsa"}' > conf.json
grunt pipeline-rackspace
rm -rf dist

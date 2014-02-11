#!/bin/bash
npm install
echo '{"auth":"/var/lib/jenkins/.ssh/id_rsa"}' > conf.json
grunt pipeline
rm -rf dist

#!/bin/bash
npm install
echo '{"auth":"/home/dev/.ssh/id_rsa"}' > conf.json
grunt pipeline
rm -rf dist

#!/bin/bash

if [ $# == 0 ] || [ $# -ne 1 ]
then
	echo "Invalid Arguments. ex: ./start.sh testing_or_staging_or_production";
	exit 1
fi

ENV=$1

if [ $ENV == 'develop' ]
then
	grunt debug
	exit 0
fi

echo 'Starting ARWEN on '$ENV
NODE_ENV=$ENV DEBUG=arwen:server* node index.js
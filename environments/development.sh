#!/bin/bash

DIR="base"
CURRENT=${PWD##*/}

if [ "$CURRENT" != "environments" ]
then
    DIR="environments/base"
fi

echo "`./$DIR.sh -i 127.0.0.1 -e Development`"

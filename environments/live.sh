#!/bin/bash

DIR="base"
CURRENT=${PWD##*/}

if [ "$CURRENT" != "environments" ]
then
    DIR="environments/base"
fi

echo "`./$DIR.sh -e Live`"

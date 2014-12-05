#!/bin/bash

DIR="base"
CURRENT=${PWD##*/}

if [ "$CURRENT" != "environments" ]
then
    DIR="environments/base"
fi

echo "`./$DIR.sh -i 166.78.73.55 -e Testing`"

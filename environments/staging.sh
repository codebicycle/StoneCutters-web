#!/bin/bash

DIR="base"
CURRENT=${PWD##*/}

if [ "$CURRENT" != "environments" ]
then
    DIR="environments/base"
fi

echo "`./$DIR.sh -i 162.242.197.57 -e Staging`"

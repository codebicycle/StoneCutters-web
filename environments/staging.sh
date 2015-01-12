#!/bin/bash

DIR="base"
CURRENT=${PWD##*/}
SMAUG="162.242.207.79"
SPAMHANDLER="162.242.197.45"

if [ "$CURRENT" != "environments" ]
then
    DIR="environments/base"
fi

echo "`./$DIR.sh -i 162.242.197.57 -e Staging -s $SMAUG -h $SPAMHANDLER`"

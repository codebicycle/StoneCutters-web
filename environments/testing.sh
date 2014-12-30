#!/bin/bash

DIR="base"
CURRENT=${PWD##*/}
SMAUG="108.171.171.70"
SPAMHANDLER="166.78.73.54"

if [ "$CURRENT" != "environments" ]
then
    DIR="environments/base"
fi

echo "`./$DIR.sh -i 166.78.73.55 -e Testing -s $SMAUG -h $SPAMHANDLER`"

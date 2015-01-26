#!/bin/bash

DIR="base"
CURRENT=${PWD##*/}
SMAUG="108.171.171.70"
SPAMHANDLER="166.78.73.54"
IPSTATICS='108.171.171.65'

if [ "$CURRENT" != "environments" ]
then
    DIR="environments/base"
fi

echo "`./$DIR.sh -i 127.0.0.1 -e Development -s $SMAUG -h $SPAMHANDLER -t $IPSTATICS`"

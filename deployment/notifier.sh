#!/bin/sh

##########################################################################################################
# Project: ARWEN
# Description: This script notifies the jenkins job that pushes the ARWEN to ENV
##########################################################################################################

URL=$1
curl --user jenkins-mobile:pwd -s $URL

GREP_RETURN_CODE=0
JOB_STATUS_URL=$2

echo "URL:"$URL
echo "JOB_STATUS:"$JOB_STATUS_URL
# Poll every thirty seconds until the build is finished
while [ $GREP_RETURN_CODE -eq 0 ]
do
    echo "Waiting for the next curl"
    sleep 30
    echo "Trying to get the new json"
    # Grep will return 0 while the build is running:
    JSON_REPONSE=`curl $JOB_STATUS_URL`
    echo $JSON_REPONSE | grep result\":null
    GREP_RETURN_CODE=$?
    echo $GREP_RETURN_CODE
done

echo $JSON_REPONSE
echo $JSON_REPONSE | grep result\":\"SUCCESS\"
GREP_RETURN_CODE=$?
if [ $GREP_RETURN_CODE -eq 0 ]
then
  echo "SUCCESS!!"
  RESPOSE=0
else
  echo "FAILED!!"
  RESPONSE=1
fi

echo Build finished
exit $RESPONSE

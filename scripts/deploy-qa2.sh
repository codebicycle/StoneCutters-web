#!/bin/bash

echo -----------------****************************************-------------------
echo -n Deploying to QA as: && whoami
echo -n Using the following path: && pwd

echo Erasing previous repos 
rm -rf arwen
rm -rf arwen-configuration
rm -rf heman

echo Cloning new repos
git clone git@github.com:olx-inc/arwen-configuration.git
git clone git@github.com:olx-inc/arwen.git

echo Moving repos
mv arwen-configuration/heman heman
mv arwen/src/main/webapp/ heman/public/
ls

cd heman
git init

echo Adding a new remote to the git project...
git remote add heroku git@heroku.com:arwen-qa.git
echo Remotes...
git remote -v
echo Adding files...
git add .
git commit -m "deploying to QA..."
git push heroku master -f
rm -rf arwen-configuration
rm -rf arwen
rm -rf heman
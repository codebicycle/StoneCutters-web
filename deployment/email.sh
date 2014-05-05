#!/bin/bash

# ================== ARGUMENTS

if [ $# -ne 3 ]
then
	echo "Invalid Arguments."
	echo "Required:"
	echo "   SOURCE_PATH"
	echo "   BUILD_NUMBER"
	echo "   ENVIRONMENT"
	echo ""
	echo "Example:"
	echo "./email.sh /home/dev/src/arwen 1.1.152 testing"
	
	exit 1;
fi

SOURCE_PATH=$1
BUILD_NUMBER=$2
ENVIRONMENT=$3

# ================== Hello!

echo "Hello!"
echo "    SOURCE_PATH:" $SOURCE_PATH
echo "   BUILD_NUMBER:" $BUILD_NUMBER
echo "    ENVIRONMENT:" $ENVIRONMENT
echo "------------------------------------------"

# ================== Validations

if [ ! -d $SOURCE_PATH ]
then
	echo "ERROR:"
	echo "Source directory not found: "$SOURCE_PATH" (remember this argument should be an absolute path)";
	exit 1;
fi

# ================== Last Build

LAST_BUILD_VERSION=$(curl -s 'http://elvira.olx.com.ar/tags/api/query.php?repo=mobile-webapp&env=PRODUCTION');
echo "     PRODUCTION:" $LAST_BUILD_VERSION
echo "------------------------------------------"

if [ $LAST_BUILD_VERSION = "0" ]
then
	echo "Woow! There is not live version, so we will create an email for the full log"
	echo "------------------------------------------"

	cd $SOURCE_PATH
	RELEASE_NOTES=$(git log --grep MOB --pretty=format:'%s' --abbrev-commit | grep -v pull | grep -v "^MOB" | awk '!x[$0]++')
	RELEASE_NOTES=${RELEASE_NOTES//[/<br>[}

	URL_GIT="https\://github.com/olx-inc/mobile-webapp/commits/master"
fi


# ================== Write the file

# stars a new file
echo "" > /tmp/arwen-mailing.jenkins

# appends to file
echo "environment = "$ENVIRONMENT >> /tmp/arwen-mailing.jenkins
echo "build = ARWEN v"$BUILD_NUMBER >> /tmp/arwen-mailing.jenkins
echo "githubcompare = ref. "$URL_GIT >> /tmp/arwen-mailing.jenkins
echo "releasenote = "$RELEASE_NOTES >> /tmp/arwen-mailing.jenkins
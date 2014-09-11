#!/bin/bash

# Validate permissions (sudo)
if [ "$(whoami)" != "root" ]; then
	echo "Sorry, you are not root (sudo)."
	exit 1
fi

CURRENT=${PWD##*/}

if [ "$CURRENT" != "environments" ]
then
	cd 'environments'
fi

LOCAL_AUXI=$(cat /etc/sudoers | grep 'dev-laptop' | head -n1 | awk '{print $3}');
LOCAL=${LOCAL_AUXI:0};

if [ "$LOCAL" == "" ]; then
	echo "Couldnt read your host alias from /etc/sudoers. Check the line LOCAL=developXX"
	exit 1;
fi

if [ ! -f /etc/hosts_bkp_arwen ]
then
	cp /etc/hosts /etc/hosts_bkp_arwen
fi

cp hosts /etc/hosts;

IP='162.242.197.57';
sed -i "s/{IP}/$IP/g" '/etc/hosts';
sed -i "s/{LOCAL}/$LOCAL/g" '/etc/hosts';

echo 'Moved to Staging'

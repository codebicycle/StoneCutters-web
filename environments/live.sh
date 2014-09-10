#!/bin/bash

LOCAL_AUXI=$(cat /etc/sudoers | grep 'dev-laptop' | head -n1 | awk '{print $3}');
LOCAL=${LOCAL_AUXI:0};

if [ "$LOCAL" == "" ]; then
	echo "Couldnt read your host alias from /etc/sudoers. Check the line LOCAL=developXX"
	exit 1;
fi

if [ ! -f /etc/hosts_bkp ]
then
	cp /etc/hosts /etc/hosts_bkp
fi

cp empty /etc/hosts;

sed -i "s/{LOCAL}/$LOCAL/g" '/etc/hosts';

echo 'Moved to Live'

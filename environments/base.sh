#!/bin/bash

# Validate permissions (sudo)
# ---------------------------------------------------------------------------------------
if [ "$(whoami)" != "root" ]; then
	echo "Sorry, you are not root (sudo)."
	exit 1
fi

# Constants
# ---------------------------------------------------------------------------------------
IP="127.0.0.1"
ENV="Development"

# Help
# ---------------------------------------------------------------------------------------
usage() {
    echo "\nUsage: ./{ENVIRONMENT}.sh"
    echo ""
    echo "Arguments"
    echo "  -i  |  Environment IP or yours"
    echo "  -e  |  Environment name. Default " + $ENV + "\n"
    exit 1
}

# Arguments
# ---------------------------------------------------------------------------------------
while getopts ":i:e:" o; do
    case "${o}" in
        i)
            IP=${OPTARG}
            ;;
        e)
            ENV=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

# Location path
# ---------------------------------------------------------------------------------------
CURRENT=${PWD##*/}

if [ "$CURRENT" != "environments" ]
then
	cd 'environments'
fi

# Host alias
# ---------------------------------------------------------------------------------------
LOCAL_AUXI=$(cat /etc/sudoers | grep 'LOCAL' | head -n1 | awk '{print $3}');
LOCAL=${LOCAL_AUXI:0};

if [ "$LOCAL" == "" ]
then
	echo "Couldnt read your host alias from /etc/sudoers. Check the line LOCAL=developXX"
	exit 1;
fi

# Host backup
# ---------------------------------------------------------------------------------------
if [ ! -f /etc/hosts_bkp_arwen ]
then
	cp /etc/hosts /etc/hosts_bkp_arwen
fi

cp hosts /etc/hosts;

# Host replace
# ---------------------------------------------------------------------------------------
# Check if Mac OS
if [[ "$OSTYPE" == "darwin"* ]]
then
	sed -i .bkp "s/{IP}/$IP/g" '/etc/hosts';
	sed -i .bkp "s/{LOCAL}/$LOCAL/g" '/etc/hosts';
else
	sed -i "s/{IP}/$IP/g" '/etc/hosts';
	sed -i "s/{LOCAL}/$LOCAL/g" '/etc/hosts';
fi

echo "Moved to $ENV"

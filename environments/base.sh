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
SMAUG="190.210.62.60"
SPAMHANDLER="162.242.207.113"
IPSTATICS="108.171.171.65"
EXTBKP=""

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
while getopts ":i:e:s:h:t:" o; do
    case "${o}" in
        i)
            IP=${OPTARG}
            ;;
        e)
            ENV=${OPTARG}
            ;;
        s)
            SMAUG=${OPTARG}
            ;;
        h)
            SPAMHANDLER=${OPTARG}
            ;;
        t)
            IPSTATICS=${OPTARG}
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
LOCAL_AUXI=$(cat /etc/sudoers | grep 'LOCAL' | head -n1 | tr "=" "\n" | tail -n1 | tr -d ' ');
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

if [ "$ENV" != "Live" ]
then
   cp hosts /etc/hosts;
else
   cp empty /etc/hosts;
fi

# Host replace
# ---------------------------------------------------------------------------------------
# Check if Mac OS
if [[ "$OSTYPE" == "darwin"* ]]
then
    EXTBKP=".bkp"
fi

sed -i $EXTBKP "s/{LOCAL}/$LOCAL/g" '/etc/hosts';
if [ "$ENV" != "Live" ]
then
    sed -i $EXTBKP "s/{IP}/$IP/g" '/etc/hosts';
    sed -i $EXTBKP "s/{SMAUG}/$SMAUG/g" '/etc/hosts';
    sed -i $EXTBKP "s/{SPAMHANDLER}/$SPAMHANDLER/g" '/etc/hosts';
    sed -i $EXTBKP "s/{IPSTATICS}/$IPSTATICS/g" '/etc/hosts';
fi

echo "Moved to $ENV"

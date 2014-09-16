#!/bin/bash

# Validate permissions (sudo)
if [ "$(whoami)" != "root" ]; then
    echo "Sorry, you are not root (sudo)."
    exit 1
fi

if [ ! -f /etc/hosts_bkp_arwen ]
then
    echo "Sorry, no backup found."
    exit 1
fi

cp /etc/hosts_bkp_arwen /etc/hosts

echo 'Restored original environment'

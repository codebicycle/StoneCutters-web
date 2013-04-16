#!/bin/sh
curl -s -H static03.olx-st.com http://192.168.0.101/mobile-arwen/ | grep title | grep -q 'OLX Mobile'
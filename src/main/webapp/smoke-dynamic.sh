#!/bin/sh
curl -s http://webapp.olx.com | grep title | grep -q 'OLX Mobile'
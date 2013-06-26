#!/bin/sh
CMD="/bin/date +%s"
URL="http://static03.olx-st.com/mobile-arwen/js/arwen-"
curl -s $URL`$CMD`.js | grep -q 'RequireJS 2.1.5'
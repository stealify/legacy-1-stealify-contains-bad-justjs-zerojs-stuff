#!/bin/bash
CMD=${1:-"stealify download.js"}
DL=${2:-"https://codeload.github.com/stealify/modules/tar.gz/0.0.1"}
shift
STEALIFY_MODULES=/home/andrew/Documents/source/github/stealify/modules
LIBS="$STEALIFY_MODULES/openssl:$STEALIFY_MODULES/picohttp"
#LD_LIBRARY_PATH=$LIBS $CMD --inspector -L -o modules.tar.gz https://codeload.github.com/stealify/modules/tar.gz/0.0.1 $@
LD_LIBRARY_PATH=$LIBS $CMD -L -o modules.tar.gz $DL $@

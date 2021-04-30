#!/bin/bash
make clean runtime-debug
mkdir -p .debug
objcopy --only-keep-debug ./stealify .debug/stealify
strip --strip-debug --strip-unneeded ./stealify
objcopy --add-gnu-debuglink=.debug/stealify ./stealify
chmod -x .debug/stealify 

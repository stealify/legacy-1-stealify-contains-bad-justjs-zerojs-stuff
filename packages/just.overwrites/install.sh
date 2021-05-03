#!/bin/sh
git clone git@github.com:just-js/just.git ./stealify
rm -f ./stealify/Makefile
cp ./Makefile ./stealify
cd stealify
make runtime-static

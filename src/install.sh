#!/bin/sh
curl -L -o stealify.tar.gz https://github.com/stealify/stealify/archive/0.0.22.tar.gz
tar -zxvf stealify.tar.gz
cd stealify-0.0.22
make runtime-static

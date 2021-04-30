```bash
## make the main runtime
make runtime
## change the config and rebuild using an eval
./stealify eval "require('build').run(require('config/runtime.js'))"
## or pipe ebal to stealify
echo "require('build').run(require('config/runtime.js'))" | ./stealify --
## or rebuild like this
./stealify build
## or use a different config
./stealify build foo.js
## or use json instead
./stealify build foo.json
## dump a configuration
./stealify build config/runtime.js --dump
## clean and build
./stealify build config/runtime.js --clean
## clean and make a debug build
./stealify build config/runtime.js --clean --debug
## install examples
./stealify build config/runtime.js examples
## build the net module
MODULE=net ./stealify build config/runtime.js module
## build debug version of the net module
MODULE=net ./stealify build config/runtime.js module-debug
```
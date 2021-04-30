# Stealify

A very small v8 javascript runtime for linux only

[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/stealify/binder/HEAD)

## Build and Run

Currently working on modern linux (debian/ubuntu and alpine tested) on x86_64

```bash
# download and run the build script
sh -c "$(curl -sSL https://raw.githubusercontent.com/stealify/stealify/0.0.22/install.sh)"
# install stealify binary to /usr/local/bin
make -C stealify-0.0.22 install
# export the stealify home directory
export STEALIFY_HOME=$(pwd)/stealify-0.0.22
export STEALIFY_TARGET=$STEALIFY_HOME
# if you don't want to install, add STEALIFY_HOME to SPATH
export PATH=$PATH:$STEALIFY_HOME
# run a shell
stealify
```

## Create a new Application
```bash
# initialise a new application in the hello directory
stealify init hello
cd hello
# build hello app
stealify build hello.js --clean --static
./hello
```

## Command Line Options

### Run a Stealify shell/repl
```bash
stealify
```

### Pipe a script to stdin
```bash
cat hello.js | stealify --
```

### Eval some Javascript passed as an argument
```bash
stealify eval "stealify.print(stealify.memoryUsage().rss)"
```

### Run a script
```bash
stealify hello.js
```

### Initialise a new project and build it
```bash
stealify init hello
cd hello
stealify build
```

### Clean a built project
```bash
stealify clean
```

## Documentation

Coming soon...

## Philosophy/Goals
- small, secure, robust and performant js runtime for linux
- small codebase. easy to understand and hack
- very simple layer on top of system calls, v8 and c/c++ standard libraries
- minimal use of classes/function templates and OO - "c" in javascript
- favour return codes over exceptions
- platform for building system software on linux in javascaript
- as close to native performance as possible
- secure by default
- avoid abstraction as much as possible. abstractions can be built in userland
- commonjs modules, no support for ES modules
- non-async by default - can do blocking calls and not use the event loop
- event loop in JS-land. full control over epoll api
- small standard library - leave as much to userland as possible. focus on primitives needed to build higher level abstractions
- useful as a teaching/learning platform for linux system programming and learning more about javascript and v8 internals
- small number of source files
- minimal dependencies - g++ and make only
- keep LOC as small as possible < 5k
- allocate as little as possible on v8 heap

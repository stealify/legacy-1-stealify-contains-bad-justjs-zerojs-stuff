const libs = [
  'lib/fs.js',
  'lib/loop.js',
  'lib/path.js',
  'lib/process.js',
  'lib/build.js',
  'lib/repl.js',
  'lib/configure.js',
  'lib/acorn.js'
]

const version = stealify.version.stealify
const v8flags = '--stack-trace-limit=10 --use-strict --disallow-code-generation-from-strings'
const v8flagsFromCommandLine = true
const debug = false
const capabilities = [] // list of allowed internal modules, api calls etc. TBD

const modules = [{
  name: 'sys',
  obj: [
    'modules/sys/sys.o'
  ],
  lib: ['dl', 'rt']
}, {
  name: 'fs',
  obj: [
    'modules/fs/fs.o'
  ]
}, {
  name: 'net',
  obj: [
    'modules/net/net.o'
  ]
}, {
  name: 'vm',
  obj: [
    'modules/vm/vm.o'
  ]
}, {
  name: 'epoll',
  obj: [
    'modules/epoll/epoll.o'
  ]
}]

const embeds = [
  'stealify.cc',
  'Makefile',
  'main.cc',
  'stealify.h',
  'stealify.js',
  'config.js'
]

const target = 'stealify'
const main = 'stealify.js'

module.exports = { version, libs, modules, capabilities, target, main, v8flags, embeds, static: false, debug, v8flagsFromCommandLine }

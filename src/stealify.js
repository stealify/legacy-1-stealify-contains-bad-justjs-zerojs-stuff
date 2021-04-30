function wrapMemoryUsage (memoryUsage) {
  const mem = new BigUint64Array(16)
  return () => {
    memoryUsage(mem)
    return {
      rss: mem[0],
      total_heap_size: mem[1],
      used_heap_size: mem[2],
      external_memory: mem[3],
      heap_size_limit: mem[5],
      total_available_size: mem[10],
      total_heap_size_executable: mem[11],
      total_physical_size: mem[12]
    }
  }
}

function wrapCpuUsage (cpuUsage) {
  const cpu = new Uint32Array(4)
  const result = { elapsed: 0, user: 0, system: 0, cuser: 0, csystem: 0 }
  const clock = cpuUsage(cpu)
  const last = { user: cpu[0], system: cpu[1], cuser: cpu[2], csystem: cpu[3], clock }
  return () => {
    const clock = cpuUsage(cpu)
    result.elapsed = clock - last.clock
    result.user = cpu[0] - last.user
    result.system = cpu[1] - last.system
    result.cuser = cpu[2] - last.cuser
    result.csystem = cpu[3] - last.csystem
    last.user = cpu[0]
    last.system = cpu[1]
    last.cuser = cpu[2]
    last.csystem = cpu[3]
    last.clock = clock
    return result
  }
}

function wrapgetrUsage (getrUsage) {
  const res = new Float64Array(16)
  return () => {
    getrUsage(res)
    return {
      user: res[0],
      system: res[1],
      maxrss: res[2],
      ixrss: res[3],
      idrss: res[4],
      isrss: res[5],
      minflt: res[6],
      majflt: res[7],
      nswap: res[8],
      inblock: res[9],
      outblock: res[10],
      msgsnd: res[11],
      msgrcv: res[12],
      ssignals: res[13],
      nvcsw: res[14],
      nivcsw: res[15]
    }
  }
}

function wrapHeapUsage (heapUsage) {
  const heap = (new Array(16)).fill(0).map(v => new Float64Array(4))
  return () => {
    const usage = heapUsage(heap)
    usage.spaces = Object.keys(usage.heapSpaces).map(k => {
      const space = usage.heapSpaces[k]
      return {
        name: k,
        size: space[2],
        used: space[3],
        available: space[1],
        physicalSize: space[0]
      }
    })
    delete usage.heapSpaces
    return usage
  }
}

function wrapHrtime (hrtime) {
  const time = new BigUint64Array(1)
  return () => {
    hrtime(time)
    return time[0]
  }
}

function wrapEnv (env) {
  return () => {
    return env()
      .map(entry => entry.split('='))
      .reduce((e, pair) => { e[pair[0]] = pair[1]; return e }, {})
  }
}

function wrapLibrary (cache = {}) {
  function loadLibrary (path, name) {
    if (cache[name]) return cache[name]
    if (!stealify.sys.dlopen) return
    const handle = stealify.sys.dlopen(path, stealify.sys.RTLD_LAZY)
    if (!handle) return
    const ptr = stealify.sys.dlsym(handle, `_register_${name}`)
    if (!ptr) return
    const lib = stealify.load(ptr)
    if (!lib) return
    lib.close = () => stealify.sys.dlclose(handle)
    lib.type = 'module-external'
    cache[name] = lib
    return lib
  }

  function library (name, path) {
    if (cache[name]) return cache[name]
    const lib = stealify.load(name)
    if (!lib) {
      if (path) return loadLibrary(path, name)
      return loadLibrary(`${name}.so`, name)
    }
    lib.type = 'module'
    cache[name] = lib
    return lib
  }

  return { library, cache }
}

function wrapRequire (cache = {}) {
  const appRoot = stealify.sys.cwd()
  const { HOME, STEALIFY_TARGET } = stealify.env()
  const stealifyDir = STEALIFY_TARGET || `${HOME}/.stealify`

  function requireNative (path) {
    path = `lib/${path}.js`
    if (cache[path]) return cache[path].exports
    const { vm } = stealify
    const params = ['exports', 'require', 'module']
    const exports = {}
    const module = { exports, type: 'native', dirName: appRoot }
    module.text = stealify.builtin(path)
    if (!module.text) return
    const fun = vm.compile(module.text, path, params, [])
    module.function = fun
    cache[path] = module
    fun.call(exports, exports, p => stealify.require(p, module), module)
    return module.exports
  }

  function require (path, parent = { dirName: appRoot }) {
    const { join, baseName, fileName } = stealify.path
    if (path[0] === '@') path = `${appRoot}/lib/${path.slice(1)}/${fileName(path.slice(1))}.js`
    const ext = path.split('.').slice(-1)[0]
    if (ext === 'js' || ext === 'json') {
      let dirName = parent.dirName
      const fileName = join(dirName, path)
      if (cache[fileName]) return cache[fileName].exports
      dirName = baseName(fileName)
      const params = ['exports', 'require', 'module']
      const exports = {}
      const module = { exports, dirName, fileName, type: ext }
      // todo: this is not secure
      if (stealify.fs.isFile(fileName)) {
        module.text = stealify.fs.readFile(fileName)
      } else {
        path = fileName.replace(appRoot, '')
        if (path[0] === '/') path = path.slice(1)
        module.text = stealify.builtin(path)
        if (!module.text) {
          path = `${stealifyDir}/${path}`
          if (!stealify.fs.isFile(path)) return
          module.text = stealify.fs.readFile(path)
          if (!module.text) return
        }
      }
      cache[fileName] = module
      if (ext === 'js') {
        const fun = stealify.vm.compile(module.text, fileName, params, [])
        module.function = fun
        fun.call(exports, exports, p => require(p, module), module)
      } else {
        module.exports = JSON.parse(module.text)
      }
      return module.exports
    }
    return requireNative(path, parent)
  }

  return { requireNative, require, cache }
}

function setTimeout (callback, timeout, repeat = 0, loop = stealify.factory.loop) {
  const buf = new ArrayBuffer(8)
  const timerfd = stealify.sys.timer(repeat, timeout)
  loop.add(timerfd, (fd, event) => {
    callback()
    stealify.net.read(fd, buf, 0, buf.byteLength)
    if (repeat === 0) {
      loop.remove(fd)
      stealify.net.close(fd)
    }
  })
  return timerfd
}

function setInterval (callback, timeout, loop = stealify.factory.loop) {
  return setTimeout(callback, timeout, timeout, loop)
}

function clearTimeout (fd, loop = stealify.factory.loop) {
  loop.remove(fd)
  stealify.net.close(fd)
}

class SystemError extends Error {
  constructor (syscall) {
    const { sys } = stealify
    const errno = sys.errno()
    const message = `${syscall} (${errno}) ${sys.strerror(errno)}`
    super(message)
    this.name = 'SystemError'
  }
}

function setNonBlocking (fd) {
  let flags = stealify.fs.fcntl(fd, stealify.sys.F_GETFL, 0)
  if (flags < 0) return flags
  flags |= stealify.net.O_NONBLOCK
  return stealify.fs.fcntl(fd, stealify.sys.F_SETFL, flags)
}

function parseArgs (args) {
  const opts = {}
  args = args.filter(arg => {
    if (arg.slice(0, 2) === '--') {
      opts[arg.slice(2)] = true
      return false
    }
    return true
  })
  opts.args = args
  return opts
}

function main (opts) {
  const { library, cache } = wrapLibrary()

  // load the builtin modules
  stealify.vm = library('vm').vm
  stealify.loop = library('epoll').epoll
  stealify.fs = library('fs').fs
  stealify.net = library('net').net
  stealify.sys = library('sys').sys
  stealify.env = wrapEnv(stealify.sys.env)

  const { requireNative, require } = wrapRequire(cache)
  ArrayBuffer.prototype.writeString = function(str, off = 0) { // eslint-disable-line
    return stealify.sys.writeString(this, str, off)
  }
  ArrayBuffer.prototype.readString = function (len = this.byteLength, off = 0) { // eslint-disable-line
    return stealify.sys.readString(this, len, off)
  }
  ArrayBuffer.prototype.getAddress = function () { // eslint-disable-line
    return stealify.sys.getAddress(this)
  }
  ArrayBuffer.prototype.copyFrom = function (ab, off = 0, len = ab.byteLength, off2 = 0) { // eslint-disable-line
    return stealify.sys.memcpy(this, ab, off, len, off2)
  }
  ArrayBuffer.fromString = str => stealify.sys.calloc(1, str)
  String.byteLength = stealify.sys.utf8Length

  Object.assign(stealify.fs, requireNative('fs'))
  stealify.config = requireNative('config')
  stealify.path = requireNative('path')
  stealify.factory = requireNative('loop').factory
  // todo - remove this call at startup
  stealify.factory.loop = stealify.factory.create(128)
  stealify.process = requireNative('process')

  stealify.setTimeout = setTimeout
  stealify.setInterval = setInterval
  stealify.clearTimeout = stealify.clearInterval = clearTimeout
  stealify.SystemError = SystemError
  stealify.library = library
  stealify.requireNative = requireNative
  stealify.sys.setNonBlocking = setNonBlocking
  stealify.require = global.require = require
  stealify.require.cache = cache

  stealify.memoryUsage = wrapMemoryUsage(stealify.memoryUsage)
  stealify.cpuUsage = wrapCpuUsage(stealify.sys.cpuUsage)
  stealify.rUsage = wrapgetrUsage(stealify.sys.getrUsage)
  stealify.heapUsage = wrapHeapUsage(stealify.sys.heapUsage)
  stealify.hrtime = wrapHrtime(stealify.sys.hrtime)

  delete global.console

  function freezeIntrinsics () {
    if (stealify.opts.freeze) {
      const freeze = requireNative('freeze')
      if (!freeze) throw new Error('freeze is not available in runtime')
      freeze()
    }
  }

  function startup () {
    if (!stealify.args.length) return true
    if (stealify.workerSource) {
      const scriptName = stealify.path.join(stealify.sys.cwd(), stealify.args[0] || 'thread')
      const source = stealify.workerSource
      delete stealify.workerSource
      stealify.vm.runScript(source, scriptName)
      return
    }
    if (stealify.args.length === 1) {
      const replModule = stealify.require('repl')
      if (!replModule) {
        throw new Error('REPL not enabled. Maybe I should be a standalone?')
      }
      replModule.repl()
      return
    }
    if (stealify.args[1] === '--') {
      // todo: limit size
      // todo: allow streaming in multiple scripts with a separator and running them all
      const buf = new ArrayBuffer(4096)
      const chunks = []
      let bytes = stealify.net.read(stealify.sys.STDIN_FILENO, buf, 0, buf.byteLength)
      while (bytes > 0) {
        chunks.push(buf.readString(bytes))
        bytes = stealify.net.read(stealify.sys.STDIN_FILENO, buf, 0, buf.byteLength)
      }
      stealify.vm.runScript(chunks.join(''), 'stdin')
      return
    }
    if (stealify.args[1] === 'eval') {
      stealify.vm.runScript(stealify.args[2], 'eval')
      return
    }
    if (stealify.args[1] === 'build') {
      const buildModule = stealify.require('build')
      if (!buildModule) throw new Error('Build not Available')
      let config
      if (stealify.opts.config) {
        config = require(stealify.args[2]) || {}
      } else {
        if (stealify.args.length > 2) {
          config = stealify.require('configure').run(stealify.args[2], opts)
        } else {
          config = require(stealify.args[2] || 'config.json') || require('config.js') || {}
        }
      }
      buildModule.run(config, opts)
        .then(cfg => {
          if (opts.dump) stealify.print(JSON.stringify(cfg, null, '  '))
        })
        .catch(err => stealify.error(err.stack))
      return
    }
    if (stealify.args[1] === 'init') {
      const buildModule = stealify.require('build')
      if (!buildModule) throw new Error('Build not Available')
      buildModule.init(stealify.args[2] || 'hello')
      return
    }
    if (stealify.args[1] === 'clean') {
      const buildModule = stealify.require('build')
      if (!buildModule) throw new Error('Build not Available')
      buildModule.clean()
      return
    }
    const scriptName = stealify.path.join(stealify.sys.cwd(), stealify.args[1])
    stealify.vm.runScript(stealify.fs.readFile(stealify.args[1]), scriptName)
  }
  if (opts.inspector) {
    const inspectorLib = stealify.library('inspector')
    if (!inspectorLib) throw new SystemError('inspector module is not enabled')
    stealify.inspector = inspectorLib.inspector
    // TODO: this is ugly
    Object.assign(stealify.inspector, require('inspector'))
    stealify.encode = library('encode').encode
    stealify.sha1 = library('sha1').sha1
    global.process = {
      pid: stealify.sys.pid(),
      version: 'v15.6.0',
      arch: 'x64',
      env: stealify.env()
    }
    const _require = global.require
    global.require = (name, path) => {
      if (name === 'module') {
        return [
          "fs",
          "process",
          "repl"
        ]
      }
      return _require(name, path)
    }
    global.inspector = stealify.inspector.createInspector({
      title: 'Stealify!',
      onReady: () => {
        if (!startup()) stealify.factory.run()
      }
    })
    stealify.inspector.enable()
    stealify.factory.run(1)
    return
  }
  if (!startup()) stealify.factory.run()
}

const opts = parseArgs(stealify.args)
stealify.args = opts.args
stealify.opts = opts
if (opts.bare) {
  stealify.load('vm').vm.runScript(stealify.args[1], 'eval')
} else {
  main(opts)
}

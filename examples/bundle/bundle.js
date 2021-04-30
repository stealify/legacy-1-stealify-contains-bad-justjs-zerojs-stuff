const { launch, watch } = require('lib/process.js')
const { isFile, isDir } = require('fs')

function library (name, obj = [], lib = []) {
  lib = lib.map(v => `-l${v}`).join(' ')
  const cmdline = `g++ -s -shared -flto -pthread -Wl,--start-group ${obj.join(' ')} bundle.o -Wl,--end-group -Wl,-soname=${name}.so -ldl -lrt ${lib} -o ${name}.so`
  const [cmd, ...args] = cmdline.split(' ').filter(v => v)
  return watch(launch(cmd, args, stealifyDir))
}

function bundle (name, obj = [], lib = []) {
  lib = lib.map(v => `-l${v}`).join(' ')
  const cmdline = `g++ -s -rdynamic -pthread -Wl,--start-group ./deps/v8/libv8_monolith.a ${obj.join(' ')} main.o stealify.o builtins.o bundle.o -Wl,--end-group -ldl -lrt ${lib} -o ${name}`
  const [cmd, ...args] = cmdline.split(' ').filter(v => v)
  return watch(launch(cmd, args, stealifyDir))
}

function link (output, ...files) {
  return watch(launch('ld', ['-r', '-b', 'binary', '-o', output, ...files]))
}

function build (...args) {
  return watch(launch('stealify', ['build', ...args]))
}

function cp (src, dest) {
  return watch(launch('cp', [src, dest]))
}

async function bundleExecutable (name) {
  const config = require(`${name}/config.js`)
  const files = config.files.map(v => `${name}/${v}`)
  stealify.fs.mkdir(stealifyDir)
  let status = await link(`${stealifyDir}/bundle.o`, ...[...files, `${name}/index.js`, `${name}/config.js`])
  stealify.print(`link ${status}`)
  status = await cp('stealify.js', `${stealifyDir}/stealify.js`)
  stealify.print(`cp ${status}`)
  if (!isFile(`${stealifyDir}/stealify.o`)) {
    stealify.print('building runtime')
    status = await build('runtime')
    stealify.print(`build ${status}`)
  }
  if (config.modules && config.modules.length) {
    if (!isDir(`${stealifyDir}/modules`)) {
      stealify.print('downloading modules')
      status = await build('modules')
      stealify.print(`build ${status}`)
    }
    let obj = []
    let lib = []
    for (const module of config.modules) {
      const missing = module.obj.some(obj => {
        return !isFile(`${stealifyDir}/${obj}`)
      })
      if (missing) {
        stealify.print(`building ${module.name} module`)
        status = await build(`MODULE=${module.name}`, 'module-static')
        stealify.print(`build ${module.name} module-static ${status}`)
      }
      obj = obj.concat(module.obj.map(v => `${stealifyDir}/${v}`))
      if (module.lib && module.lib.length) lib = lib.concat(module.lib)
    }
    stealify.print(`building ${stealifyDir}/${name}`)
    status = await bundle(name, obj, lib)
    stealify.print(`bundle ${status}`)
    return
  }
  stealify.print(`building ${stealifyDir}/${name}`)
  status = await bundle(name)
  stealify.print(`bundle ${status}`)
}

async function bundleLibrary (name) {
  const config = require(`${name}/config.js`)
  const files = config.files.map(v => `${name}/${v}`)
  stealify.fs.mkdir(stealifyDir)
  let status = await link(`${stealifyDir}/bundle.o`, ...[...files, `${name}/index.js`, `${name}/config.js`])
  stealify.print(`link ${status}`)
  if (config.modules && config.modules.length) {
    if (!isDir(`${stealifyDir}/modules`)) {
      stealify.print('downloading modules')
      status = await build('modules')
      stealify.print(`build modules ${status}`)
    }
    let obj = []
    let lib = []
    for (const module of config.modules) {
      const missing = module.obj.some(obj => {
        return !isFile(`${stealifyDir}/${obj}`)
      })
      if (missing) {
        stealify.print(`building ${module.name} module`)
        status = await build(`MODULE=${module.name}`, 'module')
        stealify.print(`build ${module.name} ${status}`)
      }
      obj = obj.concat(module.obj.map(v => `${stealifyDir}/${v}`))
      if (module.lib && module.lib.length) lib = lib.concat(module.lib)
    }
    stealify.print(`building ${stealifyDir}/${name}.so`)
    status = await library(name, obj, lib)
    stealify.print(`library ${status}`)
    return
  }
  stealify.print(`building ${stealifyDir}/${name}.so`)
  status = await library(name)
  stealify.print(`library ${status}`)
}
const stealifyDir = stealify.env().STEALIFY_TARGET || `${stealify.sys.cwd()}/.stealify`
const shared = stealify.args.slice(1).some(arg => (arg === '--shared'))
if (shared) {
  bundleLibrary(stealify.args[2]).catch(err => stealify.error(err.stack))
} else {
  bundleExecutable(stealify.args[2]).catch(err => stealify.error(err.stack))
}

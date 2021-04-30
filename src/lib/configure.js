const { baseName, fileName, join } = stealify.path
const acorn = require('acorn')
const { readFile, isFile, isDir } = require('fs')
const { mkdir, writeFile } = stealify.fs
const { launch } = stealify.process
const appRoot = stealify.sys.cwd()
const cache = createCache()
const appDir = stealify.sys.cwd()
let config
const moduleCache = {}
let { HOME, STEALIFY_TARGET, STEALIFY_HOME } = stealify.env()
if (!STEALIFY_TARGET) {
  STEALIFY_TARGET = `${HOME}/.stealify`
}
if (!STEALIFY_HOME) {
  STEALIFY_HOME = STEALIFY_TARGET
}

function requireText (text) {
  const { vm } = stealify
  const params = ['exports', 'require', 'module']
  const exports = {}
  const module = { exports, type: 'native' }
  module.text = text
  if (!module.text) return
  const fun = vm.compile(module.text, stealify.sys.cwd(), params, [])
  module.function = fun
  fun.call(exports, exports, p => stealify.require(p, module), module)
  return module.exports
}

function createCache () {
  const libs = new Set()
  const natives = new Set()
  const modules = new Set()
  const external = new Set()
  return { main: '', index: '', libs, natives, modules, external }
}

function make (...args) {
  const currentDir = stealify.sys.cwd()
  const process = launch('make', ['C=gcc', 'CC=g++', ...args], currentDir)
  process.onStdout = (buf, len) => {}
  process.onStderr = (buf, len) => {}
  return process
}

function getExternalLibrary (originalFileName, fileName) {
  const libsDir = `${STEALIFY_TARGET}/lib/pg`
  if (!isDir(libsDir)) {
    stealify.fs.chdir(STEALIFY_TARGET)
    const process = make('libs')
    while (1) {
      const [status, kpid] = stealify.sys.waitpid(new Uint32Array(2), process.pid)
      if (kpid === process.pid) {
        if (status !== 0) throw new Error(`make failed ${status}`)
        break
      }
    }
    stealify.fs.chdir(appDir)
  }
  const moduleDir = `${STEALIFY_TARGET}/lib/${originalFileName}`
  if (!isDir(moduleDir)) {
    if (!config.external[originalFileName]) {
      throw new Error(`module not found ${moduleDir}`)
    }
    const { org, repo, tag, subdir = originalFileName, main = `${originalFileName}.js` } = config.external[originalFileName]
    const url = `https://codeload.github.com/${org}/${repo}/tar.gz/${tag}`
    stealify.print(url)
    //require('@fetch').fetch
    //stealify.sys.exit()
  }
  fileName = `${moduleDir}/${originalFileName}.js`
  return fileName
}

function getModule (fileName, libName) {
  const modulesDir = `${STEALIFY_TARGET}/modules`
  if (!isDir(modulesDir)) {
    stealify.fs.chdir(STEALIFY_TARGET)
    const process = make('modules')
    while (1) {
      const [status, kpid] = stealify.sys.waitpid(new Uint32Array(2), process.pid)
      if (kpid === process.pid) {
        if (status !== 0) throw new Error(`make failed ${status}`)
        break
      }
    }
    stealify.fs.chdir(appDir)
  }
  let moduleDir = `${STEALIFY_TARGET}/modules/${fileName}`
  if (libName) {
    libName = libName.replace('.so', '')
    moduleDir = `${STEALIFY_TARGET}/modules/${libName}`
  } else {
    libName = fileName
  }
  if (!isDir(moduleDir)) {
    throw new Error(`Module ${moduleDir} Not Found`)
    // TODO: look in config for module to download
  }
  const json = require(`${moduleDir}/${libName}.json`)
  const entry = moduleCache[libName] || { name: libName }
  if (json) {
    if (json.exports) {
      const lib = json.exports.filter(l => l.name === fileName)[0]
      if (!entry.exports) entry.exports = []
      const exists = entry.exports.filter(l => l.name === fileName)
      if (!exists.length) {
        const exp = { name: fileName, obj: [] }
        lib.obj.forEach(o => {
          exp.obj.push(`modules/${libName}/${o}`)
        })
        entry.exports.push(exp)
      }
    } else {
      if (!moduleCache[libName]) {
        if (!entry.obj) entry.obj = []
        entry.obj.push(`modules/${libName}/${fileName}.o`)
        for (const obj of json.obj) {
          entry.obj.push(`modules/${libName}/${obj}`)
        }
      }
    }
    entry.lib = json.lib
  } else {
    if (!moduleCache[libName]) {
      if (!entry.obj) entry.obj = []
      entry.obj.push(`modules/${libName}/${fileName}.o`)
    }
  }
  cache.modules.add(libName)
  moduleCache[libName] = entry
}

function parse (fileName, type = 'script') {
  const originalFileName = fileName
  if (fileName[0] === '@') {
    cache.external.add(fileName.slice(1))
    fileName = `${appRoot}/lib/${fileName.slice(1)}/${stealify.path.fileName(fileName.slice(1))}.js`
    fileName = getExternalLibrary(originalFileName.slice(1), fileName)
  }
  const parent = `${baseName(fileName)}`
  if (type === 'module' && fileName.indexOf('.') === -1) {
    cache.natives.add(`lib/${fileName}.js`)
    return
  }
  if (!isFile(fileName)) {
    stealify.error(`Warning ${fileName} not found`)
    return
  }
  if (type === 'script') {
    cache.index = fileName
  }
  if (type === 'module') {
    cache.libs.add(fileName.replace(`${appRoot}/`, '').replace(`${STEALIFY_TARGET}/`, ''))
  }
  const src = stealify.fs.readFile(fileName)
  acorn.parse(src, {
    ecmaVersion: 2020,
    sourceType: type,
    onToken: token => {
      if (token.value === 'require') {
        const expr = acorn.parseExpressionAt(src, token.start)
        if (expr.type === 'CallExpression') {
          if (expr.arguments[0].type === 'Literal') {
            let fileName = expr.arguments[0].value
            if (fileName[0] !== '@') {
              const ext = fileName.split('.').slice(-1)[0]
              if (ext === 'js' || ext === 'json') {
                fileName = join(parent, fileName)
              }
            }
            parse(fileName, 'module')
          }
        }
        return
      }
      if (token.value === 'library') {
        const expr = acorn.parseExpressionAt(src, token.start)
        if (expr.type === 'CallExpression') {
          const [fileName, libName] = expr.arguments
          if (libName) {
            if (fileName.type === 'Literal' && libName.type === 'Literal') {
              getModule(fileName.value, libName.value)
            }
          } else {
            if (fileName.type === 'Literal') {
              getModule(fileName.value)
            }
          }
        }
      }
    }
  })
  return cache
}

function run (scriptName, opts = {}) {
  if (!scriptName) throw new Error('Please Supply a Script name')
  const fn = fileName(scriptName)
  const appName = fn.slice(0, fn.lastIndexOf('.'))
  const builtin = requireText(stealify.builtin('config.js')) || {}
  if (isFile(`${appName}.config.json`)) {
    config = requireText(readFile(`${appName}.config.json`))
  } else if (isFile(`${appName}.config.js`)) {
    config = requireText(readFile(`${appName}.config.js`))
  } else {
    config = require('config.js')
    if (!config) {
      config = JSON.parse(JSON.stringify(builtin))
    }
    config.embeds = []
  }
  for (const module of builtin.modules) {
    moduleCache[module.name] = module
  }
  if (config.modules) {
    for (const module of config.modules) {
      moduleCache[module.name] = module
    }
  }
  if (!config.external) config.external = {}
  if (!isDir(STEALIFY_TARGET)) {
    mkdir(STEALIFY_TARGET)
    mkdir(`${STEALIFY_TARGET}/lib`)
  }
  for (const fileName of builtin.embeds) {
    const fn = `${STEALIFY_TARGET}/${fileName}`
    if (!isFile(fn)) writeFile(fn, ArrayBuffer.fromString(stealify.builtin(fileName)))
  }
  for (const fileName of builtin.libs) {
    const fn = `${STEALIFY_TARGET}/${fileName}`
    if (!isFile(fn)) writeFile(fn, ArrayBuffer.fromString(stealify.builtin(fileName)))
  }
  if (!isFile(`${STEALIFY_TARGET}/Makefile`)) writeFile(`${STEALIFY_TARGET}/Makefile`, ArrayBuffer.fromString(stealify.builtin('Makefile')))
  config.modules = config.modules || []
  let builtinModules = config.modules.map(v => v.name)
  if (config.main === 'stealify.js' || !config.main) {
    builtinModules = [...new Set([...builtinModules, ...builtin.modules.map(v => v.name)])]
  }
  const { index, libs, modules, natives } = parse(scriptName)
  if (!config.target || config.target === 'stealify') {
    config.target = appName
  }
  config.version = config.version || builtin.version
  config.v8flags = config.v8flags || builtin.v8flags
  config.debug = config.debug || builtin.debug
  config.capabilities = config.capabilities || builtin.capabilities
  config.static = opts.static || config.static
  config.index = config.index || index
  config.libs = [...new Set([...Array.from(libs.keys()), ...Array.from(natives.keys())])]
  config.modules = [...new Set([...builtinModules, ...Array.from(modules.keys())])].map(k => moduleCache[k])
  config.embeds = config.embeds || []
  if (config.index === config.main) delete config.index
  return config
}

module.exports = { run }

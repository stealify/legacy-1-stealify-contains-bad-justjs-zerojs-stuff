
const { createContext, compileAndRunInContext, enterContext, exitContext } = stealify.vm
const { AM, AD } = require('@binary').ANSI

function newContext (opts = {}) {
  const ctx = new ArrayBuffer(0)
  const stealify = createContext(ctx)
  stealify.args = opts.args || []
  if (!opts.builtin) delete stealify.builtin
  if (!opts.load) delete stealify.load
  if (!opts.sleep) delete stealify.sleep
  if (!opts.chdir) delete stealify.chdir
  const scriptName = opts.scriptName || 'stealify.js'
  function execute (src) {
    return compileAndRunInContext(ctx, src, scriptName)
  }
  if (opts.main) compileAndRunInContext(ctx, opts.main, scriptName)
  return { stealify, execute, ctx }
}

/*
// run a full stealify.js runtime with args. same as running from shell
const full = newContext({
  main: stealify.builtin('stealify.js'),
  load: true,
  builtin: true,
  args: ['stealify', '--freeze', 'eval', "require('repl').repl()"]
})

// create the simplest possible context and run a repl in current
// context to evaluate code in the new context
const context = newContext()
require('repl').repl().onCommand = context.execute
*/

const full = newContext({
  main: stealify.builtin('stealify.js'),
  load: true,
  builtin: true,
  args: ['stealify', '--freeze', 'eval', '']
})
const mini = newContext()

const dumpScript = `
stealify.print(JSON.stringify(Object.getOwnPropertyNames(global), null, '  '))
stealify.print(JSON.stringify(Object.getOwnPropertyNames(stealify), null, '  '))
stealify.foo = 'bar'
`

stealify.print(`${AM}full${AD}`)
full.execute(dumpScript)
stealify.print(`${AM}mini${AD}`)
mini.execute(dumpScript)

enterContext(full)
//stealify.print('hello')
//exitContext(full)

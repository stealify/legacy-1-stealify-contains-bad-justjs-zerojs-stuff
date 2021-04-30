const src = stealify.builtin('stealify.js')

function createContext () {
  const ctx = new ArrayBuffer(8)
  const contextStealify = stealify.vm.createContext(ctx)
  const start = Date.now()
  contextStealify.args = []
  function execute (src, scriptName = 'stealify.js') {
    return stealify.vm.compileAndRunInContext(ctx, src, scriptName)
  }
  stealify.vm.compileAndRunInContext(ctx, src, 'stealify.js')
  Object.assign(contextStealify, stealify)
  //stealify.vm.compileAndRunInContext(ctx, 'stealify.setInterval(() => {}, 10000)', 'stealify.js')
  const time = Date.now() - start
  return { stealify: contextStealify, execute, time, ctx }
}

const contexts = []

function next () {
  const context = createContext()
  context.stealify.id = contexts.length
  contexts.push(context)
  if (contexts.length === 1000) {
    stealify.clearInterval(t)
    stealify.clearInterval(t2)
    require('repl').repl()
  }
}

const t = stealify.setInterval(next, 1)
stealify.print(stealify.sys.pid())
let last = 0
const t2 = stealify.setInterval(() => {
  const rss = stealify.memoryUsage().rss
  const total = BigInt(contexts.length)
  const average = rss / (total || 1n)
  const time = contexts.map(context => context.time).reduce((a, v) => v + a, 0)
  const avgTime = time / contexts.length
  const created = contexts.length - last
  last = contexts.length
  stealify.print(`rss ${rss.toString()} contexts ${total} average ${average.toString()} time ${avgTime.toFixed(2)} ${created}`)
}, 1000)

while (1) {
  stealify.factory.loop.poll(-1)
  stealify.sys.runMicroTasks()
}

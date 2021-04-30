const { readFile } = require('fs')
stealify.thread = stealify.library('thread', 'thread.so').thread

const main = stealify.builtin('stealify.js').readString()
const cores = [2, 3, 4, 5]
let current = 0
stealify.print(stealify.sys.pid())

function spawn (source) {
  const shared = new SharedArrayBuffer(4)
  const u32 = new Uint32Array(shared)
  const tid = stealify.thread.spawn(source, main, stealify.args.slice(1), shared)
  stealify.thread.setAffinity(tid, cores[current++])
  const core = stealify.thread.getAffinity(tid)
  if (current === cores.length) current = 0
  const thread = { tid, u32, core, shared }
  threads.push(thread)
  return thread
}

let last = 0
function onTimer () {
  const { user, system, elapsed } = stealify.cpuUsage()
  const { rss } = stealify.memoryUsage()
  let total = 0
  for (const thread of threads) {
    total += Atomics.exchange(thread.u32, 0, 0)
  }
  const u = user / elapsed
  const s = system / elapsed
  const jitter = Math.abs(total - last) / total
  last = total
  stealify.print(`threads ${threads.length} total ${total} mem ${rss} cpu (${u.toFixed(2)}/${s.toFixed(2)}) ${(u + s).toFixed(2)} qps/core ${(total / (u + s)).toFixed(2)} mem/core ${(Number(rss) / threads.length).toFixed(0)} jitter ${jitter.toFixed(2)}`)
}

const source = readFile(stealify.args[2] || 'test.js')
const cpus = parseInt(stealify.env().CPUS || stealify.sys.cpus, 10)
const threads = []
for (let i = 0; i < cpus; i++) spawn(source)
stealify.setInterval(onTimer, 1000)

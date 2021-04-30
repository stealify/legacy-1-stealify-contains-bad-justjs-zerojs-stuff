stealify.thread = stealify.library('thread', 'thread.so').thread
function spawn (fn, onComplete) {
  let source = fn.toString()
  source = source.slice(source.indexOf('{') + 1, source.lastIndexOf('}')).trim()
  const tid = stealify.thread.spawn(source)
  const thread = { tid, onComplete }
  threads.push(thread)
  return thread
}

let threads = []

const timer = stealify.setInterval(() => {
  for (const thread of threads) {
    const { tid, onComplete } = thread
    const answer = [0]
    const r = stealify.thread.tryJoin(tid, answer)
    if (r === 0n) {
      threads = threads.filter(t => !(t.tid === tid))
      onComplete(tid, answer[0])
    }
  }
  stealify.print(`${threads.length} running`)
}, 1000)

function threadOne () {
  let count = 0
  const timer = stealify.setInterval(() => {
    if (count++ === 5) stealify.clearInterval(timer)
    stealify.print(`${stealify.thread.self()} running`)
  }, 1000)
}

function onComplete (tid, rc) {
  stealify.print(`thread ${tid} completed with rc ${rc}`)
  stealify.print(`threads ${threads.length} rss: ${stealify.memoryUsage().rss}`)
  if (!threads.length) stealify.clearInterval(timer)
}

spawn(threadOne, onComplete)
spawn(threadOne, onComplete)
spawn(threadOne, onComplete)

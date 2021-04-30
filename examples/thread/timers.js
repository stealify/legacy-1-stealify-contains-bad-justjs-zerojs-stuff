stealify.thread = stealify.library('thread', 'thread.so').thread

function threadOne () {
  stealify.setInterval(() => {
    stealify.print('hello from thread one')
  }, 1000)
}

function threadTwo () {
  stealify.setInterval(() => {
    stealify.print('hello from thread two')
  }, 1000)
}

function spawn (fn) {
  let source = fn.toString()
  source = source.slice(source.indexOf('{') + 1, source.lastIndexOf('}')).trim()
  return stealify.thread.spawn(source, stealify.builtin('stealify.js'))
}

const tids = []
tids.push(spawn(threadOne))
tids.push(spawn(threadTwo))
tids.forEach(tid => stealify.thread.join(tid))

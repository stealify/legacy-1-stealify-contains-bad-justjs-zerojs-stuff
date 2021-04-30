const { sys } = stealify.library('sys')
const { readFileBytes } = require('fs')
const { memory } = stealify.library('memory')
const { fexecve, fork, waitpid } = sys
const { memfdCreate, MFD_CLOEXEC } = memory
const fd = memfdCreate('busybox', MFD_CLOEXEC)
let buf = stealify.builtin('busybox', 1)
if (!buf) {
  buf = readFileBytes('./busybox')
}
stealify.net.write(fd, buf)
const u32 = new Uint32Array(2)
function exec (...args) {
  const pid = fork()
  if (pid === 0) {
    fexecve(fd, args)
    throw new stealify.SystemError('fexecve')
  }
  return waitpid(u32, pid, 0)
}
while (1) {
  const [status, pid] = exec('sleep', stealify.args[1] || '1')
  stealify.print(`sleep ${pid} : ${status} rss ${stealify.memoryUsage().rss}`)
}

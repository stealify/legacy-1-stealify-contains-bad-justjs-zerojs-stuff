const { loop } = stealify.factory
const { EPOLLERR, EPOLLHUP, EPOLLIN } = stealify.loop
const { close, read } = stealify.net
const { setNonBlocking } = require('lib/process.js')
const buf = new ArrayBuffer(4096)
setNonBlocking(stealify.sys.STDIN_FILENO)
let total = 0
loop.add(stealify.sys.STDIN_FILENO, (fd, event) => {
  if (event & EPOLLERR || event & EPOLLHUP) {
    loop.remove(fd)
    stealify.print('closing')
    close(fd)
    return
  }
  if (event & EPOLLIN) {
    total += read(fd, buf)
  }
})
stealify.setInterval(() => {
  const mbits = Math.floor((total / (1024 * 1024)) * 8)
  stealify.print(`child  ${mbits} Mb`)
  total = 0
}, 1000)

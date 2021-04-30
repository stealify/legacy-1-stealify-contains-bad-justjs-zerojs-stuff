const { loop } = stealify.factory
const { EPOLLERR, EPOLLHUP, EPOLLIN } = stealify.loop
const { close, read } = stealify.net
const pid = stealify.sys.pid()

stealify.setInterval(() => {
  stealify.print(`child (${pid}) timer`)
}, 1000)

const buf = new ArrayBuffer(4096)

loop.add(stealify.sys.STDIN_FILENO, (fd, event) => {
  if (event & EPOLLERR || event & EPOLLHUP) {
    loop.remove(fd)
    close(fd)
    return
  }
  if (event & EPOLLIN) stealify.print(buf.readString(read(fd, buf)))
})

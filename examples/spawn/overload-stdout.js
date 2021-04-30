const { fcntl } = stealify.sys
const { O_NONBLOCK } = stealify.net

function setNonBlocking (fd) {
  let flags = fcntl(fd, stealify.sys.F_GETFL, 0)
  if (flags < 0) return flags
  flags |= O_NONBLOCK
  return fcntl(fd, stealify.sys.F_SETFL, flags)
}

const buf = ArrayBuffer.fromString('0'.repeat(65536))
const fd = stealify.sys.STDOUT_FILENO
setNonBlocking(fd)
stealify.error(stealify.sys.pid())
while (1) {
  const r = stealify.net.write(fd, buf)
  if (r < 65536) {
    stealify.error(r)
    stealify.sys.exit(1)
  }
}

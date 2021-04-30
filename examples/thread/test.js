const { thread } = stealify.library('thread')
const { send, socketpair, AF_UNIX, SOCK_STREAM } = stealify.net
const { errno, strerror } = stealify.sys

function main () {
  stealify.load('vm').vm.runScript(stealify.workerSource, 'foo.js')
}

function getSource (fn) {
  let source = fn.toString()
  source = source.slice(source.indexOf('{') + 1, source.lastIndexOf('}')).trim()
  return source
}

function createPipe () {
  const fds = []
  const r = socketpair(AF_UNIX, SOCK_STREAM, fds)
  if (r !== 0) throw new Error(`socketpair ${r} errno ${errno()} : ${strerror(errno())}`)
  return fds
}

function threadMain () {
  const shared = stealify.buffer
  const { fd } = stealify
  const u32 = new Uint32Array(shared)
  const buf = new ArrayBuffer(4096)
  const { sys } = stealify.load('sys')
  const { net } = stealify.load('net')
  while (1) {
    Atomics.add(u32, 0, 1)
    const bytes = net.recv(fd, buf, 0, buf.byteLength)
    if (bytes > 0) {
      const message = sys.readString(buf, bytes)
      if (message === 'quit') break
      stealify.print(`thread recv: ${message}`)
    }
    sys.usleep(1000)
  }
}

const ipc = createPipe()
const shared = new SharedArrayBuffer(4)
const u32 = new Uint32Array(shared)
const buf = new ArrayBuffer(128)
const tid = thread.spawn(getSource(threadMain), getSource(main), [], shared, ipc[1])
let iter = 0
const timer = stealify.setInterval(() => {
  const counter = Atomics.load(u32, 0)
  if (iter++ === 5) {
    send(ipc[0], buf, buf.writeString('quit'))
  } else {
    send(ipc[0], buf, buf.writeString(`counter ${counter} rss ${stealify.memoryUsage().rss}`))
  }
  const status = []
  const r = thread.tryJoin(tid, status)
  if (r === 0n) {
    // thread is complete
    stealify.print(status)
    stealify.print(`thread complete ${status[1]}`)
    stealify.clearInterval(timer)
  }
}, 1000)

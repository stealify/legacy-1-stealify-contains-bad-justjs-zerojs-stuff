const fd = stealify.sys.shmopen('/omgthisiscool')
stealify.fs.ftruncate(fd, 4096)
const ab = stealify.sys.mmap(fd, 4096)
const u32 = new Uint32Array(ab)

Atomics.store(u32, 0, 0)

let count = 10000

const t = stealify.setInterval(() => {
  Atomics.add(u32, 0, 1)
  if (--count === 0) stealify.clearInterval(t)
}, 1)

stealify.setInterval(() => {
  stealify.print(Atomics.load(u32, 0))
}, 1000)

const fd = stealify.sys.shmopen('/omgthisiscool')
const ab = stealify.sys.mmap(fd, 4096)
const u32 = new Uint32Array(ab)

let count = 10000

const t = stealify.setInterval(() => {
  Atomics.add(u32, 0, 1)
  if (--count === 0) stealify.clearInterval(t)
}, 1)

stealify.setInterval(() => {
  stealify.print(Atomics.load(u32, 0))
}, 1000)

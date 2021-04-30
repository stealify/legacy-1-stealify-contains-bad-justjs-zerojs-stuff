const { signal } = stealify.library('signal')

function shutdown (signum) {
  if (signum === signal.SIGWINCH) return
  stealify.print(`shutting down ${signum}`)
  stealify.exit(1, signum)
}

stealify.print(stealify.pid())
signal.reset()
for (let i = 1; i < 32; i++) signal.sigaction(i, shutdown)
while (1) {
  stealify.print(stealify.memoryUsage()[0])
  stealify.sleep(1)
}

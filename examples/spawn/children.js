const { launch, watch } = require('lib/process.js')
const { STDOUT_FILENO, STDERR_FILENO } = stealify.sys
const pid = stealify.sys.pid()

async function run () {
  const process = launch('stealify', ['timer.js'])
  process.onStdout = (buf, len) => stealify.net.write(STDOUT_FILENO, buf, len)
  process.onStderr = (buf, len) => stealify.net.write(STDERR_FILENO, buf, len)
  process.onClose = () => stealify.print('io closed')
  let timer
  process.onWritable = () => {
    timer = stealify.setInterval(() => {
      stealify.print(`parent (${pid}) timer`)
      process.write(ArrayBuffer.fromString(`hello from ${pid}`))
    }, 1000)
  }
  const status = await watch(process)
  stealify.print(`exit ${status}`)
  if (timer) stealify.clearInterval(timer)
}

run().catch(err => stealify.error(err.stack))

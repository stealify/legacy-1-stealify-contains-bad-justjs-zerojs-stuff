const { compile, save, evaluate, createMemory } = require('../../modules/wasm/wasm.js')
const { loop } = stealify.factory
const { http } = stealify.library('http.so', 'http')
const { parseRequests } = http

async function main () {
  const fileName = stealify.path.join(stealify.path.baseName(stealify.path.scriptName), './parse.wat')
  const { wasm } = await compile(fileName)
  save('./parse.wasm', wasm)
  const memory = createMemory({ initial: 20 })
  const { buffer } = memory
  stealify.print(buffer.byteLength)
  const startData = 16384
  const context = { }
  let requests = 0
  const { parse } = evaluate(wasm, context, memory)
  const str = 'GET /thisisatest HTTP/1.1\r\nHost: api.billywhizz.io\r\nAccept: application/json\r\n\r\n'.repeat(1024)
  const len = buffer.writeString(str, startData)
  let bytes = 0
  function test () {
    for (let i = 0; i < 1000; i++) {
      requests += parse(startData, len + startData)
      //requests += parseRequests(buffer, len, startData)
      bytes += len
    }
    loop.poll(0)
    stealify.sys.runMicroTasks()
  }
  stealify.setInterval(() => {
    const rss = stealify.memoryUsage().rss
    const mbps = Math.floor(bytes / (1024 * 1024) * 100) / 100
    stealify.print(`rps ${requests} mem ${rss} MBps ${mbps}`)
    requests = 0
    bytes = 0
  }, 1000)
  while (1) {
    test()
  }
}

main().catch(err => stealify.error(err.stack))

const { copyFile } = require('fs')
const { cwd } = stealify.sys
const { build } = require('build')

const stealifyDir = `${stealify.env().STEALIFY_TARGET || stealify.sys.cwd()}/.foo`
const config = {
  destination: stealifyDir
}

function run (fileName = 'stealify') {
  build(config, (err, process) => {
    if (err) return stealify.error(err.stack)
    const { pid, status } = process
    if (pid < 0) throw new Error(`bad PID ${pid}`)
    if (status !== 0) throw new Error(`bad status ${status}`)
    copyFile(`${stealifyDir}/stealify`, `${cwd()}/${fileName}`)
  })
}

run()

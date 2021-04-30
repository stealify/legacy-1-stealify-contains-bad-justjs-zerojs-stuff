const { TTY } = process.binding('tty_wrap')
const stdin = new TTY(0)
stdin.setRawMode(true)
let size = 0
stdin.onread = buf => {
  if (!buf) {
    console.log(size)
    return
  }
  size += buf.byteLength
}
stdin.readStart()

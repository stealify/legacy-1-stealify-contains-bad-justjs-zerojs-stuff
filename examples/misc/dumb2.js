const { signal } = stealify.library('signal')

const ignore = new Array(32)
signal.SIGTTIN = 21
signal.SIGTTOU = 22

function showStats () {}
const MAXSIG = 31
const TIOCNOTTY = 0x5422
const TIOCSCTTY = 0x540E
const sigmask = new ArrayBuffer(128)

function onSignal (signum) {
  if (ignore[signum]) {
    ignore[signum] = 0
    return
  }
  let exitStatus = 0
  if (signum === signal.SIGCHLD) {
    let [status, kpid] = stealify.sys.waitpid(new Uint32Array(2))
    while (kpid > 0) {
      if ((status & 0x7f) === 0) { // WIFEXITED
        exitStatus = ((status & 0xff00) >> 8) // WEXITSTATUS
      } else {
        // assert(WIFSIGNALED(status));
        exitStatus = 128 + (status & 0x7f) // WTERMSIG
      }
      if (kpid === child) {
        stealify.sys.kill(-child, signal.SIGTERM)
        stealify.sys.exit(exitStatus)
      }
      [status, kpid] = stealify.sys.waitpid(new Uint32Array(2))
    }
  }
  if (signum !== 0) stealify.sys.kill(-child, signum)
  if (signum === signal.SIGTSTP || signum === signal.SIGTTOU || signum === signal.SIGTTIN) {
    stealify.sys.kill(stealify.sys.pid(), signal.SIGSTOP)
  }
}

function parentMain () {
  signal.reset()
  stealify.fs.chdir('/')
  for (let i = 1; i <= MAXSIG; i++) {
    signal.sigaction(i, onSignal)
  }
  stealify.setInterval(showStats, 1000)
}

function childMain () {
  signal.sigprocmask(sigmask, signal.SIG_UNBLOCK, 1)
  if (stealify.sys.setsid() === -1) {
    stealify.sys.exit(1)
  }
  stealify.sys.ioctl(stealify.sys.STDIN_FILENO, TIOCSCTTY)
  stealify.sys.exec('stealify', stealify.args.slice(2))
  stealify.sys.exit(2)
}

ignore.fill(0)
signal.sigfillset(sigmask)
signal.sigprocmask(sigmask, signal.SIG_BLOCK, 1)
if (stealify.sys.ioctl(stealify.sys.STDIN_FILENO, TIOCNOTTY) !== -1) {
  if (stealify.sys.getsid(0) === stealify.sys.pid()) {
    ignore[signal.SIGHUP] = 1
    ignore[signal.SIGCONT] = 1
  }
}
const child = stealify.sys.fork()
if (child < 0) throw new stealify.SystemError('fork')
child === 0 ? childMain() : parentMain()

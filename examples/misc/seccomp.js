const { signal } = stealify.library('signal')
const { seccomp } = stealify.library('seccomp')
const {
  SCMP_ACT_KILL_PROCESS,
  SYSCALL_NAME_MAX_LEN,
  SCMP_ACT_KILL_THREAD,
  SCMP_ACT_TRAP,
  SCMP_ACT_LOG,
  SCMP_ACT_ALLOW
} = seccomp
const { create, addRule, load, release, getName, getNumber } = seccomp

//signal.reset()
signal.sigaction(signal.SIGSYS, signum => {
  stealify.print('signalled')
})

let i = 0
let syscall = getName(i)
while (syscall) {
  stealify.print(`${i.toString().padEnd(6, ' ')} ${syscall}`)
  syscall = getName(++i)
}
let r = 0

//const ctx = seccomp.create(seccomp.SCMP_ACT_LOG)
const ctx = create(SCMP_ACT_KILL_PROCESS)
if (!ctx) throw new Error('could not create seccomp context')

const syscalls = [
  'write',
  'mprotect',
  'madvise',
  'futex',
  'getpid',
  'munmap',
  'exit_group',
  'timerfd_create',
  'timerfd_settime',
  'epoll_ctl',
  'epoll_wait',
  'read'
]

for (const syscall of syscalls) {
  r = addRule(ctx, getNumber(syscall), SCMP_ACT_ALLOW)
  stealify.print(`seccomp.allow ${syscall} ${r}`)
}

//r = addRule(ctx, getNumber('read'), SCMP_ACT_TRAP)
//stealify.print(`seccomp.allow ${syscall} ${r}`)

r = load(ctx)
stealify.print(`seccomp.load ${r}`)

stealify.setInterval(() => {
  stealify.print('foo')
}, 1000)

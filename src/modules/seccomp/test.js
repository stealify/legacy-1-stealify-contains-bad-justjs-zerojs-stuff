const { seccomp } = stealify.library('seccomp', './seccomp.so')

stealify.print(seccomp.getNumber('read'))
stealify.print(seccomp.getNumber('write'))
stealify.print(seccomp.getNumber('exit'))
stealify.print(seccomp.getNumber('mknod'))

stealify.print(seccomp.getName(228))
stealify.print(seccomp.getName(233))
stealify.print(seccomp.getName(232))
stealify.print(seccomp.getName(283))
stealify.print(seccomp.getName(286))


const syscalls = [
  'read',
  'write',
  'clock_gettime',
  'epoll_ctl',
  'epoll_wait',
  'timerfd_create',
  'timerfd_settime'
]

// allow subset, log on exception
seccomp.allow(syscalls.join(':'), false)

// allow none, log on exception
//seccomp.allow('', true)

// disallow write, log on exception, all others allowed
//seccomp.deny('write', false)

stealify.setInterval(() => {
  stealify.print('hello')
}, 1000)

stealify.setTimeout(() => {
  const fd = stealify.fs.open('/tmp/foo.txt')
}, 5000)

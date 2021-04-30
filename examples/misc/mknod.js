const { S_IFCHR, S_IRUSR, S_IRGRP, S_IWUSR, S_IROTH } = stealify.fs
const mode = S_IRUSR | S_IRGRP | S_IWUSR | S_IROTH
let r = stealify.fs.mknod('tty', S_IFCHR, mode, 5, 0)
stealify.print(r)
r = stealify.fs.mknod('console', S_IFCHR, mode, 5, 1)
stealify.print(r)

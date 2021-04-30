const { crypto } = stealify.library('crypto', 'openssl.so')
const { encode } = stealify.library('encode')

const algorithms = {
  'sha512': crypto.SHA512,
  'sha256': crypto.SHA256,
  'sha1': crypto.SHA1,
  'md5': crypto.MD5,
  'md4': crypto.MD4,
  'sha224': crypto.SHA224,
  'sha384': crypto.SHA384,
  'ripemd160': crypto.RIPEMD160
}

function checksum (fd, algorithm = crypto.SHA256) {
  const source = new ArrayBuffer(65536)
  const dest = new ArrayBuffer(64)
  const hash = crypto.create(algorithm, source, dest)
  if (hash < 0) throw new Error('Could not create Hash')
  let bytes = stealify.net.read(fd, source)
  while (bytes > 0) {
    crypto.update(hash, bytes)
    bytes = stealify.net.read(fd, source)
  }
  if (bytes < 0) throw new stealify.SystemError('read')
  return stealify.sys.readString(source, encode.hexEncode(dest, source, crypto.digest(hash)))
}

let fd = stealify.sys.STDIN_FILENO
let fileName = 'stdin'
if (stealify.args.length > 2) {
  fileName = stealify.args[2]
  fd = stealify.fs.open(fileName)
  if (fd <= 0) throw new stealify.SystemError('open')
}
const algo = algorithms[stealify.args[3] || 'sha256']
if (!algo) throw new Error(`Algorithm not found ${stealify.args[3]}`)
stealify.print(`${checksum(fd, algo)}  ${fileName}`)

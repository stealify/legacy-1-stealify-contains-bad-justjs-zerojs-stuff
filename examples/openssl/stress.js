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

const source = new ArrayBuffer(65536)
const dest = new ArrayBuffer(64)
const result = new ArrayBuffer(128)
const fd = stealify.fs.open('/dev/urandom')
const bytes = stealify.net.read(fd, source)
const algorithm = algorithms[stealify.args[3] || 'sha256']
const hash = crypto.create(algorithm, source, dest)

function test (runs = 5000) {
  const start = Date.now()
  for (let i = 1; i < runs; i++) {
    crypto.update(hash, bytes)
    crypto.digest(hash)
    crypto.reset(hash)
  }
  const elapsed = Date.now() - start
  stealify.print(runs / (elapsed / 1000))
  stealify.print(stealify.memoryUsage().rss)
  stealify.setTimeout(test, 100)
}

test()

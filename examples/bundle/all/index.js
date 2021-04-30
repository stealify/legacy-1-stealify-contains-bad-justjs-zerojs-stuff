function testLib (name, lib) {
  stealify.print(`testing ${name}`)
  const library = stealify.library(`${lib || name}.so`, name)
  stealify.print(JSON.stringify(Object.getOwnPropertyNames(library[name]), null, '  '))
}

testLib('html')
testLib('http')
testLib('blake3')
testLib('zlib')
testLib('ffi')
testLib('tcc')
testLib('crypto', 'openssl')
testLib('tls', 'openssl')
testLib('pg')

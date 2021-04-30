const { ffi } = stealify.library('../ffi/ffi.so', 'ffi')
const { tcc } = stealify.library('./tcc.so', 'tcc')
const source = `
#include "foo.h"

int fib(int n) {
  foo(n);
  if (n <= 2)
      return 1;
  else
      return fib(n-1) + fib(n-2);
}
`
const code = tcc.compile(source, ['-O3'], [stealify.sys.cwd()])
if (!code) throw new Error('Could not compile')

const handle = stealify.sys.dlopen()
if (!handle) throw new Error('Clould not create handle')
const printf = stealify.sys.dlsym(handle, 'printf')
if (!printf) throw new Error('Could not find symbol')

tcc.add(code, 'log', printf)
tcc.relocate(code)

const fn = tcc.get(code, 'fib')
if (!fn) throw new Error('Could not find symbol')

function prepareFib () {
  const cif = new ArrayBuffer(4)
  const dv = new DataView(cif)
  const status = ffi.ffiPrepCif(cif, ffi.FFI_TYPE_UINT32, [ffi.FFI_TYPE_UINT32])
  if (status !== ffi.FFI_OK) {
    throw new Error(`Bad Status ${status}`)
  }
  function fib (v) {
    dv.setUint32(0, v, true)
    return ffi.ffiCall(cif, fn)
  }
  return fib
}

const fib = prepareFib()
stealify.print(fib(parseInt(stealify.args[2] || '16')))
stealify.print(fib(parseInt(stealify.args[2] || '16')))

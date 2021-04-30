const { ffi } = stealify.library('../ffi/ffi.so', 'ffi')

const { tcc } = stealify.library('./tcc.so', 'tcc')

const source = `#include <tcclib.h>
extern int fib(int n);

int fib(int n) {
    if (n <= 2)
        return 1;
    else
        return fib(n-1) + fib(n-2);
}
`
tcc.compile(source)
const handle = stealify.sys.dlopen()
if (!handle) throw new Error('Clould not create handle')
const fn = stealify.sys.dlsym(handle, 'fib')
if (!fn) throw new Error('Could not find symbol')
const cif = new ArrayBuffer(4)
const dv = new DataView(cif)
const status = ffi.ffiPrepCif(cif, ffi.FFI_TYPE_UINT32, [ffi.FFI_TYPE_UINT32])
if (status !== ffi.FFI_OK) {
  throw new Error(`Bad Status ${status}`)
}
dv.setUint32(0, fd, true)
const r = ffi.ffiCall(cif, fn)
stealify.print(r)

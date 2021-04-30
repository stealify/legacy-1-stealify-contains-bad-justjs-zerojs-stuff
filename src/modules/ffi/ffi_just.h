#ifndef STEALIFY_FFI_H
#define STEALIFY_FFI_H

#include <stealify.h>
#include <ffi.h>

namespace stealify {

namespace ffi {

void FfiPrepCif(const FunctionCallbackInfo<Value> &args);
void FfiPrepCifVar(const FunctionCallbackInfo<Value> &args);
void FfiCall(const FunctionCallbackInfo<Value> &args);
void Init(Isolate* isolate, Local<ObjectTemplate> target);

}

}

extern "C" {
	void* _register_ffi() {
		return (void*)stealify::ffi::Init;
	}
}

#endif

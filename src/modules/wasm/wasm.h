#ifndef STEALIFY_FIB_H
#define STEALIFY_FIB_H

#include <stealify.h>

namespace stealify {

namespace wasm {

void Fibonacci(const FunctionCallbackInfo<Value> &args);
void Init(Isolate* isolate, Local<ObjectTemplate> target);

}

}

extern "C" {
	void* _register_wasm() {
		return (void*)stealify::wasm::Init;
	}
}

#endif

#ifndef STEALIFY_FIB_H
#define STEALIFY_FIB_H

#include <stealify.h>

namespace stealify {

namespace fib {

void Fibonacci(const FunctionCallbackInfo<Value> &args);
void Init(Isolate* isolate, Local<ObjectTemplate> target);

}

}

extern "C" {
	void* _register_fib() {
		return (void*)stealify::fib::Init;
	}
}

#endif

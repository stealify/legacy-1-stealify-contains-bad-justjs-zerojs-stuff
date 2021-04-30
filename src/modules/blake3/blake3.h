#ifndef STEALIFY_ZLIB_H
#define STEALIFY_ZLIB_H

#include "stealify.h"
#include <blake3.h>

namespace stealify {

namespace blake3 {

void HashInit(const FunctionCallbackInfo<Value> &args);
void HashInitKeyed(const FunctionCallbackInfo<Value> &args);
void HashUpdate(const FunctionCallbackInfo<Value> &args);
void HashFinalize(const FunctionCallbackInfo<Value> &args);
void Init(Isolate* isolate, Local<ObjectTemplate> target);

}

}

extern "C" {
	void* _register_blake3() {
		return (void*)stealify::blake3::Init;
	}
}

#endif

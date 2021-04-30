#ifndef STEALIFY_ZLIB_H
#define STEALIFY_ZLIB_H

#include "stealify.h"
#include <seccomp.h>

namespace stealify {

namespace seccomp {

#define SYSCALL_NAME_MAX_LEN 128

void Create(const FunctionCallbackInfo<Value> &args);
void AddRule(const FunctionCallbackInfo<Value> &args);
void Load(const FunctionCallbackInfo<Value> &args);
void Release(const FunctionCallbackInfo<Value> &args);
void GetName(const FunctionCallbackInfo<Value> &args);
void GetNumber(const FunctionCallbackInfo<Value> &args);
void Init(Isolate* isolate, Local<ObjectTemplate> target);

}

}

extern "C" {
	void* _register_seccomp() {
		return (void*)stealify::seccomp::Init;
	}
}

#endif

#ifndef STEALIFY_MEMTEST_H
#define STEALIFY_MEMTEST_H

#include <stealify.h>

#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/epoll.h>
#include <unistd.h>
#include <inttypes.h>
#include <stdarg.h>

namespace stealify {

namespace memtest {

void ReadOne(const FunctionCallbackInfo<Value> &args);
void ReadTwo(const FunctionCallbackInfo<Value> &args);

void* getBufferData (Local<Value> arg);

void Init(Isolate* isolate, Local<ObjectTemplate> target);
}

}

extern "C" {
	void* _register_memtest() {
		return (void*)stealify::memtest::Init;
	}
}

#endif

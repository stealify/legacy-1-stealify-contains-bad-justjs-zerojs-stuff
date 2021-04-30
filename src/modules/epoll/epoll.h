#ifndef STEALIFY_LOOP_H
#define STEALIFY_LOOP_H

#include <stealify.h>
#include <sys/epoll.h>

namespace stealify {

namespace epoll {

void EpollCtl(const FunctionCallbackInfo<Value> &args);
void EpollCreate(const FunctionCallbackInfo<Value> &args);
void EpollWait(const FunctionCallbackInfo<Value> &args);

void Init(Isolate* isolate, Local<ObjectTemplate> target);
}

}

extern "C" {
	void* _register_epoll() {
		return (void*)stealify::epoll::Init;
	}
}

#endif

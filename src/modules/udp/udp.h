#ifndef STEALIFY_UDP_H
#define STEALIFY_UDP_H

#include <stealify.h>
#include <arpa/inet.h>

namespace stealify {

namespace udp {
void RecvMsg(const FunctionCallbackInfo<Value> &args);
void SendMsg(const FunctionCallbackInfo<Value> &args);
void Init(Isolate* isolate, Local<ObjectTemplate> target);
}

}

extern "C" {
	void* _register_udp() {
		return (void*)stealify::udp::Init;
	}
}

#endif

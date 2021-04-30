#ifndef STEALIFY_NETLINK_H
#define STEALIFY_NETLINK_H

#include <stealify.h>
#include <asm/types.h>
#include <linux/netlink.h>
#include <linux/rtnetlink.h>
#include <sys/socket.h>

namespace stealify {

namespace netlink {

void Fibonacci(const FunctionCallbackInfo<Value> &args);
void Init(Isolate* isolate, Local<ObjectTemplate> target);

}

}

extern "C" {
	void* _register_netlink() {
		return (void*)stealify::netlink::Init;
	}
}

#endif

#ifndef STEALIFY_HTTP_H
#define STEALIFY_HTTP_H

#include "stealify.h"

namespace stealify {

namespace html {

void Escape(const FunctionCallbackInfo<Value> &args);
void Init(Isolate* isolate, Local<ObjectTemplate> target);

}

}

extern "C" {
	void* _register_html() {
		return (void*)stealify::html::Init;
	}
}
#endif

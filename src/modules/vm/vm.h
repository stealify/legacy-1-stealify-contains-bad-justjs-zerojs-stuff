#ifndef STEALIFY_VM_H
#define STEALIFY_VM_H

#include <stealify.h>

namespace stealify {

namespace vm {

struct v8_context {
	v8::Persistent<Context, v8::CopyablePersistentTraits<Context>> context;
	v8::Persistent<Script, v8::CopyablePersistentTraits<Script>> script;
};

void CompileScript(const FunctionCallbackInfo<Value> &args);
void RunModule(const FunctionCallbackInfo<Value> &args);
void RunScript(const FunctionCallbackInfo<Value> &args);
void CreateContext(const FunctionCallbackInfo<Value> &args);
void RunInContext(const FunctionCallbackInfo<Value> &args);
void CompileInContext(const FunctionCallbackInfo<Value> &args);
void CompileAndRunInContext(const FunctionCallbackInfo<Value> &args);
void EnterContext(const FunctionCallbackInfo<Value> &args);
void ExitContext(const FunctionCallbackInfo<Value> &args);

void Init(Isolate* isolate, Local<ObjectTemplate> target);
}

}

extern "C" {
	void* _register_vm() {
		return (void*)stealify::vm::Init;
	}
}

#endif

#include "inspector.h"

stealify::inspector::InspectorClient* client;

void stealify::inspector::Enable(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();
  HandleScope handleScope(isolate);
  Local<Context> context = isolate->GetCurrentContext();
  client = new stealify::inspector::InspectorClient(context, true);
}

void stealify::inspector::Init(Isolate* isolate, Local<ObjectTemplate> target) {
  Local<ObjectTemplate> module = ObjectTemplate::New(isolate);
  SET_METHOD(isolate, module, "enable", Enable);
  SET_MODULE(isolate, target, "inspector", module);
}

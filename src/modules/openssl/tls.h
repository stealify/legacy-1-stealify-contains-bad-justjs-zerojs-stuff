#ifndef STEALIFY_TLS_H
#define STEALIFY_TLS_H

#include <stealify.h>
#include <openssl/opensslv.h>
#include <openssl/err.h>
#include <openssl/dh.h>
#include <openssl/ssl.h>
#include <openssl/conf.h>
#include <openssl/engine.h>
#include <openssl/hmac.h>
#include <openssl/evp.h>
#include <atomic>

namespace stealify {
namespace tls {

void Error(const FunctionCallbackInfo<Value> &args);
void Shutdown(const FunctionCallbackInfo<Value> &args);
void Free(const FunctionCallbackInfo<Value> &args);
void Read(const FunctionCallbackInfo<Value> &args);
void Write(const FunctionCallbackInfo<Value> &args);
void Handshake(const FunctionCallbackInfo<Value> &args);
void AcceptSocket(const FunctionCallbackInfo<Value> &args);
void ConnectSocket(const FunctionCallbackInfo<Value> &args);
void ServerContext(const FunctionCallbackInfo<Value> &args);
void ClientContext(const FunctionCallbackInfo<Value> &args);
void DestroyContext(const FunctionCallbackInfo<Value> &args);
void Init(Isolate* isolate, Local<ObjectTemplate> target);

}
}

extern "C" {
	void* _register_tls() {
		return (void*)stealify::tls::Init;
	}
}

#endif

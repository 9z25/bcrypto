#ifndef _BCRYPTO_MD5_H
#define _BCRYPTO_MD5_H
#include <node.h>
#include <nan.h>
#include "openssl/md5.h"

class MD5 : public Nan::ObjectWrap {
public:
  static NAN_METHOD(New);
  static void Init(v8::Local<v8::Object> &target);

  MD5();
  ~MD5();

  MD5_CTX ctx;

private:
  static NAN_METHOD(Init);
  static NAN_METHOD(Update);
  static NAN_METHOD(Final);
  static NAN_METHOD(Digest);
  static NAN_METHOD(Root);
  static NAN_METHOD(Multi);
};
#endif

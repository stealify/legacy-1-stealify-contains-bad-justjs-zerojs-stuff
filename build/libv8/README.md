# v8lib 

docker build of v8 monolithic libary for use by just runtime build

## Building & Pushing
```bash
make v8lib ## make a pot of coffee while you wait for this to build
make dist
git commit -a -m 'v8.8'
git tag 8.8
git push origin master
git push --tags
```

should produce
/deps/v8/
  include
  gen
  src
libv8_monolith.a

https://github.com/stealify/stealify/releases/download/libv8.8/v8.tar.gz


AMD64
```
# v8lib: ## build v8 library
docker build -t v8-build .
mkdir -p deps/v8
docker run -dt --rm --name v8-build v8-build /bin/sh

docker cp v8-build:/build/v8/out.gn/x64.release/obj/libv8_monolith.a deps/v8/libv8_monolith.a
docker cp v8-build:/build/v8/include deps/v8/
docker cp v8-build:/build/v8/src deps/v8/
docker cp v8-build:/build/v8/out.gn/x64.release/gen deps/v8/
## dist header
tar -cv deps/v8/include | gzip --best > v8-headers.tar.gz
## dist lib
tar -cv deps/v8/libv8_monolith.a deps/v8/include | gzip --best > v8.tar.gz
## dist src
tar -cv deps/v8/gen deps/v8/src | gzip --best > v8src.tar.gz

docker kill v8-build

## alpine
docker build -t v8-build-alpine -f Dockerfile.alpine .
mkdir -p alpine
docker run -dt --rm --name v8-build-alpine v8-build-alpine /bin/sh
docker cp v8-build-alpine:/build/v8/out.gn/x64.release/obj/libv8_monolith.a deps/v8/libv8_monolith.a
docker kill v8-build-alpine
tar -cv deps/v8/libv8_monolith.a deps/v8/include | gzip --best > v8.alpine.tar.gz
```





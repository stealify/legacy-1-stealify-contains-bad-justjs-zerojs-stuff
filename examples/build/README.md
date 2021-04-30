## build dependencies
tar
gzip
ld
curl
g++
make

OR

use docker
```
docker run -it --rm -v $(pwd)
```

## command to create and build stealify runtime in your current directory
```bash
STEALIFY_HOME=$(pwd) stealify -e 'stealify.args.splice(1, 1); stealify.require("build").build()' runtime-builder
```
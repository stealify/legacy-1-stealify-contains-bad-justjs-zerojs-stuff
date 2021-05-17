## Information for Developers and Maintainers about Just Compat

just-js is in general the same while we renamed the global to stealify
You can reuse just-js code as long as you rename the variables and includes

just=>stealify
JUST=>STEALIFY
Just=>Stealify

We do not depend on the extra repos like just JS

```
git clone git@github.com:just-js/just.git ./stealify
cd stealify
git clone git@github.com:just-js/libs.git
## we should check at this step what cp -rf would do 
cp -r libs/* lib
rm -rf libs
git clone git@github.com:just-js/modules.git
git clone git@github.com:just-js/examples.git
rm -rf ./*/.*
find ./ -type f -exec sed -i s/just-js/stealify/g {} +
find ./ -type f -exec sed -i s/Just/Stealify/g {} +
find ./ -type f -exec sed -i s/JUST/STEALIFY/g {} +
find ./ -type f -exec sed -i s/just/stealify/g {} +
sed -i s/FromStealify/FromJust/g ./just.cc 
sed -i s/AdstealifyAmount/AdjustAmount/g ./just.cc 
mv ./just.cc ./stealify.cc
mv ./just.h ./stealify.h
mv ./just.js ./stealify.js
mv ./examples/bundle/just.js ./examples/bundle/stealify.js 
```

after that we need the dependencies from libv8
libv8/README.md

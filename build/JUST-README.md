## Information for Developers and Maintainers about Just Compat

just-js is in general the same while we renamed the global to stealify

You can reuse just-js code as long as you rename the variables and includes

just=>stealify
JUST=>STEALIFY
Just=>Stealify

We do not depend on the extra repos like just JS

```
git clone git@github.com:just-js/libs.git
git clone git@github.com:just-js/just.git
git clone git@github.com:just-js/modules.git
rm -rf ./*/.*

find ./libs -type f -exec sed -i s/just-js/stealify/g {} +
find ./modules -type f -exec sed -i s/just-js/stealify/g {} +
find ./just -type f -exec sed -i s/just-js/stealify/g {} +

find ./libs -type f -exec sed -i s/Just/Stealify/g {} +
find ./modules -type f -exec sed -i s/Just/Stealify/g {} +
find ./just -type f -exec sed -i s/Just/Stealify/g {} +
sed -i s/.FromStealify()/.FromJust()/g ./just/just.cc 

find ./libs -type f -exec sed -i s/JUST/STEALIFY/g {} +
find ./modules -type f -exec sed -i s/JUST/STEALIFY/g {} +
find ./just -type f -exec sed -i s/JUST/STEALIFY/g {} +

find ./libs -type f -exec sed -i s/just/stealify/g {} +
find ./modules -type f -exec sed -i s/just/stealify/g {} +
find ./just -type f -exec sed -i s/just/stealify/g {} +
sed -i s/AdstealifyAmount/AdjustAmount/g ./just/just.cc 

find ./libs -type f -exec sed -i s/just/stealify/g {} +
find ./modules -type f -exec sed -i s/just/stealify/g {} +
find ./just -type f -exec sed -i s/just/stealify/g {} +

mv ./just/just.cc ./just/stealify.cc
mv ./just/just.h ./just/stealify.h
mv ./just/just.js ./just/stealify.js
mv ./just ./stealify
mv ./libs ./stealify
mv ./modules ./stealify

```

after that we need the dependencies from libv8
build the v8 deps
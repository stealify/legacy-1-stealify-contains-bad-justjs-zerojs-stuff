# Build Stealify
This are internal Scripts used to build Stealify Distributions

## Download
We Download the tar.gz versions without dependencies and manage the peerdepenencies our self we also patch the downloaded source via code mods and commit it to this repo this way we can hardfork the existing projects without the need to wait for the origin to apply patches or changes. We Stealify them :). for example we use rollup-enterprise to change the imports and exports.

Codemods are able to use babel under the hood they provide a simple interface for that while jscodeshift can run them on a repo.

so Codemods and rollup do share code while rollup applys changes on load at runtime or inside the bundle. Codemods to apply changes to a existing repository. 

Codemods and Rollup can be used via or with @stealify/streams if you need to run them on higher scale.

## How to Modernize a package

hard upgrade 
```js
Object.keys(pkg.dependencies).map(k=>`npm install -d ${k}@latest`)
```
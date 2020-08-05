# Importent skills needed
Typescript removal no transpilation
flow script removal no transpilation



# What we need to track
- https://github.com/mostjs-community
- https://github.com/mostjs
- https://github.com/cujojs/meld
- https://github.com/cujojs/most
- https://github.com/cujojs/most-w3msg
- https://github.com/cujojs/msgs

https://github.com/briancavalier/most-resample
https://github.com/briancavalier/mostjs-sf-ts-7-12-2018
https://github.com/briancavalier/mostcore-todomvc
https://github.com/briancavalier/most-behave


npx repos mostjs mostjs-repos.json
npx repos mostjs mostjs-community-repos.json

``` 
const repos = [ require('./mostjs-repos.json'),  require('./mostjs-community-repos.json')].flatten()
console.log(repos.map(x=x.clone_url))
``` 


many stuff is using flow and typescript we need to strip that away as much as we can

## How to work with typescript & flow => babel
npm i -D @babel/preset-typescript @babel/plugin-proposal-class-properties @babel/plugin-proposal-object-rest-spread
// babel.config.js
module.exports = {
  presets: ["@babel/typescript"],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
  ],
};




## Additional Typechecking (Not Needed)
yarn add --dev typescript
Then add TypeScript configuration into a tsconfig.json file:
// tsconfig.json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "lib": ["esnext"],
    "strict": true
  }
}
This configuration does the following:
"esModuleInterop": true — Allows you to use imports exactly as Babel would expect. TypeScript does not have the notion of a default import, you group together all of a modules exports into a single variable via this syntax; import * as React from 'react'. However Babel does not require this and you can use this syntax; import React from 'react'.
"lib": ["esnext"]—This allows you to use the latest JavaScript language features.
"strict": true — Enables all strict type checking options.
And finally run the TypeScript tool with the --noEmit flag so it does not output any files. You can optionally not use --noEmit and instead use --declaration --emitDeclarationOnly. This will output TypeScript declaration files if you want to bundle them with your build JavaScript code.
tsc --noEmit
# or
tsc --declaration --emitDeclarationOnly
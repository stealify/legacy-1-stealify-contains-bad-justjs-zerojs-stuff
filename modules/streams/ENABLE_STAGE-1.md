npm install --save @babel/cli @babel/core @babel/preset-stage-1

{
  "presets": ["@babel/preset-stage-1"]
}

"scripts": {
  "start": "babel pipe.js --out-file output.js && node output.js"
},
import fs from 'fs';
import path from 'path'
const __dirname = path.dirname(new URL(import.meta.url).pathname)

//requiring path and fs modules

//joining path of directory 
const directoryPath = path.join(__dirname, 'es');
//passsing directoryPath and callback function
const files = fs.readdirSync(directoryPath)
files.filter(x=>x.indexOf('.mjs')>-1).map(x=>console.log(x))

/*
forEach(function (file) {
  // Do whatever you want to do with the file
  console.log(file); 
}
*/

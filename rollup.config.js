import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import alias from '@rollup/plugin-alias';
import fs from 'fs';
import path from 'path'
//const __dirname = path.dirname(new URL(import.meta.url).pathname)

//requiring path and fs modules

//joining path of directory 
const directoryPath = path.join(__dirname, 'es');
//passsing directoryPath and callback function
const files = fs.readdirSync(directoryPath).filter(x=>x.indexOf('.mjs')>-1).map(x=>`es/${x}`)
  
const extensions = [
  'mjs','.js', '.jsx', '.ts', '.tsx',
];
import pkg from './packages/core/packages/core/package.json'

export default [{
  treeshake: false,
  experimentalCodeSplitting: true,
  //experimentalPreserveModules: true,
  //optimizeChunks: true,
  input: files,
    /*
    [
    'es/core.mjs',
    'es/scheduler.mjs',
    'es/prelude.mjs',
    'es/disposable.mjs',
    'es/dom-event.mjs',
    'es/adapter.mjs',
    'es/from-array.mjs'
  ],
  */
  plugins: [
    nodeResolve({ extensions }),
    //commonjs(),
    /*
    babel({
      extensions,
      include: [
      */
        //'packages/core/packages/core/src/**/*',
        //'packages/core/packages/scheduler/src/**/*',
        //'packages/core/packages/types/src/**/*',
        //'packages/core/packages/disposable/src/**/*',
        //'packages/core/packages/prelude/src/**/*'
  /*    
  ],
      babelrc: false,
      presets: ['@babel/typescript'],
      plugins: [
        '@babel/plugin-transform-proto-to-assign',
        ['@babel/proposal-pipeline-operator', { proposal: 'minimal' }],
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-object-rest-spread"]
    }),
    */
    /*
    alias({
      entries: [
        { find: '@most/core', replacement: 'packages/core/packages/core/src/index.ts' },
        { find: '@most/scheduler', replacement: 'packages/core/packages/scheduler/src/index.ts' },
        { find: '@most/disposable', replacement: 'packages/core/packages/disposable/src/index.ts' },
        { find: '@most/prelude', replacement: 'packages/core/packages/prelude/src/index.ts' }
      ]
    })
    */
  ],
  external: [
    //'@most/prelude'
  ],
  output: [
    {
      dir: 'dist',
      chunkFileNames: "[name].mjs",
      entryFileNames: '[name].mjs',
      format: 'esm',
      sourcemap: false
    }
  ]
}
]

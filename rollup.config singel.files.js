import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import alias from '@rollup/plugin-alias';
const extensions = [
  '.js', '.jsx', '.ts', '.tsx',
];
import pkg from './packages/core/packages/core/package.json'
/*
export default [{
  experimentalCodeSplitting:true,
  input: {
    'core': 'packages/core/packages/core/src/index.ts',
    'scheduler': 'packages/core/packages/scheduler/src/index.ts',
    'dom-events': 'packages/dom-event/src/index.js'
  },
  plugins: [
    nodeResolve({ extensions }),
    commonjs(),
    babel({
      extensions,
      include: ['packages/core/packages/core/src/**/*','packages/core/packages/scheduler/src/**/*'],
      babelrc: false,
      presets: ['@babel/typescript'],
      plugins: [
        ['@babel/proposal-pipeline-operator', { proposal: 'minimal' }],
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-object-rest-spread"]
    }),
    alias({
      entries: [
        { find: '@most/scheduler', replacement: 'packages/core/packages/scheduler/src/index.ts' },
        { find: '@most/disposable', replacement: 'packages/core/packages/disposable/src/index.ts' },
        { find: '@most/prelude', replacement: 'packages/core/packages/prelude/src/index.ts' }
      ]
    })
  ],
  external: [
    //'@most/prelude'
  ],
  output: [
    {
      dir: 'dist',
      chunkFileNames: "[name].mjs",
      entryFileNames: '[name].mjs',
      format: 'es',
      sourcemap: true
    }
  ]
}
]
*/
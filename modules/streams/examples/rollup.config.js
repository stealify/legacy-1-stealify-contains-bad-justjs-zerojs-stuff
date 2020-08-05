import node from 'rollup-plugin-node-resolve'
import flow from 'rollup-plugin-flow'
import { uglify } from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'
import babel from 'rollup-plugin-babel'

export default {
  plugins: [
    flow(),
    node(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [['env', { modules: false }]]
    }),
    uglify({}, minify)
  ],
  output: {
    format: 'iife',
    sourcemap: true
  }
}


import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'

export default {
  plugins: [
    nodeResolve(),
    babel({
      presets: [['@babel/env', { modules: false }]],
      plugins: [['@babel/proposal-pipeline-operator', { proposal: 'minimal' }]]
    }),
    commonjs()
  ],
  output: {
    format: 'iife',
    sourcemap: true
  }
}
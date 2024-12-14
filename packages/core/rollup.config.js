import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import pkg from './package.json'

const input = ['src/index.js']

export default [
  {
    // UMD
    input,
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: 'bundled'
      }),
      terser()
    ],
    output: {
      file: `dist/mx.core.min.js`,
      format: 'umd',
      name: 'MX',
      esModule: false,
      exports: 'named',
      sourcemap: true,
    }
  },

  // ESM and CJS
  {
    input,
    plugins: [nodeResolve()],
    output: [
      {
        dir: 'dist/esm',
        format: 'esm',
        exports: 'named',
        sourcemap: true,
      },
      {
        dir: 'dist/cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      }
    ]
  }
]

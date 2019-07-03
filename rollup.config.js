import babel from 'rollup-plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';

import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.browser,
      format: 'umd',
      name: 'gradient-path'
    },
    {
      file: pkg.main,
      format: 'cjs',
      name: 'gradient-path'
    },
    {
      file: pkg.module,
      format: 'es'
    }
  ],
  external: ['tinygradient'],
  plugins: [
    peerDepsExternal(),
    babel({ exclude: 'node_modules/**' }),
    resolve(),
    commonjs(),
    filesize()
  ]
};

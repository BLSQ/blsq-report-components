
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    }
  ],
  external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      "bluesquare-components",
      "i18next",
      "papaparse",
      "mui-datatables",
      "recharts",
    /^@babel.*/,
    /^@date-io\/.*/,
    /^@material-ui\/.*/,
    /^@blsq.*/,
    "classnames",
    "clsx",
    "d2",
    "d2/lib/d2",
    "history",
    /^lodash.*/,
    "moment",
    "prop-types",
    /^react.*/,
    /^redux.*/
  ],
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'runtime'
    }),
  ]
}
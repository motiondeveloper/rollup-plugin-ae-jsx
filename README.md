[npm]: https://img.shields.io/npm/v/timhaywood/rollup-plugin-ae-jsx
[npm-url]: https://www.npmjs.com/package/timhaywood/rollup-plugin-ae-jsx
[size]: https://packagephobia.now.sh/badge?p=timhaywood/rollup-plugin-ae-jsx
[size-url]: https://packagephobia.now.sh/result?ptimhaywood/rollup-plugin-ae-jsx

[![npm][npm]][npm-url]
[![size][size]][size-url]

# rollup-plugin-ae-jsx

A Rollup plugin which converts the ouput to After Effects compatible JSON for `.jsx` files.

## Requirements

This plugin requires an [LTS](https://github.com/nodejs/Release) Node version (v8.0.0+) and Rollup v1.20.0+.

## Install

Using npm:

```console
npm install rollup-plugin-ae-jsx --save-dev
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files), import the plugin, and add it to the `plugins` array:

```js
import afterEffectJsx from './rollup-plugin-ae-jsx';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.jsx',
    format: 'cjs'
  },
  plugins: [
    afterEffectsJsx()
  ]
};
```

> - The output extension should be `.jsx` and format `cjs` to ensure After Effects compatible files.
> - `rollup-plugin-ae-jsx` should be placed in `plugins` _after_ any other plugins.

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Limitations

Since After Effects compatible JSON isn't valid JavaScript, transformations must be done on the output code as a string rather than the AST. This means success is dependant on the formatting of the code.

While not perfect, it works well enough for our use, but errors may occur adapting it to work with your own code.

## Meta

[CONTRIBUTING](/.github/CONTRIBUTING.md)

[LICENSE (MIT)](/LICENSE)

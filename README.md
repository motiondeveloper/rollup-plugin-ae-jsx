[npm]: https://img.shields.io/npm/v/rollup-plugin-ae-jsx
[npm-url]: https://www.npmjs.com/package/rollup-plugin-ae-jsx
[size]: https://packagephobia.now.sh/badge?p=rollup-plugin-ae-jsx

[![npm][npm]][npm-url]

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
import afterEffectJsx from "./rollup-plugin-ae-jsx";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.jsx",
    format: "es",
  },
  external: Object.keys(pkg.dependencies),
  plugins: [afterEffectJsx()],
};
```

> - The output extension should be `.jsx` and format `es` to ensure After Effects compatible files.
> - `rollup-plugin-ae-jsx` should be placed in `plugins` _after_ any other plugins.

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Limitations

- Output code must be in a single file
- Makes some manual transformations outside of the AST
- Pretty experimental!

## Meta

[CONTRIBUTING](/.github/CONTRIBUTING.md)

[LICENSE (MIT)](/LICENSE)

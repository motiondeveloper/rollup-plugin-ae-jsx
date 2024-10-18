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
import afterEffectJsx from './rollup-plugin-ae-jsx';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.jsx',
    format: 'es',
  },
  external: Object.keys(pkg.dependencies),
  plugins: [afterEffectJsx()],
};
```

> - The output extension should be `.jsx` and format `es` to ensure After Effects compatible files.
> - `rollup-plugin-ae-jsx` should be placed in `plugins` _after_ any other plugins.

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Options

### `wrap`

Type: `boolean` \
Default: `false`

Wraps compiled code in a `get()` function. See [Wrapping](#wrapping) for more detail.

## Process

1. Creating a list of the exported functions and variables from the index file
2. Removing non-compatible statements: `['ExpressionStatement', 'DebuggerStatement', 'ImportDeclaration', 'ExportNamedDeclaration'];`
3. Converting function and variable declarations into `.jsx` compliant syntax
4. Wrapping in braces (`{}`)

## Wrapping

Compiling code that references top level functions or variables will error when run in After Effects, since each exported property is isolated from the surrounding code.

For example the following source code:

```js
function add(a, b) {
  return a + b;
}

function getFour() {
  return add(2, 2);
}

export { add, getFour };
```

Will compile to the following `.jsx` file:

```js
{
  add(a, b) {
    return a + b;
  },
  getFour() {
    return add(2, 2); // error, add is not defined
  }
}
```

Which will error, since `add()` is not defined within the scope of `getFour()`.

This can be solved by wrapping all of your code in a parent function, which `rollup-plugin-jsx` will do for you if `wrap` is set to true.

```js
// rollup.config.js
plugins: [afterEffectJsx({ wrap: true })],
```

The compiled `.jsx` would then be:

```js
{
  get() {
    function add(a, b) {
      return a + b;
    }

    function getFour() {
      return add(2, 2);
    }

    return { add, getFour }
  }
}
```

You then would need to call `.get()` in your expressions:

```js
const { getFour, add } = footage('index.jsx').sourceData.get();
```

## Meta

[CONTRIBUTING](/.github/CONTRIBUTING.md)

[LICENSE (MIT)](/LICENSE)

<div align="center">

![onions](https://socialify.git.ci/yuanzhhh/onions/image?description=1&font=Inter&language=1&owner=1&pattern=Circuit%20Board&theme=Dark "principle")

# Onions

**Lightweight function middleware combiner (onion model) for TypeScript / JavaScript.**

[![npm](https://img.shields.io/npm/v/onions)](https://www.npmjs.com/package/onions)
[![npm downloads](https://img.shields.io/npm/dm/onions)](https://www.npmjs.com/package/onions)
[![bundle size](https://img.shields.io/bundlephobia/minzip/onions)](https://bundlephobia.com/package/onions)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/npm/l/onions)](./LICENSE)

**English** | [中文](./README.zh-CN.md)

</div>

---

## Why Onions?

Most middleware libraries (Koa compose, Redux middleware) are tied to a specific runtime or request model.
**Onions** is different — it wraps **any plain function** with before/after hooks, works with sync or async code, and returns a standard Promise. No framework lock-in, no special context objects.

Use it when you need to:

- Add logging, validation, or caching around existing functions
- Transform arguments before they reach a target function
- Run cleanup or side-effects after execution
- Compose reusable cross-cutting concerns without modifying the original function

## Features

- Wrap any function with **before** and **after** middleware (onion model)
- Full **async / await** support with proper error propagation
- Preserves caller's **`this`** context for `target`, `before`, and `after`
- Written in **TypeScript** with bundled type declarations
- Zero dependencies, tiny footprint (~1 KB minified + gzipped)

## Install

```sh
# pnpm (recommended)
pnpm add onions

# npm
npm install onions

# yarn
yarn add onions
```

## Compatibility

| Runtime | Version |
| ------- | ------- |
| Node.js | >= 10   |
| Browser | Any with `Promise` support (ES2015+) |

**Module format:** CommonJS (`require`) with TypeScript declarations (`.d.ts`).
Source is compiled to ES2015 — safe for modern bundlers (Webpack, Rollup, Vite, esbuild).

## Quick Start

```ts
import onions from 'onions';

// before middleware: transform arguments before they reach the target
const addOne = (next) => (a, b) => next(a + 1, b + 1);

// after middleware: run side-effects after the target completes
const logger = (next) => (...args) => {
  console.log('after:', args);
  next(...args); // must call next() to signal completion
};

async function add(a, b) {
  return a + b;
}

const wrapped = onions(add, [addOne], [logger]);

await wrapped(1, 2);
// => after: [2, 3]
// => 5
```

## API

### `onions(target, befores?, afters?)`

Returns a new **Promise-returning function** that applies the middleware chain.

| Parameter | Type                                       | Default | Description                                                                          |
| --------- | ------------------------------------------ | ------- | ------------------------------------------------------------------------------------ |
| `target`  | `Function \| MiddlewareFun[] \| undefined` | —       | The core function to wrap. Pass an array to use as `befores` shorthand.              |
| `befores` | `MiddlewareFun \| MiddlewareFun[]`         | `[]`    | Middleware executed **before** the target. Can transform arguments.                   |
| `afters`  | `MiddlewareFun \| MiddlewareFun[]`         | `[]`    | Middleware executed **after** the target. Receives the same params passed to target.  |

### `compose(middlewares)`

Combines an array of middleware into a single middleware function. Used internally, but exported for advanced composition.

### Middleware Signature

```ts
type MiddlewareFun = (next: Function) => (...args: unknown[]) => unknown;
```

Each middleware receives `next` and returns a function. Call `next(...)` to continue the chain.

## Examples

### Chaining Multiple Before Middleware

```ts
const double = (next) => (x) => next(x * 2);
const addTen = (next) => (x) => next(x + 10);

const compute = onions((x) => x, [double, addTen]);

await compute(3);
// double: 3 → 6, addTen: 6 → 16
// => 16
```

### Async Middleware

```ts
const validate = (next) => async (...args) => {
  await checkPermissions();
  return next(...args);
};

const audit = (next) => async (...args) => {
  next(...args);
  await writeAuditLog(args);
};

const secured = onions(myAction, [validate], [audit]);
```

### Error Handling

Errors from `target`, `before`, or `after` middleware all correctly reject the returned Promise — including async errors thrown **after** `next()`.

```ts
const fragile = (next) => async (...args) => {
  await next(...args);
  throw new Error('cleanup failed');
};

try {
  await onions(myFn, [fragile])(1, 2);
} catch (err) {
  // err.message === 'cleanup failed'
}
```

### `this` Context

When called as a method, `this` is passed to `target` and the outermost middleware in each chain. Use regular functions (not arrows) and `next.call(this, ...)` to propagate `this` through multiple middleware layers.

```ts
const withContext = (next) => function (...args) {
  console.log(this); // the calling object
  return next.call(this, ...args);
};

const obj = {
  value: 10,
  run: onions(
    function (x) { return this.value + x; },
    [withContext],
  ),
};

await obj.run(5); // => 15
```

## Contributing

Contributions are welcome! To get started:

```sh
git clone https://github.com/yuanzhhh/onions.git
cd onions
pnpm install
pnpm test        # run tests
pnpm run lint    # lint source
```

Please open an [issue](https://github.com/yuanzhhh/onions/issues) before submitting large changes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed release history.

## License

[ISC](./LICENSE) © [Evan Yuanzh](https://github.com/yuanzhhh)

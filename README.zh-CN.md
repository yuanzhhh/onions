<div align="center">

![onions](https://socialify.git.ci/yuanzhhh/onions/image?description=1&font=Inter&language=1&owner=1&pattern=Circuit%20Board&theme=Dark "principle")

# Onions

**轻量级函数中间件组合器（洋葱模型），适用于 TypeScript / JavaScript。**

[![npm](https://img.shields.io/npm/v/onions)](https://www.npmjs.com/package/onions)
[![npm downloads](https://img.shields.io/npm/dm/onions)](https://www.npmjs.com/package/onions)
[![bundle size](https://img.shields.io/bundlephobia/minzip/onions)](https://bundlephobia.com/package/onions)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/npm/l/onions)](./LICENSE)

[English](./README.md) | **中文**

</div>

---

## 为什么选择 Onions？

大多数中间件库（Koa compose、Redux middleware）都绑定在特定的运行时或请求模型上。
**Onions** 不同——它可以为**任意普通函数**添加 before/after 钩子，支持同步和异步代码，返回标准 Promise。没有框架绑定，没有特殊上下文对象。

适用场景：

- 为已有函数添加日志、校验、缓存等横切逻辑
- 在目标函数执行前转换参数
- 在执行后运行清理或副作用逻辑
- 组合可复用的横切关注点，而无需修改原函数

## 特性

- 用 **before** 和 **after** 中间件包裹任意函数（洋葱模型）
- 完整的 **async / await** 支持，错误正确传播
- 保留调用方的 **`this`** 上下文（`target`、`before`、`after` 均可获取）
- 使用 **TypeScript** 编写，自带类型声明
- 零依赖，体积极小（压缩 + gzip 约 1 KB）

## 安装

```sh
# pnpm（推荐）
pnpm add onions

# npm
npm install onions

# yarn
yarn add onions
```

## 兼容性

| 运行环境 | 版本要求 |
| -------- | -------- |
| Node.js  | >= 10    |
| 浏览器   | 支持 `Promise` 的环境（ES2015+） |

**模块格式：** CommonJS（`require`），附带 TypeScript 类型声明（`.d.ts`）。
源码编译目标为 ES2015，兼容主流打包工具（Webpack、Rollup、Vite、esbuild）。

## 快速开始

```ts
import onions from 'onions';

// before 中间件：在到达目标函数前转换参数
const addOne = (next) => (a, b) => next(a + 1, b + 1);

// after 中间件：在目标函数完成后执行副作用
const logger = (next) => (...args) => {
  console.log('after:', args);
  next(...args); // 必须调用 next() 以通知完成
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

返回一个新的**返回 Promise 的函数**，应用中间件链。

| 参数      | 类型                                       | 默认值 | 说明                                                                    |
| --------- | ------------------------------------------ | ------ | ----------------------------------------------------------------------- |
| `target`  | `Function \| MiddlewareFun[] \| undefined` | —      | 要包裹的核心函数。传入数组时作为 `befores` 的简写。                     |
| `befores` | `MiddlewareFun \| MiddlewareFun[]`         | `[]`   | 在目标函数**之前**执行的中间件，可转换参数。                            |
| `afters`  | `MiddlewareFun \| MiddlewareFun[]`         | `[]`   | 在目标函数**之后**执行的中间件，接收与 target 相同的参数。              |

### `compose(middlewares)`

将中间件数组组合为单个中间件函数。内部使用，也导出供高级组合场景使用。

### 中间件签名

```ts
type MiddlewareFun = (next: Function) => (...args: unknown[]) => unknown;
```

每个中间件接收 `next`，返回一个函数。调用 `next(...)` 以继续链路。

## 示例

### 链式 Before 中间件

```ts
const double = (next) => (x) => next(x * 2);
const addTen = (next) => (x) => next(x + 10);

const compute = onions((x) => x, [double, addTen]);

await compute(3);
// double: 3 → 6, addTen: 6 → 16
// => 16
```

### 异步中间件

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

### 错误处理

`target`、`before`、`after` 中间件抛出的错误都会正确地 reject 返回的 Promise——包括在 `next()` 之后抛出的异步错误。

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

### `this` 上下文

作为对象方法调用时，`this` 会传递给 `target` 和每条链路的最外层中间件。使用普通函数（非箭头函数）并通过 `next.call(this, ...)` 在多层中间件间传递 `this`。

```ts
const withContext = (next) => function (...args) {
  console.log(this); // 调用方对象
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

## 参与贡献

欢迎贡献！开始之前：

```sh
git clone https://github.com/yuanzhhh/onions.git
cd onions
pnpm install
pnpm test        # 运行测试
pnpm run lint    # 代码检查
```

提交较大改动前，请先开一个 [Issue](https://github.com/yuanzhhh/onions/issues)。

## 更新日志

详见 [CHANGELOG.md](./CHANGELOG.md)。

## 许可证

[ISC](./LICENSE) © [Evan Yuanzh](https://github.com/yuanzhhh)

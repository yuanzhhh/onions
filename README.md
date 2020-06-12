# Onions

## Intro
Add access middleware for function

## Install
```sh
$ npm install onions --save

```
## Usage
```ts | pure
import onions from 'onions';

const before1 = (next) => (a, b) => next(a + 1, b + 1);

const before2 = (next) => async (a, b) => {
    await Promise.resolve();

    next(a + 1, b + 1);
};

const before3 = (next) => (a, b) => next(a + 1, b + 1);

const after = (next) => (...args) => {
    console.log('After');

    next(...args);
};

async function target(a, b) {
    const result = a + b;

    await Promise.resolve();

    return result;
}

(async () => {
  const newTarget = onions(target, [before1, before2, before3], after) // after or [after]

  await newTarget(1, 2); // 9
})();

> 9
> After

```

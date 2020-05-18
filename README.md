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

function target(a, b) {
    const result = a + b;

    console.log(result);

    return result;
}

const before = (next) => (a, b) => next(a + 1, b + 1);

const after = (next) => (...args) => {
    console.log('After');

    next(...args);
};

const newTarget = onions(target, [before], after) // or [after]

newTarget(1, 2); // 5
> 5
> After

```

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

const befAdd1 = (next) => (a, b) => { next(a + 1, b + 1) };
const befAdd2 = (next) => (a, b) => next(a + 1, b + 1);

const logEndTime = (next) => (...args) => {
    console.log('EndTime', Date.now());

    next(...args);
};

const newTarget = onions(target, [befAdd1, befAdd2], logEndTime) // or [logEndTime]

newTarget(1, 2); // 7
> 7
> EndTime 1589373681518

```

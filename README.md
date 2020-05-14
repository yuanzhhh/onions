# Onions

## Intro
Add access middleware for function

## Usage
```sh
## Installation
$ npm install onions --save

```
## Usage
```ts | pure
import onions from 'onions';

const reducer = {
  'addMessage': () => console.log('addMessage'),
  'delMessage': () => console.log('delMessage'),
};

const logBeginTime = (next: Function) => (args) => {
  console.log('BeginTime', Date.now());

  return next(info);
};

const logEndTime = (next: Function) => (args) => {
  console.log('EndTime', Date.now());

  return next(info);
};

const onionsWrap =  onions(reducer, [logBeginTime], [logEndTime])

onionsWrap['addMessage']();

// BeginTime 1589373681192
// addMessage
// EndTime 1589373681518
```

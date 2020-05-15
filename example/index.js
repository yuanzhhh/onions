const onions = require('onions');

function target(a, b) {
    return a + b;
}

const befAdd1 = (next) => (a, b) => { next(a + 1, b + 1) };
const befAdd2 = (next) => (a, b) => next(a + 1, b + 1);

const logEndTime = (next) => (...args) => {
    console.log('EndTime', Date.now());

    next(...args);
};

const newTarget = onions(target, [befAdd1, befAdd2], logEndTime);

console.log(newTarget(1, 2)); // 7

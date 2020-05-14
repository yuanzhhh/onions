const onions = require('onions');

const reducer = {
    'addMessage': (a, b) => console.log('addMessage', a, b),
    'delMessage': () => console.log('delMessage'),
};

const logBeginTime = (next) => (...args) => {
    console.log('BeginTime', Date.now());

    return next(...args);
};

const logEndTime = (next) => (...args) => {
    console.log('EndTime', Date.now());

    return next(...args);
};

const onionsWrap =  onions(reducer, [logBeginTime], [logEndTime])

onionsWrap['addMessage'](1, 2);

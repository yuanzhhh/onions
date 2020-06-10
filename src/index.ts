export type UnknownFunction = (...args: unknown[]) => unknown;

export const compose = (middlewares: Function[] | Function): Function => {
  if (typeof middlewares === 'function') return middlewares;

  if (middlewares.length === 0) return (next: UnknownFunction) => (...args: unknown[]) => next(...args);

  if (middlewares.length === 1) return middlewares[0];

  return middlewares.reduce((a, b) => (...args: unknown[]) => a(b(...args)));
};

type Onions = (target: UnknownFunction, befores: Function[] | Function, afters: Function[] | Function) => UnknownFunction;
const onions: Onions = (target, befores, afters) => {
  const targetType = Object.prototype.toString.call(target).slice(8, -1);
  const wrapBefore = compose(befores);
  const wrapAfter = compose(afters);

  return (...args: unknown[]): unknown => {
    let targetResult: unknown;

    wrapBefore(async (...params: unknown[]) => {
      if (targetType === 'Function') {
        targetResult = target(...params);
      } else if (['AsyncFunction', 'Promise', 'GeneratorFunction'].indexOf(targetType) !== -1) {
        // TODO after结尾调用Promise的reject处理异常
        targetResult = await target(...params);
      } else {
        throw new Error(target + ' is not function');
      }

      // TODO after结尾调用resolve
      wrapAfter((...afterParams: unknown[]) => afterParams)(...params);
    })(...args);

    return targetResult;
  }
};

export default onions;

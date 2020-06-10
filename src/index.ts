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
    return new Promise((resolve, reject) => {
      wrapBefore(async (...params: unknown[]) => {
        let targetResult: unknown;
        if (targetType === 'Function') {
          targetResult = target(...params);
        } else if (['AsyncFunction', 'Promise', 'GeneratorFunction'].indexOf(targetType) !== -1) {
          try {
            targetResult = await target(...params);
          } catch (err) {
            reject(err);
          }
        } else {
          throw new Error(target + ' is not function');
        }

        wrapAfter(() => resolve(targetResult))(...params);
      })(...args);
    });
  }
};

export default onions;

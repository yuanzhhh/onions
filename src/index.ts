export type UnknownFunction = (...args: unknown[]) => unknown;

export const compose = (middlewares: Function[] | Function): Function => {
  if (typeof middlewares === 'function') return middlewares;

  if (middlewares.length === 0) return (next: UnknownFunction) => (...args: unknown[]) => next(...args);

  if (middlewares.length === 1) return middlewares[0];

  return middlewares.reduce((a, b) => (...args: unknown[]) => a(b(...args)));
};

type Onions = (target: UnknownFunction, befores: Function[] | Function, afters: Function[] | Function) => UnknownFunction;
const onions: Onions = (target, befores, afters) => {
  const wrapBefore = compose(befores);
  const wrapAfter = compose(afters);

  return (...args: unknown[]) => {
    const wrapBeforeDone = wrapBefore(target);
    const targetResult = wrapBeforeDone(...args);
    wrapAfter((...params: unknown[]) => params)(...args);

    return targetResult;
  }
};

export default onions;

export type UnknownFun = (...args: unknown[]) => unknown;
export type MiddlewareFun = (next: Function) => UnknownFun;
export type Middleware = MiddlewareFun | MiddlewareFun[];
export type OnionsFun = (...args: unknown[]) => Promise<unknown>;

export const compose = (middlewares: Middleware): Function => {
  if (typeof middlewares === 'function') return middlewares;
  if (middlewares.length === 0) return (next: UnknownFun) => (...args: unknown[]): unknown => next(...args);
  if (middlewares.length === 1) return middlewares[0];

  return middlewares.reduce((a, b) => (...args): UnknownFun => a(b(...args)));
};

export default function onions (target: UnknownFun | MiddlewareFun[] | undefined, befores: Middleware = [], afters: Middleware = []): OnionsFun {
  if (Array.isArray(target)) return onions(undefined, target);

  const wrapBefore = compose(befores);
  const wrapAfter = compose(afters);

  return function (...args): Promise<unknown> {
    const wrapf = (resolve: (value: unknown) => void, reject?: (error: Error) => void): void =>
      wrapBefore(async (...params: unknown[]): Promise<void> => {
        let result: unknown = [...params];

        if (Object.prototype.toString.call(target).substr(-9, 8) === 'Function') {
          try {
            result = await target.call(this, ...params);
          } catch (err) {
            reject(err);
          };
        };

        wrapAfter(() => resolve(result))(...params);
      })(...args);

    return new Promise(wrapf);
  };
};

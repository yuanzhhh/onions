export type UnknownFun = (...args: unknown[]) => unknown;
export type MiddlewareFun = (next: Function) => UnknownFun;
export type Middleware = MiddlewareFun | MiddlewareFun[];
export type OnionsFun = (...args: unknown[]) => Promise<unknown>;

export const compose = (middlewares: Middleware): Function => {
  if (typeof middlewares === 'function') return middlewares;
  if (middlewares.length === 0) return (next: UnknownFun) => function (...args: unknown[]): unknown { return next.call(this, ...args); };
  if (middlewares.length === 1) return middlewares[0];

  return middlewares.reduce((a, b) => (...args): UnknownFun => a(b(...args)));
};

export default function onions (target: UnknownFun | MiddlewareFun[] | undefined, befores: Middleware = [], afters: Middleware = []): OnionsFun {
  if (Array.isArray(target)) return onions(undefined, target);

  const wrapBefore = compose(befores);
  const wrapAfter = compose(afters);

  return function (...args): Promise<unknown> {
    let result: unknown;
    let resolveInner: () => void;
    let rejectInner: (err: unknown) => void;
    const innerDone = new Promise<void>((resolve, reject) => {
      resolveInner = resolve;
      rejectInner = reject;
    });

    const innerCallback = async (...params: unknown[]): Promise<void> => {
      try {
        result = [...params];

        if (typeof target === 'function') {
          result = await target.call(this, ...params);
        }

        let afterCalled = false;
        const afterNext: UnknownFun = () => { afterCalled = true; return undefined; };
        await Promise.resolve(wrapAfter(afterNext).call(this, ...params));

        if (afterCalled) resolveInner();
      } catch (err) {
        rejectInner(err);
      }
    };

    return new Promise((resolve, reject) => {
      try {
        const maybePromise = wrapBefore(innerCallback).call(this, ...args);

        Promise.all([
          Promise.resolve(maybePromise),
          innerDone
        ]).then(() => resolve(result)).catch(reject);
      } catch (err) {
        reject(err);
      }
    });
  };
};

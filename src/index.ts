export type UnknownFunction = (...args: unknown[]) => unknown;
export type MiddlewareType = Function[] | Function;
export type OnionsFunction = (...args: unknown[]) => Promise<unknown>;

export const compose = (middlewares: MiddlewareType): Function => {
  if (typeof middlewares === 'function') return middlewares;

  if (middlewares.length === 0) return (next: UnknownFunction) => (...args: unknown[]) => next(...args);

  if (middlewares.length === 1) return middlewares[0];

  return middlewares.reduce((a, b) => (...args: unknown[]) => a(b(...args)));
};

export default function onions(target: UnknownFunction, befores: MiddlewareType, afters: MiddlewareType): OnionsFunction {
  const wrapBefore = compose(befores);
  const wrapAfter = compose(afters);
  let targetResult: unknown;

  const newTarget: OnionsFunction = function(...args) {
    const wrapf = (resolve: (value: unknown) => void, reject?: (error: Error) => void): void => {
      wrapBefore(async (...params: unknown[]): Promise<void> => {
        try {
          targetResult = await target.call(this, ...params);
        } catch (err) {
          reject!(err);
        };

        wrapAfter(() => resolve(targetResult))(...params);
      })(...args);
    };

    return new Promise(wrapf);
  };

  return newTarget;
};

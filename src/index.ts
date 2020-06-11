export type UnknownFunction<T = any> = (...args: unknown[]) => T;
export type MiddlewareType = Function[] | Function;

export const compose = (middlewares: MiddlewareType): Function => {
  if (typeof middlewares === 'function') return middlewares;

  if (middlewares.length === 0) return (next: UnknownFunction) => (...args: unknown[]) => next(...args);

  if (middlewares.length === 1) return middlewares[0];

  return middlewares.reduce((a, b) => (...args: unknown[]) => a(b(...args)));
};

export default function onions<T = any>(target: UnknownFunction<T>, befores: MiddlewareType, afters: MiddlewareType): UnknownFunction<T> {
  const targetType: string = Object.prototype.toString.call(target).slice(8, -1);
  const wrapBefore = compose(befores);
  const wrapAfter = compose(afters);
  let targetResult: unknown;

  const newTarget: UnknownFunction<T> = function(...args) {
    const wrapf = (resolve?: (value: unknown) => void, reject?: (error: Error) => void): unknown => {
      wrapBefore(async (...params: unknown[]): Promise<void> => {
        if (['AsyncFunction', 'Promise', 'GeneratorFunction'].includes(targetType)) {
          try {
            targetResult = await target.call(this, ...params);
          } catch (err) {
            reject!(err);
          }
        } else {
          targetResult = target.call(this, ...params);
        }

        wrapAfter(() => resolve ? resolve(targetResult) : targetResult)(...params);
      })(...args);

      return targetResult;
    }

    return (targetType === 'Function' ? wrapf() : new Promise(wrapf)) as T;
  }

  return newTarget;
};

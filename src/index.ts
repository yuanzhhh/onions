export type UnknownFunction = (...args: unknown[]) => unknown;
export type MiddlewareType = Function[] | Function;

export const compose = (middlewares: MiddlewareType): Function => {
  if (typeof middlewares === 'function') return middlewares;

  if (middlewares.length === 0) return (next: UnknownFunction) => (...args: unknown[]) => next(...args);

  if (middlewares.length === 1) return middlewares[0];

  return middlewares.reduce((a, b) => (...args: unknown[]) => a(b(...args)));
};

export default function onions<T = unknown, U = unknown>(target: (...args: T[]) => U | Promise<U>, befores: MiddlewareType, afters: MiddlewareType): Function {
  const targetType = Object.prototype.toString.call(target).slice(8, -1);
  const wrapBefore = compose(befores);
  const wrapAfter = compose(afters);

  return function(...args: T[]): U | Promise<U> {
    const wrapf = (resolve?: (value: U) => void, reject?: (error: Error) => void): U | Promise<U> => {
      let targetResult: unknown;

      const lastBeforeWare = async (...params: T[]): Promise<void> => {
        if (['AsyncFunction', 'Promise', 'GeneratorFunction'].indexOf(targetType) !== -1) {
          try {
            targetResult = await target.call(this, ...params);
          } catch (err) {
            reject!(err);
          }
        } else {
          targetResult = target.call(this, ...params);
        }

        wrapAfter(() => resolve ? resolve(targetResult as U) : targetResult)(...params);
      }

      wrapBefore(lastBeforeWare)(...args);

      return targetResult as U;
    }

    return targetType === 'Function' ? wrapf() : new Promise(wrapf);
  }
};

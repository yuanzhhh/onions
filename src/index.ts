export type UnknownFunction<T = any> = (...args: unknown[]) => T;
export type MiddlewareType = Function[] | Function;

const isEffectFunction = ['AsyncFunction', 'Promise', 'GeneratorFunction'];
const filterEffectFunction = (target: string): boolean => isEffectFunction.includes(target);
const getFunType = (target: Function): string => Object.prototype.toString.call(target).slice(8, -1);

export const compose = (middlewares: MiddlewareType): [boolean, Function] => {
  let isEffect = false;

  if (typeof middlewares === 'function') return [filterEffectFunction(getFunType(middlewares())), middlewares];

  if (middlewares.length === 0) return [isEffect, (next: UnknownFunction) => (...args: unknown[]) => next(...args)];

  if (middlewares.length === 1) return [filterEffectFunction(getFunType(middlewares[0]())), middlewares[0]];

  const composeWrap = middlewares.reduce((a, b) => {
    if (!isEffect) {
      isEffect = isEffect || isEffectFunction.includes(getFunType(a()));
      isEffect = isEffect || isEffectFunction.includes(getFunType(b()));
    }

    return (...args: unknown[]) => a(b(...args));
  });

  return [isEffect, composeWrap];
};

export default function onions<T = any>(target: UnknownFunction<T>, befores: MiddlewareType, afters: MiddlewareType): UnknownFunction<T> {
  const targetType: string = getFunType(target);
  const [isEffectBef, wrapBefore] = compose(befores);
  const [isEffectAft, wrapAfter] = compose(afters);
  let targetResult: unknown;
  const isEffect = isEffectBef || isEffectAft || isEffectFunction.includes(targetType);

  const newTarget: UnknownFunction<T> = function(...args) {
    const wrapf = (resolve?: (value: unknown) => void, reject?: (error: Error) => void): unknown => {
      wrapBefore(async (...params: unknown[]): Promise<void> => {
        if (isEffectFunction.includes(targetType)) {
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

    return (isEffect ? new Promise(wrapf) : wrapf()) as T;
  }

  return newTarget;
};

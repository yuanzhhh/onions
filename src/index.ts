export interface Onions {
  (
    reducers: {
      [type: string]: (...args: any[]) => void | Function;
    },
    beforeMiddleware: Array<Function>,
    afterMiddleware: Array<Function>
  ): {
    [type: string]: any;
  },
}

export const compose = (middleware: Array<Function>) =>
  middleware.reduce((a, b) => (...args: any) => a(b(...args)));

export let onions: Onions;
onions = (reducers, beforeMiddleware, afterMiddleware) => {
  const wrapBeforeMiddleware = compose(beforeMiddleware);
  const wrapAfterMiddleware = compose(afterMiddleware);

  return Object.keys(reducers).reduce((resultBundle, item) => {
    resultBundle[item] = (...args) => {
      const beforeResult = wrapBeforeMiddleware(reducers[item])(...args);
      const beforeCallback = typeof beforeResult === 'function' ?
                             beforeResult : (() => {});

      return wrapAfterMiddleware(beforeCallback)(...args);
    }

    return resultBundle;
  }, {});
};

export default onions;

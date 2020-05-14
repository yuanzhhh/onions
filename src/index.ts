type Onions = (
    reducers: {
      [type: string]: (...args: any[]) => void | Function;
    },
    beforeMiddleware: Function[],
    afterMiddleware: Function[]
  ) => {
    [type: string]: any;
  }

const compose = (middlewares: Function[]): Function => {
  if (middlewares.length === 0) return (next: any) => (info: any) => next(info);

  if (middlewares.length === 1) return middlewares[0];

  return middlewares.reduce((a, b) => (...args: any) => a(b(...args)));
};

const onions: Onions = (reducers, beforeMiddleware = [], afterMiddleware = []) => {
  const wrapBefore = compose(beforeMiddleware);
  const wrapAfter = compose(afterMiddleware);

  return Object.keys(reducers).reduce((pResultBundle, item) => {
    const resultBundle = {...pResultBundle};

    resultBundle[item] = (...args: any) => {
      const wrapBeforeDone = wrapBefore(reducers[item]);

      const beforeResult = wrapBeforeDone(...args);

      const wrapAfterDone = wrapAfter(
        typeof beforeResult === 'function' ? beforeResult : (info: any) => info,
      );

      return (typeof wrapAfterDone === 'function' ? wrapAfterDone : (info: any) => info)(...args);
    }

    return resultBundle;
  }, {});
};

export default onions;

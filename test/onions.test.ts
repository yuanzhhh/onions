import onions, { UnknownFun } from '../src';

describe('Onions test', () => {
  const beforeMiddleware = (next: UnknownFun) => (...args: unknown[]) => next(...args);
  const afterMiddleware = (next: UnknownFun) => (...args: unknown[]) => next(...args);

  function target<A extends number>(a: A, b: A): A;
  function target(a: number, b: number) {
    return (a + b)
  };

  test('Onions result is function', () => {
    expect(typeof onions(target, [beforeMiddleware], [afterMiddleware])).toBe('function');
    expect(typeof onions(target, [], [afterMiddleware])).toBe('function');
    expect(typeof onions(target, [beforeMiddleware], [])).toBe('function');
    expect(typeof onions(target, [], [])).toBe('function');
    expect(typeof onions(target, beforeMiddleware, afterMiddleware)).toBe('function');
  });

  test('Target normal execution for function[]', async () =>
    expect(await onions(target, [beforeMiddleware], [afterMiddleware])(1, 2)).toBe(3));

  test('Target normal execution for function', async () =>
    expect(await onions(target, beforeMiddleware, afterMiddleware)(1, 2)).toBe(3));

  test('Target normal execution for not has beforeMiddleware', async () =>
    expect(await onions(target, [], afterMiddleware)(1, 2)).toBe(3));

  test('Target normal execution for not has afterMiddleware', async () =>
    expect(await onions(target, beforeMiddleware, [])(1, 2)).toBe(3));

  test('Test beforeMiddleware pipe', async () => {
    const befAdd1 = <T extends number>(next: UnknownFun) => (a: T, b: T) => {
      next(a +1, b + 1);
    };

    const befAdd2 = <T extends number>(next: UnknownFun) => (a: T, b: T) => next(a +1, b + 1);

    expect(await onions(target, [befAdd1, befAdd2], [])(1, 2)).toBe(7)
  });

  test('Test afterMiddleware pipe', async () => {
    type TestValue = {value: number};
    const afterMiddleware = <T extends TestValue>(next: UnknownFun) => (a: T) => next(a.value++);
    const testValue: TestValue = {value: 1};

    await onions((valueObject: TestValue) => valueObject.value++, [], afterMiddleware)(testValue);

    expect(testValue).toEqual({value: 3});
  });

  test('Target is AsyncFunction', async () => {
    async function asyncTarget(a: number, b: number) {
      await Promise.resolve();

      return (a + b);
    }

    const asyncTargetWrapOnions = onions(asyncTarget, [beforeMiddleware], [afterMiddleware]);

    expect(Object.prototype.toString.call(asyncTargetWrapOnions(1, 2)).slice(8, -1)).toBe('Promise');
    expect(await asyncTargetWrapOnions(1, 2)).toBe(3);
  });

  const before1 = (next) => async (a, b) => {
    next(a + 1, b + 1);
  };

  const before2 = (next) => async (a, b) => {
    await Promise.resolve();

    next(a + 1, b + 1);
  };

  const before3 = (next) => (a, b) => {
    next(a + 1, b + 1)
  };

  test('Middlewares async test', async () => {
    let testAfter = 0;
    function target(a: number, b: number): number {
      const result = a + b;

      return result;
    }

    const after = (next) => (a, b) => {
      testAfter = a + b;

      next(a, b);
    };

    const newTarget = onions(target, [before1, before2, before3], after);

    expect(await newTarget(1, 2)).toBe(9);
    expect(testAfter).toBe(9);
  });

  test('Target async test', async () => {
    let testAfter = 0;
    async function target(a: number, b: number): Promise<number> {
      const result = a + b;

      await Promise.resolve();

      return result;
    }

    const after = (next) => (a, b) => {
      testAfter = a + b;

      next(a, b);
    };

    const newTarget = onions(target, [before1, before2, before3], after);

    expect(await newTarget(1, 2)).toBe(9);
    expect(testAfter).toBe(9);
  });
});

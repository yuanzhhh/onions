import onions, { UnknownFunction } from '../src';

describe('Onions test', () => {
  const beforeMiddleware = (next: UnknownFunction) => (...args: unknown[]) => next(...args);
  const afterMiddleware = (next: UnknownFunction) => (...args: unknown[]) => next(...args);

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

  test('Target normal execution for function[]', () =>
    expect(onions(target, [beforeMiddleware], [afterMiddleware])(1, 2)).toBe(3));

  test('Target normal execution for function', () =>
    expect(onions(target, beforeMiddleware, afterMiddleware)(1, 2)).toBe(3));

  test('Target normal execution for not has beforeMiddleware', () =>
    expect(onions(target, [], afterMiddleware)(1, 2)).toBe(3));

  test('Target normal execution for not has afterMiddleware', () =>
    expect(onions(target, beforeMiddleware, [])(1, 2)).toBe(3));


  test('Test beforeMiddleware pipe', () => {
    const befAdd = <T extends number>(next: UnknownFunction) => (a: T, b: T) => next(a +1, b + 1);

    expect(onions(target, befAdd, [])(1, 2)).toBe(5)
  });

  test('Test afterMiddleware pipe', () => {
    type TestValue = {value: number};
    const afterMiddleware = <T extends TestValue>(next: UnknownFunction) => (a: T) => next(a.value++);
    const testValue: TestValue = {value: 1};

    onions((valueObject: TestValue) => valueObject.value++, [], afterMiddleware)(testValue);

    expect(testValue).toEqual({value: 3});
  });
});

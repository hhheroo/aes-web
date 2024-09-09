declare global {
  interface PromiseConstructor {
    withResolvers<T = unknown>(): {
      resolve: (val: T | PromiseLike<T>) => void;
      reject: (reason?: any) => void;
      promise: Promise<T>;
    };

    fromEvent<T>(
      event: string,
      source: object,
      handler?: (e: any) => T
    ): Promise<T>;
  }

  interface Window {
    noop: () => void;
  }
}

const noop = () => {};
window.noop = noop;

if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function <T>() {
    let resolve: (val: T | PromiseLike<T>) => void = noop;
    let reject: (reason?: any) => void = noop;
    const promise = new Promise<T>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });

    return { promise, resolve, reject };
  };
}

if (typeof Promise.fromEvent !== 'function') {
  Promise.fromEvent = function <T>(
    event: string,
    source: any,
    handler?: (e: any) => T
  ) {
    const { promise, resolve } = Promise.withResolvers<T>();
    source[event] = function (e: any) {
      resolve(handler ? handler(e) : e);
    };
    return promise;
  };
}

export {};

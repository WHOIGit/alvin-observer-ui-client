import { useEffect, useState } from "react";

function recurringFunction(interval, fn) {
  let intervalId = null;
  let context = null;
  let args = null;
  let isDisposed = false;

  const start = () => {
    intervalId = setInterval(() => {
      if (isDisposed) {
        stop();
 
      if (context && args) {
        fn.apply(context, args);
      }
    };
  };

  const stop = () => {
    clearInterval(intervalId);
    intervalId = null;
  }

  return [
    function () {
       intervalId = setInterval(() => {
         fn.apply(context, args);
       }, interval);
    },
    () => {
      isDisposed = true;
    }
  ];
}


function throttledFunction(delay, fn) {
  let throttlePromise = null;
  let pendingCallPromise = null;
  let nextContext = null;
  let nextArgs = null;
  let isDisposed = false;

  function promiseTimeout(delay) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, delay);
    });
  }

  function makeThrottlePromise() {
    return promiseTimeout(delay).then(function () {
      throttlePromise = null;
    });
  }

  return [
    function () {
        nextContext = this;
        nextArgs = [].slice.call(arguments, 0);
        pendingCallPromise = throttlePromise.then(function () {
          var context = nextContext;
          nextContext = null;
          var args = nextArgs;
          nextArgs = null;
          throttlePromise = makeThrottlePromise();
          pendingCallPromise = null;
          if (!isDisposed) {
            fn.apply(context, args);
          }
        });
      } else {
        throttlePromise = makeThrottlePromise();
        fn.apply(this, arguments);
      }
    },
    (newFn) => {
      fn = newFn
    },
    () => {
      isDisposed = true;
    }
  ];
}


// React Hook for consuming a throttled function. The throttled function
// is disposed when the React component unmounts so that the throttled
// function will never run again.
//
// Thanks to Adam Comella.
export default function useThrottledFunction(delay, fn) {
  const [prevDelay] = useState(delay);
  if (delay !== prevDelay) {
    throw new Error('useThrottledFunction: Changing the `delay` parameter between invocations is currently not supported.');
  }

  const [[throttledFn, setFn, disposeThrottledFn]] = useState(() => {
    return throttledFunction(delay, fn);
  });
  setFn(fn);

  useEffect(() => {
    return () => {
      disposeThrottledFn();
    };
  }, []);

  return throttledFn;
}

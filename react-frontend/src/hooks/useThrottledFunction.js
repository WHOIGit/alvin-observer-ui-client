import { useEffect, useState } from "react";

// Based on the implementation from WinJS:
// https://github.com/winjs/winjs/blob/b9e0b33f76c57caac941c9b1885bf69443320b1c/src/js/WinJS/Core/_BaseUtils.js#L196-L245
//
// This implementation is extended to handle disposal. When your React component
// unmounts, you can dispose the throttled function so that it never runs again.
//
// Thanks to Adam Comella.
//
// -----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation
//
// All rights reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the ""Software""), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// -----------------------------------------------------------------------------
//
// Returns a function which, when called, will call *fn*. However, if called
// multiple times, it will only call *fn* at most once every *delay*
// milliseconds. Multiple calls during the throttling period will be coalesced
// into a single call to *fn* with the arguments being the ones from the last
// call received during the throttling period.
//
// Note that, due to the throttling period, *fn* may be invoked asynchronously
// relative to the time it was called so make sure its arguments are still valid
// (for example, eventObjects will not be valid).
//
// Example usage. If you want your key down handler to run once every 100 ms,
// you could do this:
//
//   var [onKeyDown, disposeOnKeyDown] = throttledFunction(100, function (key) {
//       // do something with key
//   });
//   element.addEventListener("keydown", function (eventObject) {
//     onKeyDown(eventObject.keyCode);
//   });
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
      if (isDisposed) {
        return;
      } else if (pendingCallPromise) {
        nextContext = this;
        nextArgs = [].slice.call(arguments, 0);
      } else if (throttlePromise) {
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

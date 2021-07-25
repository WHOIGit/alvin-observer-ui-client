import { useRef, useCallback, useMemo } from "react";

export default function useLongPress({
  onClick = () => {},
  onLongPress = () => {},
  onStop = () => {},
  ms = 500
} = {}) {
  const timerRef = useRef(false);
  const eventRef = useRef({});

  const callback = useCallback(() => {
    onLongPress(eventRef.current);
    eventRef.current = {};
    timerRef.current = false;
  }, [onLongPress]);

  const start = useCallback(
    ev => {
      ev.persist();
      eventRef.current = ev;
      timerRef.current = setTimeout(callback, ms);
    },
    [callback, ms]
  );

  const stop = useCallback(
    ev => {
      ev.persist();
      eventRef.current = ev;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        onClick(eventRef.current);
        timerRef.current = false;
        eventRef.current = {};
      }
      // call custom onStop function if provided
      onStop();
    },
    [onClick, onStop]
  );

  return useMemo(
    () => ({
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchStart: start,
      onTouchEnd: stop
    }),
    [start, stop]
  );
}

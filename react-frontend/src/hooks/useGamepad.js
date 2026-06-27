import { useEffect, useRef, useState } from "react";

const DEFAULT_DEADZONE = 0.15;
const AXIS_X = 0;
const AXIS_Y = 1;

// Poll the Gamepad API and emit nipplejs-style start/move/end lifecycle
// events for the left stick. Vectors are screen-space (x right+, y down+)
// with magnitude clamped to 0..1, matching how a touch joystick reports.
export function useGamepad({
  deadzone = DEFAULT_DEADZONE,
  onStart,
  onMove,
  onEnd,
} = {}) {
  const [connected, setConnected] = useState(false);
  const cbs = useRef({});
  cbs.current = { onStart, onMove, onEnd };

  useEffect(() => {
    const update = () =>
      setConnected(
        Array.from(navigator.getGamepads?.() ?? []).some(Boolean)
      );
    window.addEventListener("gamepadconnected", update);
    window.addEventListener("gamepaddisconnected", update);
    update();
    return () => {
      window.removeEventListener("gamepadconnected", update);
      window.removeEventListener("gamepaddisconnected", update);
    };
  }, []);

  useEffect(() => {
    if (!connected) return;
    let raf;
    let active = false;

    const readStick = () => {
      for (const pad of navigator.getGamepads?.() ?? []) {
        if (!pad) continue;
        const x = pad.axes[AXIS_X] ?? 0;
        const y = pad.axes[AXIS_Y] ?? 0;
        const mag = Math.hypot(x, y);
        if (mag < deadzone) return { x: 0, y: 0, magnitude: 0 };
        const scaled = Math.min((mag - deadzone) / (1 - deadzone), 1);
        const k = scaled / mag;
        return { x: x * k, y: y * k, magnitude: scaled };
      }
      return { x: 0, y: 0, magnitude: 0 };
    };

    const loop = () => {
      const v = readStick();
      if (v.magnitude > 0) {
        // A deflected stick is continuous input: emit every frame so the
        // command spitter always has the current deflection, even when the
        // stick is held perfectly still.
        if (!active) {
          active = true;
          cbs.current.onStart?.(v);
        } else {
          cbs.current.onMove?.(v);
        }
      } else if (active) {
        active = false;
        cbs.current.onEnd?.(v);
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (active) cbs.current.onEnd?.({ x: 0, y: 0, magnitude: 0 });
    };
  }, [connected, deadzone]);

  return { connected };
}

export default useGamepad;

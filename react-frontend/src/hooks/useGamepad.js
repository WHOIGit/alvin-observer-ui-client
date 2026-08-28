import { useEffect, useRef, useState } from "react";

const DEFAULT_DEADZONE = 0.15;
// Release below a lower threshold than we engage at, or a stick resting on the
// boundary chatters start/end at frame rate, each transition sending a command.
const RELEASE_RATIO = 0.6;
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

    const release = deadzone * RELEASE_RATIO;

    const readStick = (engaged) => {
      const threshold = engaged ? release : deadzone;
      for (const pad of navigator.getGamepads?.() ?? []) {
        if (!pad) continue;
        const x = pad.axes[AXIS_X] ?? 0;
        const y = pad.axes[AXIS_Y] ?? 0;
        const mag = Math.hypot(x, y);
        // Skip rather than bail, so a second pad is still reachable when the
        // first is connected but resting.
        if (mag < threshold) continue;
        const scaled = Math.min((mag - release) / (1 - release), 1);
        const k = scaled / mag;
        return { x: x * k, y: y * k, magnitude: scaled };
      }
      return { x: 0, y: 0, magnitude: 0 };
    };

    const loop = () => {
      const v = readStick(active);
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

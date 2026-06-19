import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import bombIcon from "../../images/bomb.png";

// How long the button must be held before the restart fires.
const HOLD_MS = 5000;
const RESTART_URL = `http://${window.location.hostname}:8082/restart`;

const useStyles = makeStyles(() => ({
  root: {
    position: "fixed",
    bottom: 16,
    left: 16,
    zIndex: 1300,
    width: 56,
    height: 56,
    padding: 0,
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    background: "#b71c1c",
    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
    overflow: "hidden",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
    outline: "none",
  },
  img: {
    width: 32,
    height: 32,
    pointerEvents: "none",
    // Sit above the progress fill.
    position: "relative",
    zIndex: 1,
  },
  // Radial fill that grows while the button is held.
  fill: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "100%",
    background: "rgba(255, 193, 7, 0.85)",
    zIndex: 0,
  },
  // Agitation — amplitude driven by the inline --amp var, speed by inline duration.
  "@keyframes bombShake": {
    "0%": { transform: "translate(0, 0) rotate(0deg)" },
    "20%": {
      transform:
        "translate(calc(var(--amp, 1) * -1px), calc(var(--amp, 1) * 0.6px)) rotate(calc(var(--amp, 1) * -1deg))",
    },
    "40%": {
      transform:
        "translate(calc(var(--amp, 1) * 1px), calc(var(--amp, 1) * -0.6px)) rotate(calc(var(--amp, 1) * 1deg))",
    },
    "60%": {
      transform:
        "translate(calc(var(--amp, 1) * -1px), calc(var(--amp, 1) * -0.4px)) rotate(calc(var(--amp, 1) * -0.7deg))",
    },
    "80%": {
      transform:
        "translate(calc(var(--amp, 1) * 1px), calc(var(--amp, 1) * 0.4px)) rotate(calc(var(--amp, 1) * 0.7deg))",
    },
    "100%": { transform: "translate(0, 0) rotate(0deg)" },
  },
  shake: {
    animationName: "$bombShake",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
}));

export default function RestartButton() {
  const classes = useStyles();
  const [progress, setProgress] = React.useState(0); // 0..1
  const timerRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const startRef = React.useRef(0);
  const firedRef = React.useRef(false);

  const clearTimers = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = React.useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    setProgress(Math.min(elapsed / HOLD_MS, 1));
    if (elapsed < HOLD_MS) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const fire = React.useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    setProgress(1);
    // Fire-and-forget GET, then refresh regardless of the result.
    fetch(RESTART_URL, { method: "GET", mode: "no-cors" })
      .catch(() => {})
      .finally(() => {
        window.location.reload();
      });
  }, []);

  const start = React.useCallback(
    (e) => {
      e.preventDefault();
      if (firedRef.current) return;
      clearTimers();
      startRef.current = Date.now();
      timerRef.current = setTimeout(fire, HOLD_MS);
      rafRef.current = requestAnimationFrame(tick);
    },
    [clearTimers, fire, tick]
  );

  const cancel = React.useCallback(() => {
    if (firedRef.current) return;
    clearTimers();
    setProgress(0);
  }, [clearTimers]);

  React.useEffect(() => clearTimers, [clearTimers]);

  // Shake kicks in at ~1/3 full and gets more violent toward the top.
  const SHAKE_START = 1 / 3;
  const shaking = progress >= SHAKE_START;
  const ramp = shaking ? (progress - SHAKE_START) / (1 - SHAKE_START) : 0; // 0..1
  const amp = 1 + ramp * 6; // 1px -> 7px
  const dur = 0.32 - ramp * 0.24; // 0.32s -> 0.08s (faster as it fills)
  const shakeStyle = shaking
    ? { "--amp": amp, animationDuration: `${dur}s` }
    : undefined;

  return (
    <button
      type="button"
      className={shaking ? `${classes.root} ${classes.shake}` : classes.root}
      style={shakeStyle}
      title="Hold 5s to restart"
      aria-label="Hold 5 seconds to restart"
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onTouchStart={start}
      onTouchEnd={cancel}
      onTouchCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className={classes.fill}
        style={{ height: `${progress * 100}%` }}
      />
      <img className={classes.img} src={bombIcon} alt="restart" />
    </button>
  );
}

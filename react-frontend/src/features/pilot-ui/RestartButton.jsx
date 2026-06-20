import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import bombIcon from "../../images/bomb.png";

// How long the button must be held before the restart fires.
const HOLD_MS = 5000;
// Past this fraction the red wash ramps in.
const ARM_AT = 0.7;
// Near the end the wash strobes like a klaxon.
const STROBE_AT = 0.9;
const BOMB_RED = "#b71c1c";
const HINT_MS = 10000;
// Klaxon strobe cycle: slow swell, then a slower-than-before drop.
const KLAXON_CYCLE_MS = 2200;
// Where in the cycle the peak sits (rest is the fade-out).
const KLAXON_PEAK = 0.68;
// Sparks begin only after this much continuous holding (later than the 5s arm).
const SPARKS_AT_MS = 7000;
// Red wash never goes fully opaque — peak and trough alpha.
const RED_MAX = 0.85;
const RED_MIN = 0.14;
const RESTART_URL = `http://${window.location.hostname}:8082/restart`;

const useStyles = makeStyles(() => ({
  root: {
    // Lives inline at the far-right of the toolbar.
    position: "relative",
    zIndex: 1300, // stay above the red wash (1299)
    flexShrink: 0,
    marginLeft: 12,
    width: 40,
    height: 40,
    padding: 0,
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    background: BOMB_RED,
    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
    overflow: "hidden",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
    outline: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: 24,
    height: 24,
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
  // Full-screen red wash — beneath the button, over everything else.
  redOverlay: {
    position: "fixed",
    inset: 0,
    background: BOMB_RED,
    zIndex: 1299,
    pointerEvents: "none",
  },
  // Klaxon strobe — slow swell to peak, then an eased fade-out.
  "@keyframes bombKlaxon": {
    "0%": { opacity: RED_MIN, animationTimingFunction: "ease-in" },
    [`${KLAXON_PEAK * 100}%`]: {
      opacity: RED_MAX,
      animationTimingFunction: "ease-out",
    },
    "100%": { opacity: RED_MIN },
  },
  klaxon: {
    animationName: "$bombKlaxon",
    animationDuration: `${KLAXON_CYCLE_MS}ms`,
    animationIterationCount: "infinite",
    // Start at the peak so it flows out of the full-red ramp instead of
    // snapping down to the dim 0% frame on the first cycle.
    animationDelay: `-${KLAXON_PEAK * KLAXON_CYCLE_MS}ms`,
  },
  // Spark particle layer — above the red wash, below the bomb button.
  sparks: {
    position: "fixed",
    inset: 0,
    zIndex: 1300,
    pointerEvents: "none",
  },
  // "PRESS & HOLD" nudge shown after a tap/cancel.
  hint: {
    position: "fixed",
    top: 64,
    right: 12,
    zIndex: 1301,
    padding: "8px 14px",
    borderRadius: 6,
    background: "rgba(0, 0, 0, 0.85)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.5,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
    transition: "opacity 0.6s ease",
  },
}));

export default function RestartButton() {
  const classes = useStyles();
  const [progress, setProgress] = React.useState(0); // 0..1
  const [hintVisible, setHintVisible] = React.useState(false);
  const [sparksOn, setSparksOn] = React.useState(false); // sparks (after 7s hold)
  const rafRef = React.useRef(null);
  const startRef = React.useRef(0);
  const firedRef = React.useRef(false);
  const chargedRef = React.useRef(false); // held the full duration, awaiting release
  const hintTimerRef = React.useRef(null);
  const sparkTimerRef = React.useRef(null);
  const releaseRef = React.useRef(null); // window release handler, while pressed
  const canvasRef = React.useRef(null);

  const clearRaf = React.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = React.useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const p = Math.min(elapsed / HOLD_MS, 1);
    setProgress(p);
    if (elapsed < HOLD_MS) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      // Fully charged — do NOT fire yet; wait for the release.
      chargedRef.current = true;
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

  const showHint = React.useCallback(() => {
    setHintVisible(true);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setHintVisible(false), HINT_MS);
  }, []);

  const detachRelease = React.useCallback(() => {
    if (releaseRef.current) {
      window.removeEventListener("mouseup", releaseRef.current);
      window.removeEventListener("touchend", releaseRef.current);
      window.removeEventListener("touchcancel", releaseRef.current);
      releaseRef.current = null;
    }
  }, []);

  // Pointer released anywhere. Fire only if it was held the whole time;
  // otherwise it's an abort and we nudge with the hint.
  const release = React.useCallback(() => {
    if (firedRef.current) return;
    detachRelease();
    clearRaf();
    const wasCharged = chargedRef.current;
    chargedRef.current = false;
    if (sparkTimerRef.current) clearTimeout(sparkTimerRef.current);
    setSparksOn(false); // stop the sparks immediately
    if (wasCharged) {
      fire(); // held the full duration — send on release, no hint
    } else {
      setProgress(0);
      showHint();
    }
  }, [detachRelease, clearRaf, fire, showHint]);

  const start = React.useCallback(
    (e) => {
      e.preventDefault();
      if (firedRef.current) return;
      clearRaf();
      detachRelease();
      chargedRef.current = false;
      setSparksOn(false);
      if (sparkTimerRef.current) clearTimeout(sparkTimerRef.current);
      sparkTimerRef.current = setTimeout(() => setSparksOn(true), SPARKS_AT_MS);
      // A new press dismisses any lingering hint.
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      setHintVisible(false);
      startRef.current = Date.now();
      rafRef.current = requestAnimationFrame(tick);
      // Catch the release anywhere — the button shakes out from under the cursor.
      releaseRef.current = release;
      window.addEventListener("mouseup", release);
      window.addEventListener("touchend", release);
      window.addEventListener("touchcancel", release);
    },
    [clearRaf, detachRelease, tick, release]
  );

  React.useEffect(
    () => () => {
      clearRaf();
      detachRelease();
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      if (sparkTimerRef.current) clearTimeout(sparkTimerRef.current);
    },
    [clearRaf, detachRelease]
  );

  // Welding sparks: while fully charged, quasi-random bursts shoot in from the
  // left/right edges, leave glowing trails, and fall off the bottom under gravity.
  React.useEffect(() => {
    if (!sparksOn) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");

    let W = 0;
    let H = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const GRAVITY = 0.2;
    const DRAG = 0.99;
    const MAX = 500;
    const TRAIL = 12; // history points kept per spark
    const particles = [];
    let frame = 0;

    // Emit a small cluster (1-5) from a single origin on one edge. Each spark
    // in the cluster gets its own size, horizontal force, slight position
    // jitter, and a small spawn-time offset.
    const emit = () => {
      const fromLeft = Math.random() < 0.5;
      const dir = fromLeft ? 1 : -1;
      const x0 = fromLeft ? -4 : W + 4;
      const y0 = H * 0.05 + Math.random() * H * 0.8;
      const n = 1 + Math.floor(Math.random() * 5);
      for (let i = 0; i < n; i++) {
        if (particles.length >= MAX) break;
        const hforce = 2.5 + Math.random() * 5.5; // gentle, per-spark
        particles.push({
          x: x0,
          y: y0 + (Math.random() - 0.5) * 20, // cluster jitter around the origin
          vx: dir * hforce,
          vy: -(1 + Math.random() * 3) + (Math.random() - 0.5) * 2,
          hist: [],
          life: 60 + Math.random() * 80,
          size: 0.8 + Math.random() * 1.8,
          start: frame + Math.floor(Math.random() * 8), // small random time offset
        });
      }
    };

    let raf = 0;
    const step = () => {
      frame += 1;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter"; // additive glow
      ctx.lineCap = "round";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.start > frame) continue; // not born yet (staggered spawn)
        p.vy += GRAVITY;
        p.vx *= DRAG;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        p.hist.push(p.x, p.y);
        if (p.hist.length > TRAIL * 2) p.hist.splice(0, p.hist.length - TRAIL * 2);

        const segs = p.hist.length / 2;
        for (let j = 1; j < segs; j++) {
          const t = j / segs; // 0 = old/dim, 1 = new/bright
          ctx.strokeStyle = `rgba(255, ${150 + Math.floor(100 * t)}, ${Math.floor(50 * t)}, ${0.06 + 0.5 * t})`;
          ctx.lineWidth = p.size * t + 0.3;
          ctx.beginPath();
          ctx.moveTo(p.hist[(j - 1) * 2], p.hist[(j - 1) * 2 + 1]);
          ctx.lineTo(p.hist[j * 2], p.hist[j * 2 + 1]);
          ctx.stroke();
        }
        // white-hot head
        ctx.fillStyle = "rgba(255, 248, 220, 0.95)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.y > H + 40 || p.life <= 0 || p.x < -80 || p.x > W + 80) {
          particles.splice(i, 1);
        }
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // Steady high-frequency trickle of a few sparks at a time.
    let burstTimer = 0;
    const scheduleEmit = () => {
      emit();
      burstTimer = window.setTimeout(scheduleEmit, 25 + Math.random() * 70);
    };
    scheduleEmit();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(burstTimer);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, W, H);
    };
  }, [sparksOn]);

  // Bomb's own shake — kicks in at ~1/3 and intensifies.
  const SHAKE_START = 1 / 3;
  const shaking = progress >= SHAKE_START;
  const ramp = shaking ? (progress - SHAKE_START) / (1 - SHAKE_START) : 0; // 0..1
  const amp = 1 + ramp * 6; // 1px -> 7px
  const dur = 0.32 - ramp * 0.24; // 0.32s -> 0.08s (faster as it fills)
  const shakeStyle = shaking
    ? { "--amp": amp, animationDuration: `${dur}s` }
    : undefined;

  const armed = progress >= ARM_AT;
  const strobing = progress >= STROBE_AT;
  const redAlpha = Math.min(Math.max((progress - ARM_AT) / (STROBE_AT - ARM_AT), 0), 1);

  const btnClass = `${classes.root} restart-bomb-button${
    shaking ? ` ${classes.shake}` : ""
  }`;

  return (
    <>
      {armed && (
        <div
          className={
            strobing ? `${classes.redOverlay} ${classes.klaxon}` : classes.redOverlay
          }
          style={strobing ? undefined : { opacity: redAlpha * RED_MAX }}
        />
      )}
      {sparksOn && <canvas ref={canvasRef} className={classes.sparks} />}
      <div
        className={classes.hint}
        style={{ opacity: hintVisible ? 1 : 0 }}
        aria-hidden={!hintVisible}
      >
        PRESS &amp; HOLD
      </div>
      <button
        type="button"
        className={btnClass}
        style={shakeStyle}
        title="Hold 5s to restart"
        aria-label="Hold 5 seconds to restart"
        onMouseDown={start}
        onTouchStart={start}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className={classes.fill} style={{ height: `${progress * 100}%` }} />
        <img className={classes.img} src={bombIcon} alt="restart" />
      </button>
    </>
  );
}

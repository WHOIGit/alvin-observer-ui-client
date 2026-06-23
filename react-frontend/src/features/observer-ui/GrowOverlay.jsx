import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector } from "react-redux";
// local
import { useStream } from "../camera-controls/WebRtcProvider";

// "Grow in place" transition for the observer camera view.
//
// When you toggle Show/Hide Camera Control, the little OBS preview and the big
// camera-controls feed are two separate <video> elements in different parts of
// the layout. Animating between them directly is awkward, so instead we fly a
// fixed-position overlay <video> — bound to the *same* shared MediaStream, so
// there's no flicker — from one rect to the other (a FLIP transform), then hand
// off to the real element on landing. The real large video is hidden during the
// flight so only the soaring overlay is visible.

const DURATION = 480;
// easeOutExpo — launches fast, glides to rest.
const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

const MINI_ID = "OBS-minivideo";
const LARGE_ID = "videoMain";
const LARGE_BOX_ID = "videoBoxMain";

const rectOf = (id) => {
  const el = document.getElementById(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

export default function GrowOverlay({ active }) {
  const observerVideoSrc = useSelector(
    (state) => state.cameraControls.observerVideoSrc
  );
  const stream = useStream(observerVideoSrc);

  const videoRef = useRef(null);
  const miniRectRef = useRef(null); // last known resting rect of the mini preview
  const largeRectRef = useRef(null); // last known resting rect of the large feed
  const cancelRef = useRef(null);
  const firstRun = useRef(true);

  // Keep the overlay pointed at the shared stream.
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // Cache whichever resting rect is currently measurable, so both directions of
  // the animation have a source and a target.
  useEffect(() => {
    if (active) {
      const r = rectOf(LARGE_ID);
      if (r) largeRectRef.current = r;
    } else {
      const r = rectOf(MINI_ID);
      if (r) miniRectRef.current = r;
    }
  });

  useLayoutEffect(() => {
    // Don't animate on first mount, only on real toggles.
    if (firstRun.current) {
      firstRun.current = false;
      return undefined;
    }

    const overlay = videoRef.current;
    if (!overlay) return undefined;

    // Cancel anything still in flight from a rapid re-toggle.
    if (cancelRef.current) cancelRef.current();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // On expand the large feed is now at rest (panel snaps to its flow
    // position), so measure it live; the mini just hid, so use the cached rect.
    // On collapse it's the mirror image.
    const to = active
      ? rectOf(LARGE_ID)
      : rectOf(MINI_ID) || miniRectRef.current;
    const from = active ? miniRectRef.current : largeRectRef.current;
    const largeBox = document.getElementById(LARGE_BOX_ID);

    if (!from || !to || reduce) return undefined;

    // Hide the real large video during the flight (synchronously, before paint,
    // so it never flashes at full size).
    if (largeBox) largeBox.style.opacity = "0";

    const sx = from.width / to.width;
    const sy = from.height / to.height;
    const tx = from.left - to.left;
    const ty = from.top - to.top;

    Object.assign(overlay.style, {
      display: "block",
      left: `${to.left}px`,
      top: `${to.top}px`,
      width: `${to.width}px`,
      height: `${to.height}px`,
      transformOrigin: "top left",
      transition: "none",
      transform: `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`,
      opacity: "1",
    });

    // Force the start frame, then transition to the resting transform.
    // eslint-disable-next-line no-unused-expressions
    overlay.offsetWidth;
    const raf = requestAnimationFrame(() => {
      overlay.style.transition = `transform ${DURATION}ms ${EASING}`;
      overlay.style.transform = "none";
    });

    const finish = () => {
      overlay.removeEventListener("transitionend", finish);
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      Object.assign(overlay.style, {
        display: "none",
        transition: "none",
        transform: "none",
      });
      if (largeBox) largeBox.style.opacity = "";
      cancelRef.current = null;
    };

    overlay.addEventListener("transitionend", finish);
    const timer = setTimeout(finish, DURATION + 120); // safety net
    cancelRef.current = finish;

    return undefined;
  }, [active]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        display: "none",
        zIndex: 3000,
        pointerEvents: "none",
        objectFit: "fill",
        background: "#000",
        borderRadius: 4,
        boxShadow: "0 12px 48px rgba(0, 0, 0, 0.55)",
        willChange: "transform",
      }}
    />
  );
}

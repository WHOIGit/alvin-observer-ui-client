import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGamepad } from "./useGamepad";

let rafCbs = [];
function flushFrames(n) {
  for (let i = 0; i < n; i++) {
    const cbs = rafCbs;
    rafCbs = [];
    cbs.forEach((cb) => cb());
  }
}

function setup() {
  const starts = [];
  const moves = [];
  const ends = [];
  renderHook(() =>
    useGamepad({
      onStart: (v) => starts.push(v),
      onMove: (v) => moves.push(v),
      onEnd: (v) => ends.push(v),
    })
  );
  act(() => window.dispatchEvent(new Event("gamepadconnected")));
  return { starts, moves, ends };
}

describe("useGamepad", () => {
  let stick;
  beforeEach(() => {
    rafCbs = [];
    stick = [0, 0];
    navigator.getGamepads = () => [{ axes: stick }];
    vi.stubGlobal("requestAnimationFrame", (cb) => rafCbs.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });
  afterEach(() => vi.unstubAllGlobals());

  it("emits move every frame while the stick is held, so deflection is continuous", () => {
    const { starts, moves, ends } = setup();
    act(() => {
      stick = [1, 0];
      flushFrames(4);
    });
    expect(starts).toHaveLength(1);
    expect(moves.length).toBe(3); // one start frame, then a move each held frame
    expect(ends).toHaveLength(0);
    // every emitted vector reflects the real deflection, not a zeroed rest value
    expect(moves.every((v) => v.magnitude > 0.9)).toBe(true);
  });

  it("emits end once when the stick returns to center", () => {
    const { ends } = setup();
    act(() => {
      stick = [1, 0];
      flushFrames(2);
    });
    act(() => {
      stick = [0, 0];
      flushFrames(2);
    });
    expect(ends).toHaveLength(1);
    expect(ends[0].magnitude).toBe(0);
  });

  it("ignores deflection inside the deadzone", () => {
    const { starts } = setup();
    act(() => {
      stick = [0.1, 0.05];
      flushFrames(3);
    });
    expect(starts).toHaveLength(0);
  });
});

import { afterEach, beforeEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup, act } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer, {
  changeCamHeartbeat,
} from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import Joystick from "./Joystick.jsx";

let rafCbs: Array<() => void> = [];
let stick = [0, 0];

function flushFrames(n: number) {
  for (let i = 0; i < n; i++) {
    const cbs = rafCbs;
    rafCbs = [];
    cbs.forEach((cb) => cb());
  }
}

beforeEach(() => {
  rafCbs = [];
  stick = [0, 0];
  (navigator as any).getGamepads = () => [{ axes: stick }];
  vi.stubGlobal("requestAnimationFrame", (cb: () => void) => rafCbs.push(cb));
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  cleanup();
});

// Joystick renders null when the camera has no pan/tilt, but it is never
// unmounted, so nothing else stops the 10 Hz command spitter.
test("disabling pan/tilt stops the gamepad command spitter", async () => {
  const h = createSocketIoHarness();
  const store = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
  });
  const setSpy = vi.spyOn(globalThis, "setInterval");
  const clearSpy = vi.spyOn(globalThis, "clearInterval");

  renderWithProviders(<Joystick />, { store });
  await h.connected;
  act(() => window.dispatchEvent(new Event("gamepadconnected")));

  stick = [0.9, 0];
  act(() => flushFrames(1));

  expect(setSpy).toHaveBeenCalledTimes(1); // the spitter started
  const spitterId = setSpy.mock.results[0].value;
  clearSpy.mockClear();

  // Camera switches to one with no pan/tilt while the stick is still deflected.
  act(() => {
    store.dispatch(changeCamHeartbeat({ pantilt: "N" } as any));
  });

  expect(clearSpy).toHaveBeenCalledWith(spitterId);
});

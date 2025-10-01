import { afterEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import FocusZoomButton from "./FocusZoomButton.jsx";
import { renderWithProviders } from "../../../tests/renderWithProviders";

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

function bootstrapState(overrides: Partial<CameraControlsState> = {}) {
  const base = cameraControlsReducer(undefined, {
    type: "@@INIT",
  } as any) as any;
  return { ...base, ...overrides } as any;
}

afterEach(() => {
  cleanup();
});

test("emits step focus once on click", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.step = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const state = bootstrapState({
    webSocketNamespace: "",
    camHeartbeatData: { focus_mode: "MF" },
  });

  const store = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: state },
  });

  const { getByText } = renderWithProviders(
    <FocusZoomButton
      id={1}
      buttonFunction="focus"
      label="Focus Near"
      commandStringControl={COMMAND_STRINGS.focusControlCommand}
      commandStringOneStop={COMMAND_STRINGS.focusNearOneStop}
      commandStringContinuous={COMMAND_STRINGS.focusNearContinuos}
      activeFocusZoomButton={null}
      sendActiveFocusZoomButtonToParent={() => null}
    />,
    { store },
  );

  await h.connected;
  await user.click(getByText("Focus Near"));

  const { namespace, args } = await h.step;
  expect(namespace).toBe("/");
  expect(args[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: null,
    action: {
      name: COMMAND_STRINGS.focusControlCommand,
      value: COMMAND_STRINGS.focusNearOneStop,
    },
  });
});

test("emits continuous focus on long press", async () => {
  // FIXME
  // In theory this test is supposed to call vi.useFakeTimers() and advance
  // the timers instead of actually waiting, but I couldn't get that to work.

  const h = createSocketIoHarness((h, expectEmit) => {
    h.start = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    h.stop = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const state = bootstrapState({
    webSocketNamespace: "",
    camHeartbeatData: { focus_mode: "MF" },
  });

  const store = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: state },
  });

  const { getByText } = renderWithProviders(
    <FocusZoomButton
      id={2}
      buttonFunction="focus"
      label="Focus Near Hold"
      commandStringControl={COMMAND_STRINGS.focusControlCommand}
      commandStringOneStop={COMMAND_STRINGS.focusNearOneStop}
      commandStringContinuous={COMMAND_STRINGS.focusNearContinuos}
      activeFocusZoomButton={null}
      sendActiveFocusZoomButtonToParent={() => null}
    />,
    { store },
  );

  await h.connected;
  const user = userEvent.setup();

  const btn = getByText("Focus Near Hold");
  await user.pointer({ target: btn, keys: "[MouseLeft>]" });
  await new Promise((r) => setTimeout(r, 600)); // > 500ms threshold

  const start = await h.start;
  expect(start.namespace).toBe("/");
  expect(start.args[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: null,
    action: {
      name: COMMAND_STRINGS.focusControlCommand,
      value: COMMAND_STRINGS.focusNearContinuos,
    },
  });

  await user.pointer({ target: btn, keys: "[/MouseLeft]" });

  const stop = await h.stop;
  expect(stop.namespace).toBe("/");
  expect(stop.args[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: null,
    action: {
      name: COMMAND_STRINGS.focusControlCommand,
      value: COMMAND_STRINGS.focusStop,
    },
  });
});

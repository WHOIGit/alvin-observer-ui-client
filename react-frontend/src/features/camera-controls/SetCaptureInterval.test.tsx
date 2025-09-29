import { afterEach, beforeEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import SetCaptureInterval from "./SetCaptureInterval.jsx";
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

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  consoleErrorSpy.mockRestore();
});

test("emits Start capture interval payload with selected value", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const state = bootstrapState({
    webSocketNamespace: "",
    camHeartbeatData: { capture_interval: "0" },
  });
  const store = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: state },
  });

  const { getByRole, getByText } = renderWithProviders(<SetCaptureInterval />, {
    store,
  });

  await h.connected;
  await user.click(getByRole("combobox"));
  const opt = await screen.findByRole("option", { name: "20 secs" });
  await user.click(opt);
  await user.click(getByText("Start"));

  const { data } = await h.gotCmd;
  expect(data[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: null,
    action: { name: COMMAND_STRINGS.captureIntervalCommand, value: "20" },
  });
});

test("emits Stop capture interval payload with value 0", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const state = bootstrapState({
    webSocketNamespace: "",
    camHeartbeatData: { capture_interval: "20" },
  });
  const store = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: state },
  });

  const { getByText } = renderWithProviders(<SetCaptureInterval />, { store });

  await h.connected;
  await user.click(getByText("Stop"));

  const { data } = await h.gotCmd;
  expect(data[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: null,
    action: { name: COMMAND_STRINGS.captureIntervalCommand, value: "0" },
  });
});

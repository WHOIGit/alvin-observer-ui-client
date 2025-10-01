import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import SelectWhiteBalance from "./SelectWhiteBalance.jsx";
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

test("emits WB change payload on select", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const state = bootstrapState({
    webSocketNamespace: "",
    camHeartbeatData: { white_balance: "INDOOR" },
  });

  const store = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: state },
  });

  const { getByRole, getByText } = renderWithProviders(
    <SelectWhiteBalance showLabel={true} />,
    { store },
  );

  await h.connected;
  await user.click(getByRole("combobox"));
  await user.click(getByText("AUTO"));

  const { namespace, args } = await h.gotCmd;
  expect(namespace).toBe("/");
  expect(args[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: null,
    action: { name: COMMAND_STRINGS.whiteBalanceCommand, value: "AUTO" },
  });
});

test("emits WB one-push payload on button", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const state = bootstrapState({
    webSocketNamespace: "",
    camHeartbeatData: { white_balance: "ONE_PUSH_WB" },
  });

  const store = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: state },
  });

  const { getByText } = renderWithProviders(
    <SelectWhiteBalance showLabel={true} />,
    { store },
  );

  await h.connected;
  await user.click(getByText("WB One Push"));

  const { namespace, args } = await h.gotCmd;
  expect(namespace).toBe("/");
  expect(args[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: null,
    action: {
      name: COMMAND_STRINGS.whiteBalanceCommand,
      value: COMMAND_STRINGS.whiteBalanceOnePushCommandValue,
    },
  });
});

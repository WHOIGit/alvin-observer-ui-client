import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import SelectIsoMode from "./SelectIsoMode.jsx";
import { renderWithProviders } from "../../../tests/renderWithProviders";

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

function makeStore(overrides: Partial<CameraControlsState> = {}) {
  const baseState = cameraControlsReducer(undefined, { type: "@@INIT" } as any);
  return configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: { ...baseState, ...overrides } },
  });
}

afterEach(() => {
  cleanup();
});

test("emits ISO change payload on select", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const store = makeStore({
    webSocketNamespace: "",
    cameraControls: undefined as any,
  } as any);

  const allState = cameraControlsReducer(undefined, {
    type: "@@INIT",
  } as any) as any;
  const preloaded = {
    ...allState,
    webSocketNamespace: "",
    currentCamData: { ISO: ["100", "200", "400"] },
    camHeartbeatData: { exposure: "MAN", iso: "100" },
    exposureControlsEnabled: true,
  } as any;

  const customStore = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: preloaded },
  });

  const { getByRole, getByText } = renderWithProviders(<SelectIsoMode />, {
    store: customStore,
  });

  await h.connected;
  await user.click(getByRole("combobox"));
  await user.click(getByText("ISO: 200"));

  const { data } = await h.gotCmd;
  expect(data[0]).toMatchObject({
    action: { name: COMMAND_STRINGS.isoModeCommand, value: "200" },
  });
});

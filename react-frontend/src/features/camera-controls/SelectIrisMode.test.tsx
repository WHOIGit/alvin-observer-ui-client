import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import SelectIrisMode from "./SelectIrisMode.jsx";
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

test("emits IRIS mode change payload", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const state = bootstrapState({
    webSocketNamespace: "",
    currentCamData: { IRS: ["1.8", "2.8", "4.0"] },
    camHeartbeatData: { exposure: "MAN", iris: "1.8" },
    exposureControlsEnabled: true,
  });

  const store = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: state },
  });

  const { getByRole, getByText } = renderWithProviders(<SelectIrisMode />, {
    store,
  });

  await h.connected;
  await user.click(getByRole("combobox"));
  await user.click(getByText("IRIS: 2.8"));

  const { data } = await h.gotCmd;
  expect(data[0]).toMatchObject({
    action: { name: COMMAND_STRINGS.irisModeCommand, value: "2.8" },
  });
});

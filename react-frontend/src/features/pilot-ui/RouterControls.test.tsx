import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "../camera-controls/cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import RouterControls from "./RouterControls.jsx";
import { renderWithProviders } from "../../../tests/renderWithProviders";

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

const routerInputs = [
  { label: "BZBGEAR", value: "input1" },
  { label: "INPUT2", value: "input2" },
];
const routerOutputs = [
  { label: "PROXY_REC", value: "output1" },
  { label: "PRORES_REC", value: "output2" },
];

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

// The backend may ship later: ports arrive at bootstrap but routerRouting is
// never sent. The matrix should still be usable and TAKE should emit RTR.
test("stages a crosspoint and emits a router take without backend routing", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const store = makeStore({
    observerSide: "PL",
    routerInputs,
    routerOutputs,
    routerRouting: {}, // backend without the routing query
  });

  const { getByLabelText, getByText } = renderWithProviders(<RouterControls />, {
    store,
  });

  await h.connected;

  await user.click(getByLabelText("Route INPUT2 to PRORES_REC"));
  await user.click(getByText("TAKE"));

  const { args } = await h.gotCmd;
  expect(args[0].action).toEqual({
    name: COMMAND_STRINGS.routerIOCommand,
    value: { input: "input2", output: "output2" },
  });
});

import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "../camera-controls/cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { ROUTER_TAKE_EVENT, WS_ROUTER_NAMESPACE } from "../../config.js";
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

// Router state + takes are served on the v1.5 /router namespace (not the legacy
// v1 newCameraCommand path). Staging a crosspoint and pressing TAKE should emit
// a 'take' there with the selected ports.
test("stages a crosspoint and emits a take on the v1.5 /router namespace", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotTake = expectEmit(ROUTER_TAKE_EVENT);
  });

  const store = makeStore({ routerInputs, routerOutputs, routerRouting: {} });

  const { getByLabelText, getByText } = renderWithProviders(<RouterControls />, {
    store,
  });

  await h.connected;

  await user.click(getByLabelText("Route INPUT2 to PRORES_REC"));
  await user.click(getByText("TAKE"));

  const { namespace, args } = await h.gotTake;
  expect(namespace).toBe(WS_ROUTER_NAMESPACE);
  expect(args[0]).toEqual({ input: "input2", output: "output2" });
});

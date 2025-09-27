import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer, {
  changeCamHeartbeat,
} from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import FocusModeButton from "./FocusModeButton.jsx";
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

test.each([
  { initial: COMMAND_STRINGS.focusAF, expected: COMMAND_STRINGS.focusMF },
  { initial: COMMAND_STRINGS.focusMF, expected: COMMAND_STRINGS.focusAF },
])("toggles focus mode from %s", async ({ initial, expected }) => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const store = makeStore({ webSocketNamespace: "" });
  store.dispatch(changeCamHeartbeat({ focus_mode: initial } as any));

  const { getByText } = renderWithProviders(<FocusModeButton />, { store });

  await h.connected;
  await user.click(getByText(/Focus/i));

  const { data } = await h.gotCmd;
  expect(data[0]).toMatchObject({
    action: { name: COMMAND_STRINGS.focusModeCommand, value: expected },
  });
});

import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  storeCamHeartbeat,
} from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { makeCameraControlsStore } from "../../../tests/imaging-test-utils";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import FocusModeButton from "./FocusModeButton.jsx";
import { ObservedCameraProvider } from "./ObservedCameraProvider";
import { renderWithProviders } from "../../../tests/renderWithProviders";

afterEach(() => {
  cleanup();
});

test.each(SOCKET_USER_SCENARIOS)(
  "toggles focus from AF to MF ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeCameraControlsStore({
      ownStationId: scenario.stationId,
    });
    store.dispatch(
      storeCamHeartbeat({
        stationId: scenario.stationId,
        heartbeat: { focus_mode: COMMAND_STRINGS.focusAF },
      } as any),
    );

    const { getByText } = renderWithProviders(
      <ObservedCameraProvider>
        <FocusModeButton />
      </ObservedCameraProvider>,
      { store },
    );

    await h.connected;
    await user.click(getByText(/Focus/i));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: COMMAND_STRINGS.focusModeCommand,
        value: COMMAND_STRINGS.focusMF,
      },
    });
  },
);

test.each(SOCKET_USER_SCENARIOS)(
  "toggles focus from MF to AF ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeCameraControlsStore({
      ownStationId: scenario.stationId,
    });
    store.dispatch(
      storeCamHeartbeat({
        stationId: scenario.stationId,
        heartbeat: { focus_mode: COMMAND_STRINGS.focusMF },
      } as any),
    );

    const { getByText } = renderWithProviders(
      <ObservedCameraProvider>
        <FocusModeButton />
      </ObservedCameraProvider>,
      { store },
    );

    await h.connected;
    await user.click(getByText(/Focus/i));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: COMMAND_STRINGS.focusModeCommand,
        value: COMMAND_STRINGS.focusAF,
      },
    });
  },
);

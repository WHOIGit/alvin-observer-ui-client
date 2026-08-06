import { afterEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { makeCameraControlsStore } from "../../../tests/imaging-test-utils";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import { ACTIONS, FOCUS_CONTROLS } from "../../lib/imaging-client";
import FocusZoomButton from "./FocusZoomButton.jsx";
import { ObservedCameraProvider } from "./ObservedCameraProvider";
import { renderWithProviders } from "../../../tests/renderWithProviders";

afterEach(() => {
  cleanup();
});

test.each(SOCKET_USER_SCENARIOS)(
  "emits step focus once on click ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.step = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeCameraControlsStore({
      ownStationId: scenario.stationId,
      camHeartbeats: { [scenario.stationId]: { focus_mode: "MF" } },
    });

    const { getByText } = renderWithProviders(
      <ObservedCameraProvider>
        <FocusZoomButton
          id={1}
          buttonFunction="focus"
          label="Focus Near"
          controlOneStop={FOCUS_CONTROLS.NEAR_ONE_STOP}
          controlContinuous={FOCUS_CONTROLS.NEAR_CONTINUOUS}
          activeFocusZoomButton={null}
          sendActiveFocusZoomButtonToParent={() => null}
        />
      </ObservedCameraProvider>,
      { store },
    );

    await h.connected;
    await user.click(getByText("Focus Near"));

    const { namespace, args } = await h.step;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: ACTIONS.focusControl,
        value: FOCUS_CONTROLS.NEAR_ONE_STOP,
      },
    });
  },
);

test.each(SOCKET_USER_SCENARIOS)(
  "emits continuous focus on long press ($name)",
  async (scenario) => {
    const h = createSocketIoHarness((h, expectEmit) => {
      h.start = expectEmit(NEW_CAMERA_COMMAND_EVENT);
      h.stop = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeCameraControlsStore({
      ownStationId: scenario.stationId,
      camHeartbeats: { [scenario.stationId]: { focus_mode: "MF" } },
    });

    const { getByText } = renderWithProviders(
      <ObservedCameraProvider>
        <FocusZoomButton
          id={2}
          buttonFunction="focus"
          label="Focus Near Hold"
          controlOneStop={FOCUS_CONTROLS.NEAR_ONE_STOP}
          controlContinuous={FOCUS_CONTROLS.NEAR_CONTINUOUS}
          activeFocusZoomButton={null}
          sendActiveFocusZoomButtonToParent={() => null}
        />
      </ObservedCameraProvider>,
      { store },
    );

    await h.connected;
    const user = userEvent.setup();

    const btn = getByText("Focus Near Hold");
    await user.pointer({ target: btn, keys: "[MouseLeft>]" });
    await new Promise((r) => setTimeout(r, 600));

    const start = await h.start;
    expect(start.namespace).toBe(scenario.namespace);
    expect(start.args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: ACTIONS.focusControl,
        value: FOCUS_CONTROLS.NEAR_CONTINUOUS,
      },
    });

    await user.pointer({ target: btn, keys: "[/MouseLeft]" });

    const stop = await h.stop;
    expect(stop.namespace).toBe(scenario.namespace);
    expect(stop.args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: ACTIONS.focusControl,
        value: FOCUS_CONTROLS.STOP,
      },
    });
  },
);

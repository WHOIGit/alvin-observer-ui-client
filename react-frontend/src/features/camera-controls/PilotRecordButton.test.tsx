import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { makeCameraControlsStore } from "../../../tests/imaging-test-utils";
import {
  COMMAND_STRINGS,
  NEW_CAMERA_COMMAND_EVENT,
  WS_SERVER_NAMESPACE_PILOT,
} from "../../config.js";
import { getSharedImagingClient } from "../../lib/imaging-client";
import PilotRecordButton from "./PilotRecordButton.jsx";
import { ObservedCameraProvider } from "./ObservedCameraProvider";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";

afterEach(() => {
  cleanup();
  // This file pins station connections through the shared client; tear them
  // down so the next test's harness observes fresh connections.
  getSharedImagingClient().close();
});

test.each([
  {
    station: "P",
    override: "port",
    label: /Record port Source/i,
    expected: "cam-port",
    command: "COVP",
  },
  {
    station: "S",
    override: "stbd",
    label: /Record stbd Source/i,
    expected: "cam-stbd",
    command: "COVS",
  },
])(
  "emits REC payload with observerSideOverride %s",
  async ({ station, override, label, expected, command }) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeCameraControlsStore({
      ownStationId: "PL",
      camHeartbeats: {
        P: { camera: "cam-port" },
        S: { camera: "cam-stbd" },
      },
    });

    const { getByText } = renderWithProviders(
      <ObservedCameraProvider station={station}>
        <PilotRecordButton />
      </ObservedCameraProvider>,
      { store },
    );

    await h.connected;
    await user.click(getByText(label));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(`/${WS_SERVER_NAMESPACE_PILOT}`);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: command,
      observerSideOverride: override,
      action: {
        name: COMMAND_STRINGS.recordSourceCommand,
        value: expected,
      },
    });
  },
);

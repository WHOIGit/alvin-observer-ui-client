import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { makeCameraControlsStore } from "../../../tests/imaging-test-utils";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import SelectShutterMode from "./SelectShutterMode.jsx";
import { ObservedCameraProvider } from "./ObservedCameraProvider";
import { renderWithProviders } from "../../../tests/renderWithProviders";

afterEach(() => {
  cleanup();
});

test.each(SOCKET_USER_SCENARIOS)(
  "emits SHU mode change payload ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeCameraControlsStore({
      ownStationId: scenario.stationId,
      currentCamData: { SHU: ["1/60", "1/120", "1/240"] },
      camHeartbeats: { [scenario.stationId]: { exposure: "MAN", shutter: "1/60" } },
      exposureControlsEnabled: true,
    });

    const { getByRole, getByText } = renderWithProviders(
      <ObservedCameraProvider>
        <SelectShutterMode />
      </ObservedCameraProvider>,
      {
        store,
      },
    );

    await h.connected;
    await user.click(getByRole("combobox"));
    await user.click(getByText("Shutter: 1/120"));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: { name: COMMAND_STRINGS.shutterModeCommand, value: "1/120" },
    });
  },
);

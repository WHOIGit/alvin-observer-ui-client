import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { makeCameraControlsStore } from "../../../tests/imaging-test-utils";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import SelectVideoSource from "./SelectVideoSource.jsx";
import { ObservedCameraProvider } from "./ObservedCameraProvider";
import { renderWithProviders } from "../../../tests/renderWithProviders";

afterEach(() => {
  cleanup();
});

test.each(SOCKET_USER_SCENARIOS)(
  "emits camera change payload on select ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const allCameras = [
      { camera: "cam-1", cam_name: "Cam 1" },
      { camera: "cam-2", cam_name: "Cam 2" },
    ] as any;

    const store = makeCameraControlsStore({
      observerSide: scenario.stationId,
      allCameras,
      activeCamera: allCameras[0],
      camHeartbeatData: {
        camera: "cam-1",
        owner: scenario.namespace,
      },
      videoSourceEnabled: true,
    });

    const { getByRole, getByText } = renderWithProviders(
      <ObservedCameraProvider>
        <SelectVideoSource />
      </ObservedCameraProvider>,
      {
        store,
      },
    );

    await h.connected;
    await user.click(getByRole("combobox", { name: /Video Source/i }));
    await user.click(getByText("Cam 2"));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: "cam-1",
      command: scenario.cameraCommand,
      action: { name: COMMAND_STRINGS.cameraChangeCommand, value: "cam-2" },
    });
  },
);

import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { makeCameraControlsStore } from "../../../tests/imaging-test-utils";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import SelectExposureMode from "./SelectExposureMode.jsx";
import { ObservedCameraProvider } from "./ObservedCameraProvider";
import { renderWithProviders } from "../../../tests/renderWithProviders";

afterEach(() => {
  cleanup();
});

test.each(SOCKET_USER_SCENARIOS)(
  "emits EXP mode change payload ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeCameraControlsStore({
      ownStationId: scenario.stationId,
      camHeartbeats: {
        [scenario.stationId]: {
          exposure: COMMAND_STRINGS.exposureModeOptions[0],
          isControllable: true,
          camera: "cam-1",
          owner: scenario.namespace.replace(/^\//, ""),
        },
      },
      allCameras: [{ camera: "cam-1", cam_name: "Cam 1" }],
      activeCamera: { camera: "cam-1", cam_name: "Cam 1" } as any,
    });

    const { getByRole, getByText } = renderWithProviders(
      <ObservedCameraProvider>
        <SelectExposureMode showLabel="horizontal" />
      </ObservedCameraProvider>,
      { store },
    );

    await h.connected;
    await user.click(getByRole("combobox"));
    await user.click(getByText("Manual"));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: "cam-1",
      command: scenario.cameraCommand,
      action: {
        name: COMMAND_STRINGS.exposureModeCommand,
        value: COMMAND_STRINGS.exposureModeOptions[1],
      },
    });
  },
);

test("hides the control when the camera reports a driver fault", () => {
  const store = makeCameraControlsStore({
    ownStationId: "P",
    camHeartbeats: {
      P: {
        exposure: null,
        isControllable: true,
        camera: "cam-1",
        owner: "port",
        hasFault: true,
      },
    },
    allCameras: [{ camera: "cam-1", cam_name: "Cam 1" }],
    activeCamera: { camera: "cam-1", cam_name: "Cam 1" } as any,
  });

  const { container } = renderWithProviders(
    <ObservedCameraProvider>
      <SelectExposureMode showLabel="horizontal" />
    </ObservedCameraProvider>,
    { store },
  );

  expect(container.firstChild).toBe(null);
});

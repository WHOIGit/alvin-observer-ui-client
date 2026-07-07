import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import {
  storeCamHeartbeat,
} from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { makeCameraControlsStore } from "../../../tests/imaging-test-utils";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import CaptureButtons from "./CaptureButtons.jsx";
import { ObservedCameraProvider } from "./ObservedCameraProvider";

afterEach(() => {
  // Unmount React trees created with render()
  cleanup();
});

test.each(SOCKET_USER_SCENARIOS)(
  "emits a record source command on click ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const allCameras = [
      { camera: "cam-1", cam_name: "Cam 1" },
      { camera: "cam-2", cam_name: "Cam 2" },
    ] as any;
    const activeCamera = allCameras[1];
    const recorderHeartbeatData = {
      isRecording: true,
      camera: "Cam 1",
      filename: "rec-file-001",
    } as any;

    const store = makeCameraControlsStore({
      ownStationId: scenario.stationId,
      allCameras,
      activeCamera,
      recorderHeartbeatData,
    });

    store.dispatch(
      storeCamHeartbeat({
        stationId: scenario.stationId,
        heartbeat: { focus_mode: "AF" },
      } as any),
    );

    const { getByText } = render(
      <Provider store={store}>
        <ObservedCameraProvider>
          <CaptureButtons />
        </ObservedCameraProvider>
      </Provider>,
    );

    await h.connected;
    await user.click(getByText("Record Source"));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: "cam-1",
      command: scenario.cameraCommand,
      oldCamera: "cam-1",
      action: {
        name: COMMAND_STRINGS.recordSourceCommand,
        value: activeCamera.camera,
      },
    });
  },
);

test.each(SOCKET_USER_SCENARIOS)(
  "emits a still image capture command on click ($name)",
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
        heartbeat: { focus_mode: "AF" },
      } as any),
    );

    const { getByText } = render(
      <Provider store={store}>
        <ObservedCameraProvider>
          <CaptureButtons />
        </ObservedCameraProvider>
      </Provider>,
    );

    await h.connected;
    await user.click(getByText("Still Img Capture"));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: COMMAND_STRINGS.stillImageCaptureCommand,
        value: {
          imgTransferChecked: false,
          interval: 0,
        },
      },
    });
  },
);

test("does not render if camera is not initialized", async () => {
  // Initialize the Redux store but we do NOT set the focus mode, so the camera
  // should remain in an 'uninitialized' state.
  const store = makeCameraControlsStore({});

  const { getByText } = render(
    <Provider store={store}>
      <ObservedCameraProvider>
        <CaptureButtons />
      </ObservedCameraProvider>
    </Provider>,
  );

  // The buttons don't appear so we can't find them
  expect(() => getByText("Record Source")).toThrow();
  expect(() => getByText("Still Img Capture")).toThrow();
});

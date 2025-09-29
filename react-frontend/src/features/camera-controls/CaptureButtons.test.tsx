import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer, {
  changeCamHeartbeat,
} from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import CaptureButtons from "./CaptureButtons.jsx";

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

// Helper to create a Redux store with the cameraControls slice
function makeStore(overrides: Partial<CameraControlsState> = {}) {
  const baseState = cameraControlsReducer(undefined, { type: "@@INIT" } as any);
  return configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: { ...baseState, ...overrides } },
  });
}

afterEach(() => {
  // Unmount React trees created with render()
  cleanup();
});

test("emits a record source command on click", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  // Initialize the Redux store with recorder heartbeat and camera configs so
  // Record Source can build a proper payload.
  const allCameras = [
    { camera: "cam-1", cam_name: "Cam 1" },
    { camera: "cam-2", cam_name: "Cam 2" },
  ] as any;
  const activeCamera = allCameras[1];
  const recorderHeartbeatData = {
    recording: "true",
    camera: "Cam 1",
    filename: "rec-file-001",
  } as any;

  const store = makeStore({
    webSocketNamespace: "",
    allCameras,
    activeCamera,
    recorderHeartbeatData,
  });

  // Set the focus mode because this bypasses the guard in CaptureButtons that
  // checks that the camera is "active".
  store.dispatch(changeCamHeartbeat({ focus_mode: "AF" } as any));

  const { getByText } = render(
    <Provider store={store}>
      <CaptureButtons />
    </Provider>
  );

  // Click the Record Source button
  await h.connected;
  await user.click(getByText("Record Source"));

  const { data } = await h.gotCmd;
  expect(data[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: "cam-1",
    oldCamera: "cam-1",  // only in this message
    action: {
      name: COMMAND_STRINGS.recordSourceCommand,
      value: activeCamera.camera,
    },
  });
});

test("emits a still image capture command on click", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  // Initialize the Redux store and set the focus mode because this bypasses
  // the guard in CaptureButtons that checks that the camera is "active".
  const store = makeStore({ webSocketNamespace: "" });
  store.dispatch(changeCamHeartbeat({ focus_mode: "AF" } as any));

  const { getByText } = render(
    <Provider store={store}>
      <CaptureButtons />
    </Provider>
  );

  // Click the Still Image Capture button
  await h.connected;
  await user.click(getByText("Still Img Capture"));

  const { data } = await h.gotCmd;
  expect(data[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: null,
    action: {
      name: COMMAND_STRINGS.stillImageCaptureCommand,
      value: {
        imgTransferChecked: false,
        interval: 0,
      }
    },
  });
});

test("does not render if camera is not initialized", async () => {
  // Initialize the Redux store but we do NOT set the focus mode, so the camera
  // should remain in an 'uninitialized' state.
  const store = makeStore({ webSocketNamespace: "" });

  const { getByText } = render(
    <Provider store={store}>
      <CaptureButtons />
    </Provider>
  );

  // The buttons don't appear so we can't find them
  expect(() => getByText("Record Source")).toThrow();
  expect(() => getByText("Still Img Capture")).toThrow();
});

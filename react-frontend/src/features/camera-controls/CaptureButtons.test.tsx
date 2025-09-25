import { afterEach, expect, test } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer, {
  changeCamHeartbeat,
} from "./cameraControlsSlice.js";
import { createIoHarness } from "../../../tests/socket.io-harness.js";
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
  const emitP = createIoHarness()
    .waitForConnection()
    .then(({ harness }) => harness.waitForClientEmit(NEW_CAMERA_COMMAND_EVENT));

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
  getByText("Record Source").click();

  const { data } = await emitP;
  expect(data[0]).toMatchObject({
    action: {
      name: COMMAND_STRINGS.recordSourceCommand,
      value: activeCamera.camera,
    },
  });
});

test("emits a still image capture command on click", async () => {
  const emitP = createIoHarness()
    .waitForConnection()
    .then(({ harness }) => harness.waitForClientEmit(NEW_CAMERA_COMMAND_EVENT));

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
  getByText("Still Img Capture").click();

  const { data } = await emitP;
  expect(data[0]).toMatchObject({
    action: { name: COMMAND_STRINGS.stillImageCaptureCommand },
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

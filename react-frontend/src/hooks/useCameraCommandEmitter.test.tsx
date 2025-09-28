import { afterEach, expect, test } from "vitest";
import React, { useEffect } from "react";
import { cleanup, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "../features/camera-controls/cameraControlsSlice.js";
import { createSocketIoHarness } from "../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT } from "../config";
import { useCameraCommandEmitter } from "./useCameraCommandEmitter";

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

function makeStore(overrides: Partial<CameraControlsState> = {}) {
  const baseState = cameraControlsReducer(undefined, {
    type: "@@INIT",
  } as any) as any;
  return configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: { ...baseState, ...overrides } },
  });
}

afterEach(() => cleanup());

function Emitter({ payload }: { payload: any }) {
  const { emit } = useCameraCommandEmitter("/");
  useEffect(() => {
    void emit(payload);
  }, [emit, payload]);
  return null;
}

test("useCameraCommandEmitter emits NEW_CAMERA_COMMAND_EVENT", async () => {
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCommand = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const store = makeStore({ webSocketUserNamespace: "" } as any);
  render(
    <Provider store={store}>
      <Emitter
        payload={{
          // action is expected by the setLastCommand reducer which is called by
          // emit() so we include a minimal valid action here.
          action: { name: "hello", value: "world" },
        }}
      />
    </Provider>
  );

  await h.connected;
  const { data } = await h.gotCommand;
  expect(data[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: null,
    action: { name: "hello", value: "world" },
  });
});

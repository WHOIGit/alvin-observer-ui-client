import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import SelectVideoSource from "./SelectVideoSource.jsx";
import { renderWithProviders } from "../../../tests/renderWithProviders";

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

function makeStore(overrides: Partial<CameraControlsState> = {}) {
  const baseState = cameraControlsReducer(undefined, { type: "@@INIT" } as any);
  return configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: { ...baseState, ...overrides } },
  });
}

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

    const namespaceWithoutSlash = scenario.namespace.replace(/^\//, "");

    const store = makeStore({
      observerSide: scenario.observerSide,
      webSocketNamespace: namespaceWithoutSlash,
      allCameras,
      activeCamera: allCameras[0],
      camHeartbeatData: {
        camera: "cam-1",
        owner: namespaceWithoutSlash,
      },
      videoSourceEnabled: true,
    });

    const { getByRole, getByText } = renderWithProviders(
      <SelectVideoSource />,
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

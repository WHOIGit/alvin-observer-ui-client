import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { makeCameraControlsStore } from "../../../tests/imaging-test-utils";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";
import { ACTIONS, WHITE_BALANCE_ONE_PUSH_TRIGGER } from "../../lib/imaging-client";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import SelectWhiteBalance from "./SelectWhiteBalance.jsx";
import { ObservedCameraProvider } from "./ObservedCameraProvider";
import { renderWithProviders } from "../../../tests/renderWithProviders";

afterEach(() => {
  cleanup();
});

test.each(SOCKET_USER_SCENARIOS)(
  "emits WB change payload on select ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeCameraControlsStore({
      ownStationId: scenario.stationId,
      camHeartbeats: { [scenario.stationId]: { white_balance: "INDOOR" } },
    });

    const { getByRole, getByText } = renderWithProviders(
      <ObservedCameraProvider>
        <SelectWhiteBalance showLabel={true} />
      </ObservedCameraProvider>,
      { store },
    );

    await h.connected;
    await user.click(getByRole("combobox"));
    await user.click(getByText("AUTO"));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: { name: ACTIONS.whiteBalance, value: "AUTO" },
    });
  },
);

test.each(SOCKET_USER_SCENARIOS)(
  "emits WB one-push payload on button ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeCameraControlsStore({
      ownStationId: scenario.stationId,
      camHeartbeats: { [scenario.stationId]: { white_balance: "ONE_PUSH_WB" } },
    });

    const { getByText } = renderWithProviders(
      <ObservedCameraProvider>
        <SelectWhiteBalance showLabel={true} />
      </ObservedCameraProvider>,
      { store },
    );

    await h.connected;
    await user.click(getByText("WB One Push"));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: ACTIONS.whiteBalance,
        value: WHITE_BALANCE_ONE_PUSH_TRIGGER,
      },
    });
  },
);

test("renders with an empty selection when the camera reports no white balance", () => {
  const store = makeCameraControlsStore({
    ownStationId: "PL",
    camHeartbeats: { PL: { white_balance: null } },
  });

  const { getByRole, queryByText } = renderWithProviders(
    <ObservedCameraProvider>
      <SelectWhiteBalance showLabel={true} />
    </ObservedCameraProvider>,
    { store },
  );

  expect(getByRole("combobox")).toBeTruthy();
  // The one-push trigger only appears for ONE_PUSH modes.
  expect(queryByText("WB One Push")).toBe(null);
});

import { afterEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import {
  emitTo,
  makeCameraControlsStore,
  stationConnected,
} from "../../../tests/imaging-test-utils";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import { getSharedImagingClient } from "../../lib/imaging-client";
import NewCameraCommandListener from "./NewCameraCommandListener.jsx";

afterEach(() => {
  cleanup();
  getSharedImagingClient().close();
});

test("routes configuration broadcasts into Redux", async () => {
  const h = createSocketIoHarness();
  const store = makeCameraControlsStore({ ownStationId: "P" });
  renderWithProviders(<NewCameraCommandListener />, { store });

  await stationConnected(getSharedImagingClient().station("P"));

  const cameraArray = [{ camera: "c1", cam_name: "Brow", owner: "port" }];
  const inputArray = [{ label: "Brow", value: "input1" }];
  const outputArray = [{ label: "Port Rec", value: "output1" }];

  emitTo(h, "/port", "newCameraCommand", { camera_array: cameraArray });
  emitTo(h, "/port", "newCameraCommand", { router_input_array: inputArray });
  emitTo(h, "/port", "newCameraCommand", { router_output_array: outputArray });
  emitTo(h, "/port", "newCameraCommand", {
    ISO: ["100", "400"],
    SHU: ["1/30"],
    IRS: ["F2.8"],
    current_settings: { ISO: "100" },
  });

  await vi.waitFor(() =>
    expect(store.getState().cameraControls.currentCamData?.ISO).toEqual([
      "100",
      "400",
    ])
  );
  const state = store.getState().cameraControls;
  expect(state.allCameras).toEqual(cameraArray);
  expect(state.routerInputs).toEqual(inputArray);
  expect(state.routerOutputs).toEqual(outputArray);
});

test("successful command results apply to the live camera state", async () => {
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotSelect = expectEmit("newCameraCommand");
    h.gotIso = expectEmit("newCameraCommand");
  });

  const cameraArray = [{ camera: "c1", cam_name: "Brow", owner: "port" }];
  const store = makeCameraControlsStore({
    ownStationId: "P",
    allCameras: cameraArray as any,
    currentCamData: { currentSettings: { iso: "100" } } as any,
  });
  renderWithProviders(<NewCameraCommandListener />, { store });

  const station = getSharedImagingClient().station("P");
  await stationConnected(station);

  const select = station.selectCamera("c1");
  const iso = station.camera("c1").setIso("400");
  await h.gotSelect;
  await h.gotIso;

  emitTo(h, "/port", "newCameraCommand", {
    eventId: select.eventId,
    receipt: { command: "COVP", status: "OK" },
  });
  emitTo(h, "/port", "newCameraCommand", {
    eventId: iso.eventId,
    receipt: { command: "COVP", status: "OK" },
  });

  await vi.waitFor(() =>
    expect(
      store.getState().cameraControls.currentCamData.currentSettings.iso
    ).toBe("400")
  );
  expect(store.getState().cameraControls.activeCamera).toEqual(cameraArray[0]);
});

test("a failed command result leaves state untouched", async () => {
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit("newCameraCommand");
  });

  const store = makeCameraControlsStore({
    ownStationId: "S",
    currentCamData: { currentSettings: { shu: "1/30" } } as any,
  });
  renderWithProviders(<NewCameraCommandListener />, { store });

  const station = getSharedImagingClient().station("S");
  await stationConnected(station);

  const shutter = station.camera(null).setShutter("1/60");
  await h.gotCmd;

  emitTo(h, "/stbd", "newCameraCommand", {
    eventId: shutter.eventId,
    receipt: { command: "COVS", status: "ERR" },
  });

  await expect(shutter).rejects.toThrow();
  expect(
    store.getState().cameraControls.currentCamData.currentSettings.shu
  ).toBe("1/30");
});

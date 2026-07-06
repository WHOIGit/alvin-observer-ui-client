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
import CamHeartbeatListener from "./CamHeartbeatListener.jsx";

afterEach(() => {
  cleanup();
  getSharedImagingClient().close();
});

test("feeds the observer's own heartbeat into the main reducer", async () => {
  const h = createSocketIoHarness();
  const store = makeCameraControlsStore({ observerSide: "P" });
  renderWithProviders(<CamHeartbeatListener />, { store });

  await stationConnected(getSharedImagingClient().station("P"));
  emitTo(h, "/port", "CamHeartbeat", {
    camera: "port_brow_4k",
    focus_mode: "MF",
  });

  await vi.waitFor(() =>
    expect(store.getState().cameraControls.camHeartbeatData).toMatchObject({
      camera: "port_brow_4k",
      focus_mode: "MF",
    })
  );
});

test.each([
  ["/port", "camHeartbeatDataPort"],
  ["/stbd", "camHeartbeatDataStbd"],
])(
  "pilot override %s routes into %s",
  async (namespaceOverride, stateField) => {
    const h = createSocketIoHarness();
    const store = makeCameraControlsStore({ observerSide: "PL" });
    renderWithProviders(
      <CamHeartbeatListener namespaceOverride={namespaceOverride} />,
      { store }
    );

    await stationConnected(
      getSharedImagingClient().station(namespaceOverride)
    );
    emitTo(h, namespaceOverride, "CamHeartbeat", { camera: "some_cam" });

    await vi.waitFor(() =>
      expect(
        (store.getState().cameraControls as any)[stateField]
      ).toMatchObject({ camera: "some_cam" })
    );
    // The pilot's own heartbeat slot is untouched by override traffic.
    expect(store.getState().cameraControls.camHeartbeatData).toBe(null);
  }
);

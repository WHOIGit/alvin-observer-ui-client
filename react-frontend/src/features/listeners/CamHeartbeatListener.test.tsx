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

test("feeds the observer's own heartbeat into its station's slot", async () => {
  const h = createSocketIoHarness();
  const store = makeCameraControlsStore({ ownStationId: "P" });
  renderWithProviders(<CamHeartbeatListener />, { store });

  await stationConnected(getSharedImagingClient().station("P"));
  emitTo(h, "/port", "CamHeartbeat", {
    camera: "port_brow_4k",
    focus_mode: "MF",
  });

  await vi.waitFor(() =>
    expect(store.getState().cameraControls.camHeartbeats.P).toMatchObject({
      camera: "port_brow_4k",
      focus_mode: "MF",
    })
  );
});

test.each([
  ["P", "/port"],
  ["S", "/stbd"],
])(
  "pilot mirror of station %s routes into its slot",
  async (stationId, namespace) => {
    const h = createSocketIoHarness();
    const store = makeCameraControlsStore({ ownStationId: "PL" });
    renderWithProviders(<CamHeartbeatListener station={stationId} />, {
      store,
    });

    await stationConnected(getSharedImagingClient().station(stationId));
    emitTo(h, namespace, "CamHeartbeat", { camera: "some_cam" });

    await vi.waitFor(() =>
      expect(
        store.getState().cameraControls.camHeartbeats[stationId]
      ).toMatchObject({ camera: "some_cam" })
    );
    // The pilot's own slot is untouched by mirror traffic.
    expect(store.getState().cameraControls.camHeartbeats.PL).toBeUndefined();
  }
);

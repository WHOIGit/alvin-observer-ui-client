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
import RecorderHeartbeatListener from "./RecorderHeartbeatListener.jsx";

afterEach(() => {
  cleanup();
  getSharedImagingClient().close();
});

test("stores recorder heartbeats for the observer's own side", async () => {
  const h = createSocketIoHarness();
  const store = makeCameraControlsStore({ observerSide: "S" });
  renderWithProviders(<RecorderHeartbeatListener />, { store });

  await stationConnected(getSharedImagingClient().station("S"));
  emitTo(h, "/stbd", "RecorderHeartbeat", {
    command: "SRVS",
    camera: "Stbd Brow",
    recording: "true",
    filename: "clip_0042.mov",
  });

  await vi.waitFor(() =>
    expect(store.getState().cameraControls.recorderHeartbeatData).toMatchObject({
      isRecording: true,
      filename: "clip_0042.mov",
    })
  );
});

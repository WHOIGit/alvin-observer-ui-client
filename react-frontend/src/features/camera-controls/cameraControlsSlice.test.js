import { expect, test } from "vitest";
import reducer, { setObserverSide } from "./cameraControlsSlice";

const stationState = {
  observerSide: "P",
  initialCamHeartbeat: { camera: "port_cam" },
  activeCamera: { camera: "port_cam" },
  camHeartbeatData: { camera: "port_cam" },
  currentCamData: { current_settings: {} },
};

test("switching sides drops the previous station's camera state", () => {
  const next = reducer(stationState, setObserverSide("S"));
  expect(next.observerSide).toBe("S");
  expect(next.initialCamHeartbeat).toBeNull();
  expect(next.activeCamera).toBeNull();
  expect(next.camHeartbeatData).toBeNull();
  expect(next.currentCamData).toBeNull();
});

test("re-selecting the same side keeps the camera state", () => {
  const next = reducer(stationState, setObserverSide("P"));
  expect(next.activeCamera).toEqual({ camera: "port_cam" });
  expect(next.camHeartbeatData).toEqual({ camera: "port_cam" });
});

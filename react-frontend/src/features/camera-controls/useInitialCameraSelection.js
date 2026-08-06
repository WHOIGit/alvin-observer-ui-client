import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  changeActiveCamera,
  selectActiveCamera,
  selectInitialCamHeartbeatData,
} from "./cameraControlsSlice";

// On first load, seed the active camera from the initial heartbeat and ask
// the server for that camera's settings options. Runs once, while the active
// camera is still unset; no-ops until a station and an initial heartbeat are
// both available.
export function useInitialCameraSelection(station) {
  const dispatch = useDispatch();
  const activeCamera = useSelector(selectActiveCamera);
  const initialCamHeartbeat = useSelector(selectInitialCamHeartbeatData);

  useEffect(() => {
    if (activeCamera !== null || initialCamHeartbeat === null || !station) {
      return;
    }
    dispatch(changeActiveCamera(initialCamHeartbeat));
    station.requestCameraSettings(initialCamHeartbeat.camera);
  }, [activeCamera, dispatch, station, initialCamHeartbeat]);
}

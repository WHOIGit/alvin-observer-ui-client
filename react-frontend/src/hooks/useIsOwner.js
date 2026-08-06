import { useSelector } from "react-redux";
import { normalizeStationId, STATIONS } from "../lib/imaging-client";
import {
  selectCamHeartbeatData,
  selectOwnStationId,
  selectActiveCamera,
} from "../features/camera-controls/cameraControlsSlice";

// check if CamHeartbeat owner and ObserverSide match.
// also need to check if activeCamera matches the camHeartBeat camera,
// there can be a delay in the confirmation message from the Imaging Server on cam change
//
// return true if port/P and stbd/S and activeCamera matches

export default function useIsOwner() {
  const camSettings = useSelector(selectCamHeartbeatData);
  const currentObserver = useSelector(selectOwnStationId);
  const activeCamera = useSelector(selectActiveCamera);

  let isOwner = false;

  // check the activeCamera match first
  if (camSettings?.camera === activeCamera) {
    // The pilot always owns; otherwise the heartbeat's owner station must
    // be this console's station. normalizeStationId owns the wire-name to
    // station-id mapping, so no wire vocabulary leaks into this hook.
    if (
      currentObserver === STATIONS.PILOT ||
      normalizeStationId(camSettings?.owner) === currentObserver
    ) {
      isOwner = true;
    }
  }

  return { isOwner };
}

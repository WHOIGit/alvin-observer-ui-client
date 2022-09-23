import { useSelector } from "react-redux";
import {
  selectCamHeartbeatData,
  selectObserverSide,
  selectActiveCamera,
} from "../features/camera-controls/cameraControlsSlice";

// check if CamHeartbeat owner and ObserverSide match.
// also need to check if activeCamera matches the camHeartBeat camera,
// there can be a delay in the confirmation message from the Imaging Server on cam change
//
// return true if port/P and stbd/S and activeCamera matches

export default function useIsOwner() {
  const camSettings = useSelector(selectCamHeartbeatData);
  const currentObserver = useSelector(selectObserverSide);
  const activeCamera = useSelector(selectActiveCamera);

  let isOwner = false;

  // check the activeCamera match first
  if (camSettings?.camera === activeCamera) {
    // then check Observer
    if (camSettings?.owner === "port" && currentObserver === "P") {
      isOwner = true;
    }

    if (camSettings?.owner === "stbd" && currentObserver === "S") {
      isOwner = true;
    }

    // Pilot observer "PL" is always owner
    if (currentObserver === "PL") {
      isOwner = true;
    }
  }

  return { isOwner };
}

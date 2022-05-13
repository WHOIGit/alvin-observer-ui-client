import { useSelector } from "react-redux";
import {
  selectCamHeartbeatData,
  selectObserverSide,
} from "../features/camera-controls/cameraControlsSlice";

// check if CamHearbeat owner and ObserverSide match
// return true if port/P and stbd/S

export default function useIsOwner() {
  const camSettings = useSelector(selectCamHeartbeatData);
  const currentObserver = useSelector(selectObserverSide);

  let isOwner = false;
  if (camSettings?.owner === "port" && currentObserver === "P") {
    isOwner = true;
  }

  if (camSettings?.owner === "stbd" && currentObserver === "S") {
    isOwner = true;
  }

  if (camSettings?.owner === "pilot") {
    isOwner = true;
  }

  return { isOwner };
}

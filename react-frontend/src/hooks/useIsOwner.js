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
  console.log(currentObserver);

  let isOwner = false;
  if (camSettings?.owner === "port" && currentObserver === "S") {
    isOwner = true;
  }

  if (camSettings?.owner === "stbd" && currentObserver === "S") {
    isOwner = true;
  }
  return { isOwner };
}

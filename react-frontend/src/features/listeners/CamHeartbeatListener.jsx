import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCamHeartbeat } from "../../hooks/useImagingClient";
import { getObserverInfo } from "../../lib/imaging-client";
import {
  changeCamHeartbeat,
  changeCamHeartbeatPort,
  changeCamHeartbeatStbd,
  selectObserverSide,
} from "../camera-controls/cameraControlsSlice";

export default function CamHeartbeatListener({ namespaceOverride = null }) {
  const dispatch = useDispatch();
  const observerSide = useSelector(selectObserverSide);

  // The pilot UI mounts extra instances with a namespaceOverride to mirror
  // each observer's heartbeat into a side-specific slot; the observer UI runs
  // one instance for its own side.
  const overrideSide = namespaceOverride
    ? getObserverInfo(namespaceOverride).observerSide
    : null;

  const handleMessage = useCallback(
    (message) => {
      if (!namespaceOverride) {
        dispatch(changeCamHeartbeat(message));
      } else if (overrideSide === "P") {
        dispatch(changeCamHeartbeatPort(message));
      } else if (overrideSide === "S") {
        dispatch(changeCamHeartbeatStbd(message));
      }
    },
    [namespaceOverride, overrideSide, dispatch]
  );

  useCamHeartbeat(namespaceOverride || observerSide, handleMessage);

  return null;
}

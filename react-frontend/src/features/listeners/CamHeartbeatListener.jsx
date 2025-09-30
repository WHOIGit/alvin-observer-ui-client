import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocketListener } from "../../hooks/useSocket";
import {
  CAM_HEARTBEAT,
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
} from "../../config";
import {
  changeCamHeartbeat,
  changeCamHeartbeatPort,
  changeCamHeartbeatStbd,
  selectObserverSide,
} from "../camera-controls/cameraControlsSlice";
import { getObserverInfo } from "../../utils/observerSide";

export default function CamHeartbeatListener({ namespaceOverride = null }) {
  const dispatch = useDispatch();
  const observerSide = useSelector(selectObserverSide);
  const namespaceInfo = useMemo(
    () => getObserverInfo(namespaceOverride || observerSide),
    [namespaceOverride, observerSide]
  );

  const handleMessage = useCallback(
    (message) => {
      // If namespaceOverride is provided (Pilot UI listening to observers),
      // use observer-specific reducers. Otherwise use main reducer.
      if (namespaceOverride) {
        if (namespaceInfo.namespace === WS_SERVER_NAMESPACE_PORT) {
          dispatch(changeCamHeartbeatPort(message));
        } else if (namespaceInfo.namespace === WS_SERVER_NAMESPACE_STARBOARD) {
          dispatch(changeCamHeartbeatStbd(message));
        }
      } else {
        // Regular observer UI - always use main reducer
        dispatch(changeCamHeartbeat(message));
      }
    },
    [namespaceOverride, namespaceInfo, dispatch]
  );

  useSocketListener(namespaceInfo.namespacePath, CAM_HEARTBEAT, handleMessage);

  return null;
}

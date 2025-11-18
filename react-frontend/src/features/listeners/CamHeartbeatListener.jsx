import React, { useCallback } from "react";
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
  selectWebSocketNamespace,
} from "../camera-controls/cameraControlsSlice";

export default function CamHeartbeatListener({ namespaceOverride = null }) {
  const dispatch = useDispatch();
  const userNamespace = useSelector(selectWebSocketNamespace);
  const namespace = namespaceOverride || userNamespace;

  const handleMessage = useCallback(
    (message) => {
      // If namespaceOverride is provided (Pilot UI listening to observers),
      // use observer-specific reducers. Otherwise use main reducer.
      if (namespaceOverride) {
        if (namespaceOverride === WS_SERVER_NAMESPACE_PORT) {
          dispatch(changeCamHeartbeatPort(message));
        } else if (namespaceOverride === WS_SERVER_NAMESPACE_STARBOARD) {
          dispatch(changeCamHeartbeatStbd(message));
        }
      } else {
        // Regular observer UI - always use main reducer
        dispatch(changeCamHeartbeat(message));
      }
    },
    [namespaceOverride, dispatch]
  );

  useSocketListener(`/${namespace}`, CAM_HEARTBEAT, handleMessage);

  return null;
}

import React, { useEffect } from "react";
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
  selectWebSocketUserNamespace,
} from "../camera-controls/cameraControlsSlice";

export default function CamHeartbeatListener({ namespaceOverride = null }) {
  const dispatch = useDispatch();
  const userNamespace = useSelector(selectWebSocketUserNamespace);
  const namespace = namespaceOverride || userNamespace;
  const { lastMessage } = useSocketListener(`/${namespace}`, CAM_HEARTBEAT);

  useEffect(() => {
    if (!lastMessage) return;
    if (namespace === WS_SERVER_NAMESPACE_PORT) {
      dispatch(changeCamHeartbeatPort(lastMessage));
    } else if (namespace === WS_SERVER_NAMESPACE_STARBOARD) {
      dispatch(changeCamHeartbeatStbd(lastMessage));
    } else {
      dispatch(changeCamHeartbeat(lastMessage));
    }
  }, [lastMessage, namespace, dispatch]);
  return null;
}

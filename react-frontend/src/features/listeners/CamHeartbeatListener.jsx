import React, { useEffect, useMemo } from "react";
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

  const namespaceInfo = useMemo(() => {
    const resolvedInput = namespaceOverride ?? observerSide;
    if (!resolvedInput) {
      return {
        observerSide: "PL",
        namespace: "",
        namespacePath: "/",
        command: "COPL",
      };
    }

    const info = getObserverInfo(resolvedInput);
    if (!namespaceOverride && info.observerSide === "PL" && window?.PILOT_MODE !== true) {
      return {
        ...info,
        namespace: "",
        namespacePath: "/",
      };
    }
    return info;
  }, [namespaceOverride, observerSide]);

  const { lastMessage } = useSocketListener(
    namespaceInfo.namespacePath,
    CAM_HEARTBEAT
  );

  useEffect(() => {
    if (!lastMessage) return;
    if (namespaceInfo.namespace === WS_SERVER_NAMESPACE_PORT) {
      dispatch(changeCamHeartbeatPort(lastMessage));
    } else if (namespaceInfo.namespace === WS_SERVER_NAMESPACE_STARBOARD) {
      dispatch(changeCamHeartbeatStbd(lastMessage));
    } else {
      dispatch(changeCamHeartbeat(lastMessage));
    }
  }, [lastMessage, namespaceInfo.namespace, dispatch]);
  return null;
}

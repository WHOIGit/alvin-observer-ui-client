import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocketListener } from "../../hooks/useSocket";
import { RECORDER_HEARTBEAT } from "../../config";
import {
  changeRecorderHeartbeat,
  selectObserverSide,
} from "../camera-controls/cameraControlsSlice";
import { getObserverInfo } from "../../utils/observerSide";

export default function RecorderHeartbeatListener({ isEnabled = true }) {
  const dispatch = useDispatch();
  const observerSide = useSelector(selectObserverSide);
  const namespaceInfo = useMemo(
    () => getObserverInfo(observerSide),
    [observerSide]
  );

  const handleMessage = useCallback(
    (message) => {
      dispatch(changeRecorderHeartbeat(message));
    },
    [dispatch]
  );

  useSocketListener(
    namespaceInfo.namespacePath,
    RECORDER_HEARTBEAT,
    handleMessage
  );

  return null;
}

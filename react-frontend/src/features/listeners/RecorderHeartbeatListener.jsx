import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSocketListener } from "../../hooks/useSocket";
import { RECORDER_HEARTBEAT } from "../../config";
import { changeRecorderHeartbeat } from "../camera-controls/cameraControlsSlice";

export default function RecorderHeartbeatListener({ isEnabled = true }) {
  const dispatch = useDispatch();

  const handleMessage = useCallback(
    (message) => {
      dispatch(changeRecorderHeartbeat(message));
    },
    [dispatch]
  );

  useSocketListener("/", RECORDER_HEARTBEAT, handleMessage);

  return null;
}

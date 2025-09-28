import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSocketListener } from "../../hooks/useSocket";
import { RECORDER_HEARTBEAT } from "../../config";
import { changeRecorderHeartbeat } from "../camera-controls/cameraControlsSlice";

export default function RecorderHeartbeatListener({ isEnabled = true }) {
  const dispatch = useDispatch();
  const { lastMessage } = useSocketListener("/", RECORDER_HEARTBEAT);

  useEffect(() => {
    if (lastMessage) dispatch(changeRecorderHeartbeat(lastMessage));
  }, [lastMessage, dispatch]);
  return null;
}

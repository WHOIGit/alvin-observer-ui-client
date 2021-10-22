import React from "react";
import { useSelector } from "react-redux";
import { Button } from "@material-ui/core";
// local imports
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import {
  selectCamHeartbeatDataPort,
  selectCamHeartbeatDataStbd,
} from "./cameraControlsSlice";
import {
  NEW_CAMERA_COMMAND_EVENT,
  COMMAND_STRINGS,
  WS_SERVER_NAMESPACE_STARBOARD,
} from "../../config";

export default function PilotRecordButton({ observerSide }) {
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  const activeCameraPort = useSelector(selectCamHeartbeatDataPort);
  const activeCameraStbd = useSelector(selectCamHeartbeatDataStbd);

  let activeCamera = activeCameraPort;
  if (observerSide === WS_SERVER_NAMESPACE_STARBOARD) {
    activeCamera = activeCameraStbd;
  }

  const handleSendMessage = () => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.recordSourceCommand,
        value: activeCamera.camera,
      },
    };
    sendMessage(payload);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => handleSendMessage()}
      >
        Record {observerSide} Source
      </Button>
    </div>
  );
}

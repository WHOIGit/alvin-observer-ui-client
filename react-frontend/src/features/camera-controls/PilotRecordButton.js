import React, { useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Button, CircularProgress } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
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

const useStyles = makeStyles((theme) => ({
  buttonWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

export default function PilotRecordButton({ observerSide }) {
  const classes = useStyles();
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  const activeCameraPort = useSelector(selectCamHeartbeatDataPort);
  const activeCameraStbd = useSelector(selectCamHeartbeatDataStbd);
  const [loading, setLoading] = useState(false);

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
      observerSideOverride: observerSide,
    };
    sendMessage(payload);
  };

  const handleRecordAction = () => {
    setLoading(true);
    handleSendMessage();

    // add a "fake" delay to UI to show users that image capture is processing
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className={classes.buttonWrapper}>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => handleRecordAction()}
      >
        Record {observerSide} Source
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </div>
  );
}

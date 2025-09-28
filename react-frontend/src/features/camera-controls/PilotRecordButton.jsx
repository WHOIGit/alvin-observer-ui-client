import React, { useState } from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Button, CircularProgress } from "@mui/material";
import { green } from "@mui/material/colors";
// local imports
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";
import {
  selectCamHeartbeatDataPort,
  selectCamHeartbeatDataStbd,
  selectObserverSide,
  selectWebSocketUserNamespace,
} from "./cameraControlsSlice";
import {
  COMMAND_STRINGS,
  WS_SERVER_NAMESPACE_STARBOARD,
} from "../../config";

const useStyles = makeStyles((theme) => ({
  buttonWrapper: {
    position: "relative",
    display: "inline-block",
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
  const activeCameraPort = useSelector(selectCamHeartbeatDataPort);
  const activeCameraStbd = useSelector(selectCamHeartbeatDataStbd);
  const [loading, setLoading] = useState(false);

  const userNs = useSelector(selectWebSocketUserNamespace);
  const globalObserverSide = useSelector(selectObserverSide);
  const { emit } = useCameraCommandEmitter(`/${userNs}`, {
    observerSide: globalObserverSide,
  });

  let activeCamera = activeCameraPort;
  if (observerSide === WS_SERVER_NAMESPACE_STARBOARD) {
    activeCamera = activeCameraStbd;
  }

  const handleSendMessage = () => {
    void emit({
      action: {
        name: COMMAND_STRINGS.recordSourceCommand,
        value: activeCamera.camera,
      },
      observerSideOverride: observerSide,
    });
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
        disabled={loading}
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

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, CircularProgress, Box } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { getCameraConfigFromName } from "../../utils/getCamConfigFromName";
import { selectActiveCamera } from "./cameraControlsSlice";
import {
  COMMAND_STRINGS,
  NEW_CAMERA_COMMAND_EVENT,
  RECORDER_HEARTBEAT,
} from "../../config.js";

const useStyles = makeStyles((theme) => ({
  ctrlButton: {
    width: "100%",
    fontSize: ".7em",
  },
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

export default function CaptureButtons() {
  const classes = useStyles();
  const activeCamera = useSelector(selectActiveCamera);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  const { messages } = useCameraWebSocket(RECORDER_HEARTBEAT);
  //console.log(messages);
  const [loading, setLoading] = useState(false);
  const [currentRecordingSrc, setCurrentRecordingSrc] = useState(null);
  const [requestedSrc, setRequestedSrc] = useState(null);

  useEffect(() => {
    // set current Recording camera ID from RECORDER_HEARTBEAT socket
    if (messages) {
      const recCamera = getCameraConfigFromName(messages.camera);

      recCamera && setCurrentRecordingSrc(recCamera.camera);
    }
  }, [messages]);

  const handleSendMessage = (commandName, commandValue) => {
    const payload = {
      action: {
        name: commandName,
        value: commandValue,
      },
    };
    // If a RECORD SOURCE action, need to send the previous Recording camera name
    if (commandName === COMMAND_STRINGS.recordSourceCommand) {
      // get the camera ID of the currently recording camera
      const oldCamera = getCameraConfigFromName(messages.camera);
      payload.oldCamera = oldCamera.camera;
    }

    sendMessage(payload);
  };

  const handleRecordAction = () => {
    setLoading(true);
    handleSendMessage(COMMAND_STRINGS.recordSourceCommand, activeCamera);

    // if not changing recording cameras, add a "fake" delay to UI to match the
    // time it takes imaging server to start new recording,
    // we don't get this status change from the imaging server
    console.log(activeCamera, currentRecordingSrc);
    if (activeCamera === currentRecordingSrc) {
      setTimeout(() => {
        setLoading(false);
        setRequestedSrc(activeCamera);
      }, 2000);
    } else {
      setRequestedSrc(activeCamera);
    }
  };

  useEffect(() => {
    if (currentRecordingSrc === requestedSrc) {
      setLoading(false);
    }
  }, [currentRecordingSrc, requestedSrc]);

  return (
    <>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={classes.ctrlButton}
          onClick={() =>
            handleSendMessage(COMMAND_STRINGS.stillImageCaptureCommand, 0)
          }
        >
          Still Img Capture
        </Button>
      </Grid>
      <Grid item xs={6}>
        <div className={classes.buttonWrapper}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={loading}
            className={classes.ctrlButton}
            onClick={() => handleRecordAction()}
          >
            Record Source
          </Button>
          {loading && (
            <CircularProgress size={24} className={classes.buttonProgress} />
          )}
        </div>
      </Grid>
    </>
  );
}

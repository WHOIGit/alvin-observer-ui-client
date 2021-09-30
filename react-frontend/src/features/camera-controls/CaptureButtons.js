import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, Typography } from "@material-ui/core";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import {
  selectRecorderHeartbeatData,
  selectActiveCamera,
} from "./cameraControlsSlice";
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
}));

export default function CaptureButtons() {
  const classes = useStyles();
  const activeCamera = useSelector(selectActiveCamera);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  const { messages } = useCameraWebSocket(RECORDER_HEARTBEAT);

  const handleSendMessage = (commandName, commandValue) => {
    const payload = {
      action: {
        name: commandName,
        value: commandValue,
      },
    };
    // If a RECORD SOURCE action, need to send the previous Recording camera name
    if (commandName === COMMAND_STRINGS.recordSourceCommand) {
      payload.oldCamera = messages.camera;
    }

    sendMessage(payload);
  };

  return (
    <>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={classes.ctrlButton}
          onClick={() =>
            handleSendMessage(
              COMMAND_STRINGS.stillImageCaptureCommand,
              activeCamera
            )
          }
        >
          Still Img Capture
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={classes.ctrlButton}
        >
          Event <br />
          Trigger
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={classes.ctrlButton}
          onClick={() =>
            handleSendMessage(COMMAND_STRINGS.quickClickCommand, activeCamera)
          }
        >
          Quick <br /> Clip
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={classes.ctrlButton}
          onClick={() =>
            handleSendMessage(COMMAND_STRINGS.recordSourceCommand, activeCamera)
          }
        >
          Record Source
        </Button>
      </Grid>
    </>
  );
}

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, Typography } from "@material-ui/core";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS, NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles(theme => ({
  ctrlButton: {
    width: "100%",
    fontSize: ".7em"
  }
}));

export default function CaptureButtons() {
  const classes = useStyles();
  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );

  const handleSendMessage = (commandName, commandValue) => {
    const payload = {
      action: {
        name: commandName,
        value: commandValue
      }
    };
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
            handleSendMessage(COMMAND_STRINGS.stillImageCaptureCommand)
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
          onClick={() => handleSendMessage(COMMAND_STRINGS.quickClickCommand)}
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
          onClick={() => handleSendMessage(COMMAND_STRINGS.recordSourceCommand)}
        >
          Record Source
        </Button>
      </Grid>
    </>
  );
}

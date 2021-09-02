import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { makeStyles } from "@material-ui/core/styles";

import { Grid, Button, Typography } from "@material-ui/core";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import useLongPress from "../../hooks/useLongPress";
import { selectCurrentCamData } from "./cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles(theme => ({
  root: {
    //flexGrow: 1
  },
  camButton: {
    width: "100%",
    fontSize: ".8em"
  },
  ctrlButton: {
    width: "100%",
    fontSize: ".7em"
  }
}));

export default function FocusZoomButtons() {
  const classes = useStyles();
  const camData = useSelector(selectCurrentCamData);
  const timerRef = useRef(false);

  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );

  const handleZoomHold = commandValue => {
    handleSendMessage(COMMAND_STRINGS.focusControlCommand, commandValue);
    // Set a Timeout to resend command every 1 sec
    timerRef.current = setTimeout(handleZoomHold, 1000, commandValue);
  };

  const handleZoomStop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);

      handleSendMessage(
        COMMAND_STRINGS.focusControlCommand,
        COMMAND_STRINGS.focusStop
      );
    }
  };

  const focusNearBtnProps = useLongPress({
    onClick: () =>
      handleSendMessage(
        COMMAND_STRINGS.focusControlCommand,
        COMMAND_STRINGS.focusNearOneStop
      ),
    onLongPress: () => handleZoomHold(COMMAND_STRINGS.focusNearContinuos),
    onStop: () => handleZoomStop()
  });

  const focusFarBtnProps = useLongPress({
    onClick: () =>
      handleSendMessage(
        COMMAND_STRINGS.focusControlCommand,
        COMMAND_STRINGS.focusFarOneStop
      ),
    onLongPress: () => handleZoomHold(COMMAND_STRINGS.focusFarContinuos),
    onStop: () => handleZoomStop()
  });

  const zoomNearBtnProps = useLongPress({
    onClick: () =>
      handleSendMessage(
        COMMAND_STRINGS.zoomControlCommand,
        COMMAND_STRINGS.zoomNearOneStop
      ),
    onLongPress: () => handleZoomHold(COMMAND_STRINGS.zoomNearContinuos),
    onStop: () => handleZoomStop()
  });

  const zoomFarBtnProps = useLongPress({
    onClick: () =>
      handleSendMessage(
        COMMAND_STRINGS.zoomControlCommand,
        COMMAND_STRINGS.zoomFarOneStop
      ),
    onLongPress: () => handleZoomHold(COMMAND_STRINGS.zoomFarContinuos),
    onStop: () => handleZoomStop()
  });

  const handleSendMessage = (commandName, commandValue) => {
    if (commandValue === undefined) {
      let commandValue;
    }
    const payload = {
      action: {
        name: commandName,
        value: commandValue
      }
    };
    sendMessage(payload);
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          {...focusNearBtnProps}
        >
          Near
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          {...zoomNearBtnProps}
        >
          Tele
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="overline" gutterBottom>
          Focus
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="overline" gutterBottom>
          Zoom
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          {...focusFarBtnProps}
        >
          Far
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          {...zoomFarBtnProps}
        >
          Wide
        </Button>
      </Grid>
    </Grid>
  );
}

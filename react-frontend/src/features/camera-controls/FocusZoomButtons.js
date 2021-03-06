import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, Typography } from "@material-ui/core";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import useLongPress from "../../hooks/useLongPress";
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
  },
}));

export default function FocusZoomButtons() {
  const classes = useStyles();
  const timerRef = useRef(false);
  const camSettings = useSelector(selectCamHeartbeatData);
  const [isEnabled, setIsEnabled] = useState(true);

  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);

  const handleZoomHold = (commandName, commandValue) => {
    handleSendMessage(commandName, commandValue);
    // Set a Timeout to resend command every 1 sec
    timerRef.current = setTimeout(
      handleZoomHold,
      1000,
      commandName,
      commandValue
    );
  };

  const handleStop = (commandName) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // delay Stop message sending to avoid collisions with last button actions
    setTimeout(handleSendMessage, 100, commandName, COMMAND_STRINGS.focusStop);
  };

  const focusNearBtnProps = useLongPress({
    onClick: () =>
      handleSendMessage(
        COMMAND_STRINGS.focusControlCommand,
        COMMAND_STRINGS.focusNearOneStop
      ),
    onLongPress: () =>
      handleZoomHold(
        COMMAND_STRINGS.focusControlCommand,
        COMMAND_STRINGS.focusNearContinuos
      ),
    onStop: () => handleStop(COMMAND_STRINGS.focusControlCommand),
  });

  const focusFarBtnProps = useLongPress({
    onClick: () =>
      handleSendMessage(
        COMMAND_STRINGS.focusControlCommand,
        COMMAND_STRINGS.focusFarOneStop
      ),
    onLongPress: () =>
      handleZoomHold(
        COMMAND_STRINGS.focusControlCommand,
        COMMAND_STRINGS.focusFarContinuos
      ),
    onStop: () => handleStop(COMMAND_STRINGS.focusControlCommand),
  });

  const zoomNearBtnProps = useLongPress({
    onClick: () =>
      handleSendMessage(
        COMMAND_STRINGS.zoomControlCommand,
        COMMAND_STRINGS.zoomNearOneStop
      ),
    onLongPress: () =>
      handleZoomHold(
        COMMAND_STRINGS.zoomControlCommand,
        COMMAND_STRINGS.zoomNearContinuos
      ),
    onStop: () => handleStop(COMMAND_STRINGS.zoomControlCommand),
  });

  const zoomFarBtnProps = useLongPress({
    onClick: () =>
      handleSendMessage(
        COMMAND_STRINGS.zoomControlCommand,
        COMMAND_STRINGS.zoomFarOneStop
      ),
    onLongPress: () =>
      handleZoomHold(
        COMMAND_STRINGS.zoomControlCommand,
        COMMAND_STRINGS.zoomFarContinuos
      ),
    onStop: () => handleStop(COMMAND_STRINGS.zoomControlCommand),
  });

  const handleSendMessage = (commandName, commandValue = "UND") => {
    const payload = {
      action: {
        name: commandName,
        value: commandValue,
      },
    };
    sendMessage(payload);
  };

  useEffect(() => {
    // set enabled status from camSettings.focus_mode
    // if AUTO focus, disable
    if (camSettings && camSettings.focus_mode === "AF") {
      setIsEnabled(false);
    } else {
      setIsEnabled(true);
    }
  }, [camSettings]);

  return (
    <Grid container spacing={1} className={classes.root}>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          disabled={!isEnabled}
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
          disabled={!isEnabled}
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

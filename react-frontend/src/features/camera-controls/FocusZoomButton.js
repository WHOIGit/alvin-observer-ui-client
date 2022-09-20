import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Button, CircularProgress } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import useLongPress from "../../hooks/useLongPress";
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

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

export default function FocusZoomButton({
  buttonFunction,
  label,
  commandStringControl,
  commandStringOneStop,
  commandStringContinuous,
}) {
  const classes = useStyles();
  const timerRef = useRef(false);
  const camSettings = useSelector(selectCamHeartbeatData);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

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

    // add a "fake" delay to UI to show users that image capture is processing
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const btnProps = useLongPress({
    onClick: () =>
      handleSendMessage(commandStringControl, commandStringOneStop),
    onLongPress: () =>
      handleZoomHold(commandStringControl, commandStringContinuous),
    onStop: () => handleStop(commandStringControl),
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
    if (
      camSettings &&
      camSettings.focus_mode === "AF" &&
      buttonFunction === "focus"
    ) {
      setIsEnabled(false);
    } else {
      setIsEnabled(true);
    }
  }, [buttonFunction, camSettings]);

  return (
    <div className={classes.buttonWrapper}>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        disabled={!isEnabled || loading}
        {...btnProps}
      >
        {label}
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </div>
  );
}

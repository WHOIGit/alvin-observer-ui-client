import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Button, CircularProgress } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";
// local
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import { COMMAND_STRINGS, NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

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

const FocusModeButton = () => {
  const classes = useStyles();
  const camSettings = useSelector(selectCamHeartbeatData);
  const [currentFocusMode, setCurrentFocusMode] = useState("AF");
  const [loading, setLoading] = useState(false);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);

  useEffect(() => {
    if (camSettings !== null) {
      setCurrentFocusMode(camSettings.focus_mode);
    }
  }, [camSettings]);

  const handleSendMessage = (commandName) => {
    // add a "fake" delay to UI to show users that image capture is processing
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    let commandValue;
    if (camSettings.focus_mode === COMMAND_STRINGS.focusAF) {
      commandValue = COMMAND_STRINGS.focusMF;
    } else {
      commandValue = COMMAND_STRINGS.focusAF;
    }

    const payload = {
      action: {
        name: commandName,
        value: commandValue,
      },
    };
    sendMessage(payload);
  };

  return (
    <div className={classes.buttonWrapper}>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        startIcon={<CenterFocusStrongIcon />}
        disabled={loading}
        onClick={() => handleSendMessage(COMMAND_STRINGS.focusModeCommand)}
      >
        Focus {currentFocusMode}
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </div>
  );
};

export default FocusModeButton;

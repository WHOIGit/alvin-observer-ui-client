import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Button, CircularProgress } from "@mui/material";
import { green } from "@mui/material/colors";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
// local
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";
import {
  selectActiveCamera,
  selectObserverSide,
  selectWebSocketUserNamespace,
} from "./cameraControlsSlice";

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

  const userNs = useSelector(selectWebSocketUserNamespace);
  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const { emit } = useCameraCommandEmitter(`/${userNs}`, {
    activeCamera: activeCameraId,
    observerSide,
  });

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

    void emit({
      action: {
        name: commandName,
        value: commandValue,
      },
    });
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

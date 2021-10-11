import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@material-ui/core";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";
// local
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import { COMMAND_STRINGS, NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const FocusModeButton = () => {
  const camSettings = useSelector(selectCamHeartbeatData);
  const [currentFocusMode, setCurrentFocusMode] = useState("AF");
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);

  useEffect(() => {
    if (camSettings !== null) {
      setCurrentFocusMode(camSettings.focus_mode);
    }
  }, [camSettings]);

  const handleSendMessage = (commandName) => {
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
    <Button
      variant="contained"
      color="secondary"
      size="small"
      startIcon={<CenterFocusStrongIcon />}
      onClick={() => handleSendMessage(COMMAND_STRINGS.focusModeCommand)}
    >
      Focus {currentFocusMode}
    </Button>
  );
};

export default FocusModeButton;

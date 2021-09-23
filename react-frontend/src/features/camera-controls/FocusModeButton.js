import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@material-ui/core";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";
// local
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { selectCurrentCamData } from "./cameraControlsSlice";
import { COMMAND_STRINGS, NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const FocusModeButton = () => {
  const camData = useSelector(selectCurrentCamData);
  const [currentFocusMode, setCurrentFocusMode] = useState("AF");
  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );

  useEffect(() => {
    if (camData !== null) {
      setCurrentFocusMode(camData.currentSettings.focus_mode);
    }
  }, [camData]);

  const handleSendMessage = (commandName) => {
    let commandValue;
    if (camData.currentSettings.focus_mode === COMMAND_STRINGS.focusAF) {
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

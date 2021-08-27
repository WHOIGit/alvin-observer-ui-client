import React from "react";
import { useSelector } from "react-redux";
import { Button } from "@material-ui/core";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";
// local
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS, NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const FocusModeButton = () => {
  const camData = useSelector(selectCurrentCamData);
  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );

  const handleSendMessage = commandName => {
    if (camData.currentSettings.focus_mode === COMMAND_STRINGS.focusAF) {
      commandValue = COMMAND_STRINGS.focusMF;
    } else {
      commandValue = COMMAND_STRINGS.focusAF;
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
    <Button
      variant="contained"
      color="secondary"
      size="small"
      startIcon={<CenterFocusStrongIcon />}
      onClick={() => handleSendMessage(COMMAND_STRINGS.focusModeCommand)}
    >
      Focus AF/MF
    </Button>
  );
};

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Chip from "@material-ui/core/Chip";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
// local imports
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { RECORDER_HEARTBEAT } from "../../config.js";
import { selectActiveCamera } from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function RecordingStatusChip() {
  const { messages } = useCameraWebSocket(RECORDER_HEARTBEAT);
  const activeCamera = useSelector(selectActiveCamera);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (messages) {
      console.log(activeCamera);
    }
  }, [messages, activeCamera]);
  return (
    <div>
      <Chip
        icon={isRecording ? <VideocamIcon /> : <VideocamOffIcon />}
        label={isRecording ? "RECORDING" : "NOT RECORDING"}
        color="default"
      />
    </div>
  );
}

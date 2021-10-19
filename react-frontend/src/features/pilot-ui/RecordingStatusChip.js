import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Chip from "@material-ui/core/Chip";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
// local imports
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { RECORDER_HEARTBEAT } from "../../config.js";
import { selectActiveCameraConfig } from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  chipOn: {
    backgroundColor: "red",
  },
}));

export default function RecordingStatusChip() {
  const classes = useStyles();
  const { messages } = useCameraWebSocket(RECORDER_HEARTBEAT);
  const activeCameraConfig = useSelector(selectActiveCameraConfig);
  const [isRecording, setIsRecording] = useState(false);

  const chipStyle = clsx({
    [classes.chipOn]: isRecording, //only when condition === true
  });

  useEffect(() => {
    if (messages && activeCameraConfig) {
      // get list of recording cameras from Pilot Heartbeat
      let recordingCams = [];
      if (messages.port_recording === "true") {
        recordingCams.push(messages.port_camera);
      }
      if (messages.stbd_recording === "true") {
        recordingCams.push(messages.stbd_camera);
      }
      console.log(recordingCams);
      console.log(activeCameraConfig);
      console.log(messages);
      if (recordingCams.includes(activeCameraConfig.cam_name)) {
        setIsRecording(true);
      }
    }
  }, [messages, activeCameraConfig]);
  return (
    <div>
      <Chip
        icon={isRecording ? <VideocamIcon /> : <VideocamOffIcon />}
        label={isRecording ? "RECORDING" : "NOT RECORDING"}
        color="default"
        className={chipStyle}
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import Chip from "@mui/material/Chip";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
// local imports
import {
  selectActiveCameraConfig,
  selectRecorderHeartbeatData,
} from "../camera-controls/cameraControlsSlice";

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
  const lastMessage = useSelector(selectRecorderHeartbeatData);
  const activeCameraConfig = useSelector(selectActiveCameraConfig);
  const [isRecording, setIsRecording] = useState(false);

  const chipStyle = clsx({
    [classes.chipOn]: isRecording, //only when condition === true
  });

  useEffect(() => {
    if (lastMessage && activeCameraConfig) {
      // get list of recording cameras from Pilot Heartbeat
      let recordingCams = [];
      if (lastMessage.port_recording === "true") {
        recordingCams.push(lastMessage.port_camera);
      }

      if (lastMessage.stbd_recording === "true") {
        recordingCams.push(lastMessage.stbd_camera);
      }

      if (recordingCams.includes(activeCameraConfig.cam_name)) {
        setIsRecording(true);
      } else {
        setIsRecording(false);
      }
    }
  }, [lastMessage, activeCameraConfig]);
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

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { CardHeader } from "@material-ui/core";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
// local import
import {
  selectActiveCameraConfig,
  selectRecorderResponseError,
} from "../camera-controls/cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { RECORDER_HEARTBEAT, CAM_HEARTBEAT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  headerRoot: {
    padding: "0 2px",
  },
  headerRecording: {
    backgroundColor: "red",
  },
  headerError: {
    backgroundColor: "#ffc107",
  },
  title: {
    fontSize: ".9em",
  },
  cardAction: {
    marginTop: "0",
    marginRight: 0,
    height: "30px",
  },
  actionIcon: {
    position: "absolute",
  },
}));

export default function MiniVideoHeader({ videoType }) {
  // set websocket event based on videoType
  let wsEvent;
  if (videoType === "OBS") {
    wsEvent = CAM_HEARTBEAT;
  } else if (videoType === "REC") {
    wsEvent = RECORDER_HEARTBEAT;
  }
  const classes = useStyles();
  const [cameraName, setCameraName] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const activeCameraConfig = useSelector(selectActiveCameraConfig);
  const recorderResponseError = useSelector(selectRecorderResponseError);
  const { messages } = useCameraWebSocket(wsEvent);

  const cardHeaderStyle = clsx({
    [classes.headerRoot]: true, //always applies
    [classes.headerRecording]: messages && isRecording, //only when condition === true
    [classes.headerError]: videoType === "REC" && recorderResponseError, //only when condition === true
  });

  useEffect(() => {
    if (videoType === "REC" && messages) {
      setCameraName(messages.camera);
      setIsRecording(messages.recording === "true");
      recorderResponseError && setErrorMessage("Connection Error!");
    } else if (videoType === "OBS" && activeCameraConfig) {
      setCameraName(activeCameraConfig.cam_name);
      setIsRecording(false);
    }
  }, [messages, videoType, activeCameraConfig, recorderResponseError]);

  let title = videoType + ": " + cameraName + " " + errorMessage;

  return (
    <CardHeader
      title={title}
      action={
        <div>
          {isRecording && videoType === "REC" && <VideocamIcon />}
          {!isRecording && videoType === "REC" && <VideocamOffIcon />}
        </div>
      }
      classes={{
        root: cardHeaderStyle,
        title: classes.title,
        action: classes.cardAction,
      }}
    />
  );
}

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
  selectRecorderHeartbeatData,
} from "../camera-controls/cameraControlsSlice";

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
  const classes = useStyles();
  const [cameraName, setCameraName] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const activeCameraConfig = useSelector(selectActiveCameraConfig);
  const recorderResponseError = useSelector(selectRecorderResponseError);
  const recorderHeartbeatData = useSelector(selectRecorderHeartbeatData);

  const cardHeaderStyle = clsx({
    [classes.headerRoot]: true, //always applies
    [classes.headerRecording]: recorderHeartbeatData && isRecording, //only when condition === true
    [classes.headerError]: videoType === "REC" && recorderResponseError, //only when condition === true
  });

  useEffect(() => {
    if (videoType === "REC" && recorderHeartbeatData) {
      setCameraName(recorderHeartbeatData.camera);
      setIsRecording(recorderHeartbeatData.recording === "true");
      // only check Recorder error status if RECORDER_HEARTBEAT recording status is false
      if (recorderHeartbeatData.recording !== "true") {
        if (recorderResponseError) {
          setErrorMessage("Connection Error!");
        } else {
          setErrorMessage("");
        }
      }
    } else if (videoType === "OBS" && activeCameraConfig) {
      setCameraName(activeCameraConfig.cam_name);
      setIsRecording(false);
    }
  }, [
    recorderHeartbeatData,
    videoType,
    activeCameraConfig,
    recorderResponseError,
  ]);

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

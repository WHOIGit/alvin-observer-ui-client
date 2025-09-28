import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import makeStyles from '@mui/styles/makeStyles';
import { CardHeader } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
// local import
import {
  selectCamHeartbeatData,
  selectCamHeartbeatDataPort,
  selectCamHeartbeatDataStbd,
  selectAllCameras,
} from "../camera-controls/cameraControlsSlice";
import { useSocketListener } from "../../hooks/useSocket";
import { getCameraConfigFromId } from "../../utils/getCamConfigFromId";
import { RECORDER_HEARTBEAT } from "../../config.js";

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

export default function MiniVideoHeader({ observerSide, videoType }) {
  const classes = useStyles();
  const [cameraName, setCameraName] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const handleMessage = useCallback((message) => {
    setLastMessage(message);
  }, []);

  useSocketListener(`/${observerSide}`, RECORDER_HEARTBEAT, handleMessage);

  const allCameras = useSelector(selectAllCameras);
  const activeCameraPilot = useSelector(selectCamHeartbeatData);
  const activeCameraPort = useSelector(selectCamHeartbeatDataPort);
  const activeCameraStbd = useSelector(selectCamHeartbeatDataStbd);

  const cardHeaderStyle = clsx({
    [classes.headerRoot]: true, //always applies
    [classes.headerRecording]: lastMessage && isRecording, //only when condition === true
  });

  useEffect(() => {
    if (allCameras.length) {
      if (videoType === "REC" && lastMessage) {
        setCameraName(lastMessage.camera);
        setIsRecording(lastMessage.recording === "true");
      } else if (videoType === "OBS" || videoType === "PILOT") {
        if (observerSide === "port" && activeCameraPort) {
          const camera = getCameraConfigFromId(
            activeCameraPort.camera,
            allCameras
          );
          setCameraName(camera.cam_name);
        } else if (observerSide === "stbd" && activeCameraStbd) {
          const camera = getCameraConfigFromId(
            activeCameraStbd.camera,
            allCameras
          );
          setCameraName(camera.cam_name);
        } else if (observerSide === "pilot" && activeCameraPilot) {
          const camera = getCameraConfigFromId(
            activeCameraPilot.camera,
            allCameras
          );
          camera && setCameraName(camera.cam_name);
        }
      }
    }
  }, [
    activeCameraPilot,
    activeCameraPort,
    activeCameraStbd,
    allCameras,
    lastMessage,
    observerSide,
    videoType,
  ]);

  let title = videoType + ": " + cameraName;

  return (
    <CardHeader
      title={title}
      classes={{
        root: cardHeaderStyle,
        title: classes.title,
        action: classes.cardAction,
      }}
      action={
        <div>
          {isRecording && videoType === "REC" && <VideocamIcon />}
          {!isRecording && videoType === "REC" && <VideocamOffIcon />}
        </div>
      }
    />
  );
}

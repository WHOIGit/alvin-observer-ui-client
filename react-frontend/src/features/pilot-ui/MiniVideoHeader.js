import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { CardHeader } from "@material-ui/core";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
// local import
import {
  selectCamHeartbeatData,
  selectCamHeartbeatDataPort,
  selectCamHeartbeatDataStbd,
  selectAllCameras,
} from "../camera-controls/cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
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
  // only use Web Socket hook for recording sources
  let hookEnabled = false;
  if (videoType === "REC") {
    hookEnabled = true;
  }

  const classes = useStyles();
  const [cameraName, setCameraName] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const { messages } = useCameraWebSocket(
    RECORDER_HEARTBEAT,
    true,
    observerSide,
    hookEnabled
  );

  const allCameras = useSelector(selectAllCameras);
  const activeCameraPilot = useSelector(selectCamHeartbeatData);
  const activeCameraPort = useSelector(selectCamHeartbeatDataPort);
  const activeCameraStbd = useSelector(selectCamHeartbeatDataStbd);

  const cardHeaderStyle = clsx({
    [classes.headerRoot]: true, //always applies
    [classes.headerRecording]: messages && isRecording, //only when condition === true
  });

  useEffect(() => {
    if (videoType === "REC" && messages) {
      setCameraName(messages.camera);
      setIsRecording(messages.recording === "true");
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
  }, [
    messages,
    observerSide,
    videoType,
    activeCameraPort,
    activeCameraStbd,
    activeCameraPilot,
    allCameras,
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

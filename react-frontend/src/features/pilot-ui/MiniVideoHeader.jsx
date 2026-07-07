import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import makeStyles from '@mui/styles/makeStyles';
import { CardHeader } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
// local import
import {
  selectAllCameras,
  selectCamHeartbeatFor,
} from "../camera-controls/cameraControlsSlice";
import { useRecorderHeartbeat } from "../../hooks/useImagingClient";
import { useObservedStation } from "../camera-controls/ObservedCameraProvider";
import { getCameraConfigFromId } from "../../utils/getCamConfigFromId";


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
  const stationId = useObservedStation().id;
  const [cameraName, setCameraName] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const handleMessage = useCallback((message) => {
    setLastMessage(message);
  }, []);

  useRecorderHeartbeat(stationId, handleMessage);

  const allCameras = useSelector(selectAllCameras);
  const stationHeartbeat = useSelector((state) =>
    selectCamHeartbeatFor(state, stationId)
  );

  const cardHeaderStyle = clsx({
    [classes.headerRoot]: true, //always applies
    [classes.headerRecording]: lastMessage && isRecording, //only when condition === true
  });

  useEffect(() => {
    if (allCameras.length) {
      if (videoType === "REC" && lastMessage) {
        setCameraName(lastMessage.camera);
        setIsRecording(lastMessage.isRecording);
      } else if (videoType === "OBS" || videoType === "PILOT") {
        if (stationHeartbeat) {
          const camera = getCameraConfigFromId(
            stationHeartbeat.camera,
            allCameras
          );
          camera && setCameraName(camera.cam_name);
        }
      }
    }
  }, [stationHeartbeat, allCameras, lastMessage, videoType]);

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

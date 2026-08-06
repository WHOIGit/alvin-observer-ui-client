import React, { useCallback, useState } from "react";
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
  const isRecHeader = videoType === "REC";
  const [lastMessage, setLastMessage] = useState(null);

  const handleMessage = useCallback((message) => {
    // Only re-render when the fields this header displays change.
    setLastMessage((previous) =>
      previous &&
      previous.camera === message.camera &&
      previous.isRecording === message.isRecording
        ? previous
        : message
    );
  }, []);

  // Only REC headers display recorder state; the others skip the
  // subscription entirely.
  useRecorderHeartbeat(isRecHeader ? stationId : null, handleMessage);

  const allCameras = useSelector(selectAllCameras);
  const stationHeartbeat = useSelector((state) =>
    selectCamHeartbeatFor(state, stationId)
  );

  // Derived directly from the latest messages; no state mirroring.
  let cameraName = null;
  let isRecording = false;
  if (allCameras.length) {
    if (isRecHeader && lastMessage) {
      cameraName = lastMessage.camera;
      isRecording = lastMessage.isRecording;
    } else if (!isRecHeader && stationHeartbeat) {
      const camera = getCameraConfigFromId(stationHeartbeat.camera, allCameras);
      if (camera) cameraName = camera.cam_name;
    }
  }

  const cardHeaderStyle = clsx({
    [classes.headerRoot]: true, //always applies
    [classes.headerRecording]: isRecording, //only when condition === true
  });

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

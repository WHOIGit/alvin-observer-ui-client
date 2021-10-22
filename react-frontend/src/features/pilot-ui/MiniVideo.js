import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardHeader, CardContent } from "@material-ui/core";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import { v4 as uuidv4 } from "uuid";
// local import
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import WebRtcPlayer from "../../utils/webrtcplayer";
import { getCameraConfigFromId } from "../../utils/getCamConfigFromId";
import {
  selectCamHeartbeatData,
  selectCamHeartbeatDataPort,
  selectCamHeartbeatDataStbd,
} from "../camera-controls/cameraControlsSlice";
import {
  VIDEO_STREAM_CONFIG,
  RECORDER_HEARTBEAT,
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
  WS_SERVER_NAMESPACE_PILOT,
} from "../../config.js";

WebRtcPlayer.setServer(VIDEO_STREAM_CONFIG.server);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  headerRoot: {
    padding: "0 2px",
  },
  headerRecording: {
    backgroundColor: "red",
  },
  title: {
    fontSize: ".9em",
  },
  cardContent: {
    padding: 0,
  },
  cardAction: {
    marginTop: "0",
    marginRight: 0,
    height: "30px",
  },
}));

export default function MiniVideo({ videoSrc, observerSide, videoType }) {
  // only use Web Socket hook for recording sources
  let hookEnabled = false;
  if (videoType === "REC") {
    hookEnabled = true;
  }

  const classes = useStyles();
  const videoElem = useRef(null);
  const [cameraName, setCameraName] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const { messages } = useCameraWebSocket(
    RECORDER_HEARTBEAT,
    true,
    observerSide,
    hookEnabled
  );

  const activeCameraPilot = useSelector(selectCamHeartbeatData);
  const activeCameraPort = useSelector(selectCamHeartbeatDataPort);
  const activeCameraStbd = useSelector(selectCamHeartbeatDataStbd);

  const cardHeaderStyle = clsx({
    [classes.headerRoot]: true, //always applies
    [classes.headerRecording]: messages && isRecording, //only when condition === true
  });

  useEffect(() => {
    const video = videoElem.current;
    if (videoSrc) {
      try {
        new WebRtcPlayer(video.id, videoSrc);
      } catch (error) {
        console.error(error);
      }
    }
  }, [videoSrc]);

  useEffect(() => {
    if (videoType === "REC" && messages) {
      setCameraName(messages.camera);
      setIsRecording(messages.recording === "true");
    } else {
      console.log(observerSide);
      if (observerSide === "port" && activeCameraPort) {
        const camera = getCameraConfigFromId(activeCameraPort.camera);
        setCameraName(camera.cam_name);
      } else if (observerSide === "stbd" && activeCameraStbd) {
        const camera = getCameraConfigFromId(activeCameraStbd.camera);
        setCameraName(camera.cam_name);
      } else if (observerSide === "pilot" && activeCameraPilot) {
        const camera = getCameraConfigFromId(activeCameraPilot.camera);
        console.log(camera, activeCameraPilot);
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
  ]);

  let title = videoType + ": " + cameraName;

  return (
    <Card className={`${classes.root}`}>
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
      <CardContent className={classes.cardContent}>
        <div>
          <video
            style={{ width: "100%" }}
            ref={videoElem}
            id={uuidv4()}
            autoPlay
            muted
          ></video>
        </div>
      </CardContent>
    </Card>
  );
}

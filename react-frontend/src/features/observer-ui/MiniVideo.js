import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardHeader, CardContent } from "@material-ui/core";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import { v4 as uuidv4 } from "uuid";
// local import
import { selectActiveCameraConfig } from "../camera-controls/cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import WebRtcPlayer from "../../utils/webrtcplayer";
import {
  VIDEO_STREAM_CONFIG,
  RECORDER_HEARTBEAT,
  CAM_HEARTBEAT,
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
  cardAction: {
    marginTop: "0",
    marginRight: 0,
    height: "30px",
  },
  actionIcon: {
    position: "absolute",
  },
  cardContent: {
    padding: 0,
    "&:last-child": {
      paddingBottom: 0,
    },
  },
}));

export default function MiniVideo({ videoSrc, videoType }) {
  // set websocket event based on videoType
  let wsEvent;
  if (videoType === "OBS") {
    wsEvent = CAM_HEARTBEAT;
  } else if (videoType === "REC") {
    wsEvent = RECORDER_HEARTBEAT;
  }
  const classes = useStyles();
  const videoElem = useRef(null);
  const [cameraName, setCameraName] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const activeCameraConfig = useSelector(selectActiveCameraConfig);
  const { messages } = useCameraWebSocket(wsEvent);

  const cardHeaderStyle = clsx({
    [classes.headerRoot]: true, //always applies
    [classes.headerRecording]: messages && isRecording, //only when condition === true
  });

  useEffect(() => {
    if (videoElem.current) {
      const player = new WebRtcPlayer(
        videoElem.current.id,
        videoSrc /* stream */,
        "0" /* channel */
      );
    }
  }, [videoSrc]);

  useEffect(() => {
    if (videoType === "REC" && messages) {
      setCameraName(messages.camera);
      setIsRecording(messages.recording === "true");
    } else if (videoType === "OBS" && activeCameraConfig) {
      setCameraName(activeCameraConfig.cam_name);
      setIsRecording(false);
    }
  }, [messages, videoType, activeCameraConfig]);

  let title = videoType + ": " + cameraName;

  return (
    <Card className={`${classes.root}`}>
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

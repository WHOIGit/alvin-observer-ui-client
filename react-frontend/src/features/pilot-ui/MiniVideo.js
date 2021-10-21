import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardHeader,
  CardActions,
  CardContent,
  Typography,
} from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";
// local import
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import WebRtcPlayer from "../../utils/webrtcplayer";
import {
  VIDEO_STREAM_CONFIG,
  RECORDER_HEARTBEAT,
  CAM_HEARTBEAT,
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
  WS_SERVER_NAMESPACE_PILOT,
} from "../../config.js";

WebRtcPlayer.setServer(VIDEO_STREAM_CONFIG.server);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  headerRoot: { padding: "4px" },
  title: {
    fontSize: ".9em",
  },
  inactiveVideo: {
    border: "white solid 2px",
  },
  activeVideo: {
    border: "red solid 2px",
  },
  videoAction: {
    justifyContent: "center",
    textTransform: "uppercase",
    padding: "4px",
  },
  activeVideoAction: {
    backgroundColor: "red",
  },
  cardContent: {
    padding: 0,
  },
}));

export default function MiniVideo({ videoSrc, observerSide, videoType }) {
  // set websocket event based on videoType
  let wsEvent = RECORDER_HEARTBEAT;
  if (videoType !== "REC") {
    wsEvent = CAM_HEARTBEAT;
  }

  const classes = useStyles();
  const videoElem = useRef(null);
  const [cameraName, setCameraName] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const { messages } = useCameraWebSocket(wsEvent, true, observerSide);
  console.log(wsEvent, observerSide, messages);

  useEffect(() => {
    const video = videoElem.current;
    console.log(video);
    if (videoSrc) {
      try {
        new WebRtcPlayer(video.id, videoSrc);
      } catch (error) {
        console.error(error);
      }
    }
  }, [videoSrc]);

  useEffect(() => {
    if (!messages) {
      return null;
    }

    if (videoType === "REC") {
      setCameraName(messages.camera);
      setIsRecording(messages.recording === "true");
    } else if (videoType === "OBS" || videoType === "PILOT") {
      setCameraName(messages.camera);
    }
  }, [messages, observerSide, videoType]);

  let title = videoType + ": " + cameraName;
  let footer;

  return (
    <Card className={`${classes.root}`}>
      <CardHeader
        title={title}
        classes={{
          root: classes.headerRoot,
          title: classes.title,
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

      <CardActions
        className={`${classes.videoAction} ${
          isRecording && classes.activeVideoAction
        }`}
      >
        <Typography variant="body2" color="textSecondary" component="span">
          {footer}
        </Typography>
      </CardActions>
    </Card>
  );
}

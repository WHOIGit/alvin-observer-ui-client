import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
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
import { selectActiveCamera } from "../camera-controls/cameraControlsSlice";
import { VIDEO_STREAM_CONFIG } from "../../config.js";

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

export default function MiniVideo({ videoSrc, recording }) {
  const classes = useStyles();
  const videoElem = useRef(null);

  console.log(videoSrc);

  useEffect(() => {
    const video = videoElem.current;
    console.log(video);
    if (videoSrc) {
      const videoPlayer = new WebRtcPlayer(video.id, videoSrc);
      console.log(videoPlayer);
    }
  }, [videoSrc]);

  let title;
  let footer;
  if (recording) {
    title = "REC:";
    footer = "RECORDING";
  } else {
    title = "OBS:";
    footer = "SOURCE";
  }

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
          recording && classes.activeVideoAction
        }`}
      >
        <Typography variant="body2" color="textSecondary" component="span">
          {footer}
        </Typography>
      </CardActions>
    </Card>
  );
}

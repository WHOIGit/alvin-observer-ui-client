import React, { useEffect, useRef } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Card, CardContent } from "@mui/material";
// local import
import WebRtcPlayer from "../../utils/webrtcplayer";
import MiniVideoHeader from "./MiniVideoHeader";
import { VIDEO_STREAM_CONFIG } from "../../config.js";

WebRtcPlayer.setServer(VIDEO_STREAM_CONFIG.server);
WebRtcPlayer.setProtocol(VIDEO_STREAM_CONFIG.protocol);
WebRtcPlayer.setUrlTemplate(VIDEO_STREAM_CONFIG.urlTemplate);

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
  const classes = useStyles();
  const videoElem = useRef(null);

  useEffect(() => {
    if (videoElem.current) {
      const player = new WebRtcPlayer(
        videoElem.current.id,
        videoSrc /* stream */,
        "0" /* channel */
      );
    }
  }, [videoSrc]);

  return (
    <Card className={`${classes.root}`}>
      <MiniVideoHeader observerSide={observerSide} videoType={videoType} />
      <CardContent className={classes.cardContent}>
        <div>
          <video
            style={{ width: "100%" }}
            ref={videoElem}
            id={`${videoType}-${observerSide}-minivideo`}
            autoPlay
            muted
          ></video>
        </div>
      </CardContent>
    </Card>
  );
}

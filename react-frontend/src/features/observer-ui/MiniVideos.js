import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Card, CardHeader, CardContent } from "@material-ui/core";
// local import
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import TopCameraCommandsList from "./TopCameraCommandsList";
import WebRtcPlayer from "../../utils/webrtcplayer";
import {
  //selectActiveCamera,
  selectActiveCameraConfig,
} from "../camera-controls/cameraControlsSlice";
import { VIDEO_STREAM_CONFIG, RECORDER_HEARTBEAT } from "../../config.js";

WebRtcPlayer.setServer(VIDEO_STREAM_CONFIG.server);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  headerRoot: {
    padding: "4px",
  },
  headerRecording: {
    backgroundColor: "red",
  },
  title: {
    fontSize: ".9em",
  },
  cardContent: {
    padding: 0,
    "&:last-child": {
      paddingBottom: 0,
    },
  },
}));

export default function MiniVideos({ showFullCameraControls }) {
  const classes = useStyles();
  //const activeCamera = useSelector(selectActiveCamera);
  const activeCameraConfig = useSelector(selectActiveCameraConfig);
  const { messages } = useCameraWebSocket(RECORDER_HEARTBEAT);
  const videoElemRecord = useRef(null);
  const videoElemObserver = useRef(null);
  const observerVideoSrc = useSelector(
    (state) => state.cameraControls.observerVideoSrc
  );
  const recordVideoSrc = useSelector(
    (state) => state.cameraControls.recordVideoSrc
  );

  const cardHeaderStyle = clsx({
    [classes.headerRoot]: true, //always applies
    [classes.headerRecording]: messages, //only when open === true
  });

  useEffect(() => {
    const videoObserver = videoElemObserver.current;
    console.log(videoObserver, observerVideoSrc);
    if (videoObserver) {
      // eslint-disable-next-line no-unused-vars
      const obsVideo = new WebRtcPlayer(videoObserver.id, observerVideoSrc);
    }

    const videoRecord = videoElemRecord.current;
    if (videoRecord) {
      // eslint-disable-next-line no-unused-vars
      const recVideo = new WebRtcPlayer(videoRecord.id, recordVideoSrc);
    }
  }, [
    showFullCameraControls,
    observerVideoSrc,
    recordVideoSrc,
    videoElemObserver,
    videoElemRecord,
  ]);

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card className={`${classes.root}`}>
            <CardHeader
              title={messages && `REC: ${messages.camera}`}
              classes={{
                root:
                  messages && messages.recording && classes.headerRecorderRoot,
                title: classes.title,
              }}
            />
            <CardContent className={classes.cardContent}>
              <div id="videoBox1">
                <video
                  style={{ width: "100%" }}
                  id="miniVideoRecord"
                  ref={videoElemRecord}
                  autoPlay
                  muted
                ></video>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          {showFullCameraControls ? (
            <TopCameraCommandsList />
          ) : (
            <>
              <Card className={classes.root}>
                <CardHeader
                  title={
                    activeCameraConfig && `OBS: ${activeCameraConfig.cam_name}`
                  }
                  classes={{
                    root: classes.headerRoot,
                    title: classes.title,
                  }}
                />
                <CardContent className={classes.cardContent}>
                  <div id="videoBox2">
                    <video
                      style={{ width: "100%" }}
                      id="miniVideoObserver"
                      ref={videoElemObserver}
                      autoPlay
                      muted
                    ></video>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

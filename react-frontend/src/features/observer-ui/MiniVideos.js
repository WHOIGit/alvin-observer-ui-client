import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import adapter from "webrtc-adapter";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Card,
  CardHeader,
  CardMedia,
  CardActions,
  CardContent,
  Typography,
  Button,
  Chip
} from "@material-ui/core";
// local import
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import TopCameraCommandsList from "./TopCameraCommandsList";
import WebRtcPlayer from "../../utils/webrtcplayer";
import { selectActiveCamera } from "../camera-controls/cameraControlsSlice";
import { VIDEO_STREAM_CONFIG, RECORDER_HEARTBEAT } from "../../config.js";

WebRtcPlayer.setServer(VIDEO_STREAM_CONFIG.server);

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  headerRoot: { padding: "4px" },
  title: {
    fontSize: ".9em"
  },
  inactiveVideo: {
    border: "white solid 2px"
  },
  activeVideo: {
    border: "red solid 2px"
  },
  videoAction: {
    justifyContent: "center",
    textTransform: "uppercase",
    padding: "4px"
  },
  activeVideoAction: {
    backgroundColor: "red"
  },
  miniVidImage: {
    height: 0,
    paddingTop: "77%",
    maxWidth: "100%"
  },
  cardContent: {
    padding: 0
  }
}));

export default function MiniVideos({ showFullCameraControls }) {
  const classes = useStyles();
  const activeCamera = useSelector(selectActiveCamera);
  const { messages } = useCameraWebSocket(RECORDER_HEARTBEAT);
  console.log(messages);
  const videoElemRecord = useRef(null);
  const videoElemObserver = useRef(null);
  const observerVideoSrc = useSelector(
    state => state.cameraControls.observerVideoSrc
  );
  const recordVideoSrc = useSelector(
    state => state.cameraControls.recordVideoSrc
  );

  useEffect(() => {
    const videoObserver = videoElemObserver.current;
    if (videoObserver) {
      const playerObserver = new WebRtcPlayer(
        videoObserver.id,
        observerVideoSrc
      );
    }

    const videoRecord = videoElemRecord.current;
    if (videoRecord) {
      const playerRecord = new WebRtcPlayer(videoRecord.id, recordVideoSrc);
    }
  }, [showFullCameraControls, observerVideoSrc, recordVideoSrc]);

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card className={`${classes.root}`}>
            <CardHeader
              title={messages && `REC: ${messages.camera}`}
              classes={{
                root: classes.headerRoot,
                title: classes.title
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

            <CardActions
              className={`${classes.videoAction} ${classes.activeVideoAction}`}
            >
              <Typography
                variant="body2"
                color="textSecondary"
                component="span"
              >
                RECORDING
              </Typography>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={6}>
          {showFullCameraControls ? (
            <TopCameraCommandsList />
          ) : (
            <>
              <Card className={classes.root}>
                <CardHeader
                  title={`OBS: ${activeCamera}`}
                  classes={{
                    root: classes.headerRoot,
                    title: classes.title
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

                <CardActions className={classes.videoAction}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="span"
                    align="center"
                  >
                    SOURCE
                  </Typography>
                </CardActions>
              </Card>
            </>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import axios from "axios";
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
import TopCameraCommandsList from "./TopCameraCommandsList";
import FocusModeDisplayChip from "./FocusModeDisplayChip";
import WebRtcPlayer from "../../utils/webrtcplayer";

WebRtcPlayer.setServer("128.128.181.215:8083");

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
  infoChip: {
    marginTop: theme.spacing(1),
    width: "100%"
  },
  cardContent: {
    padding: 0
  }
}));

export default function MiniVideos({ showFullCameraControls }) {
  const classes = useStyles();
  const videoElem1 = useRef(null);
  const videoElem2 = useRef(null);

  useEffect(() => {
    let video = videoElem1.current;
    console.log(video);
    const player = new WebRtcPlayer("miniVideo1", "teradek");
  }, []);

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card className={`${classes.root}`}>
            <CardHeader
              title="REC: Camera Name2"
              classes={{
                root: classes.headerRoot,
                title: classes.title
              }}
            />
            <CardContent className={classes.cardContent}>
              <div id="videoBox1">
                <video
                  style={{ width: "100%" }}
                  id="miniVideo1"
                  ref={videoElem1}
                  autoPlay
                  muted
                  controls
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
                  title="OBS: Camera Name1"
                  classes={{
                    root: classes.headerRoot,
                    title: classes.title
                  }}
                />
                <CardContent className={classes.cardContent}>
                  <div id="videoBox2">
                    <video
                      style={{ width: "100%" }}
                      id="miniVideo2"
                      ref={videoElem2}
                      autoPlay
                      muted
                      controls
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
              <FocusModeDisplayChip className={classes.infoChip} />
            </>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

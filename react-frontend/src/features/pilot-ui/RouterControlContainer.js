import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, Box, CircularProgress } from "@material-ui/core";
import { green, red } from "@material-ui/core/colors";
// local
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import RouterControls from "./RouterControls";
import MiniVideo from "./MiniVideo";
import {
  VIDEO_STREAM_CONFIG,
  COMMAND_STRINGS,
  NEW_CAMERA_COMMAND_EVENT,
  CAM_HEARTBEAT,
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
  WS_SERVER_NAMESPACE_PILOT,
} from "../../config.js";
import PilotRecordButton from "../camera-controls/PilotRecordButton";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  rightAlign: {
    textAlign: "right",
  },
  recStopButton: {
    backgroundColor: red[600],
  },
  buttonWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

export default function RouterControlContainer() {
  const classes = useStyles();
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  // establish web socket connections for all CAM_HEARTBEAT namespaces
  const { messages } = useCameraWebSocket(CAM_HEARTBEAT);
  console.log(messages);
  useCameraWebSocket(CAM_HEARTBEAT, true, WS_SERVER_NAMESPACE_PORT);
  useCameraWebSocket(CAM_HEARTBEAT, true, WS_SERVER_NAMESPACE_STARBOARD);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = (commandName, commandValue) => {
    const payload = {
      action: {
        name: commandName,
        value: commandValue,
      },
    };
    sendMessage(payload);
  };

  const handleStopRecord = () => {
    setLoading(true);
    handleSendMessage(
      COMMAND_STRINGS.recordSourceCommand,
      COMMAND_STRINGS.recordStopCommand
    );

    // add a "fake" delay to UI to show users that image capture is processing
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs>
          <MiniVideo
            videoSrc={VIDEO_STREAM_CONFIG.portRecordVideo}
            observerSide={WS_SERVER_NAMESPACE_PORT}
            videoType="REC"
            key="video1"
          />
        </Grid>
        <Grid item xs>
          <MiniVideo
            videoSrc={VIDEO_STREAM_CONFIG.portObserverSmallVideo}
            observerSide={WS_SERVER_NAMESPACE_PORT}
            videoType="OBS"
            key="video0"
          />
        </Grid>

        <Grid item xs>
          <MiniVideo
            videoSrc={VIDEO_STREAM_CONFIG.pilotSmallVideo}
            observerSide={WS_SERVER_NAMESPACE_PILOT}
            videoType="PILOT"
            key="video2"
          />
        </Grid>

        <Grid item xs>
          <MiniVideo
            videoSrc={VIDEO_STREAM_CONFIG.stbdObserverSmallVideo}
            observerSide={WS_SERVER_NAMESPACE_STARBOARD}
            videoType="OBS"
            key="video3"
          />
        </Grid>
        <Grid item xs>
          <MiniVideo
            videoSrc={VIDEO_STREAM_CONFIG.stbdRecordVideo}
            observerSide={WS_SERVER_NAMESPACE_STARBOARD}
            videoType="REC"
            key="video4"
          />
        </Grid>
      </Grid>

      <Box mt={1.5}>
        <Grid container justifyContent="center" spacing={2}>
          <Grid item xs>
            <PilotRecordButton observerSide={WS_SERVER_NAMESPACE_PORT} />
          </Grid>

          <Grid>
            <div className={classes.buttonWrapper}>
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                className={classes.recStopButton}
                onClick={() => handleStopRecord()}
              >
                Stop All Recordings
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  className={classes.buttonProgress}
                />
              )}
            </div>
          </Grid>

          <Grid item xs className={classes.rightAlign}>
            <PilotRecordButton observerSide={WS_SERVER_NAMESPACE_STARBOARD} />
          </Grid>
        </Grid>
      </Box>
      <Box mt={3}>
        <RouterControls />
      </Box>
    </>
  );
}

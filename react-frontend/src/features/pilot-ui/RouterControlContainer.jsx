import React, { useState } from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Grid, Button, Box, CircularProgress } from "@mui/material";
import { green, red } from "@mui/material/colors";
// local
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";
import RouterControls from "./RouterControls";
import MiniVideo from "../camera-controls/MiniVideo";
import MiniVideoHeader from "./MiniVideoHeader";
import EncoderActions from "./EncoderActions";
import {
  VIDEO_STREAM_CONFIG,
  ENCODER_KEYS,
  COMMAND_STRINGS,
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
  WS_SERVER_NAMESPACE_PILOT,
} from "../../config.js";
import PilotRecordButton from "../camera-controls/PilotRecordButton";
import { selectActiveCamera, selectObserverSide } from "../camera-controls/cameraControlsSlice";

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
  const [loading, setLoading] = useState(false);

  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const { emit } = useCameraCommandEmitter({
    activeCamera: activeCameraId,
    observerSide,
  });

  const handleSendMessage = (commandName, commandValue) => {
    void emit({
      action: {
        name: commandName,
        value: commandValue,
      },
    });
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
            videoType="REC"
            id={`REC-${WS_SERVER_NAMESPACE_PORT}-minivideo`}
            header={
              <MiniVideoHeader
                observerSide={WS_SERVER_NAMESPACE_PORT}
                videoType="REC"
              />
            }
            key="video1"
          />
          <EncoderActions name={ENCODER_KEYS.portRecorder} />
        </Grid>
        <Grid item xs>
          <MiniVideo
            videoSrc={VIDEO_STREAM_CONFIG.portObserverVideo}
            videoType="OBS"
            id={`OBS-${WS_SERVER_NAMESPACE_PORT}-minivideo`}
            header={
              <MiniVideoHeader
                observerSide={WS_SERVER_NAMESPACE_PORT}
                videoType="OBS"
              />
            }
            key="video0"
          />
          <EncoderActions name={ENCODER_KEYS.portObserver} />
        </Grid>

        <Grid item xs>
          <MiniVideo
            videoSrc={VIDEO_STREAM_CONFIG.pilotVideo}
            videoType="PILOT"
            id={`PILOT-${WS_SERVER_NAMESPACE_PILOT}-minivideo`}
            header={
              <MiniVideoHeader
                observerSide={WS_SERVER_NAMESPACE_PILOT}
                videoType="PILOT"
              />
            }
            key="video2"
          />
          <EncoderActions name={ENCODER_KEYS.pilot} />
        </Grid>

        <Grid item xs>
          <MiniVideo
            videoSrc={VIDEO_STREAM_CONFIG.stbdObserverVideo}
            videoType="OBS"
            id={`OBS-${WS_SERVER_NAMESPACE_STARBOARD}-minivideo`}
            header={
              <MiniVideoHeader
                observerSide={WS_SERVER_NAMESPACE_STARBOARD}
                videoType="OBS"
              />
            }
            key="video3"
          />
          <EncoderActions name={ENCODER_KEYS.stbdObserver} />
        </Grid>
        <Grid item xs>
          <MiniVideo
            videoSrc={VIDEO_STREAM_CONFIG.stbdRecordVideo}
            videoType="REC"
            id={`REC-${WS_SERVER_NAMESPACE_STARBOARD}-minivideo`}
            header={
              <MiniVideoHeader
                observerSide={WS_SERVER_NAMESPACE_STARBOARD}
                videoType="REC"
              />
            }
            key="video4"
          />
          <EncoderActions name={ENCODER_KEYS.stbdRecorder} />
        </Grid>
      </Grid>

      <Box mt={1.5}>
        <Grid container justifyContent="center" spacing={2}>
          <Grid item xs>
            <PilotRecordButton observerSide={WS_SERVER_NAMESPACE_PORT} />
          </Grid>

          <Grid item xs display="flex" justifyContent="center">
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

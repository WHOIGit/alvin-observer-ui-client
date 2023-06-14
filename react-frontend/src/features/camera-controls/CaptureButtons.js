import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, CircularProgress, Checkbox } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { getCameraConfigFromName } from "../../utils/getCamConfigFromName";
import {
  selectActiveCameraConfig,
  setRecorderError,
  setVideoSourceEnabled,
  selectRecordControlsEnabled,
  selectRecorderHeartbeatData,
  selectCamHeartbeatData,
  selectAllCameras,
} from "./cameraControlsSlice";
import { COMMAND_STRINGS, NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  ctrlButton: {
    width: "100%",
    fontSize: ".7em",
  },
  buttonWrapper: {
    position: "relative",
  },
  imgCheckbox: {
    paddingLeft: 0,
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

export default function CaptureButtons() {
  const classes = useStyles();
  const activeCamera = useSelector(selectActiveCameraConfig);
  const recordControlsEnabled = useSelector(selectRecordControlsEnabled);
  const recorderHeartbeatData = useSelector(selectRecorderHeartbeatData);
  const camSettings = useSelector(selectCamHeartbeatData);
  const allCameras = useSelector(selectAllCameras);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  const [recordTimer, setRecordTimer] = useState(null);
  const [currentRecordFile, setCurrentRecordFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingImgCapture, setLoadingImgCapture] = useState(false);
  const [checkedImg, setCheckedImg] = React.useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (recordControlsEnabled) {
      setLoading(false);
      setLoadingImgCapture(false);
    } else {
      setLoading(true);
      setLoadingImgCapture(true);
    }
  }, [recordControlsEnabled]);

  useEffect(() => {
    // get current Recording camera ID from RECORDER_HEARTBEAT
    // also check if RECORDER_HEARTBEAT filename has changed, indicates new recording for same camera
    if (recorderHeartbeatData && recordTimer) {
      if (
        recorderHeartbeatData.recording === "true" &&
        activeCamera.cam_name === recorderHeartbeatData.camera &&
        recorderHeartbeatData.filename !== currentRecordFile
      ) {
        clearInterval(recordTimer);
        setRecordTimer(null);
        setLoading(false);
        // reenable Video Source menu
        const payloadVideoSrc = true;
        dispatch(setVideoSourceEnabled(payloadVideoSrc));
      }
    }
  }, [
    recorderHeartbeatData,
    recordTimer,
    activeCamera,
    dispatch,
    currentRecordFile,
  ]);

  const handleSendMessage = (commandName, commandValue) => {
    const payload = {
      action: {
        name: commandName,
        value: commandValue,
      },
    };
    // If a RECORD SOURCE action, need to send the previous Recording camera name
    if (commandName === COMMAND_STRINGS.recordSourceCommand) {
      // get the camera ID of the currently recording camera
      const oldCamera = getCameraConfigFromName(
        recorderHeartbeatData.camera,
        allCameras
      );
      payload.oldCamera = oldCamera.camera;
    }

    // If a IMG CAPTURE action, need to send checkbox value
    if (commandName === COMMAND_STRINGS.stillImageCaptureCommand) {
      payload.action.imgCaptureChecked = checkedImg;
    }

    sendMessage(payload);
  };

  const handleRecordAction = async () => {
    setLoading(true);
    // save the current RECORDER_HEARTBEAT filename so we can check if it changes on new actions
    setCurrentRecordFile(recorderHeartbeatData.filename);
    handleSendMessage(COMMAND_STRINGS.recordSourceCommand, activeCamera.camera);
    // set Video Source menu to be disabled
    console.log("disabling video source");
    const payloadVideoSrc = false;
    dispatch(setVideoSourceEnabled(payloadVideoSrc));
    // reset error status in Redux
    console.log("reset recording error");
    const payload = false;
    console.log("disabling video source");
    dispatch(setRecorderError(payload));

    // This is the maximum time the spinner will display
    // Cancel this timer if we get a OK response from socket message in useEffect above
    // OK response can take up to 10 seconds
    const timer = setTimeout(() => {
      setLoading(false);
      // save error status in Redux
      const payloadRecError = true;
      dispatch(setRecorderError(payloadRecError));
      // reenable Video Source menu
      console.log("enabling video source");
      const payloadVideoSrc = true;
      dispatch(setVideoSourceEnabled(payloadVideoSrc));
    }, 12000);
    setRecordTimer(timer);
  };

  const handleImgCapture = () => {
    setLoadingImgCapture(true);
    handleSendMessage(COMMAND_STRINGS.stillImageCaptureCommand, 0);

    // add a "fake" delay to UI to show users that image capture is processing
    setTimeout(() => {
      setLoadingImgCapture(false);
    }, 2000);
  };

  const handleCheckboxChange = (event) => {
    console.log(event.target.checked);
    setCheckedImg(event.target.checked);
  };

  // check to make sure camera has controls, current Observer matches Cam Owner, camera is available
  if (camSettings === null || camSettings?.focus_mode === "ERR") {
    return null;
  }

  return (
    <>
      <Grid item xs={2}>
        <div className={classes.buttonWrapper}>
          <Checkbox
            onChange={handleCheckboxChange}
            size="small"
            className={classes.imgCheckbox}
          />
        </div>
      </Grid>
      <Grid item xs={5}>
        <div className={classes.buttonWrapper}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={loadingImgCapture}
            className={classes.ctrlButton}
            onClick={() => handleImgCapture()}
          >
            Still Img Capture
          </Button>
          {loadingImgCapture && (
            <CircularProgress size={24} className={classes.buttonProgress} />
          )}
        </div>
      </Grid>
      <Grid item xs={5}>
        <div className={classes.buttonWrapper}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={loading}
            className={classes.ctrlButton}
            onClick={() => handleRecordAction()}
          >
            Record Source
          </Button>
          {loading && (
            <CircularProgress size={24} className={classes.buttonProgress} />
          )}
        </div>
      </Grid>
    </>
  );
}

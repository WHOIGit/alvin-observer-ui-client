import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Grid, Button, CircularProgress, Checkbox } from "@mui/material";
import { green } from "@mui/material/colors";
import { useObservedCamera, useObservedStation } from "./ObservedCameraProvider";
import { useRecordingStarted } from "../../hooks/useImagingClient";
import { getCameraConfigFromName } from "../../utils/getCamConfigFromName";
import {
  selectActiveCameraConfig,
  selectAllCameras,
  selectCamHeartbeatData,
  selectRecordControlsEnabled,
  selectRecorderHeartbeatData,
  setRecorderError,
  setVideoSourceEnabled,
} from "./cameraControlsSlice";

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

  const station = useObservedStation();
  const camera = useObservedCamera();

  const [loading, setLoading] = useState(false);
  const [loadingImgCapture, setLoadingImgCapture] = useState(false);

  // The record command awaiting confirmation: its failure timer and the
  // camera it asked the recorder to switch to.
  const pendingRecordRef = useRef(null);

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

  // The recorder confirms a record command by starting a new clip on the
  // requested camera (the library detects new clips from its heartbeat).
  useRecordingStarted(station?.id, (camera) => {
    const pending = pendingRecordRef.current;
    if (!pending || camera !== pending.cameraName) return;
    clearTimeout(pending.timerId);
    pendingRecordRef.current = null;
    setLoading(false);
    dispatch(setVideoSourceEnabled(true));
  });

  // Don't leave the failure timer running past unmount.
  useEffect(
    () => () => {
      if (pendingRecordRef.current) clearTimeout(pendingRecordRef.current.timerId);
    },
    []
  );

  const startRecording = () => {
    // The record command must carry the previously recording camera's ID,
    // which the heartbeat reports by display name.
    const oldCamera = getCameraConfigFromName(
      recorderHeartbeatData.camera,
      allCameras
    );
    if (!oldCamera) {
      // The recorder's reported source isn't in this station's camera list
      // yet (e.g. the camera list hasn't arrived after a reconnect); don't
      // send a malformed record command.
      console.warn(
        "Cannot start recording: unknown recorder source",
        recorderHeartbeatData.camera
      );
      return false;
    }
    station.record(activeCamera.camera, { previousCamera: oldCamera.camera });
    return true;
  };

  const captureStillImage = () => {
    camera.captureStill();
  };

  const handleRecordAction = async () => {
    if (!recorderHeartbeatData || !activeCamera) {
      // No recorder heartbeat yet (recorder down or still starting) or no
      // active camera selected; without them there is no record command to
      // build. Bail before setLoading so the button can't wedge.
      console.warn("Cannot start recording: recorder state not ready");
      return;
    }
    setLoading(true);
    if (!startRecording()) {
      setLoading(false);
      return;
    }
    dispatch(setVideoSourceEnabled(false));
    dispatch(setRecorderError(false));

    // Maximum time the spinner shows; the onRecordingStarted subscription
    // above cancels it when the recorder confirms, which can take up to 10
    // seconds.
    const timerId = setTimeout(() => {
      pendingRecordRef.current = null;
      setLoading(false);
      dispatch(setRecorderError(true));
      dispatch(setVideoSourceEnabled(true));
    }, 12000);
    pendingRecordRef.current = { timerId, cameraName: activeCamera.cam_name };
  };

  const handleImgCapture = () => {
    setLoadingImgCapture(true);
    captureStillImage();
    // set Video Source menu to be disabled
    console.log("disabling video source");
    dispatch(setVideoSourceEnabled(false));

    // add a "fake" delay to UI to show users that image capture is processing
    setTimeout(() => {
      setLoadingImgCapture(false);
      dispatch(setVideoSourceEnabled(true));
    }, 2000);
  };

  // check to make sure camera has controls, current Observer matches Cam Owner, camera is available
  if (camSettings === null || camSettings?.faults?.focus_mode) {
    return null;
  }

  return (
    <>
      <Grid item xs={6}>
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
      <Grid item xs={6}>
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

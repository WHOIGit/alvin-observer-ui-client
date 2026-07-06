import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Button, CircularProgress } from "@mui/material";
import { green } from "@mui/material/colors";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
// local
import { useImagingStation } from "../../hooks/useImagingClient";
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import { FOCUS_MODES } from "../../lib/imaging-client";
import { selectActiveCamera, selectObserverSide } from "./cameraControlsSlice";

const useStyles = makeStyles((theme) => ({
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

const FocusModeButton = () => {
  const classes = useStyles();
  const camSettings = useSelector(selectCamHeartbeatData);
  const [currentFocusMode, setCurrentFocusMode] = useState("AF");
  const [loading, setLoading] = useState(false);

  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const camera = useImagingStation(observerSide).camera(activeCameraId ?? null);

  useEffect(() => {
    if (camSettings !== null) {
      setCurrentFocusMode(camSettings.focus_mode);
    }
  }, [camSettings]);

  const handleSendMessage = () => {
    // add a "fake" delay to UI to show users that image capture is processing
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    const nextFocusMode =
      camSettings.focus_mode === FOCUS_MODES.AUTOFOCUS
        ? FOCUS_MODES.MANUAL
        : FOCUS_MODES.AUTOFOCUS;

    camera.setFocusMode(nextFocusMode);
  };

  return (
    <div className={classes.buttonWrapper}>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        startIcon={<CenterFocusStrongIcon />}
        disabled={loading}
        onClick={() => handleSendMessage()}
      >
        Focus {currentFocusMode}
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </div>
  );
};

export default FocusModeButton;

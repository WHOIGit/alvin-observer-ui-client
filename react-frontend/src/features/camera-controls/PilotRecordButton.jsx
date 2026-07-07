import React, { useState } from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Button, CircularProgress } from "@mui/material";
import { green } from "@mui/material/colors";
// local imports
import { useObservedStation } from "./ObservedCameraProvider";
import { selectCamHeartbeatFor } from "./cameraControlsSlice";
import { WS_SERVER_NAMESPACE_STARBOARD } from "../../config";

const useStyles = makeStyles((theme) => ({
  buttonWrapper: {
    position: "relative",
    display: "inline-block",
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

export default function PilotRecordButton({ observerSide }) {
  const classes = useStyles();
  const stationId =
    observerSide === WS_SERVER_NAMESPACE_STARBOARD ? "S" : "P";
  const activeCamera = useSelector((state) =>
    selectCamHeartbeatFor(state, stationId)
  );
  const [loading, setLoading] = useState(false);

  const station = useObservedStation();

  const handleSendMessage = () => {
    station.record(activeCamera.camera, { as: stationId });
  };

  const handleRecordAction = () => {
    setLoading(true);
    handleSendMessage();

    // add a "fake" delay to UI to show users that image capture is processing
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className={classes.buttonWrapper}>
      <Button
        variant="contained"
        color="primary"
        size="small"
        disabled={loading}
        onClick={() => handleRecordAction()}
      >
        Record {observerSide} Source
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </div>
  );
}

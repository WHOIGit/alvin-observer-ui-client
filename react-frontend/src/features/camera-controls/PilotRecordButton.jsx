import React, { useState } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Button, CircularProgress } from "@mui/material";
import { green } from "@mui/material/colors";
// local imports
import {
  useObservedCamera,
  useObservedStation,
  useOwnStation,
} from "./ObservedCameraProvider";
import { getStationInfo } from "../../lib/imaging-client";

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

// Rendered under a mirror station's provider: the observed station names the
// recording target, but the command itself is delegated on the pilot's own
// station, as the wire protocol requires.
export default function PilotRecordButton() {
  const classes = useStyles();
  const station = useObservedStation();
  const camera = useObservedCamera();
  const ownStation = useOwnStation();
  const [loading, setLoading] = useState(false);

  const stationName = getStationInfo(station.id).namespace;

  const handleRecordAction = () => {
    setLoading(true);
    ownStation.record(camera.id, { as: station.id });

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
        disabled={loading || !camera.id}
        onClick={() => handleRecordAction()}
      >
        Record {stationName} Source
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </div>
  );
}

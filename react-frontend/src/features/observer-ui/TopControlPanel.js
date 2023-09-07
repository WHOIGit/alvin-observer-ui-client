import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Box } from "@material-ui/core";
import { useSelector } from "react-redux";
// local
import ObserverDisplayChip from "./ObserverDisplayChip";
import UpperRightButtons from "./UpperRightButtons";
import NavDataDisplay from "./NavDataDisplay";
import TopCameraCommandsList from "./TopCameraCommandsList";
import MiniVideo from "./MiniVideo";
import MetaDataDisplay from "./MetaDataDisplay";
import SelectVideoSource from "../camera-controls/SelectVideoSource";
import SelectExposureMode from "../camera-controls/SelectExposureMode";
import ErrorCard from "../camera-controls/ErrorCard";
import {
  selectCamHeartbeatData,
  selectSocketError,
} from "../camera-controls/cameraControlsSlice";
import SocketErrorChip from "./SocketErrorChip";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  infoChip: {
    marginBottom: theme.spacing(1),
    width: "100%",
  },
  horizLabel: {
    paddingTop: theme.spacing(2),
  },
  exposureGrid: {
    paddingLeft: theme.spacing(4),
  },
}));

export default function TopControlPanel({
  showFullCameraControls,
  setShowFullCameraControls,
}) {
  const classes = useStyles();
  const observerVideoSmallSrc = useSelector(
    (state) => state.cameraControls.observerVideoSmallSrc
  );
  const recordVideoSrc = useSelector(
    (state) => state.cameraControls.recordVideoSrc
  );
  const camHeartbeat = useSelector(selectCamHeartbeatData);
  const socketError = useSelector(selectSocketError);

  const renderDynamicGridBox = () => {
    if (camHeartbeat?.focus_mode === "ERR") return <ErrorCard />;
    if (showFullCameraControls) {
      return <TopCameraCommandsList />;
    } else {
      return <MiniVideo videoSrc={observerVideoSmallSrc} videoType={"OBS"} />;
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <MiniVideo videoSrc={recordVideoSrc} videoType={"REC"} />
            </Grid>
            <Grid item xs={6}>
              {renderDynamicGridBox()}
            </Grid>
          </Grid>

          <Grid container spacing={0} justify="flex-start" alignItems="center">
            <Grid item xs>
              <Grid container spacing={0}>
                <Grid item>
                  <SelectVideoSource showLabel="horizontal" />
                </Grid>
                <Grid item className={classes.exposureGrid}>
                  <SelectExposureMode showLabel="horizontal" />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Box>
            <NavDataDisplay />
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box mb={1}>
            {socketError ? <SocketErrorChip /> : <ObserverDisplayChip />}
          </Box>
          <Box mb={1}>
            <MetaDataDisplay />
          </Box>
          <Paper className={classes.paper}>
            <UpperRightButtons
              showFullCameraControls={showFullCameraControls}
              setShowFullCameraControls={setShowFullCameraControls}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

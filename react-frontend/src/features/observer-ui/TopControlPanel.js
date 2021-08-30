import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Icon, Box } from "@material-ui/core";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
// local
import ObserverDisplayChip from "./ObserverDisplayChip";
import UpperRightButtons from "./UpperRightButtons";
import NavDataDisplay from "./NavDataDisplay";
import MiniVideos from "./MiniVideos";
import SelectVideoSource from "../camera-controls/SelectVideoSource";
import SelectExposureMode from "../camera-controls/SelectExposureMode";
import SensorDataDisplay from "./SensorDataDisplay";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  infoChip: {
    marginBottom: theme.spacing(1),
    width: "100%"
  }
}));

export default function TopControlPanel({
  showFullCameraControls,
  setShowFullCameraControls
}) {
  const classes = useStyles();

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <MiniVideos showFullCameraControls={showFullCameraControls} />
          <Grid container spacing={2} justify="flex-start" alignItems="center">
            <Grid item xs>
              <Grid container spacing={0}>
                <Grid item>
                  <SelectVideoSource />
                </Grid>
                <Grid item>
                  <SelectExposureMode />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Box>
            <NavDataDisplay />
          </Box>
          <Box mt={1}>
            <SensorDataDisplay />
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box mb={1}>
            <ObserverDisplayChip />
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

import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Icon } from "@material-ui/core";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
// local
import UpperRightBtns from "./UpperRightBtns";
import NavDataDisplay from "./NavDataDisplay";
import MiniVideos from "./MiniVideos";
import SelectVideoSource from "../camera-controls/SelectVideoSource";
import SelectExposureMode from "../camera-controls/SelectExposureMode";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
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
        </Grid>
        <Grid item xs={3}>
          <NavDataDisplay />
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.paper}>
            <UpperRightBtns
              showFullCameraControls={showFullCameraControls}
              setShowFullCameraControls={setShowFullCameraControls}
            />
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={0} justify="flex-start">
        <Grid item>
          <SelectVideoSource />
        </Grid>
        <Grid item>
          <SelectExposureMode />
        </Grid>
      </Grid>
    </>
  );
}

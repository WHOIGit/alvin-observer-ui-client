import React, { useState, Suspense } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import { Typography, Grid, Paper, Icon, Fab } from "@material-ui/core";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
import CameraControlButtons from "./CameraControlButtons";
import LargeVideo from "../camera-controls/LargeVideo";

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#f5f5f5",
    position: "absolute",
    top: 290,
    left: 0,
    width: "100%",
    padding: theme.spacing(2),
    zIndex: 500,
    transition: "all 0.4s"
  },
  rootCollapse: {
    top: "-564px"
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

export default function CameraControls({
  showFullCameraControls,
  setShowFullCameraControls
}) {
  const classes = useStyles();

  return (
    <div
      className={`${classes.root} ${
        showFullCameraControls ? "active" : classes.rootCollapse
      }`}
    >
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <LargeVideo />
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.paper}>
            {showFullCameraControls && <CameraControlButtons />}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

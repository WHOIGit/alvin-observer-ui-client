import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper } from "@material-ui/core";
import CameraControlButtons from "./CameraControlButtons";
import LargeVideo from "../camera-controls/LargeVideo";

const useStyles = makeStyles((theme) => ({
  root: {
    //backgroundColor: "#f5f5f5",
    backgroundColor: "#282c34",
    position: "absolute",
    top: 250,
    left: 0,
    width: "100%",
    padding: theme.spacing(2),
    zIndex: 500,
    transition: "all 0.4s",
  },
  rootCollapse: {
    top: "-524px",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

export default function CameraControls({ showFullCameraControls }) {
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

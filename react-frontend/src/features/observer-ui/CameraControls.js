import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import { Grid, Paper } from "@material-ui/core";
import CameraControlButtons from "./CameraControlButtons";
import LargeVideo from "../camera-controls/LargeVideo";
import ErrorCard from "../camera-controls/ErrorCard";
import { selectCamHeartbeatData } from "../camera-controls/cameraControlsSlice";
const useStyles = makeStyles((theme) => ({
  root: {
    //backgroundColor: "#f5f5f5",
    backgroundColor: "#282c34",
    position: "absolute",
    left: 0,
    width: "100%",
    padding: theme.spacing(2),
    zIndex: 500,
    transition: "all 0.4s",
    userSelect: "none",
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
  const camHeartbeat = useSelector(selectCamHeartbeatData);

  if (!showFullCameraControls) return null;

  return (
    <div
      className={`${classes.root} ${
        showFullCameraControls ? "active" : classes.rootCollapse
      }`}
    >
      <Grid container spacing={2}>
        <Grid item xs={9}>
          {camHeartbeat?.focus_mode === "ERR" ? <ErrorCard /> : <LargeVideo />}
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

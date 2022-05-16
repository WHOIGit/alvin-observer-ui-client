import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
// local
import { selectCamHeartbeatData } from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles((theme) => ({
  table: {
    width: "100%",
  },
}));

export default function NavDataDisplay() {
  const classes = useStyles();
  const camSettings = useSelector(selectCamHeartbeatData);

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        Pilot Imaging UI for Alvin {camSettings?.version}
      </Grid>
      <Grid item xs={3}>
        Cruise: {camSettings?.cruise}
      </Grid>
      <Grid item xs={3}>
        Dive: {camSettings?.dive}
      </Grid>
    </Grid>
  );
}

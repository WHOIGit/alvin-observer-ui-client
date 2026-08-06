import React from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Grid } from "@mui/material";
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
        {camSettings && ` Alvin Pilot Imaging UI ${camSettings?.version}`}
      </Grid>
      <Grid item xs={3}>
        Exp: {camSettings?.cruise}
      </Grid>
      <Grid item xs={3}>
        Dive: {camSettings?.dive}
      </Grid>
    </Grid>
  );
}

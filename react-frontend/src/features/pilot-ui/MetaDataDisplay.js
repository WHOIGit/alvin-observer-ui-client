import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
// local
import {
  selectCamHeartbeatData,
  selectSocketError,
} from "../camera-controls/cameraControlsSlice";
import SocketErrorChip from "../observer-ui/SocketErrorChip";

const useStyles = makeStyles((theme) => ({
  table: {
    width: "100%",
  },
}));

export default function NavDataDisplay() {
  const classes = useStyles();
  const camSettings = useSelector(selectCamHeartbeatData);
  const socketError = useSelector(selectSocketError);

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        {socketError && <SocketErrorChip />}
        {camSettings && ` Alvin Pilot Imaging UI {camSettings?.version}`}
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

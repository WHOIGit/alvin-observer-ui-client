import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
// local
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { SENSOR_HEARTBEAT } from "../../config.js";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    paddingLeft: theme.spacing(1)
  }
}));

export default function SensorDataDisplay() {
  const classes = useStyles();
  const { messages, sendMessage } = useCameraWebSocket(SENSOR_HEARTBEAT);
  if (messages === null) {
    return null;
  }
  return (
    <Paper className={classes.root}>
      <Grid container spacing={1} justify="center" alignItems="center">
        <Grid item xs>
          T1: {messages.t1} &deg;
        </Grid>
        <Grid item xs>
          T2: {messages.t2} &deg;
        </Grid>
        <Grid item xs>
          T3: {messages.t3} &deg;
        </Grid>
      </Grid>
    </Paper>
  );
}

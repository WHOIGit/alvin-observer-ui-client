import React from "react";
import { Grid } from "@material-ui/core";
// local
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { SENSOR_HEARTBEAT } from "../../config.js";

export default function SensorDataDisplay() {
  const { messages } = useCameraWebSocket(SENSOR_HEARTBEAT);
  if (messages === null) {
    return null;
  }
  return (
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
  );
}

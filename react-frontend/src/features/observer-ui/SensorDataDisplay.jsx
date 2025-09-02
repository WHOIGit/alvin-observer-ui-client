import React from "react";
import { Grid } from "@material-ui/core";
// local
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { SENSOR_HEARTBEAT } from "../../config.js";

export default function SensorDataDisplay() {
  const { messages } = useCameraWebSocket(SENSOR_HEARTBEAT);

  return (
    <Grid container spacing={1} justify="center" alignItems="center">
      <Grid item xs>
        T1: {messages ? messages?.t1 : "na"} &deg;
      </Grid>
      <Grid item xs>
        T2: {messages ? messages?.t2 : "na"} &deg;
      </Grid>
      <Grid item xs>
        T3: {messages ? messages?.t3 : "na"} &deg;
      </Grid>
    </Grid>
  );
}

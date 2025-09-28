import React from "react";
import { useSelector } from "react-redux";
import { Grid } from "@mui/material";
// local
import { useSocketListener } from "../../hooks/useSocket";
import { SENSOR_HEARTBEAT } from "../../config.js";
import { selectWebSocketUserNamespace } from "../camera-controls/cameraControlsSlice";

export default function SensorDataDisplay() {
  const userNs = useSelector(selectWebSocketUserNamespace);
  const { lastMessage } = useSocketListener(`/${userNs}`, SENSOR_HEARTBEAT);

  return (
    <Grid container spacing={1} justifyContent="center" alignItems="center">
      <Grid item xs>
        T1: {lastMessage ? lastMessage?.t1 : "na"} &deg;
      </Grid>
      <Grid item xs>
        T2: {lastMessage ? lastMessage?.t2 : "na"} &deg;
      </Grid>
      <Grid item xs>
        T3: {lastMessage ? lastMessage?.t3 : "na"} &deg;
      </Grid>
    </Grid>
  );
}

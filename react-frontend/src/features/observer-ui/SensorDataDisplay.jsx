import React from "react";
import { useSelector } from "react-redux";
import { Grid } from "@mui/material";
// local
import { useSocketListener } from "../../hooks/useSocket";
import { SENSOR_HEARTBEAT } from "../../config.js";
import { selectObserverSide } from "../camera-controls/cameraControlsSlice";
import { observerSideToNamespacePath } from "../../utils/observerSide";

export default function SensorDataDisplay() {
  const observerSide = useSelector(selectObserverSide);
  const namespacePath = observerSideToNamespacePath(observerSide);
  const { lastMessage } = useSocketListener(namespacePath, SENSOR_HEARTBEAT);

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

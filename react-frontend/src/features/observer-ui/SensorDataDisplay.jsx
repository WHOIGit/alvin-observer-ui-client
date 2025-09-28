import React, { useCallback, useState } from "react";
import { Grid } from "@mui/material";
// local
import { useSocketListener } from "../../hooks/useSocket";
import { SENSOR_HEARTBEAT } from "../../config.js";

export default function SensorDataDisplay() {
  const [lastMessage, setLastMessage] = useState(null);

  const handleMessage = useCallback((message) => {
    setLastMessage(message);
  }, []);

  useSocketListener("/", SENSOR_HEARTBEAT, handleMessage);

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

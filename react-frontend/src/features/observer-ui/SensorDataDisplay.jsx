import React, { useCallback, useState } from "react";
import { Grid } from "@mui/material";
// local
import { useSensorHeartbeat } from "../../hooks/useImagingClient";


export default function SensorDataDisplay() {
  const [lastMessage, setLastMessage] = useState(null);

  const handleMessage = useCallback((message) => {
    setLastMessage(message);
  }, []);

  useSensorHeartbeat(handleMessage);

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

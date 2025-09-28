import React, { useCallback, useState } from "react";
import makeStyles from '@mui/styles/makeStyles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Grid,
} from "@mui/material";
// local
import { useSocketListener } from "../../hooks/useSocket";
import SensorDataDisplay from "./SensorDataDisplay";
import { NAV_HEARTBEAT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  table: {
    width: "100%",
  },
}));

export default function NavDataDisplay() {
  const classes = useStyles();
  const [lastMessage, setLastMessage] = useState(null);

  const handleMessage = useCallback((message) => {
    setLastMessage(message);
  }, []);

  useSocketListener("/", NAV_HEARTBEAT, handleMessage);

  return (
    <div>
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="Nav Data">
          <TableBody>
            <TableRow key="alt">
              <TableCell component="th" scope="row">
                Altitude
              </TableCell>
              <TableCell align="right">
                {lastMessage ? lastMessage.alt : "na"} m
              </TableCell>
            </TableRow>
            <TableRow key="dep">
              <TableCell component="th" scope="row">
                Depth
              </TableCell>
              <TableCell align="right">
                {lastMessage ? lastMessage.dep : "na"} m
              </TableCell>
            </TableRow>
            <TableRow key="hdg">
              <TableCell component="th" scope="row">
                Heading
              </TableCell>
              <TableCell align="right">
                {lastMessage ? lastMessage.hdg : "na"} &deg;
              </TableCell>
            </TableRow>
            <TableRow key="lat">
              <TableCell component="th" scope="row">
                Lat
              </TableCell>
              <TableCell align="right">
                {lastMessage ? lastMessage.lat : "na"}
              </TableCell>
            </TableRow>
            <TableRow key="lon">
              <TableCell component="th" scope="row">
                Lon
              </TableCell>
              <TableCell align="right">
                {lastMessage ? lastMessage.lon : "na"}
              </TableCell>
            </TableRow>
            <TableRow key="x-y">
              <TableCell component="th" scope="row">
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    X:
                  </Grid>
                  <Grid item xs={9}>
                    {lastMessage ? lastMessage.x : "na"}
                  </Grid>
                </Grid>
              </TableCell>
              <TableCell>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    Y:
                  </Grid>
                  <Grid item xs={9}>
                    {lastMessage ? lastMessage.y : "na"}
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>
            <TableRow key="temp">
              <TableCell component="th" scope="row" colSpan={2}>
                <SensorDataDisplay />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

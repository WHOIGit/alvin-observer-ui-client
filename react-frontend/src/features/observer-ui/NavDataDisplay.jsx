import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Grid,
} from "@material-ui/core";
// local
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import SensorDataDisplay from "./SensorDataDisplay";
import { NAV_HEARTBEAT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  table: {
    width: "100%",
  },
}));

export default function NavDataDisplay() {
  const classes = useStyles();
  const { messages } = useCameraWebSocket(NAV_HEARTBEAT);

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
                {messages ? messages.alt : "na"} m
              </TableCell>
            </TableRow>
            <TableRow key="dep">
              <TableCell component="th" scope="row">
                Depth
              </TableCell>
              <TableCell align="right">
                {messages ? messages?.dep : "na"} m
              </TableCell>
            </TableRow>
            <TableRow key="hdg">
              <TableCell component="th" scope="row">
                Heading
              </TableCell>
              <TableCell align="right">
                {messages ? messages?.hdg : "na"} &deg;
              </TableCell>
            </TableRow>
            <TableRow key="lat">
              <TableCell component="th" scope="row">
                Lat
              </TableCell>
              <TableCell align="right">
                {messages ? messages?.lat : "na"}
              </TableCell>
            </TableRow>
            <TableRow key="lon">
              <TableCell component="th" scope="row">
                Lon
              </TableCell>
              <TableCell align="right">
                {messages ? messages?.lon : "na"}
              </TableCell>
            </TableRow>
            <TableRow key="x-y">
              <TableCell component="th" scope="row">
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    X:
                  </Grid>
                  <Grid item xs={9}>
                    {messages ? messages?.x : "na"}
                  </Grid>
                </Grid>
              </TableCell>
              <TableCell>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    Y:
                  </Grid>
                  <Grid item xs={9}>
                    {messages ? messages?.y : "na"}
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

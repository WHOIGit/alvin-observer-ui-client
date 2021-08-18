import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
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
    position: "relative"
  }
}));

export default function SensorDataDisplay() {
  const classes = useStyles();
  const { messages, sendMessage } = useCameraWebSocket(SENSOR_HEARTBEAT);
  if (messages === null) {
    return null;
  }
  return (
    <div className={classes.root}>
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="Sensor Data">
          <TableBody>
            <TableRow key="alt">
              <TableCell component="th" scope="row">
                Temp. Data
              </TableCell>
              <TableCell align="right">T1: {messages.t1} &deg;</TableCell>
              <TableCell align="right">T2: {messages.t2} &deg;</TableCell>
              <TableCell align="right">T3: {messages.t3} &deg;</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

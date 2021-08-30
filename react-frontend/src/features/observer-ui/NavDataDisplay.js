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
import { NAV_HEARTBEAT, CAM_HEARTBEAT } from "../../config.js";

const useStyles = makeStyles(theme => ({
  root: {
    height: "179px",
    backgroundColor: "#f5f5f5"
  },
  table: {
    width: "100%"
  }
}));

export default function NavDataDisplay() {
  const classes = useStyles();
  const { messages, sendMessage } = useCameraWebSocket(NAV_HEARTBEAT);

  if (messages === null) {
    return null;
  }
  return (
    <div className={classes.root}>
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="Nav Data">
          <TableBody>
            <TableRow key="alt">
              <TableCell component="th" scope="row">
                Altitude
              </TableCell>
              <TableCell align="right">{messages.alt} m</TableCell>
            </TableRow>
            <TableRow key="dep">
              <TableCell component="th" scope="row">
                Depth
              </TableCell>
              <TableCell align="right">{messages.dep} m</TableCell>
            </TableRow>
            <TableRow key="hdg">
              <TableCell component="th" scope="row">
                Heading
              </TableCell>
              <TableCell align="right">{messages.hdg} &deg;</TableCell>
            </TableRow>
            <TableRow key="lat">
              <TableCell component="th" scope="row">
                Lat
              </TableCell>
              <TableCell align="right">{messages.lat}</TableCell>
            </TableRow>
            <TableRow key="lon">
              <TableCell component="th" scope="row">
                Lon
              </TableCell>
              <TableCell align="right">{messages.lon}</TableCell>
            </TableRow>
            <TableRow key="x">
              <TableCell component="th" scope="row">
                X
              </TableCell>
              <TableCell align="right">{messages.x}</TableCell>
            </TableRow>
            <TableRow key="y">
              <TableCell component="th" scope="row">
                Y
              </TableCell>
              <TableCell align="right">{messages.y}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

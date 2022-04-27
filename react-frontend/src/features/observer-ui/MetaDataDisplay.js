import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@material-ui/core";
// local
import { selectCamHeartbeatData } from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles((theme) => ({
  table: {
    width: "100%",
  },
}));

export default function NavDataDisplay() {
  const classes = useStyles();
  const camSettings = useSelector(selectCamHeartbeatData);

  if (camSettings === null) {
    return null;
  }
  return (
    <div>
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="Nav Data">
          <TableBody>
            <TableRow key="version">
              <TableCell component="th" scope="row">
                Observer Imaging UI for Alvin {camSettings.version}
              </TableCell>
            </TableRow>

            <TableRow key="x-y">
              <TableCell component="th" scope="row">
                Cruise: {camSettings.cruise}
              </TableCell>
              <TableCell>Dive: {camSettings.dive}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

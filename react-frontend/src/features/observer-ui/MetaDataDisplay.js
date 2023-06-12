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
  Grid,
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
  console.log(camSettings);
  if (camSettings === null) {
    return null;
  }
  return (
    <div>
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="Nav Data">
          <TableBody>
            <TableRow key="version">
              <TableCell scope="row">
                Alvin Obs Imaging UI {camSettings.version}
              </TableCell>
            </TableRow>

            <TableRow key="cruise">
              <TableCell scope="row">
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    Exp: {camSettings.cruise}
                  </Grid>
                  <Grid item xs={6}>
                    Dive: {camSettings.dive}
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

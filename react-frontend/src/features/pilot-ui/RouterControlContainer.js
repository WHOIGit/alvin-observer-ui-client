import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Icon } from "@material-ui/core";
// local
import RouterControls from "./RouterControls";
const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

export default function RouterControlContainer() {
  const classes = useStyles();

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          Grid 1
        </Grid>
        <Grid item xs={3}>
          Grid 2
        </Grid>
        <Grid item xs={4}>
          Grid 3
        </Grid>
      </Grid>

      <RouterControls />
    </>
  );
}

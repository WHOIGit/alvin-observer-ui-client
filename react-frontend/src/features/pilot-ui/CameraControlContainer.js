import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Icon, List, ListItem } from "@material-ui/core";
// local
import LargeVideo from "../camera-controls/LargeVideo";
import SelectVideoSource from "../camera-controls/SelectVideoSource";
import SelectShutterMode from "../camera-controls/SelectShutterMode";
import SelectIrisMode from "../camera-controls/SelectIrisMode";
import SelectIsoMode from "../camera-controls/SelectIsoMode";
import SelectExposureMode from "../camera-controls/SelectExposureMode";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

export default function CameraControlContainer() {
  const classes = useStyles();

  return (
    <>
      <Grid container spacing={2} justify="flex-start" alignItems="center">
        <Grid item xs={6}>
          <SelectVideoSource />
        </Grid>

        <Grid item xs={6}>
          Recording Status
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={9}>
          <LargeVideo />
        </Grid>
        <Grid item xs={3}>
          <List>
            <ListItem>
              <SelectShutterMode />
            </ListItem>
            <ListItem>
              <SelectIrisMode />
            </ListItem>
            <ListItem>
              <SelectIsoMode />
            </ListItem>
            <ListItem>
              <SelectExposureMode />
            </ListItem>
          </List>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs>
          Grid 1
        </Grid>
        <Grid item xs>
          Grid 2
        </Grid>
        <Grid item xs>
          Grid 3
        </Grid>
        <Grid item xs>
          Grid 4
        </Grid>
      </Grid>
    </>
  );
}

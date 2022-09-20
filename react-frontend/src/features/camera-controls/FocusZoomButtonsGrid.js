import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { COMMAND_STRINGS } from "../../config.js";
import FocusZoomButton from "./FocusZoomButton";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
  },
}));

export default function FocusZoomButtons() {
  const classes = useStyles();

  return (
    <Grid container spacing={1} className={classes.root}>
      <Grid item xs={6}>
        <FocusZoomButton
          buttonFunction="focus"
          label="Near"
          commandStringControl={COMMAND_STRINGS.focusControlCommand}
          commandStringOneStop={COMMAND_STRINGS.focusNearOneStop}
          commandStringContinuous={COMMAND_STRINGS.focusNearContinuos}
        />
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
          buttonFunction="zoom"
          label="Tele"
          commandStringControl={COMMAND_STRINGS.zoomControlCommand}
          commandStringOneStop={COMMAND_STRINGS.zoomNearOneStop}
          commandStringContinuous={COMMAND_STRINGS.zoomNearContinuos}
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="overline" gutterBottom>
          Focus
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="overline" gutterBottom>
          Zoom
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
          buttonFunction="focus"
          label="Far"
          commandStringControl={COMMAND_STRINGS.focusControlCommand}
          commandStringOneStop={COMMAND_STRINGS.focusFarOneStop}
          commandStringContinuous={COMMAND_STRINGS.focusFarContinuos}
        />
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
          buttonFunction="zoom"
          label="Wide"
          commandStringControl={COMMAND_STRINGS.zoomControlCommand}
          commandStringOneStop={COMMAND_STRINGS.zoomFarOneStop}
          commandStringContinuous={COMMAND_STRINGS.zoomFarContinuos}
        />
      </Grid>
    </Grid>
  );
}

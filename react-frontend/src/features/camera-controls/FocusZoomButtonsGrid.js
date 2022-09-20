import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";
import FocusZoomButton from "./FocusZoomButton";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
  },
}));

export default function FocusZoomButtons() {
  const classes = useStyles();
  const camSettings = useSelector(selectCamHeartbeatData);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // set enabled status from camSettings.focus_mode
    // if AUTO focus, disable
    if (camSettings && camSettings.focus_mode === "AF") {
      setIsEnabled(false);
    } else {
      setIsEnabled(true);
    }
  }, [camSettings]);

  return (
    <Grid container spacing={1} className={classes.root}>
      <Grid item xs={6}>
        <FocusZoomButton
          label="Near"
          commandStringControl={COMMAND_STRINGS.focusControlCommand}
          commandStringOneStop={COMMAND_STRINGS.focusNearOneStop}
          commandStringContinuous={COMMAND_STRINGS.focusNearContinuos}
        />
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
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
          label="Far"
          commandStringControl={COMMAND_STRINGS.focusControlCommand}
          commandStringOneStop={COMMAND_STRINGS.focusFarOneStop}
          commandStringContinuous={COMMAND_STRINGS.focusFarContinuos}
        />
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
          label="Wide"
          commandStringControl={COMMAND_STRINGS.zoomControlCommand}
          commandStringOneStop={COMMAND_STRINGS.zoomFarOneStop}
          commandStringContinuous={COMMAND_STRINGS.zoomFarContinuos}
        />
      </Grid>
    </Grid>
  );
}

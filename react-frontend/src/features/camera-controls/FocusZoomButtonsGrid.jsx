import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Grid, Typography } from "@mui/material";
import { COMMAND_STRINGS } from "../../config.js";
import FocusZoomButton from "./FocusZoomButton";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
  },
}));



export default function FocusZoomButtons() {
  const classes = useStyles();
  
  // track the active button so the others can be blocked while it is held
  const [activeFocusZoomButton, setActiveFocusZoomButton] = React.useState(null);
  function handleActiveFocusZoomButton(buttonID, activeButton) {
    if ((buttonID === activeButton) && (activeFocusZoomButton !== activeButton)) {
      setActiveFocusZoomButton(activeButton);
    } else {
      if ((buttonID === activeFocusZoomButton) && (activeButton === null)) {
        setActiveFocusZoomButton(activeButton);
      }
    }
  };
  
  return (
    <Grid container spacing={1} className={classes.root}>
      <Grid item xs={6}>
        <FocusZoomButton 
          id="focusNear"
          buttonFunction="focus"
          label="Near"
          commandStringControl={COMMAND_STRINGS.focusControlCommand}
          commandStringOneStop={COMMAND_STRINGS.focusNearOneStop}
          commandStringContinuous={COMMAND_STRINGS.focusNearContinuos}
          activeFocusZoomButton={activeFocusZoomButton} //25oct2024-mjs
          sendActiveFocusZoomButtonToParent={handleActiveFocusZoomButton} //25oct2024-mjs
        />
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
          id="zoomTele"
          buttonFunction="zoom"
          label="Tele"
          commandStringControl={COMMAND_STRINGS.zoomControlCommand}
          commandStringOneStop={COMMAND_STRINGS.zoomNearOneStop}
          commandStringContinuous={COMMAND_STRINGS.zoomNearContinuos + ":" + "3"}
          activeFocusZoomButton={activeFocusZoomButton} //25oct2024-mjs
          sendActiveFocusZoomButtonToParent={handleActiveFocusZoomButton} //25oct2024-mjs
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
          id="focusFar"
          buttonFunction="focus"
          label="Far"
          commandStringControl={COMMAND_STRINGS.focusControlCommand}
          commandStringOneStop={COMMAND_STRINGS.focusFarOneStop}
          commandStringContinuous={COMMAND_STRINGS.focusFarContinuos}
          activeFocusZoomButton={activeFocusZoomButton} //25oct2024-mjs
          sendActiveFocusZoomButtonToParent={handleActiveFocusZoomButton} //25oct2024-mjs
        />
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
          id="zoomWide"
          buttonFunction="zoom"
          label="Wide"
          commandStringControl={COMMAND_STRINGS.zoomControlCommand}
          commandStringOneStop={COMMAND_STRINGS.zoomFarOneStop}
          commandStringContinuous={COMMAND_STRINGS.zoomFarContinuos + ":" + "3"}
          activeFocusZoomButton={activeFocusZoomButton} //25oct2024-mjs
          sendActiveFocusZoomButtonToParent={handleActiveFocusZoomButton} //25oct2024-mjs
        />
      </Grid>
    </Grid>
  );
}

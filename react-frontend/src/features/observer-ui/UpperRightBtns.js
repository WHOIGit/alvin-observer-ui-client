import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import { Grid, Button } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
// local imports
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";
import CaptureButtons from "../camera-controls/CaptureButtons";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  camButton: {
    width: "100%",
    fontSize: ".9em"
  },
  ctrlButton: {
    width: "100%",
    fontSize: ".7em"
  }
}));

export default function ControlButtons({
  showFullCameraControls,
  setShowFullCameraControls
}) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              showFullCameraControls ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            className={classes.camButton}
            onClick={() => setShowFullCameraControls(!showFullCameraControls)}
          >
            Goto {showFullCameraControls ? "SEALOG" : "Cam Control"}
          </Button>
        </Grid>
        <CaptureButtons />
      </Grid>
    </div>
  );
}

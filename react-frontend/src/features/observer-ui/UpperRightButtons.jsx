import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Grid, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// local imports
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

export default function UpperRightButtons({
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
            {showFullCameraControls ? "HIDE CAMERA CONTROL" : "SHOW CAMERA CONTROL"}
          </Button>
        </Grid>
        <CaptureButtons />
      </Grid>
    </div>
  );
}

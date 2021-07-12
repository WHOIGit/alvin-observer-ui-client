import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import { Grid, Button } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

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
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            className={classes.ctrlButton}
          >
            Still Img Capture
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            className={classes.ctrlButton}
          >
            Event <br />
            Trigger
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            className={classes.ctrlButton}
          >
            Quick <br /> Clip
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            className={classes.ctrlButton}
          >
            Record Source
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

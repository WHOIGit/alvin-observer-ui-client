import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import { Grid, Paper, Icon, Fab } from "@material-ui/core";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
import ControlButtons from "./ControlButtons";
import NavOverlayData from "./NavOverlayData";
import CameraControls from "../camera-controls/CameraControls";
import MiniVideos from "./MiniVideos";
import SelectVideoSource from "./SelectVideoSource";
import SelectExposureMode from "./SelectExposureMode";

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#f5f5f5",
    position: "relative",
    marginTop: 0,
    paddingBottom: 0,
    width: "100%",
    padding: theme.spacing(2),
    zIndex: 1000,
    transition: "all 0.4s",
    minHeight: "290px"
  },
  rootCollapse: {
    marginTop: "-290px",
    height: 0
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  toggleButton: {
    position: "absolute",
    bottom: -Math.abs(theme.spacing(8)),
    right: theme.spacing(2),
    zIndex: 2000,
    transition: "all 0.4s"
  },
  toggleButtonOff: {
    bottom: "-500px"
  },
  extendedIcon: {
    marginRight: theme.spacing(1)
  }
}));

export default function ObserverUI() {
  const classes = useStyles();
  //const socket = useContext(WebSocketContext);
  const [showTopControls, setShowTopControls] = useState(false);
  const [showFullCameraControls, setShowFullCameraControls] = useState(false);

  const handleControlToggle = () => {
    // close CameraControls if we're hiding panels
    if (showTopControls) {
      setShowFullCameraControls(false);
    }
    setShowTopControls(!showTopControls);
  };

  return (
    <>
      <div
        className={`${classes.root} ${
          showTopControls ? "active" : classes.rootCollapse
        }`}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <MiniVideos showFullCameraControls={showFullCameraControls} />
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <NavOverlayData />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <ControlButtons
                showFullCameraControls={showFullCameraControls}
                setShowFullCameraControls={setShowFullCameraControls}
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={0} justify="flex-start">
          <Grid item>
            <SelectVideoSource showTopControls={showTopControls} />
          </Grid>
          <Grid item>
            <SelectExposureMode showTopControls={showTopControls} />
          </Grid>
        </Grid>

        <Fab
          variant="extended"
          color="primary"
          className={`${classes.toggleButton} ${
            showFullCameraControls ? classes.toggleButtonOff : "camera-off"
          }`}
          onClick={() => handleControlToggle()}
        >
          <CameraAltIcon className={classes.extendedIcon} />
          {showTopControls ? "Hide" : "Show"} Camera
        </Fab>
      </div>
      <CameraControls showFullCameraControls={showFullCameraControls} />
    </>
  );
}

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import { Grid, Paper, Icon, Fab } from "@material-ui/core";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
import CameraControls from "../camera-controls/CameraControls";
import ObserverSideSelect from "./ObserverSideSelect";
import ObserverUI from "./ObserverUI";
import { selectObserverSide } from "../camera-controls/cameraControlsSlice";

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

export default function ObserverUIContainer() {
  const classes = useStyles();
  const observerSide = useSelector(selectObserverSide);
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
        {/* force user to choose ObserverSide if not set */}
        {!observerSide ? (
          <ObserverSideSelect />
        ) : (
          <ObserverUI
            showFullCameraControls={showFullCameraControls}
            setShowFullCameraControls={setShowFullCameraControls}
          />
        )}

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

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import CameraControls from "./CameraControls";
import ObserverSideSelect from "./ObserverSideSelect";
import ObserverUI from "./ObserverUI";
import { selectObserverSide } from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#282c34",
    position: "relative",
    marginTop: 0,
    paddingBottom: 0,
    width: "100%",
    padding: theme.spacing(2),
    zIndex: 1000,
    transition: "all 0.4s",
    minHeight: "250px",
  },
  rootCollapse: {
    marginTop: "-250px",
    height: 0,
  },
  toggleButton: {
    position: "absolute",
    bottom: -Math.abs(theme.spacing(6)),
    right: theme.spacing(2),
    zIndex: 2000,
    transition: "all 0.4s",
  },
  toggleButtonOff: {
    bottom: "-500px",
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
}));

export default function ObserverUIContainer() {
  const classes = useStyles();
  const observerSide = useSelector(selectObserverSide);
  const [showTopControls, setShowTopControls] = useState(false);
  const [showFullCameraControls, setShowFullCameraControls] = useState(false);
  console.log("OBERSERV UI comp.");

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
          <>
            <ObserverSideSelect />
          </>
        ) : (
          <ObserverUI
            showFullCameraControls={showFullCameraControls}
            setShowFullCameraControls={setShowFullCameraControls}
          />
        )}

        <Fab
          variant="extended"
          color="primary"
          size="medium"
          className={`${classes.toggleButton} ${
            showFullCameraControls ? classes.toggleButtonOff : "camera-off"
          }`}
          onClick={() => handleControlToggle()}
        >
          <CameraAltIcon className={classes.extendedIcon} />
          {showTopControls ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </Fab>
      </div>
      <CameraControls showFullCameraControls={showFullCameraControls} />
    </>
  );
}

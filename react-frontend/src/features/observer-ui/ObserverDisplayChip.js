import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Chip } from "@material-ui/core";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";
// local
import { selectObserverSide } from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles(theme => ({
  chip: {
    width: "100%",
    color: "white",
    backgroundColor: theme.palette.success.main
  }
}));

export default function ObserverDisplayChip({}) {
  const classes = useStyles();
  const observerSide = useSelector(selectObserverSide);

  if (observerSide === null) {
    return null;
  }

  const label = `OBSERVER SIDE: ${observerSide}`;

  return <Chip label={label} className={classes.chip} color="primary" />;
}

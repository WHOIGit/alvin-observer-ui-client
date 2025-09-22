import React from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Chip } from "@mui/material";
// local
import { selectObserverSide } from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles(theme => ({
  chip: {
    width: "100%",
    color: "white",
    backgroundColor: theme.palette.success.main
  }
}));

export default function ObserverDisplayChip() {
  const classes = useStyles();
  const observerSide = useSelector(selectObserverSide);
  let label;
  if (observerSide === null) {
    return null;
  } else if (observerSide === "P") {
    label = "OBSERVER SIDE: PORT";
  } else if (observerSide === "S") {
    label = "OBSERVER SIDE: STBD";
  }

  return <Chip label={label} className={classes.chip} color="primary" />;
}

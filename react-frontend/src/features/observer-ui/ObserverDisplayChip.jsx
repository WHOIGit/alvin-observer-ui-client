import React from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Chip } from "@mui/material";
// local
import { selectOwnStationId } from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles(theme => ({
  chip: {
    width: "100%",
    color: "white",
    backgroundColor: theme.palette.success.main
  }
}));

export default function ObserverDisplayChip() {
  const classes = useStyles();
  const ownStationId = useSelector(selectOwnStationId);
  let label;
  if (ownStationId === null) {
    return null;
  } else if (ownStationId === "P") {
    label = "PORT OBSERVER";
  } else if (ownStationId === "S") {
    label = "STBD OBSERVER";
  }

  return <Chip label={label} className={classes.chip} color="primary" />;
}

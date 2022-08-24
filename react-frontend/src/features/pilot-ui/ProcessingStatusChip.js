import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { green, red } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import Chip from "@material-ui/core/Chip";
import DoneIcon from "@material-ui/icons/Done";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
// local imports
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { RECORDER_HEARTBEAT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    textAlign: "center",
    marginTop: "-50px",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  chipOn: {
    backgroundColor: green[600],
  },
  chipOff: {
    backgroundColor: red[600],
  },
}));

export default function ProcessingStatusChip() {
  const classes = useStyles();
  const { messages } = useCameraWebSocket(RECORDER_HEARTBEAT);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);

  const chipStyle = clsx({
    [classes.chipOn]: isProcessingComplete, //only when condition === true
    [classes.chipOff]: !isProcessingComplete, //only when condition === false
  });

  useEffect(() => {
    if (messages?.processing_complete == "true") {
      setIsProcessingComplete(true);
    } else {
      setIsProcessingComplete(false);
    }
  }, [messages]);
  return (
    <div className={classes.root}>
      <Chip
        icon={isProcessingComplete ? <DoneIcon /> : <HourglassEmptyIcon />}
        label={isProcessingComplete ? "Processing Complete" : "Processing..."}
        color="default"
        className={chipStyle}
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { green, red } from "@mui/material/colors";
import makeStyles from '@mui/styles/makeStyles';
import Chip from "@mui/material/Chip";
import DoneIcon from "@mui/icons-material/Done";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
// local imports
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { RECORDER_HEARTBEAT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "absolute",
    marginTop: "-50px",
    left: "50%",
    transform: "translate(-50%, 0)",
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
    if (messages?.processing_complete === "true") {
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

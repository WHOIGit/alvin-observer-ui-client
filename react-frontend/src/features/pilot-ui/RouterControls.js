import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Icon, Button, Box } from "@material-ui/core";
import { blue, green } from "@material-ui/core/colors";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
// local
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS, NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles(theme => ({
  box: {
    textAlign: "center"
  },
  ctrlButton: {
    width: "100%",
    fontSize: ".7em"
  },
  outputButton: {
    color: "white",
    backgroundColor: blue[500],
    "&:hover": {
      backgroundColor: blue[800]
    }
  },
  activeButton: {
    backgroundColor: theme.palette.secondary.main
  },
  takeButton: {
    color: "white",
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[800]
    }
  }
}));

export default function RouterControls({
  showFullCameraControls,
  setShowFullCameraControls
}) {
  const classes = useStyles();
  const ioValues = Array(16)
    .fill()
    .map((_, i) => i + 1);
  const [inputValue, setInputValue] = useState(null);
  const [outputValue, setOutputValue] = useState(null);
  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );
  // disable Take button until both values have been selected
  const disabled = !inputValue || !outputValue;

  const handleSendMessage = () => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.routerIOCommand,
        value: { input: inputValue, output: outputValue }
      }
    };
    sendMessage(payload);
    // reset local values
    setInputValue(null);
    setOutputValue(null);
  };

  const resetValues = () => {
    setInputValue(null);
    setOutputValue(null);
  };

  const renderInputBtns = value => {
    const activeBtn = value === inputValue;
    const btnStyle = clsx({
      [classes.ctrlButton]: true, //always applies
      [classes.activeButton]: activeBtn //only when open === true
    });

    return (
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={btnStyle}
          onClick={() => setInputValue(value)}
        >
          Input {value}
        </Button>
      </Grid>
    );
  };

  const renderOutputBtns = value => {
    const activeBtn = value === outputValue;
    const btnStyle = clsx({
      [classes.ctrlButton]: true, //always applies
      [classes.outputButton]: true, //always applies
      [classes.activeButton]: activeBtn //only when open === true
    });

    return (
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={btnStyle}
          onClick={() => setOutputValue(value)}
        >
          Output {value}
        </Button>
      </Grid>
    );
  };

  return (
    <>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={6}>
          <Grid container spacing={1}>
            {ioValues.map(value => renderInputBtns(value))}
          </Grid>

          <Box className={classes.box} mt={2}>
            <Button
              variant="contained"
              color="inherit"
              onClick={() => resetValues()}
            >
              CANCEL
            </Button>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={1}>
            {ioValues.map(value => renderOutputBtns(value))}
          </Grid>

          <Box className={classes.box} mt={2}>
            <Button
              variant="contained"
              color="default"
              disabled={disabled}
              className={classes.takeButton}
              onClick={() => handleSendMessage()}
            >
              TAKE
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

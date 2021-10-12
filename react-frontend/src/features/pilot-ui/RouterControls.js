import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, Box } from "@material-ui/core";
import { blue, green, deepOrange } from "@material-ui/core/colors";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
// local
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import {
  COMMAND_STRINGS,
  NEW_CAMERA_COMMAND_EVENT,
  ROUTER_INPUTS,
  ROUTER_OUTPUTS,
} from "../../config.js";

const useStyles = makeStyles((theme) => ({
  box: {
    textAlign: "center",
  },
  ctrlButton: {
    width: "100%",
    fontSize: ".7em",
  },
  outputButton: {
    color: "white",
    backgroundColor: blue[500],
    "&:hover": {
      backgroundColor: blue[800],
    },
  },
  activeButton: {
    backgroundColor: deepOrange[500] + " !important",
  },
  takeButton: {
    color: "white",
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[800],
    },
  },
}));

export default function RouterControls() {
  const classes = useStyles();

  const [inputValue, setInputValue] = useState(null);
  const [outputValue, setOutputValue] = useState(null);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  // disable Take button until both values have been selected
  const disabled = !inputValue || !outputValue;
  console.log(inputValue);
  const handleSendMessage = () => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.routerIOCommand,
        value: { input: inputValue, output: outputValue },
      },
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

  const renderInputBtns = (item) => {
    const activeBtn = item.value === inputValue;
    console.log(activeBtn);
    const btnStyle = clsx({
      [classes.ctrlButton]: true, //always applies
      [classes.activeButton]: activeBtn, //only when open === true
    });

    return (
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={btnStyle}
          onClick={() => setInputValue(item.value)}
        >
          {item.label}
        </Button>
      </Grid>
    );
  };

  const renderOutputBtns = (item) => {
    const activeBtn = item.value === outputValue;
    const btnStyle = clsx({
      [classes.ctrlButton]: true, //always applies
      [classes.outputButton]: true, //always applies
      [classes.activeButton]: activeBtn, //only when open === true
    });

    return (
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={btnStyle}
          onClick={() => setOutputValue(item.value)}
        >
          {item.label}
        </Button>
      </Grid>
    );
  };

  return (
    <>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={6}>
          <Grid container spacing={1}>
            {ROUTER_INPUTS.map((item) => renderInputBtns(item))}
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
            {ROUTER_OUTPUTS.map((item) => renderOutputBtns(item))}
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

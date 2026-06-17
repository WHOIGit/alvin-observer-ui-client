import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import makeStyles from '@mui/styles/makeStyles';
import { Grid, Button, Box, CircularProgress } from "@mui/material";
import { blue, green, red, deepOrange } from "@mui/material/colors";
import DoneIcon from "@mui/icons-material/Done";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
// local
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";
import ProcessingStatusChip from "./ProcessingStatusChip";
import {
  selectActiveCamera,
  selectObserverSide,
  selectRouterInputs,
  selectRouterOutputs,
  selectRouterTakeStatus,
  setRouterTakeStatus,
} from "../camera-controls/cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";

// How long the success/failure indicator stays on the TAKE button before it
// resets to idle.
const TAKE_RESULT_DISPLAY_MS = 2500;

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
  takeButtonError: {
    backgroundColor: red[600] + " !important",
    "&:hover": {
      backgroundColor: red[800] + " !important",
    },
  },
  buttonWrapper: {
    position: "relative",
    display: "inline-block",
  },
  buttonProgress: {
    color: "white",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

export default function RouterControls() {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [inputValue, setInputValue] = useState(null);
  const [outputValue, setOutputValue] = useState(null);

  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const { emit } = useCameraCommandEmitter({
    activeCamera: activeCameraId,
    observerSide,
  });

  const routerInputs = useSelector(selectRouterInputs);
  const routerOutputs = useSelector(selectRouterOutputs);

  // Result of the most recent TAKE, set from the command receipt in Redux.
  const takeStatus = useSelector(selectRouterTakeStatus);
  const isPending = takeStatus === "PENDING";
  const isOk = takeStatus === "OK";
  const isErr = takeStatus === "ERR";

  // Once a take resolves, clear the indicator after a short delay. On success
  // we also clear the selection (the route is set); on failure we keep it so
  // the pilot can retry without re-selecting.
  useEffect(() => {
    if (!isOk && !isErr) return undefined;
    const timer = setTimeout(() => {
      if (isOk) {
        setInputValue(null);
        setOutputValue(null);
      }
      dispatch(setRouterTakeStatus(null));
    }, TAKE_RESULT_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [isOk, isErr, dispatch]);

  // disable Take until both values are selected, while a take is in flight,
  // or while a success indicator is showing.
  const disabled = !inputValue || !outputValue || isPending || isOk;

  const handleSendMessage = () => {
    dispatch(setRouterTakeStatus("PENDING"));
    void emit({
      action: {
        name: COMMAND_STRINGS.routerIOCommand,
        value: { input: inputValue, output: outputValue },
      },
    });
  };

  const resetValues = () => {
    setInputValue(null);
    setOutputValue(null);
    if (takeStatus) dispatch(setRouterTakeStatus(null));
  };

  const renderInputBtns = (item) => {
    const activeBtn = item.value === inputValue;
    const btnStyle = clsx({
      [classes.ctrlButton]: true, //always applies
      [classes.activeButton]: activeBtn, //only when open === true
    });

    return (
      <Grid item xs={3} key={item.value}>
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
      <Grid item xs={3} key={item.value}>
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
            {routerInputs.map((item) => renderInputBtns(item))}
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
            {routerOutputs.map((item) => renderOutputBtns(item))}
          </Grid>

          <Box className={classes.box} mt={2}>
            <div className={classes.buttonWrapper}>
              <Button
                variant="contained"
                disabled={disabled}
                startIcon={
                  isOk ? <DoneIcon /> : isErr ? <ErrorOutlineIcon /> : null
                }
                className={clsx(classes.takeButton, {
                  [classes.takeButtonError]: isErr,
                })}
                onClick={() => handleSendMessage()}
              >
                {isPending
                  ? "SENDING…"
                  : isOk
                  ? "ROUTED"
                  : isErr
                  ? "TAKE FAILED"
                  : "TAKE"}
              </Button>
              {isPending && (
                <CircularProgress size={24} className={classes.buttonProgress} />
              )}
            </div>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <ProcessingStatusChip />
        </Grid>
      </Grid>
    </>
  );
}

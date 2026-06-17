import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import makeStyles from "@mui/styles/makeStyles";
import { Grid, Button, Box, Typography, CircularProgress } from "@mui/material";
import { green, red, grey } from "@mui/material/colors";
import DoneIcon from "@mui/icons-material/Done";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// local
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";
import ProcessingStatusChip from "./ProcessingStatusChip";
import RouterMatrix from "./RouterMatrix";
import {
  selectActiveCamera,
  selectObserverSide,
  selectRouterInputs,
  selectRouterOutputs,
  selectRouterRouting,
  selectRouterTakeStatus,
  setRouterTakeStatus,
  setRouterRoute,
} from "../camera-controls/cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";
import {
  MOCK_ROUTER_INPUTS,
  MOCK_ROUTER_OUTPUTS,
  MOCK_ROUTER_ROUTING,
} from "./routerMatrixMock";

// How long the success/failure indicator stays on the TAKE button before it
// resets to idle.
const TAKE_RESULT_DISPLAY_MS = 2500;

const useStyles = makeStyles((theme) => ({
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
  staged: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    minHeight: 28,
    color: grey[300],
    fontSize: ".85rem",
  },
  stagedArrow: {
    fontSize: "1rem",
    color: grey[500],
  },
  placeholder: {
    color: grey[600],
  },
}));

const labelFor = (items, value) =>
  items.find((item) => item.value === value)?.label ?? value;

export default function RouterControls() {
  const classes = useStyles();
  const dispatch = useDispatch();

  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const { emit } = useCameraCommandEmitter({
    activeCamera: activeCameraId,
    observerSide,
  });

  const routerInputs = useSelector(selectRouterInputs);
  const routerOutputs = useSelector(selectRouterOutputs);
  const routing = useSelector(selectRouterRouting);
  const takeStatus = useSelector(selectRouterTakeStatus);

  // Fall back to static mock data when no router ports are available (e.g. no
  // backend connected) so the matrix is reviewable. See routerMatrixMock.js.
  const usingMock = routerInputs.length === 0;
  const inputs = usingMock ? MOCK_ROUTER_INPUTS : routerInputs;
  const outputs = usingMock ? MOCK_ROUTER_OUTPUTS : routerOutputs;
  const effectiveRouting =
    usingMock && Object.keys(routing).length === 0 ? MOCK_ROUTER_ROUTING : routing;

  // The crosspoint the pilot has staged but not yet committed.
  const [staged, setStaged] = useState({ input: null, output: null });

  const isPending = takeStatus === "PENDING";
  const isOk = takeStatus === "OK";
  const isErr = takeStatus === "ERR";
  const hasStaged = staged.input && staged.output;

  // Once a take resolves, clear the indicator after a short delay. On success
  // we optimistically record the route and clear the staged selection; on
  // failure we keep it so the pilot can retry without re-selecting.
  useEffect(() => {
    if (!isOk && !isErr) return undefined;
    const timer = setTimeout(() => {
      if (isOk && staged.input && staged.output) {
        dispatch(setRouterRoute({ output: staged.output, input: staged.input }));
        setStaged({ input: null, output: null });
      }
      dispatch(setRouterTakeStatus(null));
    }, TAKE_RESULT_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [isOk, isErr, staged.input, staged.output, dispatch]);

  const handleSelect = (input, output) => {
    if (isPending) return;
    setStaged({ input, output });
  };

  const handleTake = () => {
    if (!hasStaged) return;
    dispatch(setRouterTakeStatus("PENDING"));
    void emit({
      action: {
        name: COMMAND_STRINGS.routerIOCommand,
        value: { input: staged.input, output: staged.output },
      },
    });
  };

  const handleCancel = () => {
    setStaged({ input: null, output: null });
    if (takeStatus) dispatch(setRouterTakeStatus(null));
  };

  const takeDisabled = !hasStaged || isPending || isOk;

  return (
    <>
      <RouterMatrix
        inputs={inputs}
        outputs={outputs}
        routing={effectiveRouting}
        stagedInput={staged.input}
        stagedOutput={staged.output}
        onSelect={handleSelect}
      />

      <Box mt={2} className={classes.staged}>
        {hasStaged ? (
          <>
            <span>{labelFor(inputs, staged.input)}</span>
            <ArrowForwardIcon className={classes.stagedArrow} />
            <span>{labelFor(outputs, staged.output)}</span>
          </>
        ) : (
          <span className={classes.placeholder}>
            Select a crosspoint to stage a route
          </span>
        )}
      </Box>

      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="center"
        mt={0}
      >
        <Grid item>
          <Button variant="contained" color="inherit" onClick={handleCancel}>
            CANCEL
          </Button>
        </Grid>
        <Grid item>
          <div className={classes.buttonWrapper}>
            <Button
              variant="contained"
              disabled={takeDisabled}
              startIcon={
                isOk ? <DoneIcon /> : isErr ? <ErrorOutlineIcon /> : null
              }
              className={clsx(classes.takeButton, {
                [classes.takeButtonError]: isErr,
              })}
              onClick={handleTake}
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
        </Grid>
      </Grid>

      {usingMock && (
        <Box mt={1} textAlign="center">
          <Typography variant="caption" color="textSecondary">
            Showing mock routing — no router connected
          </Typography>
        </Box>
      )}

      <Box mt={2}>
        <ProcessingStatusChip />
      </Box>
    </>
  );
}

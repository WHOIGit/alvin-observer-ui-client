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
    minWidth: 220,
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

  // Real router ports arrive from the backend bootstrap. The mock dataset is
  // dev-only review scaffolding (see routerMatrixMock.js) so a deployed build
  // never presents fabricated routes when no router is connected.
  const hasPorts = routerInputs.length > 0 && routerOutputs.length > 0;
  const useMock = !hasPorts && import.meta.env.DEV;
  const inputs = useMock ? MOCK_ROUTER_INPUTS : routerInputs;
  const outputs = useMock ? MOCK_ROUTER_OUTPUTS : routerOutputs;
  // routerRouting is only populated by backends that support the routing query.
  // When it's absent the matrix simply shows no active crosspoints; staging and
  // TAKE still work and update optimistically, so the take interface is fully
  // usable against a backend that doesn't report routing yet.
  const effectiveRouting = useMock ? MOCK_ROUTER_ROUTING : routing;

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

  // No router ports and not in dev review mode: show a graceful placeholder
  // rather than an empty grid.
  if (!hasPorts && !useMock) {
    return (
      <Box my={4} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          Router controls unavailable — no router connected.
        </Typography>
      </Box>
    );
  }

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

      <Box
        mt={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        gap={2}
      >
        <Box className={classes.staged}>
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

        <Button variant="contained" color="inherit" onClick={handleCancel}>
          CANCEL
        </Button>

        <div className={classes.buttonWrapper}>
          <Button
            variant="contained"
            disabled={takeDisabled}
            startIcon={isOk ? <DoneIcon /> : isErr ? <ErrorOutlineIcon /> : null}
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

        <ProcessingStatusChip />

        {useMock && (
          <Typography variant="caption" color="textSecondary">
            Showing mock routing — no router connected
          </Typography>
        )}
      </Box>
    </>
  );
}

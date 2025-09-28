import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Grid, List, ListItem } from "@mui/material";
// local
import LargeVideo from "../camera-controls/LargeVideo";
import SelectVideoSource from "../camera-controls/SelectVideoSource";
import SelectShutterMode from "../camera-controls/SelectShutterMode";
import SelectIrisMode from "../camera-controls/SelectIrisMode";
import SelectIsoMode from "../camera-controls/SelectIsoMode";
import SelectExposureMode from "../camera-controls/SelectExposureMode";
import SelectWhiteBalance from "../camera-controls/SelectWhiteBalance";
import FocusModeButton from "../camera-controls/FocusModeButton";
import FocusZoomButtonsGrid from "../camera-controls/FocusZoomButtonsGrid";
import Joystick from "../camera-controls/Joystick";
import SetCaptureInterval from "../camera-controls/SetCaptureInterval";
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";
import useIsOwner from "../../hooks/useIsOwner";
import RecordingStatusChip from "./RecordingStatusChip";
import ErrorCard from "../camera-controls/ErrorCard";
import {
  changeActiveCamera,
  selectActiveCamera,
  selectCamHeartbeatData,
  selectInitialCamHeartbeatData,
  selectObserverSide,
  selectWebSocketNamespace,
} from "../camera-controls/cameraControlsSlice";

import {
  CAM_HEARTBEAT,
  COMMAND_STRINGS,
} from "../../config";

const useStyles = makeStyles((theme) => ({
  joystickBox: {
    marginTop: "-50px",
  },
  controlsBox: {
    minHeight: "387px",
  },
}));

export default function CameraControlContainer() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { isOwner } = useIsOwner();

  const userNs = useSelector(selectWebSocketNamespace);
  const observerSide = useSelector(selectObserverSide);
  const { emit } = useCameraCommandEmitter(`/${userNs}`, {
    observerSide,
  });

  const activeCamera = useSelector(selectActiveCamera);
  const initialCamHeartbeat = useSelector(selectInitialCamHeartbeatData);
  const camSettings = useSelector(selectCamHeartbeatData);

  // use CAM_HEARTBEAT parameters only on initial app load to set activeCamera
  // keep camera params in local state otherwise
  useEffect(() => {
    const setInitialCamera = () => {
      dispatch(changeActiveCamera(initialCamHeartbeat));

      // send camera change command to set available settings options
      void emit({
        camera: initialCamHeartbeat.camera,
        action: {
          name: COMMAND_STRINGS.cameraChangeCommand,
          value: initialCamHeartbeat.camera,
        },
      });
    };

    // set initial camera state only if activeCamera is undefined
    if (activeCamera === null) {
      console.log(initialCamHeartbeat);
      if (initialCamHeartbeat !== null) {
        setInitialCamera();
      }
    }
  }, [activeCamera, dispatch, emit, initialCamHeartbeat]);

  const renderDynamicGridBox = () => {
    if (camSettings?.focus_mode === "ERR") return <ErrorCard />;
    if (camSettings?.camctrl === "y" && isOwner) {
      return (
        <List>
          <ListItem>
            <SelectExposureMode showLabel={true} />
          </ListItem>
          <ListItem>
            <SelectShutterMode />
          </ListItem>
          <ListItem>
            <SelectIrisMode />
          </ListItem>
          <ListItem>
            <SelectIsoMode />
          </ListItem>
          <ListItem>
            <SelectWhiteBalance showLabel={true} />
          </ListItem>
        </List>
      );
    }
  };

  return (
    <>
      <Grid container spacing={2} justifyContent="flex-start" alignItems="center">
        <Grid item xs={6}>
          <SelectVideoSource />
        </Grid>

        <Grid item xs={6}>
          <RecordingStatusChip />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={9}>
          <LargeVideo showFullCameraControls={true} />
        </Grid>
        <Grid item xs={3}>
          <div className={classes.controlsBox}>{renderDynamicGridBox()}</div>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs>
          {isOwner && <SetCaptureInterval />}
        </Grid>

        <>
          <Grid item xs>
            {camSettings?.camctrl === "y" && isOwner && <FocusModeButton />}
          </Grid>
          <Grid item xs>
            {camSettings?.camctrl === "y" && isOwner && (
              <FocusZoomButtonsGrid />
            )}
          </Grid>
        </>

        <Grid item xs>
          {camSettings?.pantilt === "y" && isOwner && (
            <div className={classes.joystickBox}>
              <Joystick />
            </div>
          )}
        </Grid>
      </Grid>
    </>
  );
}

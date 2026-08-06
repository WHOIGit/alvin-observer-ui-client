import React from "react";
import { useSelector } from "react-redux";
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
import { useObservedStation } from "../camera-controls/ObservedCameraProvider";
import { useInitialCameraSelection } from "../camera-controls/useInitialCameraSelection";
import useIsOwner from "../../hooks/useIsOwner";
import RecordingStatusChip from "./RecordingStatusChip";
import ErrorCard from "../camera-controls/ErrorCard";
import { selectCamHeartbeatData } from "../camera-controls/cameraControlsSlice";

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
  const { isOwner } = useIsOwner();

  const station = useObservedStation();
  useInitialCameraSelection(station);

  const camSettings = useSelector(selectCamHeartbeatData);

  const renderDynamicGridBox = () => {
    if (camSettings?.faults?.focus_mode) return <ErrorCard />;
    if (camSettings?.isControllable && isOwner) {
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
          <LargeVideo />
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
            {camSettings?.isControllable && isOwner && <FocusModeButton />}
          </Grid>
          <Grid item xs>
            {camSettings?.isControllable && isOwner && (
              <FocusZoomButtonsGrid />
            )}
          </Grid>
        </>

        <Grid item xs>
          {camSettings?.hasPanTilt && isOwner && (
            <div className={classes.joystickBox}>
              <Joystick />
            </div>
          )}
        </Grid>
      </Grid>
    </>
  );
}

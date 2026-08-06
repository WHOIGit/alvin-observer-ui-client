import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import {
  MenuItem,
  Button,
  FormControl,
  Select,
  Grid,
  Typography,
} from "@mui/material";
// local imports
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import { useObservedCamera } from "./ObservedCameraProvider";

// Choices offered for the recurring still-capture interval, in seconds;
// "0" stops the recurring capture.
const CAPTURE_INTERVAL_OPTIONS = ["0", "20", "30", "40", "50", "60"];

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 80,
  },
  horizBtn: {
    paddingTop: theme.spacing(1),
  },
  captureLabel: {
    paddingLeft: theme.spacing(1),
  },
}));

export default function SelectCaptureInterval() {
  const classes = useStyles();
  //const camData = useSelector(selectCurrentCamData);
  const camSettings = useSelector(selectCamHeartbeatData);
  const [value, setValue] = useState(null);
  const [captureEnabled, setCaptureEnabled] = useState(true);

  const camera = useObservedCamera();

  const handleValueChange = (event) => {
    setValue(event.target.value);
  };

  const handleSendMessage = () => {
    // "0" stops the recurring capture; otherwise send the selected interval.
    camera.setCaptureInterval(captureEnabled ? value : "0");
  };

  useEffect(() => {
    // only set value from camSettings if null so we can update the select field without
    // changing the current value, needs to wait for button push
    if (value === null) {
      camSettings && setValue(camSettings.capture_interval ?? "");
    }
  }, [camSettings, value]);

  useEffect(() => {
    // only set value from camSettings if null so we can update the select field without
    // changing the current value, needs to wait for button push
    if (camSettings.capture_interval === "0") {
      setCaptureEnabled(true);
      setValue(camSettings.capture_interval);
    } else {
      setCaptureEnabled(false);
    }
  }, [camSettings]);

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item>
          <FormControl variant="standard" className={classes.formControl}>
            <Select
              id="capture-interval-select"
              onChange={handleValueChange}
              value={value}
              disabled={!captureEnabled}
            >
              {CAPTURE_INTERVAL_OPTIONS.map((item) => (
                <MenuItem value={item} key={item}>
                  {item} secs
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <div className={classes.horizBtn}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={handleSendMessage}
            >
              {captureEnabled ? "Start" : "Stop"}
            </Button>
          </div>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="overline" className={classes.captureLabel}>
            CAPTURE INTERVAL
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
}

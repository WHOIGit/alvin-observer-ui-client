import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  MenuItem,
  Button,
  FormControl,
  Select,
  Grid,
  Typography,
} from "@material-ui/core";
// local imports
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

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
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);

  console.log("CAM SETTINGS", camSettings);

  const handleValueChange = (event) => {
    setValue(event.target.value);
  };

  const handleSendMessage = () => {
    let payloadValue = value;
    if (!captureEnabled) {
      // stop capture interval by sending 0 string to the AIS
      payloadValue = "0";
    }
    const payload = {
      action: {
        name: COMMAND_STRINGS.captureIntervalCommand,
        value: payloadValue,
      },
    };
    sendMessage(payload);
  };

  useEffect(() => {
    // only set value from camSettings if null so we can update the select field without
    // changing the current value, needs to wait for button push
    if (value === null) {
      camSettings && setValue(camSettings.capture_interval);
    }

    if (camSettings.capture_interval === "0") {
      setCaptureEnabled(true);
    } else {
      setCaptureEnabled(false);
    }
  }, [camSettings, value]);

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item>
          <FormControl className={classes.formControl}>
            <Select
              id="capture-interval-select"
              onChange={handleValueChange}
              value={value}
              disabled={!captureEnabled}
            >
              {COMMAND_STRINGS.captureIntervalOptions.map((item) => (
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

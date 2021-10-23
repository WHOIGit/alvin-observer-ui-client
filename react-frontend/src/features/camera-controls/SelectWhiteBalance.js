import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  MenuItem,
  Grid,
  FormControl,
  Select,
  Typography,
  Button,
} from "@material-ui/core";
// local imports
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  horizLabel: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  onePushBtn: {
    paddingTop: theme.spacing(2),
    textAlign: "center",
  },
}));

export default function SelectWhiteBalance({ showLabel }) {
  const classes = useStyles();
  const camSettings = useSelector(selectCamHeartbeatData);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  const labelText = "WHITE BALANCE:";

  const handleSendMessage = (event) => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.whiteBalanceCommand,
        value: event.target.value,
      },
    };
    sendMessage(payload);
  };

  const handleOnePushMessage = () => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.whiteBalanceOnePushCommand,
        value: null,
      },
    };
    sendMessage(payload);
  };

  // set up label options
  let displayEmpty = true;
  if (showLabel) {
    displayEmpty = false;
  }

  if (camSettings === null) {
    return null;
  }

  return (
    <Grid container spacing={0}>
      {showLabel && (
        <Grid item xs={12} className={classes.horizLabel}>
          <Typography variant="body1">{labelText}</Typography>
        </Grid>
      )}

      <Grid item xs={12}>
        <FormControl className={classes.formControl}>
          <Select
            id="exposure-select"
            value={camSettings.white_balance}
            label={labelText}
            onChange={handleSendMessage}
            displayEmpty={displayEmpty}
          >
            {COMMAND_STRINGS.whiteBalanceOptions.map((item) => (
              <MenuItem value={item} key={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        {camSettings.white_balance.includes("ONE_PUSH") && (
          <div className={classes.onePushBtn}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleOnePushMessage()}
            >
              WB One Push
            </Button>
          </div>
        )}
      </Grid>
    </Grid>
  );
}

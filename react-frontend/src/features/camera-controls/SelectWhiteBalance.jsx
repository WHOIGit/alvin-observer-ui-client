import React from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import {
  MenuItem,
  Grid,
  FormControl,
  Select,
  Typography,
  Button,
} from "@mui/material";
// local imports
import { useImagingStation } from "../../hooks/useImagingClient";
import {
  selectActiveCamera,
  selectCamHeartbeatData,
  selectObserverSide,
} from "./cameraControlsSlice";
import { WHITE_BALANCE_MODES } from "../../lib/imaging-client";

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
  const labelText = "WHITE BALANCE:";

  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const camera = useImagingStation(observerSide).camera(activeCameraId ?? null);

  const handleSendMessage = (event) => {
    camera.setWhiteBalance(event.target.value);
  };

  const handleOnePushMessage = () => {
    camera.triggerOnePushWhiteBalance();
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
        <FormControl variant="standard" className={classes.formControl}>
          <Select
            id="exposure-select"
            value={camSettings.white_balance ?? ""}
            label={labelText}
            onChange={handleSendMessage}
            displayEmpty={displayEmpty}
          >
            {Object.values(WHITE_BALANCE_MODES).map((item) => (
              <MenuItem value={item} key={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        {camSettings.white_balance?.includes("ONE_PUSH") && (
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

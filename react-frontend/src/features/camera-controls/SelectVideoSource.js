import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { selectActiveCamera } from "./cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS, NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function SelectVideoSource({ showTopControls }) {
  const classes = useStyles();
  const activeCamera = useSelector(selectActiveCamera);
  const cameras = useSelector((state) => state.cameraControls.availableCameras);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);

  const handleSendMessage = (event) => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.cameraChangeCommand,
        value: event.target.value,
      },
    };
    sendMessage(payload);
  };

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <Select
          id="video-select"
          value={activeCamera}
          onChange={handleSendMessage}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
        >
          {cameras.map((item) => (
            <MenuItem value={item.camera} key={item.camera}>
              Video Source: {item.cam_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

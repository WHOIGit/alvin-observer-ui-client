import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { List, ListItem, Chip } from "@material-ui/core";
import SelectShutterMode from "../camera-controls/SelectShutterMode";
import SelectIrisMode from "../camera-controls/SelectIrisMode";
import SelectIsoMode from "../camera-controls/SelectIsoMode";
import FocusModeDisplayChip from "./FocusModeDisplayChip";
import { selectActiveCamera } from "../camera-controls/cameraControlsSlice";

export default function TopCameraCommandsList() {
  const activeCamera = useSelector(selectActiveCamera);

  const focusLabel = `FOCUS: ${activeCamera.settings.focusMode}`;
  return (
    <List>
      <ListItem disableGutters={true}>
        <SelectShutterMode />
      </ListItem>
      <ListItem disableGutters={true}>
        <SelectIrisMode />
      </ListItem>
      <ListItem disableGutters={true}>
        <SelectIsoMode />
      </ListItem>
      <ListItem disableGutters={true}>
        <FocusModeDisplayChip />
      </ListItem>
    </List>
  );
}

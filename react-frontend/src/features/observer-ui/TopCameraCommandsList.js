import React from "react";
import { useSelector } from "react-redux";
import { List, ListItem } from "@material-ui/core";
// local
import SelectShutterMode from "../camera-controls/SelectShutterMode";
import SelectIrisMode from "../camera-controls/SelectIrisMode";
import SelectIsoMode from "../camera-controls/SelectIsoMode";
import { selectCamHeartbeatData } from "../camera-controls/cameraControlsSlice";
import useIsOwner from "../../hooks/useIsOwner";

export default function TopCameraCommandsList() {
  const camSettings = useSelector(selectCamHeartbeatData);
  const { isOwner } = useIsOwner();

  // check to make sure camera has controls and current Observer matches Cam Owner
  if (camSettings === null || camSettings?.camctrl === "n" || !isOwner) {
    return null;
  }

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
    </List>
  );
}

import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { List, ListItem, Chip } from "@material-ui/core";
import SelectShutterMode from "../camera-controls/SelectShutterMode";
import SelectIrisMode from "../camera-controls/SelectIrisMode";
import SelectIsoMode from "../camera-controls/SelectIsoMode";
const useStyles = makeStyles(theme => ({
  listItem: {
    width: "100%"
  }
}));

export default function TopCameraCommandsList() {
  const classes = useStyles();
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
        <Chip
          label="FOCUS: AF/MF"
          color="secondary"
          className={classes.listItem}
        />
      </ListItem>
    </List>
  );
}

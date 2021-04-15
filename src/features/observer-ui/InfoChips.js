import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { List, ListItem, Chip } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  infoChip: {
    width: "100%"
  }
}));

export default function InfoChips() {
  const classes = useStyles();
  return (
    <List>
      <ListItem disableGutters={true}>
        <Chip label="SHUTTER: [value]" className={classes.infoChip} />
      </ListItem>
      <ListItem disableGutters={true}>
        <Chip label="IRIS: [value]" className={classes.infoChip} />
      </ListItem>
      <ListItem disableGutters={true}>
        <Chip label="ISO: [value]" className={classes.infoChip} />
      </ListItem>
      <ListItem disableGutters={true}>
        <Chip label="FOCUS: AF/MF" className={classes.infoChip} />
      </ListItem>
    </List>
  );
}

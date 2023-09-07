import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Chip } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  chip: {
    width: "100%",
    color: "white",
    backgroundColor: theme.palette.warning.main,
  },
}));

export default function SocketErrorChip() {
  const classes = useStyles();

  return (
    <Chip
      label="CONNECTION ERROR. Unable to connect to imaging server"
      className={classes.chip}
      color="primary"
    />
  );
}

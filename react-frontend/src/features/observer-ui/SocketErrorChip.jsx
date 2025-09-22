import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Chip } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  chip: {
    width: "100%",
    color: "white",
    backgroundColor: theme.palette.error.main,
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

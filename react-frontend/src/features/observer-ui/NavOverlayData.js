import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    height: "179px",
    backgroundColor: "#f5f5f5"
  }
}));

export default function NavOverlayData() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography variant="h6" gutterBottom>
        Nav Overlay Data
      </Typography>
    </div>
  );
}
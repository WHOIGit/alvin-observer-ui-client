import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Icon, Button } from "@material-ui/core";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
// local

const useStyles = makeStyles(theme => ({
  ctrlButton: {
    width: "100%",
    fontSize: ".7em"
  },
  outputButton: {
    backgroundColor: "#2196f3",
    color: "white"
  },
  activeButton: {
    backgroundColor: theme.palette.secondary.main
  }
}));

export default function RouterControls({
  showFullCameraControls,
  setShowFullCameraControls
}) {
  const classes = useStyles();
  const ioValues = Array(16)
    .fill()
    .map((_, i) => i + 1);
  const [inputValue, setInputValue] = useState(null);
  const [outputValue, setOutputValue] = useState(null);
  const handleInputClick = value => {
    console.log(value);
    setInputValue(value);
  };

  const renderInputBtns = value => {
    const activeBtn = value === inputValue;
    const btnStyle = clsx({
      [classes.ctrlButton]: true, //always applies
      [classes.activeButton]: activeBtn //only when open === true
    });

    return (
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={btnStyle}
          onClick={() => setInputValue(value)}
        >
          Input {value}
        </Button>
      </Grid>
    );
  };

  const renderOutputBtns = value => {
    const activeBtn = value === outputValue;
    const btnStyle = clsx({
      [classes.ctrlButton]: true, //always applies
      [classes.outputButton]: true, //always applies
      [classes.activeButton]: activeBtn //only when open === true
    });

    return (
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={btnStyle}
          onClick={() => setOutputValue(value)}
        >
          Output {value}
        </Button>
      </Grid>
    );
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Grid container spacing={1}>
            {ioValues.map(value => renderInputBtns(value))}
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={1}>
            {ioValues.map(value => renderOutputBtns(value))}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

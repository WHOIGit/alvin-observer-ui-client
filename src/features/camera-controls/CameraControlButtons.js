import React, { useEffect, useRef } from "react";
import nipplejs from "nipplejs";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import { Box, Grid, Button, Typography, Divider } from "@material-ui/core";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  camButton: {
    width: "100%",
    fontSize: ".8em"
  },
  ctrlButton: {
    width: "100%",
    fontSize: ".7em"
  },
  joystickContainer: {
    position: "relative",
    height: "100px"
  }
}));

export default function CameraControlButtons() {
  const classes = useStyles();
  const joystickElem = useRef(null);

  console.log(joystickElem.current);
  useEffect(() => {
    const joystick = nipplejs.create({
      zone: joystickElem.current,
      mode: "static",
      position: { left: "50%", top: "50%" },
      color: "blue"
    });
  }, []);

  return (
    <div className={classes.root}>
      <Box my={2}>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          startIcon={<CenterFocusStrongIcon />}
        >
          Focus AF/MF
        </Button>
      </Box>

      <Box my={3}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button variant="contained" color="secondary" size="small">
              Near
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" color="secondary" size="small">
              Tele
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="overline" gutterBottom>
              Focus
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="overline" gutterBottom>
              Zoom
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" color="secondary" size="small">
              Far
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" color="secondary" size="small">
              Wide
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Divider />
      <Box my={3}>
        <Typography variant="h6" gutterBottom>
          P & T
        </Typography>
        <div className={classes.joystickContainer} ref={joystickElem}></div>
      </Box>
    </div>
  );
}

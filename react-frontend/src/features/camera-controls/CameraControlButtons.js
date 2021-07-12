import React, { useEffect, useRef } from "react";
//import nipplejs from "nipplejs";
import ReactNipple from "react-nipple";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import { Box, Grid, Button, Typography, Divider } from "@material-ui/core";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";

const useStyles = makeStyles(theme => ({
  root: {
    //flexGrow: 1
  },
  camButton: {
    width: "100%",
    fontSize: ".8em"
  },
  ctrlButton: {
    width: "100%",
    fontSize: ".7em"
  }
  /*
  joystickContainer: {
    position: "relative",
    width: "100%",
    height: "200px"
  }
  */
}));

export default function CameraControlButtons() {
  const classes = useStyles();
  const joystickElem = useRef(null);

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
      <Box mt={3}>
        <Typography variant="h6">P & T</Typography>

        <ReactNipple
          options={{
            mode: "static",
            position: { top: "50%", left: "50%" },
            color: "blue"
          }}
          style={{
            position: "relative",
            width: "100%",
            height: 120
            // if you pass position: 'relative', you don't need to import the stylesheet
          }}
          onMove={(evt, data) => console.log(evt, data)}
        />
      </Box>
    </div>
  );
}

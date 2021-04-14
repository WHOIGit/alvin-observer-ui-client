import React from "react";
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
  }
}));

export default function CameraControlButtons() {
  const classes = useStyles();
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
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Button variant="contained" color="secondary" size="small">
              Down
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button variant="contained" color="secondary" size="small">
              Left
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="overline" gutterBottom>
              P & T
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Button variant="contained" color="secondary" size="small">
              Right
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="secondary" size="small">
              Up
            </Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Card,
  CardHeader,
  CardMedia,
  CardActions,
  CardContent,
  Typography,
  Button,
  Chip
} from "@material-ui/core";
import InfoChips from "./InfoChips";
import film from "../../images/604015.png";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  headerRoot: { padding: "4px" },
  title: {
    fontSize: ".9em"
  },
  inactiveVideo: {
    border: "white solid 2px"
  },
  activeVideo: {
    border: "red solid 2px"
  },
  videoAction: {
    justifyContent: "center",
    textTransform: "uppercase",
    padding: "4px"
  },
  activeVideoAction: {
    backgroundColor: "red"
  },
  miniVidImage: {
    height: 0,
    paddingTop: "77%",
    maxWidth: "100%"
  },
  infoChip: {
    marginTop: theme.spacing(1),
    width: "100%"
  }
}));

export default function MiniVideos({ showFullCameraControls }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card className={`${classes.root}`}>
            <CardHeader
              title="REC: Camera Name2"
              classes={{
                root: classes.headerRoot,
                title: classes.title
              }}
            />
            <CardMedia
              className={`${classes.miniVidImage} ${classes.activeVideo}`}
              image={film}
            />

            <CardActions
              className={`${classes.videoAction} ${classes.activeVideoAction}`}
            >
              <Typography
                variant="body2"
                color="textSecondary"
                component="span"
              >
                RECORDING
              </Typography>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={6}>
          {showFullCameraControls ? (
            <InfoChips />
          ) : (
            <>
              <Card className={classes.root}>
                <CardHeader
                  title="OBS: Camera Name1"
                  classes={{
                    root: classes.headerRoot,
                    title: classes.title
                  }}
                />
                <CardMedia
                  className={`${classes.miniVidImage} ${classes.inactiveVideo}`}
                  image={film}
                />

                <CardActions className={classes.videoAction}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="span"
                    align="center"
                  >
                    SOURCE
                  </Typography>
                </CardActions>
              </Card>
              <Chip label="FOCUS: AF/MF" className={classes.infoChip} />
            </>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

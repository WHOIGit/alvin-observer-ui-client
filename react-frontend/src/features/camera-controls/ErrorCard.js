import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import { Card, CardContent, Chip, Box } from "@material-ui/core";
import NoPhotographyIcon from "@mui/icons-material/NoPhotography";
// local import

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  chip: {
    width: "100%",
    color: "white",
    backgroundColor: theme.palette.error.main,
  },
}));

export default function ErrorCard({ errorType }) {
  const classes = useStyles();

  return (
    <Card className={`${classes.root}`}>
      <CardContent>
        <Chip
          label="CAMERA CHANGE ERROR"
          className={classes.chip}
          color="warning"
        />
      </CardContent>
      <Box m={1}>
        <NoPhotographyIcon style={{ color: red[400] }} />
      </Box>
    </Card>
  );
}

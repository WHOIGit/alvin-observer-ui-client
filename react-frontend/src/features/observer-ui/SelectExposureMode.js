import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  }
}));

export default function SelectExposureMode({ showTopControls }) {
  const classes = useStyles();
  const [videoFeed, setVideoFeed] = React.useState(10);

  const handleChange = event => {
    setVideoFeed(event.target.value);
  };

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Exposure Mode</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={videoFeed}
          onChange={handleChange}
        >
          <MenuItem value={10}>Auto</MenuItem>
          <MenuItem value={20}>Manual</MenuItem>
          <MenuItem value={30}>Shutter Priority</MenuItem>
          <MenuItem value={30}>Iris Priority</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}

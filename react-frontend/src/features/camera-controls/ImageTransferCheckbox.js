import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { FormControlLabel, Checkbox } from "@material-ui/core";
import {
  selectActiveCamera,
  selectVideoSourceEnabled,
  setRecordControlsEnabled,
  selectAllCameras,
  setImageTransferAcomms,
} from "./cameraControlsSlice";

const useStyles = makeStyles((theme) => ({
  imgCheckbox: {
    paddingLeft: 0,
  },
}));

export default function ImageTransferCheckbox() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [checkedImg, setCheckedImg] = useState(false);

  const handleCheckboxChange = (event) => {
    console.log(event.target.checked);
    setCheckedImg(event.target.checked);
    dispatch(setImageTransferAcomms(event.target.checked));
  };

  return (
    <div>
      <FormControlLabel
        control={
          <Checkbox
            onChange={handleCheckboxChange}
            name="imgCapture"
            state={checkedImg}
            className={classes.imgCheckbox}
          />
        }
        label="ACOMMS"
      />
    </div>
  );
}

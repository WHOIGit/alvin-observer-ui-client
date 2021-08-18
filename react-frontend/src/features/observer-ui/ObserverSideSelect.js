import { useState } from "react";
import { useDispatch } from "react-redux";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { setObserverSide } from "../camera-controls/cameraControlsSlice";

export default function ObserverSideSelect() {
  const [value, setValue] = useState(null);
  const dispatch = useDispatch();

  const handleChange = event => {
    setValue(event.target.value);
    dispatch(setObserverSide(event.target.value));
  };

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Select Observer Side</FormLabel>
      <RadioGroup
        aria-label="observerSide"
        name="observerSide"
        value={value}
        onChange={handleChange}
      >
        <FormControlLabel value="P" control={<Radio />} label="Port" />
        <FormControlLabel value="S" control={<Radio />} label="Starboard" />
      </RadioGroup>
    </FormControl>
  );
}

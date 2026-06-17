import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Chip, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
// local
import {
  selectObserverSide,
  setObserverSide,
} from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles(theme => ({
  chip: {
    width: "100%",
    color: "white",
    backgroundColor: theme.palette.success.main,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.success.dark,
    },
  }
}));

const SIDE_OPTIONS = [
  { value: "P", label: "PORT OBSERVER" },
  { value: "S", label: "STBD OBSERVER" },
];

export default function ObserverDisplayChip() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const observerSide = useSelector(selectObserverSide);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (observerSide !== "P" && observerSide !== "S") {
    return null;
  }

  const current = SIDE_OPTIONS.find((o) => o.value === observerSide);

  const handleSelect = (value) => {
    setAnchorEl(null);
    if (value !== observerSide) {
      dispatch(setObserverSide(value));
    }
  };

  return (
    <>
      <Chip
        label={current.label}
        className={classes.chip}
        color="primary"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        onDelete={(event) => setAnchorEl(event.currentTarget)}
        deleteIcon={<ArrowDropDownIcon style={{ color: "white" }} />}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      />
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {SIDE_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === observerSide}
            onClick={() => handleSelect(option.value)}
          >
            <ListItemIcon>
              {option.value === observerSide ? <CheckIcon fontSize="small" /> : null}
            </ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

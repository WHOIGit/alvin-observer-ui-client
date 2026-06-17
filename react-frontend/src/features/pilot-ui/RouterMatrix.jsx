import React, { useState } from "react";
import clsx from "clsx";
import makeStyles from "@mui/styles/makeStyles";
import { blue, green, deepOrange, grey } from "@mui/material/colors";

const CELL = 30; // px, square crosspoint cell

const useStyles = makeStyles((theme) => ({
  scroll: {
    overflowX: "auto",
    paddingBottom: theme.spacing(1),
  },
  grid: {
    display: "grid",
    gap: 2,
  },
  corner: {
    position: "sticky",
    left: 0,
    zIndex: 2,
    backgroundColor: theme.palette.background.default,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingRight: 6,
    fontSize: ".6rem",
    color: grey[500],
  },
  colHeader: {
    height: 92,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    fontSize: ".62rem",
    color: grey[300],
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxHeight: 92,
  },
  colHeaderActive: {
    color: blue[200],
    fontWeight: 600,
  },
  rowHeader: {
    position: "sticky",
    left: 0,
    zIndex: 1,
    backgroundColor: theme.palette.background.default,
    height: CELL,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 6,
    fontSize: ".68rem",
    color: grey[200],
    whiteSpace: "nowrap",
  },
  rowHeaderActive: {
    color: green[200],
    fontWeight: 600,
  },
  cell: {
    height: CELL,
    minWidth: CELL,
    border: `1px solid ${grey[800]}`,
    borderRadius: 3,
    backgroundColor: grey[900],
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color .1s ease",
    "&:hover": {
      backgroundColor: grey[700],
    },
  },
  cellCrossHighlight: {
    backgroundColor: grey[800],
  },
  cellActive: {
    backgroundColor: green[600],
    borderColor: green[400],
    "&:hover": {
      backgroundColor: green[500],
    },
  },
  cellStaged: {
    backgroundColor: deepOrange[500],
    borderColor: deepOrange[300],
    boxShadow: `0 0 0 1px ${deepOrange[300]}`,
    "&:hover": {
      backgroundColor: deepOrange[400],
    },
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "white",
  },
}));

// Crosspoint matrix: each row is an output (destination), each column an input
// (source). The filled cell in a row shows which input currently feeds that
// output. Click a cell to stage a route; the parent commits it with TAKE.
export default function RouterMatrix({
  inputs,
  outputs,
  routing = {},
  stagedInput = null,
  stagedOutput = null,
  onSelect,
}) {
  const classes = useStyles();
  const [hover, setHover] = useState({ input: null, output: null });

  const gridStyle = {
    gridTemplateColumns: `minmax(110px, max-content) repeat(${inputs.length}, ${CELL}px)`,
  };

  return (
    <div className={classes.scroll}>
      <div className={classes.grid} style={gridStyle}>
        {/* Header row: corner + one label per input (column) */}
        <div className={classes.corner}>out \ in</div>
        {inputs.map((input) => (
          <div
            key={`h-${input.value}`}
            className={clsx(classes.colHeader, {
              [classes.colHeaderActive]: hover.input === input.value,
            })}
            title={input.label}
          >
            {input.label}
          </div>
        ))}

        {/* One row per output */}
        {outputs.map((output) => {
          const routedInput = routing[output.value];
          return (
            <React.Fragment key={`r-${output.value}`}>
              <div
                className={clsx(classes.rowHeader, {
                  [classes.rowHeaderActive]: hover.output === output.value,
                })}
                title={output.label}
              >
                {output.label}
              </div>
              {inputs.map((input) => {
                const isActive = routedInput === input.value;
                const isStaged =
                  stagedOutput === output.value &&
                  stagedInput === input.value;
                const isCross =
                  hover.input === input.value ||
                  hover.output === output.value;
                return (
                  <div
                    key={`${output.value}-${input.value}`}
                    role="button"
                    aria-label={`Route ${input.label} to ${output.label}${
                      isActive ? " (active)" : ""
                    }`}
                    aria-pressed={isActive}
                    className={clsx(classes.cell, {
                      [classes.cellCrossHighlight]: isCross && !isActive && !isStaged,
                      [classes.cellActive]: isActive,
                      [classes.cellStaged]: isStaged,
                    })}
                    onMouseEnter={() =>
                      setHover({ input: input.value, output: output.value })
                    }
                    onMouseLeave={() => setHover({ input: null, output: null })}
                    onClick={() => onSelect(input.value, output.value)}
                  >
                    {isActive && <span className={classes.dot} />}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

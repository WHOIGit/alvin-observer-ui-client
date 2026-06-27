import React, { useState } from "react";
import clsx from "clsx";
import makeStyles from "@mui/styles/makeStyles";
import { green, deepOrange, grey } from "@mui/material/colors";

const CELL = 26; // px, square crosspoint cell

// Outputs are split into vertical banks of this many rows, laid out side by
// side, so the 16x16 router fits a wide, short space below the cameras.
const BANK_SIZE = 8;

// Bright accent for the staged target's guide lines — deliberately distinct
// from the muted hover highlight so the two never visually compete.
const STAGE_LINE = green.A400;

const useStyles = makeStyles((theme) => ({
  banks: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing(4),
    overflowX: "auto",
    paddingBottom: theme.spacing(1),
  },
  grid: {
    display: "grid",
    gap: 2,
  },
  corner: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingRight: 6,
    fontSize: ".58rem",
    color: grey[500],
  },
  colHeader: {
    height: 80,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    fontSize: ".6rem",
    color: grey[300],
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxHeight: 80,
  },
  colHeaderActive: {
    color: green[200],
    fontWeight: 600,
  },
  colHeaderStaged: {
    color: STAGE_LINE,
    fontWeight: 600,
  },
  rowHeader: {
    height: CELL,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 6,
    fontSize: ".66rem",
    color: grey[200],
    whiteSpace: "nowrap",
  },
  rowHeaderActive: {
    color: green[200],
    fontWeight: 600,
  },
  rowHeaderStaged: {
    color: STAGE_LINE,
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
  // Bright guide lines running along the staged crosspoint's row and column,
  // up to (but not through) the staged cell. A separate, always-on indicator
  // so the staged target stays put while the hover highlight follows the
  // cursor independently.
  lineRow: {
    borderTopColor: STAGE_LINE,
    borderBottomColor: STAGE_LINE,
    boxShadow: `0 -1px 0 ${STAGE_LINE}, 0 1px 0 ${STAGE_LINE}`,
  },
  lineCol: {
    borderLeftColor: STAGE_LINE,
    borderRightColor: STAGE_LINE,
    boxShadow: `-1px 0 0 ${STAGE_LINE}, 1px 0 0 ${STAGE_LINE}`,
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
// output. Outputs are folded into banks of BANK_SIZE laid side by side so the
// grid stays wide and short. Click a cell to stage a route; the parent commits
// it with TAKE.
export default function RouterMatrix({
  inputs,
  outputs,
  routing = {},
  stagedInput = null,
  stagedOutput = null,
  onSelect,
}) {
  const classes = useStyles();
  // Shared hover state so an input column highlights across every bank (it's
  // the same source) while an output row highlights only within its bank.
  const [hover, setHover] = useState({ input: null, output: null });

  const gridStyle = {
    gridTemplateColumns: `minmax(96px, max-content) repeat(${inputs.length}, ${CELL}px)`,
  };


  const banks = [];
  for (let i = 0; i < outputs.length; i += BANK_SIZE) {
    banks.push(outputs.slice(i, i + BANK_SIZE));
  }

  const renderHeaderRow = (bankIndex) => (
    <>
      <div className={classes.corner}>out \ in</div>
      {inputs.map((input) => (
        <div
          key={`h-${bankIndex}-${input.value}`}
          className={clsx(classes.colHeader, {
            [classes.colHeaderStaged]: stagedInput === input.value,
            [classes.colHeaderActive]:
              hover.input === input.value && stagedInput !== input.value,
          })}
          title={input.label}
        >
          {input.label}
        </div>
      ))}
    </>
  );

  const renderRow = (output) => {
    const routedInput = routing[output.value];
    return (
      <React.Fragment key={`r-${output.value}`}>
        <div
          className={clsx(classes.rowHeader, {
            [classes.rowHeaderStaged]: stagedOutput === output.value,
            [classes.rowHeaderActive]:
              hover.output === output.value && stagedOutput !== output.value,
          })}
          title={output.label}
        >
          {output.label}
        </div>
        {inputs.map((input) => {
          const isActive = routedInput === input.value;
          const isStaged =
            stagedOutput === output.value && stagedInput === input.value;
          const isCross =
            hover.input === input.value || hover.output === output.value;
          // Guide lines run along the staged row/column, but not through the
          // staged cell itself (it carries its own orange fill).
          const inStagedRow = stagedOutput === output.value && !isStaged;
          const inStagedCol = stagedInput === input.value && !isStaged;
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
                [classes.lineRow]: inStagedRow,
                [classes.lineCol]: inStagedCol,
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
  };

  return (
    <div className={classes.banks}>
      {banks.map((bankOutputs, bankIndex) => (
        <div className={classes.grid} style={gridStyle} key={`bank-${bankIndex}`}>
          {renderHeaderRow(bankIndex)}
          {bankOutputs.map((output) => renderRow(output))}
        </div>
      ))}
    </div>
  );
}

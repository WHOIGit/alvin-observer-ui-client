import { afterEach, expect, test, vi } from "vitest";
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { ThemeProvider as MuiStylesThemeProvider } from "@mui/styles";
import RouterMatrix from "./RouterMatrix";

const inputs = [
  { label: "IN1", value: "input1" },
  { label: "IN2", value: "input2" },
];
const outputs = [
  { label: "OUT1", value: "output1" },
  { label: "OUT2", value: "output2" },
];

// RouterMatrix uses legacy @mui/styles makeStyles, which needs a theme in
// context. It has no Redux dependency, so a plain theme wrapper is enough.
const theme = createTheme();
const renderMatrix = (ui: React.ReactElement) =>
  render(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <MuiStylesThemeProvider theme={theme}>{ui}</MuiStylesThemeProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );

afterEach(() => {
  cleanup();
});

test("renders input and output labels", () => {
  const { getByText } = renderMatrix(
    <RouterMatrix inputs={inputs} outputs={outputs} onSelect={() => {}} />
  );
  expect(getByText("IN1")).toBeTruthy();
  expect(getByText("OUT2")).toBeTruthy();
});

test("marks the active crosspoint from the routing map", () => {
  const { getByLabelText } = renderMatrix(
    <RouterMatrix
      inputs={inputs}
      outputs={outputs}
      routing={{ output1: "input1" }}
      onSelect={() => {}}
    />
  );
  expect(
    getByLabelText("Route IN1 to OUT1 (active)").getAttribute("aria-pressed")
  ).toBe("true");
  expect(
    getByLabelText("Route IN2 to OUT2").getAttribute("aria-pressed")
  ).toBe("false");
});

test("calls onSelect with the input and output of a clicked cell", () => {
  const onSelect = vi.fn();
  const { getByLabelText } = renderMatrix(
    <RouterMatrix inputs={inputs} outputs={outputs} onSelect={onSelect} />
  );
  fireEvent.click(getByLabelText("Route IN2 to OUT1"));
  expect(onSelect).toHaveBeenCalledWith("input2", "output1");
});

import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import { makeCameraControlsStore } from "../../../tests/imaging-test-utils";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import FocusModeDisplayChip from "./FocusModeDisplayChip.jsx";

afterEach(() => {
  cleanup();
});

test("shows the reported focus mode", () => {
  const store = makeCameraControlsStore({
    currentCamData: { currentSettings: { focus_mode: "AF" } } as any,
  });
  const { getByText } = renderWithProviders(<FocusModeDisplayChip />, {
    store,
  });
  expect(getByText("FOCUS: AF")).toBeTruthy();
});

test("renders nothing when the camera reports no focus mode", () => {
  const store = makeCameraControlsStore({
    currentCamData: { currentSettings: { focus_mode: null } } as any,
  });
  const { container } = renderWithProviders(<FocusModeDisplayChip />, {
    store,
  });
  expect(container.firstChild).toBe(null);
});

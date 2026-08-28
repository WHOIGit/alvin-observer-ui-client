import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import RestartButton from "./RestartButton";

afterEach(() => cleanup());

test("the confirmation opens on press, not on release", () => {
  render(<RestartButton />);
  const button = screen.getByLabelText("Restart");

  fireEvent.pointerDown(button);
  expect(screen.getByText("Restart imaging server?")).toBeTruthy();
});

test("releasing over the backdrop does not dismiss the confirmation", () => {
  render(<RestartButton />);
  fireEvent.pointerDown(screen.getByLabelText("Restart"));

  const backdrop = document.querySelector(".MuiBackdrop-root");
  expect(backdrop).toBeTruthy();
  fireEvent.click(backdrop!);

  expect(screen.getByText("Restart imaging server?")).toBeTruthy();
});

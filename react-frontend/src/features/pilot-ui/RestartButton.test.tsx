import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import RestartButton from "./RestartButton";

afterEach(() => cleanup());

// jsdom has no PointerEvent, and fireEvent.pointerDown drops button/isPrimary,
// so dispatch a MouseEvent named pointerdown and pin isPrimary on it.
function pointerDown(el: Element, { button = 0, isPrimary = true } = {}) {
  const event = new MouseEvent("pointerdown", {
    bubbles: true,
    cancelable: true,
    button,
  });
  Object.defineProperty(event, "isPrimary", { value: isPrimary });
  fireEvent(el, event);
}

function prompt() {
  return screen.queryByText("Restart imaging server?");
}

test("the confirmation opens on press, not on release", () => {
  render(<RestartButton />);
  pointerDown(screen.getByLabelText("Restart"));
  expect(prompt()).toBeTruthy();
});

test("releasing over the backdrop does not dismiss the confirmation", () => {
  render(<RestartButton />);
  pointerDown(screen.getByLabelText("Restart"));

  const backdrop = document.querySelector(".MuiBackdrop-root");
  expect(backdrop).toBeTruthy();
  fireEvent.click(backdrop!);

  expect(prompt()).toBeTruthy();
});

test("a right-click does not open it", () => {
  render(<RestartButton />);
  pointerDown(screen.getByLabelText("Restart"), { button: 2 });
  expect(prompt()).toBeNull();
});

test("a second touch point does not open it", () => {
  render(<RestartButton />);
  pointerDown(screen.getByLabelText("Restart"), { isPrimary: false });
  expect(prompt()).toBeNull();
});

test("the label is settable so two mounts stay distinguishable", () => {
  render(<RestartButton label="Restart imaging server" />);
  expect(screen.getByLabelText("Restart imaging server")).toBeTruthy();
});

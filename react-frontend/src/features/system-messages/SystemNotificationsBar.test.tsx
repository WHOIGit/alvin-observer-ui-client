import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import SystemNotificationsBar from "./SystemNotificationsBar";
import systemMessagesReducer, { addSystemMessage } from "./systemMessagesSlice";

function makeStore() {
  return configureStore({
    reducer: {
      systemMessages: systemMessagesReducer,
    },
  });
}

afterEach(() => {
  cleanup();
});

test("shows a stable idle fixture when there are no messages", async () => {
  const user = userEvent.setup();
  const store = makeStore();

  const { getByLabelText, getByText } = renderWithProviders(
    <SystemNotificationsBar />,
    { store }
  );

  expect(getByLabelText("Expand system notifications")).toBeTruthy();
  expect(getByText("System")).toBeTruthy();
  expect(getByText("0")).toBeTruthy();

  await user.click(getByLabelText("Expand system notifications"));

  expect(getByText("No active notifications")).toBeTruthy();
  expect(getByText("No system messages")).toBeTruthy();
});

test("shows unread severity counters and expands into a message tray", async () => {
  const user = userEvent.setup();
  const store = makeStore();

  store.dispatch(
    addSystemMessage(
      {
        correlation_id: "warn-1",
        timestamp: "2026-06-15T12:00:00Z",
        message: "Low disk space",
        level: "WARN",
        source: "storage",
      },
      1000
    )
  );
  store.dispatch(
    addSystemMessage(
      {
        correlation_id: "error-1",
        timestamp: "2026-06-15T12:01:00Z",
        message: "Recorder offline",
        level: "ERROR",
      },
      2000
    )
  );

  const { getByLabelText, getByText } = renderWithProviders(
    <SystemNotificationsBar />,
    { store }
  );

  expect(getByLabelText("1 unread warning message")).toBeTruthy();
  expect(getByLabelText("1 unread error message")).toBeTruthy();

  await user.click(getByLabelText("Expand system notifications"));

  expect(getByText("2 active notifications")).toBeTruthy();
  expect(getByText("Low disk space")).toBeTruthy();
  expect(getByText("Recorder offline")).toBeTruthy();
});

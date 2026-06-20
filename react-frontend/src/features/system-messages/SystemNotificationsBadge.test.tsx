import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import SystemNotificationsBadge from "./SystemNotificationsBadge";
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

test("opens system messages in a popover", async () => {
  const user = userEvent.setup();
  const store = makeStore();

  store.dispatch(
    addSystemMessage(
      {
        correlation_id: "critical-1",
        timestamp: "2026-06-15T12:00:00Z",
        message: "Recorder offline",
        level: "CRITICAL",
      },
      1000
    )
  );

  const { getByLabelText, getByText } = renderWithProviders(
    <SystemNotificationsBadge />,
    { store }
  );

  await user.click(getByLabelText("Open system notifications"));

  expect(getByText("1 active notification")).toBeTruthy();
  expect(getByText("Recorder offline")).toBeTruthy();
});

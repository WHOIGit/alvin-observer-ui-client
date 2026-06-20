import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import SystemMessagesPanel from "./SystemMessagesPanel";
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

test("shows an empty system messages state", () => {
  const store = makeStore();

  const { getByText } = renderWithProviders(<SystemMessagesPanel />, {
    store,
  });

  expect(getByText("No active notifications")).toBeTruthy();
  expect(getByText("No system messages")).toBeTruthy();
});

test("shows active system messages", () => {
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

  const { getByText } = renderWithProviders(<SystemMessagesPanel />, {
    store,
  });

  expect(getByText("2 active notifications")).toBeTruthy();
  expect(getByText("Low disk space")).toBeTruthy();
  expect(getByText("Recorder offline")).toBeTruthy();
});

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import React from "react";
import { act, cleanup } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import cameraControlsReducer from "../camera-controls/cameraControlsSlice";
import systemMessagesReducer, {
  selectSystemMessages,
} from "../system-messages/systemMessagesSlice";
import { renderWithProviders } from "../../../tests/renderWithProviders";

// Capture the listener's channel callback so tests can drive connection
// status transitions directly.
let statusCallback: (event: { status: string }) => void;

vi.mock("../../hooks/useImagingClient", () => ({
  useConnectionStatus: (_side: unknown, callback: (event: { status: string }) => void) => {
    statusCallback = callback;
  },
}));

let ConnectionStatusListener: React.ComponentType<{ namespaceOverride?: string }>;

beforeEach(async () => {
  // Import after the mock is registered.
  ConnectionStatusListener = (
    await import("./ConnectionStatusListener")
  ).default;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makeStore() {
  return configureStore({
    reducer: {
      cameraControls: cameraControlsReducer,
      systemMessages: systemMessagesReducer,
    },
  });
}

describe("ConnectionStatusListener", () => {
  test("posts a CRITICAL alert when the connection drops", () => {
    const store = makeStore();
    renderWithProviders(
      <ConnectionStatusListener station="S" />,
      { store }
    );

    expect(selectSystemMessages(store.getState())).toHaveLength(0);

    act(() => statusCallback({ status: "disconnected" }));

    const messages = selectSystemMessages(store.getState());
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      level: "CRITICAL",
      source: "connection",
      sticky: true,
    });
    expect(messages[0].message).toMatch(/Starboard/);
  });

  test("does not duplicate the alert while the outage continues", () => {
    const store = makeStore();
    renderWithProviders(
      <ConnectionStatusListener station="S" />,
      { store }
    );

    act(() => {
      statusCallback({ status: "error" });
      statusCallback({ status: "error" });
      statusCallback({ status: "disconnected" });
    });

    expect(
      selectSystemMessages(store.getState()).filter(
        (m) => m.level === "CRITICAL"
      )
    ).toHaveLength(1);
  });

  test("clears the alert and posts a recovery notice on reconnect", () => {
    const store = makeStore();
    renderWithProviders(
      <ConnectionStatusListener station="S" />,
      { store }
    );

    act(() => statusCallback({ status: "disconnected" }));
    act(() => statusCallback({ status: "connected" }));

    const messages = selectSystemMessages(store.getState());
    // The loss alert is dismissed; an INFO recovery notice remains.
    expect(messages.filter((m) => m.level === "CRITICAL")).toHaveLength(0);
    expect(messages.filter((m) => m.level === "INFO")).toHaveLength(1);
  });

  test("stays silent on a clean first connect", () => {
    const store = makeStore();
    renderWithProviders(
      <ConnectionStatusListener station="S" />,
      { store }
    );

    act(() => statusCallback({ status: "connected" }));

    expect(selectSystemMessages(store.getState())).toHaveLength(0);
  });
});

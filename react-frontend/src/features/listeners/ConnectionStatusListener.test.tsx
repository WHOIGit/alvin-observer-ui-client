import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import cameraControlsReducer from "../camera-controls/cameraControlsSlice";
import systemMessagesReducer, {
  selectSystemMessages,
} from "../system-messages/systemMessagesSlice";
import { renderWithProviders } from "../../../tests/renderWithProviders";

// A minimal stand-in for the socket.io client: just enough event plumbing for
// the listener under test.
function createFakeSocket() {
  const handlers: Record<string, Array<(...args: any[]) => void>> = {};
  return {
    connected: false,
    on(event: string, cb: (...args: any[]) => void) {
      (handlers[event] ||= []).push(cb);
    },
    off(event: string, cb: (...args: any[]) => void) {
      handlers[event] = (handlers[event] || []).filter((h) => h !== cb);
    },
    fire(event: string, ...args: any[]) {
      (handlers[event] || []).forEach((h) => h(...args));
    },
  };
}

const fakeSocket = createFakeSocket();

vi.mock("../../hooks/useSocket", () => ({
  useSocket: () => fakeSocket,
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
  test("posts a CRITICAL alert when the socket drops", () => {
    const store = makeStore();
    renderWithProviders(
      <ConnectionStatusListener namespaceOverride="/stbd" />,
      { store }
    );

    expect(selectSystemMessages(store.getState())).toHaveLength(0);

    act(() => fakeSocket.fire("disconnect"));

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
      <ConnectionStatusListener namespaceOverride="/stbd" />,
      { store }
    );

    act(() => {
      fakeSocket.fire("connect_error");
      fakeSocket.fire("connect_error");
      fakeSocket.fire("disconnect");
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
      <ConnectionStatusListener namespaceOverride="/stbd" />,
      { store }
    );

    act(() => fakeSocket.fire("disconnect"));
    act(() => fakeSocket.fire("connect"));

    const messages = selectSystemMessages(store.getState());
    // The loss alert is dismissed; an INFO recovery notice remains.
    expect(messages.filter((m) => m.level === "CRITICAL")).toHaveLength(0);
    expect(messages.filter((m) => m.level === "INFO")).toHaveLength(1);
  });

  test("stays silent on a clean first connect", () => {
    const store = makeStore();
    renderWithProviders(
      <ConnectionStatusListener namespaceOverride="/stbd" />,
      { store }
    );

    act(() => fakeSocket.fire("connect"));

    expect(selectSystemMessages(store.getState())).toHaveLength(0);
  });
});

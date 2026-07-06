import { afterEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import systemMessagesReducer, {
  selectSystemMessages,
} from "../system-messages/systemMessagesSlice";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { emitTo } from "../../../tests/imaging-test-utils";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import { getSharedImagingClient } from "../../lib/imaging-client";
import SystemMessageListener from "./SystemMessageListener.jsx";

function makeStore() {
  return configureStore({
    reducer: { systemMessages: systemMessagesReducer },
  });
}

afterEach(() => {
  cleanup();
  getSharedImagingClient().close();
});

test("stores system messages arriving on the v1.5 channel", async () => {
  const h = createSocketIoHarness();
  const store = makeStore();
  renderWithProviders(<SystemMessageListener />, { store });

  await h.connected;
  // Give the /system namespace handshake a beat to complete.
  await new Promise((resolve) => setTimeout(resolve, 10));

  emitTo(h, "/system", "SystemMessage", {
    message: "Recorder unreachable",
    level: "CRITICAL",
    source: "device",
    sticky: true,
  });

  await vi.waitFor(() =>
    expect(selectSystemMessages(store.getState())).toHaveLength(1)
  );
  expect(selectSystemMessages(store.getState())[0]).toMatchObject({
    message: "Recorder unreachable",
    level: "CRITICAL",
  });
});

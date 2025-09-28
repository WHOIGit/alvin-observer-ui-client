import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { createSocketIoHarness } from "../../tests/socket.io-harness";
import { useSocket } from "./useSocket";

afterEach(() => cleanup());

function UseSocketTwice() {
  useSocket("/");
  useSocket("/");
  return null;
}

test("useSocket shares one connection per namespace and refcounts", async () => {
  // Register expectations for potential disconnect events
  const h = createSocketIoHarness((h, expectEmit) => {
    h.firstDisconnect = expectEmit("disconnectEvent");
    h.secondDisconnect = expectEmit("disconnectEvent");
  });

  const connections: any[] = [];

  const { getInterceptor } = await import("../../tests/ws-interceptor");
  getInterceptor().on("connection", (conn: any) => connections.push(conn));

  // Mount two consumers of the same namespace
  const { unmount } = render(<UseSocketTwice />);

  await h.connected;
  // Give a tick for any possible duplicate
  await new Promise((r) => setTimeout(r, 20));
  expect(connections.length).toBe(1);

  // Unmount both; only one disconnectEvent should appear (on last consumer)
  unmount();

  // First expectation should resolve
  await expect(h.firstDisconnect).resolves.toEqual({
    event: "disconnectEvent",
    namespace: "/",
    args: [{ client: "" }],
  });

  // Second should NOT resolve within a short timeout (no extra disconnect)
  const timed = Promise.race([
    h.secondDisconnect.then(() => "resolved"),
    new Promise((res) => setTimeout(() => res("timeout"), 50)),
  ]);
  await expect(timed).resolves.toBe("timeout");
});

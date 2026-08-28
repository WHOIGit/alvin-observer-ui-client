import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { act } from "@testing-library/react";
import { createSocketIoHarness } from "../../tests/socket.io-harness";
import { useSocket, useSocketListener } from "./useSocket";

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

function Listener({
  event,
  onMessage,
}: {
  event: string;
  onMessage: (m: any) => void;
}) {
  useSocketListener("/", event, onMessage);
  return null;
}

test("useSocketListener attaches and cleans up event handler", async () => {
  const h = createSocketIoHarness();
  let received = 0;

  const { unmount } = render(
    <Listener event="foo:event" onMessage={() => received++} />
  );

  await h.connected;
  await act(async () => {
    h.emit("foo:event", { a: 1 });
    await new Promise((r) => setTimeout(r, 0));
  });
  expect(received).toBe(1);

  // Unmount and emit again; should not trigger
  unmount();
  await act(async () => {
    h.emit("foo:event", { a: 2 });
    await new Promise((r) => setTimeout(r, 0));
  });
  expect(received).toBe(1);
});

function SideListener({
  namespace,
  onMessage,
}: {
  namespace: string;
  onMessage: (m: any) => void;
}) {
  useSocketListener(namespace, "cam:heartbeat", onMessage);
  return null;
}

test("useSocketListener rebinds when the namespace changes", async () => {
  const h = createSocketIoHarness();
  const seen: string[] = [];
  const onMessage = (m: any) => seen.push(m.side);

  const { rerender } = render(
    <SideListener namespace="/port" onMessage={onMessage} />
  );
  await h.connected;

  rerender(<SideListener namespace="/stbd" onMessage={onMessage} />);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });

  await act(async () => {
    h.emit({ event: "cam:heartbeat", namespace: "/port" }, { side: "port" });
    h.emit({ event: "cam:heartbeat", namespace: "/stbd" }, { side: "stbd" });
    await new Promise((r) => setTimeout(r, 20));
  });

  expect(seen).toEqual(["stbd"]);
});

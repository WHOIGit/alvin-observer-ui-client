import { afterEach, expect, test } from "vitest";
import React, { useEffect, useState } from "react";
import { render, cleanup } from "@testing-library/react";
import { createSocketIoHarness } from "./socket.io-harness";
import sio from "socket.io-client";

type SocketHelloProps = {
  onMessage?: (msg: any) => void;
};

function SocketHello({ onMessage }: SocketHelloProps) {
  useEffect(() => {
    const socket = sio("/", { transports: ["websocket"] });

    socket.on("connect", () => {
      socket.emit("hello", "world");
    });

    socket.on("hello", (...args) => {
      onMessage?.(args);
    });

    return () => {
      socket.close();
    };
  }, []);

  return null;
}

afterEach(() => {
  // Unmount React trees created with render()
  cleanup();
});

test("intercepts connection", async () => {
  const h = createSocketIoHarness();

  render(<SocketHello />);

  await h.connected;
});

test("intercepts emitted events", async () => {
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotHello = expectEmit("hello");
  });

  render(<SocketHello />);

  await h.connected;
  await expect(h.gotHello).resolves.toEqual({
    event: "hello",
    data: ["world"],
  });
});

test("allows injection of events", async () => {
  const h = createSocketIoHarness();

  let received = 0;

  render(<SocketHello onMessage={() => received++} />);

  await h.connected;

  // Proper way to emit an event to the client
  h.emit("hello");

  // But wait, the message handler hasn't fired yet. Why not? Because Socket.IO
  // enqueues processing the incoming message until the next tick.
  expect(received).not.toEqual(1);

  // Wait a tick, and now the message handler should have fired.
  await new Promise(process.nextTick);
  expect(received).toEqual(1);
});

test("connection event doesn't falsely fire", async () => {
  let connected = false;
  createSocketIoHarness().connected.then(() => (connected = true));
  await new Promise((res) => setTimeout(res, 250));
  expect(connected).toBe(false);
});

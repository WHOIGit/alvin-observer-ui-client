import { afterEach, expect, test } from "vitest";
import React, { useEffect, useState } from "react";
import { render, cleanup } from "@testing-library/react";
import { createSocketIoHarness } from "./socket.io-harness";
import sio from "socket.io-client";

function SocketHello({ on_message = (msg: any) => {} }) {
  useEffect(() => {
    const socket = sio("/", { transports: ["websocket"] });

    socket.on("connect", () => {
      socket.emit("hello", "world");
    });

    socket.on("hello", (...args) => {
      on_message(args);
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
  const connP = createSocketIoHarness().waitForConnection();

  render(<SocketHello />);

  const { io, conn } = await connP;
  expect(io).toBeDefined();
  expect(conn).toBeDefined();
});

test("intercepts emitted events", async () => {
  const helloP = createSocketIoHarness()
    .waitForConnection()
    .then(({ harness }) => harness.waitForClientEmit("hello"));

  render(<SocketHello />);

  expect(await helloP).toMatchObject({ event: "hello", data: ["world"] });
});

test("allows injection of events", async () => {
  const connectedP = createSocketIoHarness().waitForConnection();

  let received = 0;

  render(<SocketHello on_message={() => received++} />);

  const { io } = await connectedP;

  // This is *almost* the proper way to emit an event *to* the client.
  io.client.emit("hello");

  // But wait, the message handler hasn't fired yet. Why not? Because Socket.IO
  // enqueues processing the incoming message until the next tick.
  expect(received).not.toEqual(1);

  // Wait a tick, and now the message handler should have fired.
  await new Promise(process.nextTick);
  expect(received).toEqual(1);

  // This is also not the way to do it -- this is for emitting to the server an
  // event which has not actually been emitted by the client. It requires that
  // a real server is connected.
  expect(() => io.server.emit("hello", 123)).toThrow();
});

test("connection event doesn't falsely fire", async () => {
  let connected = false;
  createSocketIoHarness()
    .waitForConnection()
    .then(() => (connected = true));
  await new Promise((res) => setTimeout(res, 250));
  expect(connected).toBe(false);
});

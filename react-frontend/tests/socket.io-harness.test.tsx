import { afterEach, expect, test } from "vitest";
import React, { useEffect } from "react";
import { render, cleanup } from "@testing-library/react";
import { createIoHarness } from "./socket.io-harness";
import io from "socket.io-client";

// Example of a simple component that creates a socket when mounted and emits
// an event once connected.
function SocketHello() {
  useEffect(() => {
    const socket = io("/", { transports: ["websocket"], path: "/socket.io" });

    socket.on("connect", () => {
      socket.emit("hello", "world");
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
  const connP = createIoHarness().waitForConnection();

  render(<SocketHello />);

  const { io, conn } = await connP;
  expect(io).toBeDefined();
  expect(conn).toBeDefined();
});

test("intercepts emitted events", async () => {
  const helloP = createIoHarness()
    .waitForConnection()
    .then(({ harness }) => harness.waitForClientEmit("hello"));

  render(<SocketHello />);

  expect(await helloP).toMatchObject({ event: "hello", data: ["world"] });
});

test("connection event doesn't falsely fire", async () => {
  let connected = false;
  createIoHarness()
    .waitForConnection()
    .then(() => (connected = true));
  await new Promise((res) => setTimeout(res, 250));
  expect(connected).toBe(false);
});

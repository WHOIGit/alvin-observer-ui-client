import { afterEach } from "vitest";
import { toSocketIo } from "@mswjs/socket.io-binding";
import { getInterceptor, resetInterceptor } from "./ws-interceptor";

// After each test case, we reset the interceptor to drop any existing event
// handlers.
afterEach(() => {
  resetInterceptor();
});

type ExpectEmitResult = {
  event: string;
  namespace: string;
  args: any[];
};

export type SocketIoHarness = {
  connected: Promise<void>;
  emit(event: string, ...args: any[]): void;

  // Allow attaching labeled expectations: h.someLabel = expectEmit("evt")
  [label: string]: any;
};

export function createSocketIoHarness(
  register?: (
    h: SocketIoHarness,
    expectEmit: (event: string) => Promise<ExpectEmitResult>
  ) => void
): SocketIoHarness {
  let io: ReturnType<typeof toSocketIo> | undefined;

  // A test can open more than one WebSocket transport (the shared client's
  // pool may put namespaces on separate connections, e.g. after a previous
  // test's teardown). Expectation listeners attach to every connection —
  // current and future — so an emit is observed whichever transport carries
  // it.
  const connections: Array<ReturnType<typeof toSocketIo>> = [];

  // Per-event FIFO of resolvers for events from the client
  const queues = new Map<string, Array<(v: ExpectEmitResult) => void>>();

  const attach = (
    conn: ReturnType<typeof toSocketIo>,
    eventName: string
  ) => {
    conn.client.on(eventName, (event: MessageEvent, ...args: any[]) => {
      // Resolve the oldest expectation promise (FIFO), if there is one
      const resolve = queues.get(eventName)!.shift();
      if (resolve)
        resolve({
          event: eventName,
          namespace: (event as any).socketio.namespace,
          args,
        });
    });
  };

  // Ensure a listener is attached for the specified event.
  // socket.io-binding does not allow us to listen for all events, so we attach
  // listeners on demand the first time an expectation is registered.
  const ensureListener = (eventName: string) => {
    if (queues.has(eventName)) return;
    queues.set(eventName, []);
    for (const conn of connections) attach(conn, eventName);
  };

  const expectEmit = (event: string): Promise<ExpectEmitResult> => {
    ensureListener(event);
    return new Promise<ExpectEmitResult>((resolve) => {
      queues.get(event)!.push(resolve);
    });
  };

  const harness: SocketIoHarness = {
    emit(event: string, ...args: any[]) {
      if (!io) throw new Error("Cannot emit - no connection yet");
      io.client.emit(event, ...args); // as in server -> client
    },

    // connected is a promise that gets resolved when the connection is
    // established. At that time, we run the test's register() callback, which
    // can synchronously set up expectations.
    connected: new Promise<void>((resolve) => {
      getInterceptor().on("connection", (connection: any) => {
        const conn = toSocketIo(connection);
        connections.push(conn);
        io = conn;
        // Late connections get listeners for every already-expected event.
        for (const eventName of queues.keys()) attach(conn, eventName);
        resolve();
        // register() runs once — re-running it on later connections would
        // re-assign the test's expectation promises and orphan their
        // resolvers in the FIFO.
        if (register && connections.length === 1) {
          register(harness, expectEmit);
        }
      });
    }),
  };

  return harness;
}

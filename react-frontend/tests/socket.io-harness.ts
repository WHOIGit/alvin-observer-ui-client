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
  data: any[];
};

export type SocketIoHarness = {
  connected: Promise<void>;
  emit(event: string, ...data: any[]): void;

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

  // Per-event FIFO of resolvers for events from the client
  const queues = new Map<string, Array<(v: ExpectEmitResult) => void>>();

  // Ensure a listener is attached for the specified event.
  // socket.io-binding does not allow us to listen for all events, so we attach
  // listeners on demand the first time an expectation is registered.
  const ensureListener = (event: string) => {
    if (queues.has(event)) return;
    queues.set(event, []);
    io!.client.on(event, (_evt: any, ...data: any[]) => {
      // Resolve the oldest expectation promise (FIFO), if there is one
      const resolve = queues.get(event)!.shift();
      if (resolve) resolve({ event, data });
    });
  };

  const expectEmit = (event: string): Promise<ExpectEmitResult> => {
    ensureListener(event);
    return new Promise<ExpectEmitResult>((resolve) => {
      queues.get(event)!.push(resolve);
    });
  };

  const harness: SocketIoHarness = {
    emit(event: string, ...data: any[]) {
      if (!io) throw new Error("Cannot emit - no connection yet");
      io.client.emit(event, ...data); // as in server -> client
    },

    // connected is a promise that gets resolved when the connection is
    // established. At that time, we run the test's register() callback, which
    // can synchronously set up expectations.
    connected: new Promise<void>((resolve) => {
      getInterceptor().on("connection", (connection: any) => {
        io = toSocketIo(connection);
        resolve();
        if (register) register(harness, expectEmit);
      });
    }),
  };

  return harness;
}

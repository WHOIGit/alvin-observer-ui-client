import { afterEach } from "vitest";
import { toSocketIo } from "@mswjs/socket.io-binding";
import { getInterceptor, resetInterceptor } from "./ws-interceptor";

// After each test case, we reset the interceptor to drop any existing event
// handlers.
afterEach(() => {
  resetInterceptor();
});

export type SocketIoHarness = {
  waitForConnection(): Promise<{
    harness: SocketIoHarness;
    io: ReturnType<typeof toSocketIo>;
    conn: any;
  }>;
  waitForClientEmit(event: string): Promise<{
    harness: SocketIoHarness;
    event: string;
    data: any[];
  }>;
};

export function createSocketIoHarness(): SocketIoHarness {
  const ready = new Promise<{ io: any; conn: any }>((resolve) => {
    getInterceptor().on("connection", (conn: any) => {
      resolve({ io: toSocketIo(conn), conn });
    });
  });

  const harness: SocketIoHarness = {
    async waitForConnection() {
      const { io, conn } = await ready;
      return { harness, io, conn } as const;
    },

    async waitForClientEmit(event: string) {
      const { io } = await ready;
      return new Promise((resolve) => {
        io.client.on(event, (_evt: any, ...data: any[]) => {
          resolve({ harness, event, data });
        });
      });
    },
  };

  return harness;
}

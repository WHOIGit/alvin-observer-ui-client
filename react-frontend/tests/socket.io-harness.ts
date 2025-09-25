import { afterEach } from "vitest";
import { toSocketIo } from "@mswjs/socket.io-binding";
import { getInterceptor, resetInterceptor } from "./ws-interceptor";

// After each test case, we reset the interceptor to drop any existing event
// handlers.
afterEach(() => {
  resetInterceptor();
});

export type IoHarness = {
  waitForConnection(): Promise<{
    harness: IoHarness;
    io: ReturnType<typeof toSocketIo>;
    conn: any;
  }>;
  waitForClientEmit(event: string): Promise<{
    harness: IoHarness;
    event: string;
    data: any[];
  }>;
};

export function createIoHarness(): IoHarness {
  let ready: Promise<{ io: any; conn: any }>;
  let resolveReady!: (v: { io: any; conn: any }) => void;
  ready = new Promise((res) => (resolveReady = res));

  getInterceptor().on("connection", (conn: any) => {
    const io = toSocketIo(conn);
    resolveReady({ io, conn });
  });

  const harness: IoHarness = {
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

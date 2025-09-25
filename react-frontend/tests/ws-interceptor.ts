// This file provides a singleton instance of WebSocketInterceptor from
// MockServiceWorker. In setup.ts we will initialize it once. After each test,
// the interceptor must be reset.

import { WebSocketInterceptor } from "@mswjs/interceptors/WebSocket";

let interceptor: WebSocketInterceptor | null = null;

export function initInterceptor(): WebSocketInterceptor {
  if (interceptor) return interceptor;
  interceptor = new WebSocketInterceptor();
  interceptor.apply();
  return interceptor;
}

export function getInterceptor(): WebSocketInterceptor {
  if (!interceptor) {
    throw new Error("WebSocketInterceptor not initialized.");
  }
  return interceptor;
}

export function resetInterceptor(): void {
  interceptor?.removeAllListeners();
}

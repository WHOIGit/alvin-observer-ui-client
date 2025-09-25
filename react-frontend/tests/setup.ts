// This code is run before each test file.

import { initInterceptor } from "./ws-interceptor";

// Initialize the WebSocket interceptor once. This must be done before any
// imported modules take any references to the real WebSocket APIs.
initInterceptor();

// Populate settings used for Socket.IO connections
window.WS_SERVER = "http://example.invalid";
window.WS_PATH = "/imaging-server/";

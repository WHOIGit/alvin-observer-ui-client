# imaging-client

TypeScript client library for the Alvin Imaging System control protocol. The
API is topology-shaped, mirroring the backend's domain model: a **client** has
**stations** (port / starboard / pilot); a station has **cameras**, a
**recorder**, and a **router**. Consumers ask for a station, then either issue
semantic commands ("set this camera's ISO") or subscribe to typed telemetry
channels. Nothing in this library knows about React or Redux, and nothing
outside it knows the wire protocol is Socket.IO.

## Import boundary

Application code may import **only** from the library's entry point
(`src/lib/imaging-client`) and the React hooks built on it
(`src/hooks/useImagingClient.js`). Deep imports of internal modules
(`wire.ts`, `protocol.ts`, ...) and any application-side import of
`socket.io-client` are rejected by `tests/architecture.test.ts`. WebRTC video
streaming is deliberately outside this boundary — it speaks WHEP to the video
server, not the imaging-control protocol.

## Quick start

Issuing commands from a component:

```jsx
import { useImagingStation } from "../../hooks/useImagingClient";
import { FOCUS_MODES } from "../../lib/imaging-client";

function FocusToggle({ observerSide, activeCamera }) {
  const station = useImagingStation(observerSide);
  const camera = station.camera(activeCamera);
  return <button onClick={() => camera.setFocusMode(FOCUS_MODES.AUTOFOCUS)} />;
}
```

Consuming telemetry:

```jsx
import { useCamHeartbeat } from "../../hooks/useImagingClient";

useCamHeartbeat(observerSide, (heartbeat) => {
  // heartbeat.isControllable, heartbeat.iso, heartbeat.hasFault, ...
});
```

Awaiting a command's outcome (optional — see [Commands](#commands)):

```js
try {
  await station.camera(activeCamera).setIso("400");
} catch (err) {
  // err is a CommandFailedError; err.result is the CommandResult
}
```

## Obtaining a client

```ts
getSharedImagingClient(): ImagingClient
createImagingClient(options?: ImagingClientOptions): ImagingClient
```

`getSharedImagingClient()` returns the application-wide singleton. It reads
`window.WS_ENDPOINTS` lazily on first use, so it is safe to call at module
scope. This is what the React hooks use; application code should not normally
call `createImagingClient` directly.

`createImagingClient(options)` builds an independent client, used by tests:

```ts
interface ImagingClientOptions {
  endpoints?: WsEndpoints | (() => WsEndpoints); // default: window.WS_ENDPOINTS, read lazily
  uuid?: () => string;                           // eventId generator, injectable for tests
  now?: () => Date;                              // timestamp source, injectable for tests
}
```

`WsEndpoints` is keyed by backend API version:

```ts
type WsEndpoints = Record<string, WsEndpoint>; // keys: "1", "1.5"
type WsEndpoint = { server: string; path: string };
```

## ImagingClient

```ts
interface ImagingClient {
  station(side: ObserverSideInput): Station;

  // Vehicle-wide channels (v1 root namespace; system messages on v1.5 /system)
  onNavHeartbeat(cb: (msg: NavHeartbeat) => void): Unsubscribe;
  onSensorHeartbeat(cb: (msg: SensorHeartbeat) => void): Unsubscribe;
  onSystemMessage(cb: (msg: SystemMessage) => void): Unsubscribe;

  // v1.5 REST actions
  restartEncoder(name: string): Promise<void>;
  rebootEncoder(name: string): Promise<void>;
  restartServer(): Promise<void>;

  close(): void;
}
```

- `station(side)` accepts any [side input](#observer-sides) and returns the
  (cached) station for it; the same side always yields the same object.
- `onSystemMessage` connects to the v1.5 `/system` namespace; the server
  replays buffered alerts on connect, so late subscribers still see active
  alerts.
- `restartEncoder` / `rebootEncoder` POST to the v1.5 REST API and reject if
  no `"1.5"` endpoint is configured.
- `restartServer` is a fire-and-forget restart of the imaging server host
  (the page's own host). The request is opaque (`no-cors`); it resolves
  without a readable response.
- `close()` hard-tears-down every connection the client owns *without* the
  per-namespace good-bye. Intended for tests and full shutdowns; the shared
  client normally lives for the page's lifetime.

Nav, sensor, and system payloads are delivered as received:

```ts
interface NavHeartbeat  { eventId; timestamp; hdg; dep; alt; x; y; lat; lon }        // numbers
interface SensorHeartbeat { eventId; timestamp; command: "SSD"; t1; t2; t3 }         // numbers
interface SystemMessage {
  correlation_id?: string | null;
  timestamp?: string;
  message: string;
  level: "INFO" | "WARN" | "ERROR" | "CRITICAL" | string;
  source?: string | null;
  sticky?: boolean;
  ttl_seconds?: number | null;
}
```

## Station

```ts
interface Station {
  readonly side: ObserverSide;
  acquire(): Unsubscribe;
  camera(id: string | null): CameraHandle;

  // Commands
  selectCamera(cameraId: string, context?: CommandContext): SentCommand;
  record(cameraId: string, options?: RecordOptions): SentCommand;
  stopRecording(options?: Omit<RecordOptions, "previousCamera">): SentCommand;
  takeRoute(input: string, output: string, context?: CommandContext): SentCommand;
  send(body: CameraCommandBody, context?: CommandContext): SentCommand; // escape hatch

  // Channels; each returns an unsubscribe function
  onCamHeartbeat(cb: (msg: CamHeartbeat) => void): Unsubscribe;
  onRecorderHeartbeat(cb: (msg: RecorderHeartbeat) => void): Unsubscribe;
  onConnectionStatus(cb: (event: ConnectionStatusEvent) => void): Unsubscribe;
  onCameraList(cb: (cameras: CameraArrayEntry[]) => void): Unsubscribe;
  onRouterInputs(cb: (inputs: RouterPortEntry[]) => void): Unsubscribe;
  onRouterOutputs(cb: (outputs: RouterPortEntry[]) => void): Unsubscribe;
  onCameraSettings(cb: (msg: CameraSettings) => void): Unsubscribe;
  onCommandResult(cb: (result: CommandResult) => void): Unsubscribe;
}
```

### Connection pinning

A station's connection is reference-counted. `acquire()` pins it open and
returns the release function; every channel subscription pins it too (with
one exception, below). Hold an `acquire()` for the lifetime of any UI that
issues commands — `useImagingStation` does this — so the connection doesn't
churn between button presses. When the last reference is released, the
station sends the protocol's good-bye message and disconnects. Commands sent
after teardown are silently swallowed (matching the legacy behavior), so a
debounced stop firing after unmount is harmless.

`onConnectionStatus` reports `"connected"`, `"disconnected"`, or `"error"`.
If the pooled socket is already connected when the subscription attaches, the
callback fires immediately with `"connected"` — subscribers never need to
poll.

`onCommandResult` is the exception: subscribing does **not** pin the
connection. Delivery rides the command send path, so results arrive whenever
commands can be sent at all.

### Station commands

- `selectCamera(cameraId)` — switch the station's video source.
- `record(cameraId, options)` — route the recorder to a camera and start
  recording. `options.previousCamera` must carry the previously recording
  camera (the `camera` field of the latest recorder heartbeat — a display
  name); the protocol requires it on record-source commands.
  `options.as: "port" | "stbd"` is pilot-only delegation: the command is
  issued against the observer station's resources while still traveling over
  the pilot's connection.
- `stopRecording(options)` — stop the recorder; accepts `as` but not
  `previousCamera`.
- `takeRoute(input, output)` — connect a router input to an output
  (`RouterPortEntry.value` strings, e.g. `"input3"`, `"output1"`).
- `send(body, context)` — escape hatch for actions without a dedicated
  method. Results for these carry `kind: null`.

`CommandContext.activeCamera` identifies the station's currently selected
camera and travels in the payload's `camera` field; pass it wherever current
state knows it (a `CameraHandle` fills it in automatically).

### CameraHandle

`station.camera(id)` returns a handle whose commands all carry `id` as the
active-camera context. `id` may be `null` when no camera is selected yet.

```ts
interface CameraHandle {
  readonly id: string | null;
  setIso(value: string): SentCommand;
  setShutter(value: string): SentCommand;
  setIris(value: string): SentCommand;
  setExposureMode(value: string): SentCommand;    // EXPOSURE_MODES value
  setFocusMode(value: string): SentCommand;       // FOCUS_MODES value
  setWhiteBalance(value: string): SentCommand;    // WHITE_BALANCE_MODES value
  triggerOnePushWhiteBalance(): SentCommand;      // fires an armed ONE_PUSH
  focus(control: FocusControl | string): SentCommand;
  zoom(control: ZoomControl | string, speed?: number): SentCommand;
  panTilt(value: unknown): SentCommand;           // nipplejs-shaped move descriptor
  captureStill(value: unknown): SentCommand;
}
```

- ISO / shutter / iris values are the option strings the camera reports via
  `onCameraSettings` (e.g. `"400"`, `"1/60"`).
- `focus` / `zoom` take a `FOCUS_CONTROLS` / `ZOOM_CONTROLS` value; the
  `*_CONTINUOUS` controls start a move that runs until `STOP`. `zoom`'s
  optional `speed` applies only to continuous controls.
- One-push white balance is a two-step gesture: arm it with
  `setWhiteBalance(WHITE_BALANCE_MODES.ONE_PUSH)`, fire it with
  `triggerOnePushWhiteBalance()`.
- `captureStill`'s value differs by station: observers send
  `{ interval, imgTransferChecked }`, the pilot sends a numeric string.

## Commands

Every command method returns a `SentCommand`:

```ts
interface SentCommand extends Promise<CommandResult> {
  readonly payload: CameraCommandPayload; // exact wire payload, available synchronously
  readonly eventId: string;               // correlation id
}
```

The promise **resolves** with a `CommandResult` when the server acknowledges
OK, and **rejects** with a `CommandFailedError` on a non-OK receipt (ERR,
BUSY). Rejections are pre-observed by the library, so fire-and-forget call
sites need no `.catch()` — only `await`ing callers see the throw.

```ts
interface CommandResult {
  kind: CommandKind | null; // which method sent it; null for Station.send()
  value: unknown;           // the action value as sent (e.g. the requested ISO)
  isOk: boolean;
  eventId: string;
  payload: CameraCommandPayload; // raw wire shape — diagnostics only
  receipt: CommandReceipt;       // raw receipt — diagnostics only
}

class CommandFailedError extends Error {
  readonly result: CommandResult;
}
```

`COMMAND_KINDS` enumerates the possible `kind` values; they equal the method
names (`"setIso"`, `"record"`, ...).

Settlement rules:

- A command with no receipt **never settles**. Callers must not assume every
  command resolves or rejects.
- At most 256 unacknowledged commands are tracked per station. Beyond that
  the oldest is evicted: its promise never settles and it produces no
  `onCommandResult` event. In practice this is only reachable on a dead link.

**Promises vs. `onCommandResult`:** the promise is for call-site-local flow
(disable a button until its own command settles). Shared state that mirrors
command outcomes — e.g. the Redux camera-settings slice — should subscribe to
`Station.onCommandResult`, the single feed of every settled command, rather
than scatter `.then()` handlers.

## Telemetry

Channel payloads are **normalized** at the library boundary; the raw wire
encodings never reach consumers.

| Wire encoding | Delivered as |
|---|---|
| `"y"` / `"n"` flags | booleans under predicate names (`hasPanTilt`, `isControllable`) |
| `"true"` / `"false"` strings | booleans (`isRecording`, `isPortRecording`, `isStbdRecording`, `isProcessingComplete`) |
| Null sentinels (`'NULL_PORT_ISO'`, `'null'`, ...) | `null` |
| Driver-fault strings | `null`, with the fault reported via `hasFault` |

`hasFault` is true when any settings field carried a driver-fault value
(e.g. a driver socket timeout) — as opposed to a merely absent setting, which
is just `null` with `hasFault: false`.

```ts
interface CamHeartbeat {
  eventId: string;
  timestamp: string;
  command: string;              // SOVP / SOVS / SOPL
  camera: string;               // selected camera ID, e.g. "port_brow_4k"
  iso: string | null;
  shutter: string | null;
  iris: string | null;
  exposure: string | null;
  focus_mode: string | null;
  white_balance?: string | null;    // pilot heartbeat only
  capture_interval?: string | null; // pilot heartbeat only
  hasPanTilt: boolean;
  isControllable: boolean;
  hasFault: boolean;
  owner: "pilot" | "port" | "stbd" | "none";
  dive: string;
  cruise: string;
  version: string;
}
```

`RecorderHeartbeat` is a union; observer stations and the pilot receive
different shapes (discriminate with `"isRecording" in msg`):

```ts
interface RecorderHeartbeatObserver {
  eventId: string;
  timestamp: string;
  command: "SRVP" | "SRVS";
  camera: string;               // recorder source, by camera display name
  isRecording: boolean;
  filename: string | "none";
}

interface RecorderHeartbeatPilot {
  eventId: string;
  timestamp: string;
  command: "SRPL";
  port_camera: string;
  stbd_camera: string;
  isPortRecording: boolean;
  isStbdRecording: boolean;
  isProcessingComplete: boolean;
  filename: "none";
}
```

`onCameraSettings` fires when the server broadcasts the selected camera's
available options and/or current values:

```ts
interface CameraSettings {
  ISO?: string[];               // available options
  SHU?: string[];
  IRS?: string[];
  current_settings?: {
    iso: string | null;
    shu: string | null;
    irs: string | null;
    focus_mode: string | null;
    exposure: string | null;
    white_balance: string | null;
  };
  hasFault: boolean;
}
```

`onCameraList` and `onRouterInputs` / `onRouterOutputs` deliver configuration
arrays:

```ts
interface CameraArrayEntry { camera: string; cam_name: string; owner: "pilot" | "port" | "stbd" | "none" }
interface RouterPortEntry  { label: string; value: string } // "input1".."input16" / "output1".."output16"
```

## Domain vocabulary

Constants for driving cameras, exported from the entry point. Their names
mirror the backend's enums in suboptica's `icstypes.py`, so both ends of the
system share one vocabulary. The values happen to match protocol v1's wire
encodings, but consumers must treat them as **opaque tokens** — compare and
pass them, never assume their wire meaning.

| Constant | Values | Used with |
|---|---|---|
| `EXPOSURE_MODES` | `AUTO`, `MANUAL`, `SHUTTER_PRIORITY`, `IRIS_PRIORITY` | `setExposureMode`, heartbeat `exposure` |
| `FOCUS_MODES` | `AUTOFOCUS`, `MANUAL` | `setFocusMode`, heartbeat `focus_mode` |
| `FOCUS_CONTROLS` | `FAR_CONTINUOUS`, `FAR_ONE_STOP`, `NEAR_CONTINUOUS`, `NEAR_ONE_STOP`, `STOP` | `focus()` |
| `ZOOM_CONTROLS` | `TELEPHOTO_CONTINUOUS`, `TELEPHOTO_ONE_STOP`, `WIDE_CONTINUOUS`, `WIDE_ONE_STOP`, `STOP` | `zoom()` |
| `WHITE_BALANCE_MODES` | `AUTO`, `INDOOR`, `OUTDOOR`, `ONE_PUSH` | `setWhiteBalance`, heartbeat `white_balance` |

Each constant has a matching union type (`ExposureMode`, `FocusMode`,
`FocusControl`, `ZoomControl`, `WhiteBalanceMode`).

## Observer sides

```ts
type ObserverSide = "P" | "S" | "PL";
type ObserverSideInput = ObserverSide | string | null | undefined;

getObserverInfo(rawSide: ObserverSideInput): ObserverInfo
interface ObserverInfo {
  observerSide: ObserverSide;
  namespace: string;      // "port" | "stbd" | "pilot"
  namespacePath: string;  // "/port" | "/stbd" | "/pilot"
  command: string;        // COVP | COVS | COPL
}
```

Everywhere a side is expected (`client.station(...)`, the hooks), flexible
input is accepted: `"P"`, `"port"`, `"/stbd"`, etc. Unrecognized input
coerces to the pilot, matching historical behavior.

## React hooks

The hooks live in `src/hooks/useImagingClient.js` (outside the library, which
is React-free) and are the way components should consume this API.

```js
useImagingClient()             // the shared ImagingClient
useImagingStation(observerSide) // station, connection pinned for the component's lifetime
```

Channel hooks subscribe on mount and unsubscribe on unmount. The latest
callback is kept in a ref, so a new callback identity on each render does
**not** re-subscribe:

| Station-scoped (side, cb) | Vehicle-wide (cb) |
|---|---|
| `useCamHeartbeat` | `useNavHeartbeat` |
| `useRecorderHeartbeat` | `useSensorHeartbeat` |
| `useConnectionStatus` | `useSystemMessage` |
| `useCameraList` | |
| `useRouterInputs` / `useRouterOutputs` | |
| `useCameraSettings` | |
| `useCommandResult` | |

## Testing

Library behavior is tested in isolation (no React/Redux) in
`client.test.ts`, against a mock Socket.IO server at the WebSocket layer.
Component tests use the same harness via the helpers in
`tests/imaging-test-utils.ts` (`emitTo`, `stationConnected`,
`makeCameraControlsStore`). For deterministic payloads, inject `uuid` and
`now` through `createImagingClient`'s options — the eventId and timestamp of
every outgoing command come from them.

## Internals

Everything not exported from `index.ts` is an implementation detail:

- `wire.ts` — protocol v1 message shapes, mirroring the backend's Pydantic
  contract (`suboptica/src/suboptica/api/v1/icstypes.py`).
- `telemetry.ts` — wire → normalized-shape translation.
- `protocol.ts` — namespaces, event names, command prefixes, payload
  construction.
- `connection-pool.ts` — the ref-counted Socket.IO pool; the only module in
  the application allowed to import `socket.io-client`.

A protocol v2 is a rewrite of these modules behind the unchanged public API.

/**
 * Library-in-isolation tests: the ImagingClient talking to a mock server at
 * the WebSocket layer, with no React or Redux involved.
 */

import { afterEach, describe, expect, test, vi } from "vitest";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import { createImagingClient } from "./index";
import type { ImagingClient, Station } from "./index";
import { buildCameraCommand, normalizeObserverSide } from "./protocol";

// Sockets that outlive their test keep the shared Engine.IO transport open,
// so the next test's harness would never observe a fresh connection. Tear
// every client down after each test.
const liveClients: ImagingClient[] = [];

function makeClient(): ImagingClient {
  const client = createImagingClient();
  liveClients.push(client);
  return client;
}

afterEach(() => {
  for (const client of liveClients.splice(0)) {
    client.close();
  }
});

/** Emit a server → client event on a specific Socket.IO namespace. */
function emitTo(h: any, namespace: string, event: string, ...args: any[]) {
  // The harness signature takes an event name, but the underlying binding
  // also accepts an {event, namespace} envelope as the first argument.
  h.emit({ event, namespace }, ...args);
}

/** Resolves once the station's namespace connection is established. */
function stationConnected(station: Station): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = station.onConnectionStatus(({ status }) => {
      if (status === "connected") {
        // Defer so the unsubscribe doesn't run inside the callback loop.
        queueMicrotask(() => {
          unsubscribe();
          resolve();
        });
      }
    });
  });
}

describe("protocol helpers", () => {
  test("normalizes side aliases", () => {
    expect(normalizeObserverSide("port")).toBe("P");
    expect(normalizeObserverSide("/stbd")).toBe("S");
    expect(normalizeObserverSide("STARBOARD")).toBe("S");
    expect(normalizeObserverSide("pilot")).toBe("PL");
    expect(normalizeObserverSide("nonsense")).toBe(null);
    expect(normalizeObserverSide(null)).toBe(null);
  });

  test("omits the command field when the side is unknown", () => {
    const payload = buildCameraCommand({
      side: null,
      body: { action: { name: "ISO", value: "100" } },
      uuid: () => "u",
      now: () => new Date(0),
    });
    expect("command" in payload).toBe(false);
  });
});

describe("station commands", () => {
  test.each(SOCKET_USER_SCENARIOS)(
    "camera settings go to the station's namespace with its command prefix ($name)",
    async (scenario) => {
      const h = createSocketIoHarness((h, expectEmit) => {
        h.gotCmd = expectEmit("newCameraCommand");
      });

      const client = makeClient();
      client.station(scenario.observerSide).camera(null).setIso("200");

      await h.connected;
      const { namespace, args } = await h.gotCmd;
      expect(namespace).toBe(scenario.namespace);
      expect(args[0]).toEqual({
        eventId: expect.any(String),
        timestamp: expect.any(String),
        camera: null,
        command: scenario.cameraCommand,
        action: { name: "ISO", value: "200" },
      });
    }
  );

  test("record carries the previous camera and delegation override", async () => {
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit("newCameraCommand");
    });

    const client = makeClient();
    client.station("PL").record("stbd_sci_4k", {
      previousCamera: "stbd_brow_4k",
      as: "stbd",
    });

    await h.connected;
    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe("/pilot");
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: "stbd_brow_4k", // the previous camera overrides the context
      // Delegation swaps the command prefix to the target station's, even
      // though the message still travels over the pilot's namespace.
      command: "COVS",
      action: { name: "REC", value: "stbd_sci_4k" },
      oldCamera: "stbd_brow_4k",
      observerSideOverride: "stbd",
    });
  });

  test("stopRecording sends the ST record action", async () => {
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit("newCameraCommand");
    });

    const client = makeClient();
    client.station("P").stopRecording();

    await h.connected;
    const { args } = await h.gotCmd;
    expect(args[0].action).toEqual({ name: "REC", value: "ST" });
    expect("oldCamera" in args[0]).toBe(false);
  });

  test("pan/tilt actions carry their own timestamp", async () => {
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit("newCameraCommand");
    });

    const client = makeClient();
    const move = { actionType: "end", position: { x: 1, y: 2 } };
    client.station("S").camera("stbd_brow_4k").panTilt(move);

    await h.connected;
    const { args } = await h.gotCmd;
    expect(args[0].camera).toBe("stbd_brow_4k");
    expect(args[0].action).toEqual({
      name: "PANTILT",
      value: move,
      timestamp: expect.any(String),
    });
  });

  test("takeRoute sends the router input/output pair", async () => {
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit("newCameraCommand");
    });

    const client = makeClient();
    client.station("PL").takeRoute("input3", "output7", { activeCamera: "pilot_cam" });

    await h.connected;
    const { args } = await h.gotCmd;
    expect(args[0].camera).toBe("pilot_cam");
    expect(args[0].action).toEqual({
      name: "RTR",
      value: { input: "input3", output: "output7" },
    });
  });

  test("onCommandSent fires synchronously with a defensive copy", async () => {
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit("newCameraCommand");
    });

    const client = makeClient();
    const station = client.station("P");

    const seen: any[] = [];
    station.onCommandSent((payload) => {
      seen.push(payload);
      // A consumer mutating its copy must not corrupt the wire payload.
      payload.action.name = "CORRUPTED";
    });

    const { payload } = station.camera("port_brow_4k").setShutter("1/60");
    expect(seen).toHaveLength(1); // synchronous, before any wire round-trip
    expect(seen[0].eventId).toBe(payload.eventId);

    await h.connected;
    const { args } = await h.gotCmd;
    expect(args[0].action).toEqual({ name: "SHU", value: "1/60" });
  });

  test("ack resolves with the receipt matching the command's eventId", async () => {
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd1 = expectEmit("newCameraCommand");
      h.gotCmd2 = expectEmit("newCameraCommand");
    });

    const client = makeClient();
    const station = client.station("P");
    // Keep the connection pinned so the transient status subscription in
    // stationConnected() isn't the last reference when it unsubscribes.
    station.acquire();
    await stationConnected(station);

    const first = station.camera(null).setIso("100");
    const second = station.camera(null).setIso("400");
    await h.gotCmd1;
    await h.gotCmd2;

    // Acknowledge in reverse order to prove correlation is by eventId.
    emitTo(h, "/port", "newCameraCommand", {
      eventId: second.payload.eventId,
      receipt: { command: "COVP", status: "OK" },
    });
    emitTo(h, "/port", "newCameraCommand", {
      eventId: first.payload.eventId,
      receipt: { command: "COVP", status: "ERR" },
    });

    await expect(second.ack).resolves.toMatchObject({
      receipt: { status: "OK" },
    });
    await expect(first.ack).resolves.toMatchObject({
      receipt: { status: "ERR" },
    });
  });
});

describe("station subscriptions", () => {
  test("heartbeats fan out to every subscriber and unsubscribe individually", async () => {
    const h = createSocketIoHarness();

    const client = makeClient();
    const station = client.station("P");

    const first: any[] = [];
    const second: any[] = [];
    const unsubFirst = station.onCamHeartbeat((msg) => first.push(msg));
    station.onCamHeartbeat((msg) => second.push(msg));

    await stationConnected(station);

    emitTo(h, "/port", "CamHeartbeat", { camera: "port_brow_4k" });
    await vi.waitFor(() => expect(second).toHaveLength(1));
    expect(first).toHaveLength(1);

    unsubFirst();
    emitTo(h, "/port", "CamHeartbeat", { camera: "port_sci_4k" });
    await vi.waitFor(() => expect(second).toHaveLength(2));
    expect(first).toHaveLength(1);
  });

  test("messages on one station's namespace do not reach another's", async () => {
    const h = createSocketIoHarness();

    const client = makeClient();
    const port = client.station("P");
    const stbd = client.station("S");

    const portSeen: any[] = [];
    const stbdSeen: any[] = [];
    port.onCamHeartbeat((msg) => portSeen.push(msg));
    stbd.onCamHeartbeat((msg) => stbdSeen.push(msg));

    await stationConnected(port);
    await stationConnected(stbd);

    emitTo(h, "/stbd", "CamHeartbeat", { camera: "stbd_brow_4k" });
    await vi.waitFor(() => expect(stbdSeen).toHaveLength(1));
    expect(portSeen).toHaveLength(0);
  });

  test("heartbeat flags are delivered as booleans", async () => {
    const h = createSocketIoHarness();

    const client = makeClient();
    const station = client.station("P");

    const camSeen: any[] = [];
    const recSeen: any[] = [];
    station.onCamHeartbeat((msg) => camSeen.push(msg));
    station.onRecorderHeartbeat((msg) => recSeen.push(msg));

    await stationConnected(station);

    emitTo(h, "/port", "CamHeartbeat", {
      camera: "port_brow_4k",
      pantilt: "y",
      camctrl: "n",
    });
    emitTo(h, "/port", "RecorderHeartbeat", {
      command: "SRVP",
      camera: "Port Brow",
      recording: "true",
      filename: "clip_0001.mov",
    });
    emitTo(h, "/port", "RecorderHeartbeat", {
      command: "SRPL",
      port_camera: "Port Brow",
      stbd_camera: "Stbd Brow",
      port_recording: "true",
      stbd_recording: "false",
      filename: "none",
      processing_complete: "false",
    });

    await vi.waitFor(() => expect(recSeen).toHaveLength(2));
    expect(camSeen[0]).toMatchObject({
      camera: "port_brow_4k",
      hasPanTilt: true,
      isControllable: false,
    });
    expect(recSeen[0]).toMatchObject({ isRecording: true });
    expect(recSeen[1]).toMatchObject({
      isPortRecording: true,
      isStbdRecording: false,
      isProcessingComplete: false,
    });
  });

  test("splits incoming newCameraCommand messages by shape", async () => {
    const h = createSocketIoHarness();

    const client = makeClient();
    const station = client.station("P");

    const cameras: any[] = [];
    const inputs: any[] = [];
    const outputs: any[] = [];
    const settings: any[] = [];
    const receipts: any[] = [];
    station.onCameraList((msg) => cameras.push(msg));
    station.onRouterInputs((msg) => inputs.push(msg));
    station.onRouterOutputs((msg) => outputs.push(msg));
    station.onCameraSettings((msg) => settings.push(msg));
    station.onCommandReceipt((msg) => receipts.push(msg));

    await stationConnected(station);

    const cameraArray = [{ camera: "c1", cam_name: "Brow", owner: "port" }];
    const inputArray = [{ label: "Brow", value: "input1" }];
    const outputArray = [{ label: "Port Rec", value: "output1" }];
    const settingsMsg = { ISO: ["100"], current_settings: { iso: "100" } };
    const receiptMsg = { eventId: "e-1", receipt: { command: "COVP", status: "OK" } };

    emitTo(h, "/port", "newCameraCommand", { camera_array: cameraArray });
    emitTo(h, "/port", "newCameraCommand", { router_input_array: inputArray });
    emitTo(h, "/port", "newCameraCommand", { router_output_array: outputArray });
    emitTo(h, "/port", "newCameraCommand", settingsMsg);
    emitTo(h, "/port", "newCameraCommand", receiptMsg);

    await vi.waitFor(() => expect(receipts).toHaveLength(1));
    expect(cameras).toEqual([cameraArray]);
    expect(inputs).toEqual([inputArray]);
    expect(outputs).toEqual([outputArray]);
    expect(settings).toEqual([settingsMsg]);
    expect(receipts).toEqual([receiptMsg]);
  });

  test("the last release sends the historical good-bye for the namespace", async () => {
    let expectEmitFn!: (event: string) => Promise<any>;
    const h = createSocketIoHarness((_h, expectEmit) => {
      expectEmitFn = expectEmit;
    });

    const client = makeClient();
    const station = client.station("P");

    const unsubA = station.onCamHeartbeat(() => {});
    const unsubB = station.onCamHeartbeat(() => {});
    await stationConnected(station);

    const goodbye = expectEmitFn("disconnectEvent");
    unsubA();
    unsubB();

    const { namespace, args } = await goodbye;
    expect(namespace).toBe("/port");
    expect(args[0]).toEqual({ client: "port" });
  });
});

describe("vehicle-wide channels", () => {
  test("nav and sensor heartbeats arrive from the root namespace", async () => {
    const h = createSocketIoHarness();

    const client = makeClient();
    const nav: any[] = [];
    const sensor: any[] = [];
    client.onNavHeartbeat((msg) => nav.push(msg));
    client.onSensorHeartbeat((msg) => sensor.push(msg));

    await h.connected;
    // Give the root-namespace handshake a beat to complete.
    await new Promise((resolve) => setTimeout(resolve, 10));

    emitTo(h, "/", "NavHeartbeat", { alt: 2.5, dep: 1000 });
    emitTo(h, "/", "SensorHeartbeat", { t1: 4.1, t2: 4.2, t3: 4.3 });

    await vi.waitFor(() => expect(nav).toHaveLength(1));
    await vi.waitFor(() => expect(sensor).toHaveLength(1));
    expect(nav[0]).toMatchObject({ alt: 2.5 });
    expect(sensor[0]).toMatchObject({ t2: 4.2 });
  });

  test("releasing the last root-namespace subscription sends its good-bye", async () => {
    let expectEmitFn!: (event: string) => Promise<any>;
    const h = createSocketIoHarness((_h, expectEmit) => {
      expectEmitFn = expectEmit;
    });

    const client = makeClient();
    const unsubscribe = client.onNavHeartbeat(() => {});

    await h.connected;
    await new Promise((resolve) => setTimeout(resolve, 10));

    const goodbye = expectEmitFn("disconnectEvent");
    unsubscribe();

    const { namespace, args } = await goodbye;
    expect(namespace).toBe("/");
    expect(args[0]).toEqual({ client: "" });
  });

  test("system messages arrive from the v1.5 /system namespace", async () => {
    const h = createSocketIoHarness();

    const client = makeClient();
    const seen: any[] = [];
    client.onSystemMessage((msg) => seen.push(msg));

    await h.connected;
    await new Promise((resolve) => setTimeout(resolve, 10));

    emitTo(h, "/system", "SystemMessage", {
      message: "Recorder unreachable",
      level: "CRITICAL",
    });

    await vi.waitFor(() => expect(seen).toHaveLength(1));
    expect(seen[0]).toMatchObject({ level: "CRITICAL" });
  });
});

describe("station identity", () => {
  test("station lookups normalize aliases to one instance", () => {
    const client = makeClient();
    expect(client.station("port")).toBe(client.station("P"));
    expect(client.station("/stbd")).toBe(client.station("S"));
    expect(client.station("PL").side).toBe("PL");
  });
});

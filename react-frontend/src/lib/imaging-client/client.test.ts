/**
 * Library-in-isolation tests: the ImagingClient talking to a mock server at
 * the WebSocket layer, with no React or Redux involved.
 */

import { afterEach, describe, expect, test, vi } from "vitest";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import { emitTo, stationConnected } from "../../../tests/imaging-test-utils";
import { CommandFailedError, createImagingClient } from "./index";
import type { ImagingClient, Station } from "./index";
import { buildCameraCommand, normalizeStationId } from "./protocol";

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

describe("protocol helpers", () => {
  test("normalizes side aliases", () => {
    expect(normalizeStationId("port")).toBe("P");
    expect(normalizeStationId("/stbd")).toBe("S");
    expect(normalizeStationId("STARBOARD")).toBe("S");
    expect(normalizeStationId("pilot")).toBe("PL");
    expect(normalizeStationId("nonsense")).toBe(null);
    expect(normalizeStationId(null)).toBe(null);
  });

  test("omits the command field when the station is unknown", () => {
    const payload = buildCameraCommand({
      station: null,
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
      client.station(scenario.stationId).camera(null).setIso("200");

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

  test("commands settle with the receipt matching their eventId", async () => {
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
    // payload and eventId are available synchronously on the promise.
    expect(first.eventId).toBe(first.payload.eventId);
    expect(second.payload.action).toEqual({ name: "ISO", value: "400" });
    await h.gotCmd1;
    await h.gotCmd2;

    // Acknowledge in reverse order to prove correlation is by eventId.
    emitTo(h, "/port", "newCameraCommand", {
      eventId: second.eventId,
      receipt: { command: "COVP", status: "OK" },
    });
    emitTo(h, "/port", "newCameraCommand", {
      eventId: first.eventId,
      receipt: { command: "COVP", status: "ERR" },
    });

    await expect(second).resolves.toMatchObject({
      kind: "setIso",
      value: "400",
      isOk: true,
    });
    await expect(first).rejects.toThrow(CommandFailedError);
    await expect(first).rejects.toMatchObject({
      result: { kind: "setIso", value: "100", isOk: false },
    });
  });

  test("onCommandResult delivers each settled command exactly once", async () => {
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit("newCameraCommand");
    });

    const client = makeClient();
    const station = client.station("P");
    station.acquire();
    await stationConnected(station);

    const results: any[] = [];
    station.onCommandResult((result) => results.push(result));

    const cmd = station.camera("port_brow_4k").setIso("400");
    await h.gotCmd;

    emitTo(h, "/port", "newCameraCommand", {
      eventId: cmd.eventId,
      receipt: { command: "COVP", status: "OK" },
    });
    await vi.waitFor(() => expect(results).toHaveLength(1));
    expect(results[0]).toMatchObject({
      kind: "setIso",
      value: "400",
      isOk: true,
      eventId: cmd.eventId,
    });

    // A duplicate (now unmatched) receipt produces nothing further.
    emitTo(h, "/port", "newCameraCommand", {
      eventId: cmd.eventId,
      receipt: { command: "COVP", status: "OK" },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(results).toHaveLength(1);
  });

  test("failed receipts report isOk false without unhandled rejections", async () => {
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit("newCameraCommand");
    });

    const client = makeClient();
    const station = client.station("P");
    station.acquire();
    await stationConnected(station);

    const results: any[] = [];
    station.onCommandResult((result) => results.push(result));

    // Deliberately not awaited: the library pre-observes the rejection, so a
    // BUSY receipt for a fire-and-forget command must not fail this test run
    // with an unhandled rejection.
    const cmd = station.camera(null).setShutter("1/60");
    await h.gotCmd;

    emitTo(h, "/port", "newCameraCommand", {
      eventId: cmd.eventId,
      receipt: { command: "COVP", status: "BUSY" },
    });
    await vi.waitFor(() => expect(results).toHaveLength(1));
    expect(results[0]).toMatchObject({ kind: "setShutter", isOk: false });
  });

  test("kinds identify the issuing method; the escape hatch carries null", async () => {
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd1 = expectEmit("newCameraCommand");
      h.gotCmd2 = expectEmit("newCameraCommand");
    });

    const client = makeClient();
    const station = client.station("P");
    station.acquire();
    await stationConnected(station);

    const unsubscribed: any[] = [];
    const stop = station.onCommandResult((result) => unsubscribed.push(result));
    const delivered: any[] = [];
    station.onCommandResult((result) => delivered.push(result));
    stop();

    const select = station.selectCamera("c2");
    const generic = station.send({ action: { name: "QCV", value: null } });
    await h.gotCmd1;
    await h.gotCmd2;

    emitTo(h, "/port", "newCameraCommand", {
      eventId: select.eventId,
      receipt: { command: "COVP", status: "OK" },
    });
    emitTo(h, "/port", "newCameraCommand", {
      eventId: generic.eventId,
      receipt: { command: "COVP", status: "OK" },
    });

    await vi.waitFor(() => expect(delivered).toHaveLength(2));
    expect(delivered.map((result) => result.kind)).toEqual([
      "selectCamera",
      null,
    ]);
    // The callback that unsubscribed before the sends received nothing.
    expect(unsubscribed).toHaveLength(0);
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

  test("null sentinels normalize to null; fault strings raise hasFault", async () => {
    const h = createSocketIoHarness();

    const client = makeClient();
    const station = client.station("P");

    const camSeen: any[] = [];
    station.onCamHeartbeat((msg) => camSeen.push(msg));

    await stationConnected(station);

    emitTo(h, "/port", "CamHeartbeat", {
      camera: "port_brow_4k",
      iso: "NULL_PORT_ISO",
      shutter: "null",
      iris: "F2.8",
      exposure: "AUTO",
      focus_mode: "MF",
    });
    emitTo(h, "/port", "CamHeartbeat", {
      camera: "port_brow_4k",
      iso: "100",
      focus_mode: "Driver Recv Socket timed out!",
      exposure: "ERR",
    });

    await vi.waitFor(() => expect(camSeen).toHaveLength(2));
    expect(camSeen[0]).toMatchObject({
      iso: null,
      shutter: null,
      iris: "F2.8",
      exposure: "AUTO",
      focus_mode: "MF",
      hasFault: false,
    });
    // A missing-because-absent setting is not a fault; a driver error is.
    expect(camSeen[1]).toMatchObject({
      iso: "100",
      focus_mode: null,
      exposure: null,
      hasFault: true,
    });
  });

  test("camera settings arrive with normalized current values", async () => {
    const h = createSocketIoHarness();

    const client = makeClient();
    const station = client.station("P");

    const settings: any[] = [];
    station.onCameraSettings((msg) => settings.push(msg));

    await stationConnected(station);

    emitTo(h, "/port", "newCameraCommand", {
      ISO: ["100", "400"],
      SHU: ["1/30"],
      current_settings: {
        iso: "NULL_PORT_ISO",
        shu: "1/30",
        focus_mode: "AF",
        exposure: "null",
      },
    });

    await vi.waitFor(() => expect(settings).toHaveLength(1));
    expect(settings[0]).toMatchObject({
      ISO: ["100", "400"],
      SHU: ["1/30"],
      hasFault: false,
      current_settings: {
        iso: null,
        shu: "1/30",
        focus_mode: "AF",
        exposure: null,
      },
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
    station.onCameraList((msg) => cameras.push(msg));
    station.onRouterInputs((msg) => inputs.push(msg));
    station.onRouterOutputs((msg) => outputs.push(msg));
    station.onCameraSettings((msg) => settings.push(msg));

    await stationConnected(station);

    const cameraArray = [{ camera: "c1", cam_name: "Brow", owner: "port" }];
    const inputArray = [{ label: "Brow", value: "input1" }];
    const outputArray = [{ label: "Port Rec", value: "output1" }];
    const settingsMsg = { ISO: ["100"], current_settings: { iso: "100" } };

    emitTo(h, "/port", "newCameraCommand", { camera_array: cameraArray });
    emitTo(h, "/port", "newCameraCommand", { router_input_array: inputArray });
    emitTo(h, "/port", "newCameraCommand", { router_output_array: outputArray });
    emitTo(h, "/port", "newCameraCommand", settingsMsg);

    await vi.waitFor(() => expect(settings).toHaveLength(1));
    expect(cameras).toEqual([cameraArray]);
    expect(inputs).toEqual([inputArray]);
    expect(outputs).toEqual([outputArray]);
    // Settings arrive normalized: unreported fields become null.
    expect(settings).toEqual([
      {
        ISO: ["100"],
        hasFault: false,
        current_settings: {
          iso: "100",
          shu: null,
          irs: null,
          focus_mode: null,
          exposure: null,
          white_balance: null,
        },
      },
    ]);
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
    expect(client.station("PL").id).toBe("PL");
  });
});

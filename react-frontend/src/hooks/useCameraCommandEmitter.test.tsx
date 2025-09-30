import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  test,
  vi,
} from "vitest";

let lastNamespace: string | undefined;
let lastEmit: { event: string; args: any[] } | undefined;

vi.mock("./useSocket", async () => {
  const actual = await vi.importActual("./useSocket");
  return {
    ...actual,
    useSocket(namespace = "/") {
      lastNamespace = namespace;
      const socket = actual.useSocket(namespace);
      const originalEmit = (socket as any).__originalEmit
        ? (socket as any).__originalEmit
        : socket.emit.bind(socket);

      if (!(socket as any).__originalEmit) {
        (socket as any).__originalEmit = originalEmit;
      }

      socket.emit = (event: string, ...args: any[]) => {
        lastEmit = { event, args };
        return originalEmit(event, ...args);
      };

      return socket;
    },
  };
});

import React, { useEffect } from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "../features/camera-controls/cameraControlsSlice.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../config";
import { useCameraCommandEmitter } from "./useCameraCommandEmitter";

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

function makeStore(overrides: Partial<CameraControlsState> = {}) {
  const baseState = cameraControlsReducer(undefined, { type: "@@INIT" } as any);
  return configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: { ...baseState, ...overrides } },
  });
}

beforeAll(() => {
  (window as any).PILOT_MODE = true;
});

afterAll(() => {
  delete (window as any).PILOT_MODE;
});

beforeEach(() => {
  lastNamespace = undefined;
  lastEmit = undefined;
});

afterEach(() => {
  cleanup();
  lastNamespace = undefined;
  lastEmit = undefined;
});

function Emitter({
  observerSide,
  message,
}: {
  observerSide: any;
  message: any;
}) {
  const { emit } = useCameraCommandEmitter({ observerSide });
  useEffect(() => {
    void emit(message);
  }, [emit, message]);
  return null;
}

type Case = {
  name: string;
  observerSide: any;
  expectedCommand: string | undefined;
  expectedNamespace: string;
  observerSideOverride?: any;
};

const cases: Case[] = [
  {
    name: "port observer emits COVP",
    observerSide: "P",
    expectedCommand: "COVP",
    expectedNamespace: "/port",
  },
  {
    name: "starboard observer emits COVS",
    observerSide: "S",
    expectedCommand: "COVS",
    expectedNamespace: "/stbd",
  },
  {
    name: "pilot observer emits COPL",
    observerSide: "PL",
    expectedCommand: "COPL",
    expectedNamespace: "/pilot",
  },
  {
    name: "pilot override port emits COVP",
    observerSide: "PL",
    observerSideOverride: "port",
    expectedCommand: "COVP",
    expectedNamespace: "/pilot",
  },
  {
    name: "pilot override starboard emits COVS",
    observerSide: "PL",
    observerSideOverride: "stbd",
    expectedCommand: "COVS",
    expectedNamespace: "/pilot",
  },
];

const defaultPayload = {
  action: { name: "hello", value: "world" },
};

test.each(cases)(
  "useCameraCommandEmitter %s",
  async ({
    observerSide,
    expectedCommand,
    expectedNamespace,
    observerSideOverride,
  }) => {
    const store = makeStore({ observerSide } as Partial<CameraControlsState>);

    render(
      <Provider store={store}>
        <Emitter
          observerSide={observerSide}
          message={{
            ...defaultPayload,
            observerSideOverride,
          }}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(lastEmit).toBeDefined();
    });

    expect(lastNamespace).toBe(expectedNamespace);
    expect(lastEmit!.event).toBe(NEW_CAMERA_COMMAND_EVENT);
    expect(lastEmit!.args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: expectedCommand,
      ...defaultPayload,
      observerSideOverride,
    });
  }
);

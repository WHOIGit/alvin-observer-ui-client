import { expect, test } from "vitest";
import reducer, {
  addCommandQueue,
  changeCameraSettings,
  setRouterTakeStatus,
  selectRouterTakeStatus,
} from "./cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";

const queuedRouterTake = (eventId) => ({
  eventId,
  action: {
    name: COMMAND_STRINGS.routerIOCommand,
    value: { input: "input1", output: "output1" },
  },
});

const receipt = (eventId, status) => ({ eventId, receipt: { status } });

test("router take is idle by default", () => {
  const state = reducer(undefined, { type: "@@INIT" });
  expect(selectRouterTakeStatus({ cameraControls: state })).toBeNull();
});

test("setRouterTakeStatus updates the take status", () => {
  let state = reducer(undefined, { type: "@@INIT" });
  state = reducer(state, setRouterTakeStatus("PENDING"));
  expect(state.routerTakeStatus).toBe("PENDING");
});

test("an OK receipt marks the router take successful and clears the queue", () => {
  let state = reducer(undefined, { type: "@@INIT" });
  state = reducer(state, addCommandQueue(queuedRouterTake("evt-ok")));
  state = reducer(state, changeCameraSettings(receipt("evt-ok", "OK")));

  expect(state.routerTakeStatus).toBe("OK");
  expect(state.commandsQueue).toHaveLength(0);
});

test("an ERR receipt marks the router take failed", () => {
  let state = reducer(undefined, { type: "@@INIT" });
  state = reducer(state, addCommandQueue(queuedRouterTake("evt-err")));
  state = reducer(state, changeCameraSettings(receipt("evt-err", "ERR")));

  expect(state.routerTakeStatus).toBe("ERR");
  expect(state.commandsQueue).toHaveLength(0);
});

import { expect, test } from "vitest";
import reducer, {
  addCommandQueue,
  changeCameraSettings,
  setRouterTakeStatus,
  setRouterRouting,
  setRouterRoute,
  selectRouterTakeStatus,
  selectRouterRouting,
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

test("routing map is empty by default", () => {
  const state = reducer(undefined, { type: "@@INIT" });
  expect(selectRouterRouting({ cameraControls: state })).toEqual({});
});

test("setRouterRouting replaces the whole routing map", () => {
  let state = reducer(undefined, { type: "@@INIT" });
  state = reducer(
    state,
    setRouterRouting({ output1: "input1", output2: "input3" })
  );
  expect(state.routerRouting).toEqual({ output1: "input1", output2: "input3" });
});

test("setRouterRoute sets a single crosspoint without disturbing others", () => {
  let state = reducer(undefined, { type: "@@INIT" });
  state = reducer(state, setRouterRouting({ output1: "input1" }));
  state = reducer(state, setRouterRoute({ output: "output2", input: "input5" }));
  expect(state.routerRouting).toEqual({ output1: "input1", output2: "input5" });

  // overwriting an output's source replaces just that entry
  state = reducer(state, setRouterRoute({ output: "output1", input: "input9" }));
  expect(state.routerRouting).toEqual({ output1: "input9", output2: "input5" });
});

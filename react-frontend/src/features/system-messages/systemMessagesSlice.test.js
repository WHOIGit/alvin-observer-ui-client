import { expect, test } from "vitest";
import reducer, {
  addSystemMessage,
  dismissReadSystemMessages,
  markAllSystemMessagesRead,
  removeExpiredSystemMessages,
  selectSystemMessages,
  selectUnreadSystemMessageCount,
  selectUnreadSystemMessageCounts,
  selectWorstSystemMessageLevel,
} from "./systemMessagesSlice";

const rootState = (systemMessages) => ({ systemMessages });

test("adds unread messages and summarizes severity", () => {
  let state = reducer(undefined, { type: "@@INIT" });

  state = reducer(
    state,
    addSystemMessage(
      {
        correlation_id: "warn-1",
        timestamp: "2026-06-15T12:00:00Z",
        message: "Low disk space",
        level: "WARN",
        source: "storage",
      },
      1000
    )
  );

  state = reducer(
    state,
    addSystemMessage(
      {
        correlation_id: "critical-1",
        timestamp: "2026-06-15T12:01:00Z",
        message: "Recorder offline",
        level: "CRITICAL",
      },
      2000
    )
  );

  expect(selectSystemMessages(rootState(state))).toHaveLength(2);
  expect(selectUnreadSystemMessageCount(rootState(state))).toBe(2);
  expect(selectUnreadSystemMessageCounts(rootState(state))).toMatchObject({
    WARN: 1,
    CRITICAL: 1,
  });
  expect(selectWorstSystemMessageLevel(rootState(state))).toBe("CRITICAL");
});

test("marks messages read and clears read messages", () => {
  let state = reducer(undefined, { type: "@@INIT" });

  state = reducer(
    state,
    addSystemMessage(
      {
        correlation_id: "error-1",
        timestamp: "2026-06-15T12:00:00Z",
        message: "Camera command failed",
        level: "ERROR",
      },
      1000
    )
  );

  state = reducer(state, markAllSystemMessagesRead());

  expect(selectUnreadSystemMessageCount(rootState(state))).toBe(0);
  // Worst level reflects only unread messages, so reading clears it.
  expect(selectWorstSystemMessageLevel(rootState(state))).toBeNull();

  state = reducer(state, dismissReadSystemMessages());

  expect(selectSystemMessages(rootState(state))).toHaveLength(0);
});

test("expires ttl messages but keeps sticky messages", () => {
  let state = reducer(undefined, { type: "@@INIT" });

  state = reducer(
    state,
    addSystemMessage(
      {
        correlation_id: "sticky-1",
        timestamp: "2026-06-15T12:00:00Z",
        message: "Sticky critical message",
        level: "CRITICAL",
        sticky: true,
        ttl_seconds: 1,
      },
      1000
    )
  );

  state = reducer(
    state,
    addSystemMessage(
      {
        correlation_id: "temp-1",
        timestamp: "2026-06-15T12:00:01Z",
        message: "Temporary warning",
        level: "WARN",
        ttl_seconds: 1,
      },
      1000
    )
  );

  state = reducer(state, removeExpiredSystemMessages(2500));

  expect(selectSystemMessages(rootState(state)).map((message) => message.id)).toEqual([
    "sticky-1",
  ]);
});

test("refreshes messages with the same correlation id", () => {
  let state = reducer(undefined, { type: "@@INIT" });

  state = reducer(
    state,
    addSystemMessage(
      {
        correlation_id: "shared-id",
        timestamp: "2026-06-15T12:00:00Z",
        message: "Original",
        level: "WARN",
      },
      1000
    )
  );
  state = reducer(state, markAllSystemMessagesRead());

  state = reducer(
    state,
    addSystemMessage(
      {
        correlation_id: "shared-id",
        timestamp: "2026-06-15T12:01:00Z",
        message: "Updated",
        level: "ERROR",
      },
      2000
    )
  );

  const messages = selectSystemMessages(rootState(state));
  expect(messages).toHaveLength(1);
  expect(messages[0]).toMatchObject({
    id: "shared-id",
    message: "Updated",
    level: "ERROR",
    read: false,
  });
});

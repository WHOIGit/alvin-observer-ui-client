import { createSelector, createSlice } from "@reduxjs/toolkit";

export const SYSTEM_MESSAGE_LEVELS = ["INFO", "WARN", "ERROR", "CRITICAL"];

export const SYSTEM_MESSAGE_PRIORITY = {
  INFO: 0,
  WARN: 1,
  ERROR: 2,
  CRITICAL: 3,
};

const MAX_SYSTEM_MESSAGES = 50;

const normalizeLevel = (level) => {
  const normalized = String(level || "INFO").toUpperCase();
  return SYSTEM_MESSAGE_PRIORITY[normalized] === undefined
    ? "INFO"
    : normalized;
};

const getExpiresAt = (message, receivedAt) => {
  if (message.sticky) return null;

  const ttlSeconds = Number(message.ttl_seconds);
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) return null;

  return receivedAt + ttlSeconds * 1000;
};

const getMessageId = (message, receivedAt) => {
  if (message.correlation_id) return message.correlation_id;

  return [
    "system-message",
    receivedAt,
    Math.random().toString(36).slice(2),
  ].join("-");
};

const normalizeMessage = (message, receivedAt) => {
  const level = normalizeLevel(message.level);

  return {
    id: getMessageId(message, receivedAt),
    correlationId: message.correlation_id || null,
    timestamp: message.timestamp || new Date(receivedAt).toISOString(),
    receivedAt,
    message: String(message.message || ""),
    level,
    source: message.source || null,
    sticky: Boolean(message.sticky),
    ttlSeconds:
      message.ttl_seconds === undefined || message.ttl_seconds === null
        ? null
        : Number(message.ttl_seconds),
    expiresAt: getExpiresAt(message, receivedAt),
    read: false,
  };
};

const initialState = {
  items: [],
};

export const systemMessagesSlice = createSlice({
  name: "systemMessages",
  initialState,
  reducers: {
    addSystemMessage: {
      reducer: (state, action) => {
        const message = action.payload;
        const existingIndex = state.items.findIndex(
          (item) => item.id === message.id
        );

        if (existingIndex >= 0) {
          state.items.splice(existingIndex, 1);
        }

        state.items.unshift(message);
        state.items = state.items.slice(0, MAX_SYSTEM_MESSAGES);
      },
      prepare: (message, receivedAt = Date.now()) => ({
        payload: normalizeMessage(message, receivedAt),
      }),
    },
    markAllSystemMessagesRead: (state) => {
      state.items.forEach((message) => {
        message.read = true;
      });
    },
    dismissSystemMessage: (state, action) => {
      state.items = state.items.filter((message) => message.id !== action.payload);
    },
    dismissReadSystemMessages: (state) => {
      state.items = state.items.filter((message) => !message.read);
    },
    removeExpiredSystemMessages: (state, action) => {
      const now = action.payload || Date.now();
      state.items = state.items.filter(
        (message) => message.expiresAt === null || message.expiresAt > now
      );
    },
  },
});

export const {
  addSystemMessage,
  dismissReadSystemMessages,
  dismissSystemMessage,
  markAllSystemMessagesRead,
  removeExpiredSystemMessages,
} = systemMessagesSlice.actions;

export default systemMessagesSlice.reducer;

export const selectSystemMessages = (state) => state.systemMessages.items;

export const selectUnreadSystemMessages = createSelector(
  selectSystemMessages,
  (messages) => messages.filter((message) => !message.read)
);

export const selectUnreadSystemMessageCounts = createSelector(
  selectUnreadSystemMessages,
  (messages) =>
    SYSTEM_MESSAGE_LEVELS.reduce(
      (counts, level) => ({
        ...counts,
        [level]: messages.filter((message) => message.level === level).length,
      }),
      {}
    )
);

export const selectUnreadSystemMessageCount = createSelector(
  selectUnreadSystemMessageCounts,
  (counts) => SYSTEM_MESSAGE_LEVELS.reduce((total, level) => total + counts[level], 0)
);

export const selectWorstSystemMessageLevel = createSelector(
  selectSystemMessages,
  (messages) =>
    messages.reduce((worstLevel, message) => {
      if (
        worstLevel === null ||
        SYSTEM_MESSAGE_PRIORITY[message.level] > SYSTEM_MESSAGE_PRIORITY[worstLevel]
      ) {
        return message.level;
      }

      return worstLevel;
    }, null)
);

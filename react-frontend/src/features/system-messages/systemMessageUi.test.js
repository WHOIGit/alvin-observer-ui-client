import { expect, test } from "vitest";
import { formatSystemMessageTime } from "./systemMessageUi";

test("formats a same-UTC-day timestamp as 24-hour UTC time only", () => {
  const now = new Date("2026-06-19T18:00:00Z");
  expect(formatSystemMessageTime("2026-06-19T14:05:09Z", now)).toBe("14:05:09");
});

test("appends the UTC date when the message is from another UTC day", () => {
  const now = new Date("2026-06-19T18:00:00Z");
  expect(formatSystemMessageTime("2026-06-15T23:59:01Z", now)).toBe(
    "23:59:01 2026-06-15"
  );
});

test("uses UTC, not local time, regardless of the input offset", () => {
  const now = new Date("2026-06-19T18:00:00Z");
  // 2026-06-19T01:30:00+05:00 is 2026-06-18T20:30:00Z.
  expect(formatSystemMessageTime("2026-06-19T01:30:00+05:00", now)).toBe(
    "20:30:00 2026-06-18"
  );
});

test("returns an empty string for an invalid timestamp", () => {
  expect(formatSystemMessageTime("not-a-date")).toBe("");
});

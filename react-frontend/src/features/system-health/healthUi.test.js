import { describe, it, expect } from "vitest";
import {
  STATUS,
  worstOf,
  buildRowCatalog,
  groupPathsByStation,
  isFeedStale,
  formatAge,
} from "./healthUi";

describe("worstOf", () => {
  it("ranks fault > warn > unknown > ok > na", () => {
    expect(worstOf(["ok", "na", "ok"])).toBe("ok");
    expect(worstOf(["ok", "unknown"])).toBe("unknown");
    expect(worstOf(["ok", "warn", "unknown"])).toBe("warn");
    expect(worstOf(["warn", "fault", "ok"])).toBe("fault");
  });

  it("na and unknown alone do not become fault", () => {
    expect(worstOf(["na", "unknown", "ok"])).toBe("unknown");
    expect(worstOf(["na", "na"])).toBe("na");
  });
});

describe("buildRowCatalog", () => {
  it("orders ladder rows before class rows and dedups across paths", () => {
    const paths = [
      {
        checks: [
          { id: "video_flowing", label: "video flowing", status: "ok" },
          { id: "net_reachable", label: "network reachable", status: "ok" },
        ],
      },
      {
        checks: [
          { id: "reports_healthy", label: "reports healthy", status: "ok" },
          { id: "net_reachable", label: "network reachable", status: "ok" },
        ],
      },
    ];
    const rows = buildRowCatalog(paths);
    expect(rows.map((r) => r.id)).toEqual([
      "net_reachable",
      "reports_healthy",
      "video_flowing",
    ]);
  });

  it("appends unknown check ids after the catalog", () => {
    const paths = [
      { checks: [{ id: "net_reachable", status: "ok" }, { id: "zzz_custom", status: "ok" }] },
    ];
    const rows = buildRowCatalog(paths);
    expect(rows[rows.length - 1].id).toBe("zzz_custom");
  });
});

describe("groupPathsByStation", () => {
  it("groups by station in canonical order and drops empty groups", () => {
    const paths = [
      { id: "a", station: "stbd", kind: "camera", label: "a" },
      { id: "b", station: "port", kind: "recorder", label: "b" },
      { id: "c", station: "port", kind: "camera", label: "c" },
    ];
    const groups = groupPathsByStation(paths);
    expect(groups.map((g) => g.station)).toEqual(["port", "stbd"]);
    // within port, camera (c) sorts before recorder (b)
    expect(groups[0].paths.map((p) => p.id)).toEqual(["c", "b"]);
  });
});

describe("isFeedStale", () => {
  it("is stale when never received or past ttl", () => {
    expect(isFeedStale(null)).toBe(true);
    const now = 100000;
    expect(isFeedStale(now - 5000, now, 15000)).toBe(false);
    expect(isFeedStale(now - 20000, now, 15000)).toBe(true);
  });
});

describe("formatAge", () => {
  it("formats seconds and minutes, guards bad input", () => {
    const now = 60000;
    expect(formatAge(new Date(now - 5000).toISOString(), now)).toBe("5s ago");
    expect(formatAge(new Date(now - 65000).toISOString(), now)).toBe("1m 5s ago");
    expect(formatAge(null, now)).toBe("never");
    expect(formatAge("not-a-date", now)).toBe("never");
  });
});

describe("STATUS enum", () => {
  it("exposes the five schema statuses", () => {
    expect(Object.values(STATUS).sort()).toEqual([
      "fault",
      "na",
      "ok",
      "unknown",
      "warn",
    ]);
  });
});

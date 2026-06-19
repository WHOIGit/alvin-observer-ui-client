// Presentation helpers for the System health view.
// Status enum: ok | warn | fault | unknown | na. Rendered as colour + icon +
// text (never colour alone); stale/unknown is grey, na is a muted dash.
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RemoveIcon from "@mui/icons-material/Remove";

export const STATUS = {
  OK: "ok",
  WARN: "warn",
  FAULT: "fault",
  UNKNOWN: "unknown",
  NA: "na",
};

// Per-status colour / icon / short label. Text label is rendered alongside the
// icon so the cell never relies on colour alone.
export const STATUS_META = {
  ok: { color: "#43a047", Icon: CheckCircleIcon, label: "OK", text: "ok" },
  warn: { color: "#ffb300", Icon: WarningAmberIcon, label: "Warning", text: "warn" },
  fault: { color: "#e53935", Icon: ErrorIcon, label: "Fault", text: "fault" },
  unknown: { color: "#78909c", Icon: HelpOutlineIcon, label: "Unknown / stale", text: "—?" },
  na: { color: "#455a64", Icon: RemoveIcon, label: "Not applicable", text: "n/a" },
};

export function statusMeta(status) {
  return STATUS_META[status] || STATUS_META.unknown;
}

// Worst-of severity ranking: fault > warn > unknown > ok > na.
const SEVERITY = { na: 0, ok: 1, unknown: 2, warn: 3, fault: 4 };

export function worstOf(statuses) {
  let worst = STATUS.NA;
  for (const s of statuses) {
    if ((SEVERITY[s] ?? 0) > (SEVERITY[worst] ?? 0)) worst = s;
  }
  return worst;
}

// Station grouping for matrix columns.
export const STATION_ORDER = ["port", "stbd", "pilot", "shared"];
export const STATION_LABELS = {
  port: "Port",
  stbd: "Stbd",
  pilot: "Pilot",
  shared: "Shared",
};

// Within a station, order columns by device kind.
export const KIND_ORDER = [
  "camera",
  "pantilt",
  "recorder",
  "router",
  "image_capture",
  "telemetry",
];

// Canonical row order: probe ladder first, then class-specific rows. The matrix
// renders the subset present on at least one path; unlisted ids sort last.
export const ROW_CATALOG = [
  // Probe ladder (rungs 1-6)
  { id: "net_reachable", label: "network reachable" },
  { id: "port_open", label: "control port open" },
  { id: "responds", label: "responds to inquiry" },
  { id: "reports_healthy", label: "reports healthy" },
  { id: "suboptica_available", label: "suboptica available" },
  { id: "last_command", label: "last command ok" },
  // Recorder
  { id: "media_present", label: "media present" },
  { id: "free_space", label: "free space" },
  { id: "timecode_advancing", label: "timecode advancing" },
  { id: "not_dropping_frames", label: "not dropping frames" },
  { id: "recorder_state", label: "recorder state" },
  // Router
  { id: "route_integrity", label: "route integrity" },
  // Camera / video
  { id: "video_flowing", label: "video flowing" },
  // Pan/tilt
  { id: "at_fault_or_limit", label: "at fault / limit" },
  { id: "watchdog_fed", label: "watchdog fed" },
  // Image capture (Epiphan)
  { id: "usb_present", label: "USB present" },
  { id: "capture_ok", label: "capture ok" },
  // Telemetry feed
  { id: "fresh", label: "feed fresh" },
  { id: "parses", label: "parses" },
  { id: "sane", label: "sane (not frozen)" },
];

const ROW_INDEX = new Map(ROW_CATALOG.map((r, i) => [r.id, i]));
const ROW_LABELS = new Map(ROW_CATALOG.map((r) => [r.id, r.label]));

// Build the ordered list of rows actually present across the given paths.
// Each row: { id, label }. Labels prefer the catalog, then a check's own label.
export function buildRowCatalog(paths) {
  const seen = new Map();
  for (const path of paths) {
    for (const check of path.checks || []) {
      if (!seen.has(check.id)) {
        seen.set(check.id, ROW_LABELS.get(check.id) || check.label || check.id);
      }
    }
  }
  return Array.from(seen.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => {
      const ai = ROW_INDEX.has(a.id) ? ROW_INDEX.get(a.id) : Number.MAX_SAFE_INTEGER;
      const bi = ROW_INDEX.has(b.id) ? ROW_INDEX.get(b.id) : Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.label.localeCompare(b.label);
    });
}

// Order paths into station groups, kind-sorted within each group.
export function groupPathsByStation(paths) {
  const groups = STATION_ORDER.map((station) => ({
    station,
    label: STATION_LABELS[station] || station,
    paths: paths
      .filter((p) => p.station === station)
      .sort((a, b) => {
        const ak = KIND_ORDER.indexOf(a.kind);
        const bk = KIND_ORDER.indexOf(b.kind);
        if (ak !== bk) return (ak < 0 ? 99 : ak) - (bk < 0 ? 99 : bk);
        return (a.label || a.id).localeCompare(b.label || b.id);
      }),
  })).filter((g) => g.paths.length > 0);

  // Any path with an unrecognised station falls into a trailing "Other" group.
  const other = paths.filter((p) => !STATION_ORDER.includes(p.station));
  if (other.length) {
    groups.push({ station: "other", label: "Other", paths: other });
  }
  return groups;
}

// Feed staleness: if no snapshot has arrived within the TTL, the whole view is
// greyed and bannered — never stale-green.
export const FEED_STALE_AFTER_MS = 15000;

export function isFeedStale(receivedAt, now = Date.now(), ttl = FEED_STALE_AFTER_MS) {
  if (!receivedAt) return true;
  return now - receivedAt > ttl;
}

// "updated Xs ago" from an ISO timestamp.
export function formatAge(iso, now = Date.now()) {
  if (!iso) return "never";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "never";
  const secs = Math.max(0, Math.round((now - t) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${secs % 60}s ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

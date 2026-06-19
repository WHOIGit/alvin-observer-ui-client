// Static HealthSnapshot fixture for offline preview of the System health view.
// Mirrors the full Health Document the vitals socket + GET /health serve.
// Seeded when window.MOCK_HEALTH is set (see configEnv.js).

// checked_at timestamps are relative to module load so the detail drawer's
// "updated Xs ago" reads sensibly during preview.
const now = Date.now();
const ago = (secs) => new Date(now - secs * 1000).toISOString();

// check(id, label, status, { detail, checked_at_s, value, remediation })
const check = (id, label, status, opts = {}) => ({
  id,
  label,
  status,
  checked_at: ago(opts.checked_at_s ?? 4),
  detail: opts.detail ?? null,
  value: opts.value ?? null,
  remediation: opts.remediation ?? null,
});

const LADDER_OK = (extra = {}) => [
  check("net_reachable", "network reachable", "ok", { detail: "12ms", value: 12 }),
  check("port_open", "control port open", extra.port_open ?? "ok"),
  check("responds", "responds to inquiry", "ok", { detail: "VISCA reply 0.3s" }),
  check("reports_healthy", "reports healthy", "ok"),
  check("suboptica_available", "suboptica available", "ok"),
  check("last_command", "last command ok", "ok", { detail: "CommandSucceeded" }),
];

const HEALTH_FIXTURE = {
  schema_version: 1,
  generated_at: new Date(now).toISOString(),
  overall: "fault",
  dive: { dive_name: "AL5349", cruise_name: "AT51" },

  sources: {
    suboptica: { status: "ok", received_at: ago(3), stale: false },
    vitals: { status: "ok", generated_at: new Date(now).toISOString() },
  },

  paths: [
    // ---- Port station ----
    {
      id: "port_brow_4k",
      label: "port brow 4K",
      kind: "camera",
      station: "port",
      in_use: true,
      rollup: "ok",
      endpoint: { host: "10.100.162.105", port: 52109, proto: "udp" },
      checks: [
        ...LADDER_OK({ port_open: "na" }),
        check("video_flowing", "video flowing", "ok", { detail: "snapshot 1s old" }),
      ],
    },
    {
      id: "port_patz",
      label: "port PTZ",
      kind: "camera",
      station: "port",
      in_use: false,
      rollup: "warn",
      endpoint: { host: "10.100.162.105", port: 52111, proto: "udp" },
      checks: [
        check("net_reachable", "network reachable", "ok", { detail: "13ms", value: 13 }),
        check("port_open", "control port open", "na"),
        check("responds", "responds to inquiry", "warn", {
          detail: "last reply 6s ago (near stale)",
          remediation: "verify port imaging bottle power",
        }),
        check("reports_healthy", "reports healthy", "ok"),
        check("suboptica_available", "suboptica available", "ok"),
        check("last_command", "last command ok", "ok"),
        check("video_flowing", "video flowing", "warn", { detail: "snapshot 9s old" }),
      ],
    },
    {
      id: "port_brow_mount",
      label: "port brow pan/tilt",
      kind: "pantilt",
      station: "port",
      in_use: true,
      rollup: "ok",
      endpoint: { host: "10.100.162.105", port: 52000, proto: "udp" },
      checks: [
        ...LADDER_OK({ port_open: "na" }),
        check("at_fault_or_limit", "at fault / limit", "ok"),
        check("watchdog_fed", "watchdog fed", "na", { detail: "SIDUS has no watchdog" }),
      ],
    },
    {
      id: "port_prores_rec",
      label: "port ProRes rec",
      kind: "recorder",
      station: "port",
      in_use: true,
      rollup: "warn",
      endpoint: { host: "10.100.162.120", port: 9993, proto: "tcp" },
      checks: [
        check("net_reachable", "network reachable", "ok", { detail: "2ms", value: 2 }),
        check("port_open", "control port open", "ok", { detail: "TCP 9993 open" }),
        check("responds", "responds to inquiry", "ok"),
        check("reports_healthy", "reports healthy", "ok"),
        check("suboptica_available", "suboptica available", "ok"),
        check("last_command", "last command ok", "ok"),
        check("media_present", "media present", "ok", { detail: "slot 1" }),
        check("free_space", "free space", "warn", {
          detail: "18 min remaining",
          value: 18,
          remediation: "swap SSD at next opportunity",
        }),
        check("timecode_advancing", "timecode advancing", "ok"),
        check("not_dropping_frames", "not dropping frames", "ok"),
        check("recorder_state", "recorder state", "ok", { detail: "RECORDING" }),
      ],
    },
    {
      id: "port_proxy_rec",
      label: "port proxy rec",
      kind: "recorder",
      station: "port",
      in_use: true,
      rollup: "unknown",
      endpoint: { host: "10.100.162.122", port: 9993, proto: "tcp" },
      checks: [
        check("net_reachable", "network reachable", "ok", { detail: "3ms", value: 3 }),
        check("port_open", "control port open", "ok"),
        check("responds", "responds to inquiry", "unknown", {
          detail: "no observation in 40s (stale)",
          checked_at_s: 40,
        }),
        check("reports_healthy", "reports healthy", "unknown"),
        check("suboptica_available", "suboptica available", "unknown"),
        check("last_command", "last command ok", "unknown"),
        check("media_present", "media present", "unknown"),
        check("recorder_state", "recorder state", "unknown"),
      ],
    },

    // ---- Stbd station ----
    {
      id: "stbd_brow_4k",
      label: "stbd brow 4K",
      kind: "camera",
      station: "stbd",
      in_use: true,
      rollup: "fault",
      endpoint: { host: "10.100.162.106", port: 52110, proto: "udp" },
      checks: [
        check("net_reachable", "network reachable", "ok", {
          detail: "jbox 10.100.162.106 12ms",
          value: 12,
        }),
        check("port_open", "control port open", "na"),
        check("responds", "responds to inquiry", "fault", {
          detail: "no VISCA reply in 8s",
          remediation: "check power/cable at stbd imaging bottle",
        }),
        check("reports_healthy", "reports healthy", "fault"),
        check("suboptica_available", "suboptica available", "fault", {
          detail: "engine fault",
        }),
        check("last_command", "last command ok", "fault", { detail: "CommandFailed" }),
        check("video_flowing", "video flowing", "fault", { detail: "no snapshot 22s" }),
      ],
    },
    {
      id: "stbd_patz",
      label: "stbd PTZ",
      kind: "camera",
      station: "stbd",
      in_use: true,
      rollup: "ok",
      endpoint: { host: "10.100.162.106", port: 52112, proto: "udp" },
      checks: [
        ...LADDER_OK({ port_open: "na" }),
        check("video_flowing", "video flowing", "ok"),
      ],
    },
    {
      id: "stbd_brow_mount",
      label: "stbd brow pan/tilt",
      kind: "pantilt",
      station: "stbd",
      in_use: true,
      rollup: "ok",
      endpoint: { host: "10.100.162.106", port: 52001, proto: "udp" },
      checks: [
        ...LADDER_OK({ port_open: "na" }),
        check("at_fault_or_limit", "at fault / limit", "ok"),
        check("watchdog_fed", "watchdog fed", "na"),
      ],
    },
    {
      id: "stbd_prores_rec",
      label: "stbd ProRes rec",
      kind: "recorder",
      station: "stbd",
      in_use: true,
      rollup: "fault",
      endpoint: { host: "10.100.162.121", port: 9993, proto: "tcp" },
      checks: [
        check("net_reachable", "network reachable", "fault", {
          detail: "no route to 10.100.162.121",
          remediation: "check recorder power / network switch",
        }),
        check("port_open", "control port open", "fault", { detail: "connect refused" }),
        check("responds", "responds to inquiry", "unknown"),
        check("reports_healthy", "reports healthy", "unknown"),
        check("suboptica_available", "suboptica available", "unknown"),
        check("last_command", "last command ok", "unknown"),
        check("media_present", "media present", "unknown"),
        check("recorder_state", "recorder state", "unknown"),
      ],
    },

    // ---- Pilot station ----
    {
      id: "pilot_mount",
      label: "pilot pan/tilt",
      kind: "pantilt",
      station: "pilot",
      in_use: true,
      rollup: "warn",
      endpoint: { host: "10.100.162.105", port: 52002, proto: "udp" },
      checks: [
        ...LADDER_OK({ port_open: "na" }),
        check("at_fault_or_limit", "at fault / limit", "ok"),
        check("watchdog_fed", "watchdog fed", "warn", {
          detail: "watchdog fed late (0.9s)",
          remediation: "Hammerhead 1s motor watchdog near limit",
        }),
      ],
    },
    {
      id: "brow_wide",
      label: "brow wide",
      kind: "camera",
      station: "pilot",
      in_use: true,
      rollup: "ok",
      endpoint: null,
      checks: [
        check("net_reachable", "network reachable", "na", { detail: "flexlink, no IP" }),
        check("video_flowing", "video flowing", "ok", { detail: "rtsptoweb online" }),
      ],
    },

    // ---- Shared ----
    {
      id: "router",
      label: "AJA KUMO router",
      kind: "router",
      station: "shared",
      in_use: true,
      rollup: "ok",
      endpoint: { host: "10.100.162.154", port: 12345, proto: "tcp" },
      checks: [
        check("net_reachable", "network reachable", "ok", { detail: "1ms", value: 1 }),
        check("port_open", "control port open", "ok"),
        check("responds", "responds to inquiry", "ok"),
        check("reports_healthy", "reports healthy", "ok"),
        check("suboptica_available", "suboptica available", "ok"),
        check("last_command", "last command ok", "ok"),
        check("route_integrity", "route integrity", "ok", {
          detail: "commanded sources match topology()",
        }),
      ],
    },
    {
      id: "image_capture",
      label: "Epiphan capture",
      kind: "image_capture",
      station: "shared",
      in_use: false,
      rollup: "warn",
      endpoint: null,
      checks: [
        check("net_reachable", "network reachable", "na"),
        check("usb_present", "USB present", "warn", {
          detail: "udev device missing",
          remediation: "reseat AV.io 4K USB",
        }),
        check("capture_ok", "capture ok", "unknown"),
      ],
    },
    {
      id: "nav_telemetry",
      label: "nav telemetry",
      kind: "telemetry",
      station: "shared",
      in_use: true,
      rollup: "ok",
      endpoint: { host: "0.0.0.0", port: 50043, proto: "udp" },
      checks: [
        check("net_reachable", "network reachable", "na", { detail: "UDP listener" }),
        check("fresh", "feed fresh", "ok", { detail: "packet 0.2s ago" }),
        check("parses", "parses", "ok"),
        check("sane", "sane (not frozen)", "ok"),
      ],
    },
    {
      id: "sci_cam",
      label: "sci cam",
      kind: "camera",
      station: "shared",
      in_use: false,
      rollup: "na",
      endpoint: null,
      checks: [
        check("net_reachable", "network reachable", "na", { detail: "decommissioned" }),
        check("video_flowing", "video flowing", "na"),
      ],
    },
  ],

  services: [
    {
      id: "suboptica",
      label: "suboptica :4040",
      status: "ok",
      checked_at: ago(3),
      detail: "host-native, /system ok",
      source: "http",
      remediation: "systemctl restart suboptica.service",
    },
    {
      id: "caddy",
      label: "caddy",
      status: "ok",
      checked_at: ago(5),
      detail: "routes responding",
      source: "systemd",
      remediation: "systemctl restart caddy.service",
    },
    {
      id: "rtsptoweb",
      label: "rtsptoweb",
      status: "ok",
      checked_at: ago(5),
      detail: "12/12 streams online",
      source: "http",
      remediation: "systemctl restart rtsptoweb.service",
    },
    {
      id: "sealog-mongodb",
      label: "sealog mongodb",
      status: "ok",
      checked_at: ago(6),
      detail: "active",
      source: "systemd",
    },
    {
      id: "sealog-server",
      label: "sealog server",
      status: "ok",
      checked_at: ago(4),
      detail: "/server_time ok",
      source: "http",
      remediation: "systemctl restart sealog-server.service",
    },
    {
      id: "sealog-framegrabber",
      label: "sealog framegrabber",
      status: "warn",
      checked_at: ago(7),
      detail: "newest image 95s old",
      source: "fs",
      remediation: "check Teradek snapshots / restart sealog-framegrabber.service",
    },
    {
      id: "sealog-asnap",
      label: "sealog asnap",
      status: "ok",
      checked_at: ago(8),
      detail: "active",
      source: "systemd",
    },
    {
      id: "sealog-auxdata-udpgrabber",
      label: "sealog auxdata udpgrabber",
      status: "ok",
      checked_at: ago(6),
      detail: "receiving on :10600",
      source: "http",
    },
    {
      id: "observer-ui",
      label: "observer ui",
      status: "ok",
      checked_at: ago(9),
      detail: "active",
      source: "systemd",
    },
    {
      id: "pilot-ui",
      label: "pilot ui",
      status: "ok",
      checked_at: ago(9),
      detail: "active",
      source: "systemd",
    },
    {
      id: "host-data-raid",
      label: "/data RAID0",
      status: "warn",
      checked_at: ago(10),
      detail: "82% full",
      value: 82,
      source: "host",
      remediation: "offload dive data; RAID0 has no redundancy",
    },
    {
      id: "host-ntp",
      label: "NTP skew",
      status: "fault",
      checked_at: ago(11),
      detail: "AIS-vs-sub skew 2.4s",
      value: 2.4,
      source: "host",
      remediation: "check chrony / AIS time source",
    },
  ],
};

export default HEALTH_FIXTURE;

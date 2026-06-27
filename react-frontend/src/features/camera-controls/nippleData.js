const RAD = Math.PI / 180;
const DEFAULT_THRESHOLD = 0.3;

// Mirror of nipplejs' computeDirection, keyed on the raw screen-space angle.
function nippleDirection(rAngle, force, threshold) {
  if (force <= threshold) return undefined;
  const a45 = Math.PI / 4;
  const a90 = Math.PI / 2;
  let angle;
  if (rAngle > a45 && rAngle < a45 * 3) angle = "up";
  else if (rAngle > -a45 && rAngle <= a45) angle = "left";
  else if (rAngle > -a45 * 3 && rAngle <= -a45) angle = "down";
  else angle = "right";
  return {
    x: rAngle > -a90 && rAngle < a90 ? "left" : "right",
    y: rAngle > 0 ? "up" : "down",
    angle,
  };
}

// Convert a screen-space stick vector (x right+, y down+) into the same data
// shape nipplejs hands to onMove, so hardware input flows through the exact
// same pipeline as the touch joystick.
export function nippleDataFromVector(
  vx,
  vy,
  size,
  center = { x: 0, y: 0 },
  threshold = DEFAULT_THRESHOLD
) {
  const radius = size / 2;
  const mag = Math.hypot(vx, vy);
  const clamp = mag > 1 ? 1 / mag : 1;
  const dx = vx * clamp;
  const dy = vy * clamp;
  const distance = Math.hypot(dx, dy) * radius;
  const force = distance / radius;
  // `0 - d` (not `-d`) so a zeroed axis stays +0, matching nipplejs' center-pos
  // math and keeping atan2 on the same branch.
  const screenDeg = Math.atan2(0 - dy, 0 - dx) / RAD;

  // Only the fields the joystick forwards to the backend; force drives the
  // direction threshold but is never emitted (the backend rejects extra keys).
  return {
    position: { x: center.x + dx * radius, y: center.y + dy * radius },
    distance,
    angle: {
      radian: (180 - screenDeg) * RAD,
      degree: 180 - screenDeg,
    },
    direction: nippleDirection(screenDeg * RAD, force, threshold),
  };
}

export default nippleDataFromVector;

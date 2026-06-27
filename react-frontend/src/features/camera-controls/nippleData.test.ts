import { describe, it, expect } from "vitest";
import { nippleDataFromVector } from "./nippleData";

const SIZE = 150;

describe("nippleDataFromVector", () => {
  it("maps cardinal stick directions to nipplejs angles", () => {
    // x right+, y down+. nipplejs: right=0, up=90, left=180, down=270.
    expect(nippleDataFromVector(1, 0, SIZE).angle.degree).toBeCloseTo(0);
    expect(nippleDataFromVector(0, -1, SIZE).angle.degree).toBeCloseTo(90);
    expect(nippleDataFromVector(-1, 0, SIZE).angle.degree).toBeCloseTo(180);
    expect(nippleDataFromVector(0, 1, SIZE).angle.degree).toBeCloseTo(270);
  });

  it("reports cardinal direction labels like nipplejs", () => {
    expect(nippleDataFromVector(0, -1, SIZE).direction.angle).toBe("up");
    expect(nippleDataFromVector(0, 1, SIZE).direction.angle).toBe("down");
    expect(nippleDataFromVector(-1, 0, SIZE).direction.angle).toBe("left");
    expect(nippleDataFromVector(1, 0, SIZE).direction.angle).toBe("right");
  });

  it("clamps distance to the joystick radius and scales force 0..1", () => {
    const full = nippleDataFromVector(2, 0, SIZE);
    expect(full.distance).toBeCloseTo(SIZE / 2);
    expect(full.force).toBeCloseTo(1);

    const half = nippleDataFromVector(0.5, 0, SIZE);
    expect(half.distance).toBeCloseTo(SIZE / 4);
    expect(half.force).toBeCloseTo(0.5);
  });

  it("offsets page position from the supplied center", () => {
    const center = { x: 300, y: 200 };
    const { position } = nippleDataFromVector(1, 0, SIZE, center);
    expect(position.x).toBeCloseTo(300 + SIZE / 2);
    expect(position.y).toBeCloseTo(200);
  });

  it("leaves direction undefined below the threshold", () => {
    expect(nippleDataFromVector(0.1, 0, SIZE, undefined, 0.3).direction).toBeUndefined();
  });
});

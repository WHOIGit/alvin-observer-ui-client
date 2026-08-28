import { afterEach, beforeEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";

const BANNER = "mock-health-banner";

async function loadPanel() {
  vi.resetModules();
  const { HealthProvider } = await import("./HealthContext");
  const { default: SystemHealthPanel } = await import("./SystemHealthPanel");
  return { HealthProvider, SystemHealthPanel };
}

beforeEach(() => {
  delete (window as any).MOCK_HEALTH;
});

afterEach(() => {
  delete (window as any).MOCK_HEALTH;
  cleanup();
});

test("the fixture is announced on screen whenever it drives the view", async () => {
  (window as any).MOCK_HEALTH = true;
  const { HealthProvider, SystemHealthPanel } = await loadPanel();

  render(
    <HealthProvider>
      <SystemHealthPanel />
    </HealthProvider>
  );

  expect(screen.getByTestId(BANNER).textContent).toContain("NOT LIVE");
});

test("no banner on the live feed", async () => {
  const { HealthProvider, SystemHealthPanel } = await loadPanel();

  render(
    <HealthProvider>
      <SystemHealthPanel />
    </HealthProvider>
  );

  expect(screen.queryByTestId(BANNER)).toBeNull();
});

test('a "false" string in configEnv does not enable the fixture', async () => {
  (window as any).MOCK_HEALTH = "false";
  vi.resetModules();
  const { MOCK_HEALTH } = await import("../../config");
  expect(MOCK_HEALTH).toBe(false);
});

test("a truthy non-true value does not enable the fixture", async () => {
  (window as any).MOCK_HEALTH = 1;
  vi.resetModules();
  const { MOCK_HEALTH } = await import("../../config");
  expect(MOCK_HEALTH).toBe(false);
});

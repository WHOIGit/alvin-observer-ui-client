/**
 * Architecture boundary: all network code lives in src/lib/imaging-client,
 * and the application talks to it only through its public entry point.
 * These rules are what make the eventual protocol rewrite a library-internal
 * change instead of an application-wide one.
 */

import { expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Vitest runs with the package root as its working directory.
const SRC_DIR = path.resolve(process.cwd(), "src");
const LIB_DIR = path.join(SRC_DIR, "lib", "imaging-client");

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const appFiles = walk(SRC_DIR).filter((file) => !file.startsWith(LIB_DIR));

function offenders(pattern: RegExp): string[] {
  return appFiles
    .filter((file) => pattern.test(fs.readFileSync(file, "utf8")))
    .map((file) => path.relative(SRC_DIR, file));
}

test("only the imaging-client library imports socket.io-client", () => {
  expect(offenders(/from\s+["']socket\.io-client["']/)).toEqual([]);
});

test("app code imports only the library's public entry point", () => {
  // Deep imports like lib/imaging-client/protocol bypass the public API.
  expect(offenders(/from\s+["'][^"']*lib\/imaging-client\/[^"']+["']/)).toEqual(
    []
  );
});

// WebRTC video streaming is deliberately application-side: it talks to the
// video server over WHEP/RTSPtoWeb, not the imaging-control protocol this
// library owns.
const NETWORK_PRIMITIVE_ALLOWLIST = new Set(["utils/webrtcplayer.js"]);

test("raw network primitives stay inside the library", () => {
  const found = offenders(
    /\bfetch\s*\(|new\s+WebSocket\s*\(|new\s+RTCPeerConnection\s*\(/
  ).filter((file) => !NETWORK_PRIMITIVE_ALLOWLIST.has(file));
  expect(found).toEqual([]);
});

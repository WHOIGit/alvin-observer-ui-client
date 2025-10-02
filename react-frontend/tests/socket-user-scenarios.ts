import {
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
  WS_SERVER_NAMESPACE_PILOT,
} from "../src/config.js";

export type SocketUserScenario = {
  name: string;
  observerSide: "P" | "S" | "PL";
  namespace: string; // always begins with "/"
  cameraCommand: string;
};

export const SOCKET_USER_SCENARIOS: SocketUserScenario[] = [
  {
    name: "port observer",
    observerSide: "P",
    namespace: `/${WS_SERVER_NAMESPACE_PORT}`,
    cameraCommand: "COVP",
  },
  {
    name: "starboard observer",
    observerSide: "S",
    namespace: `/${WS_SERVER_NAMESPACE_STARBOARD}`,
    cameraCommand: "COVS",
  },
  {
    name: "pilot",
    observerSide: "PL",
    namespace: `/${WS_SERVER_NAMESPACE_PILOT}`,
    cameraCommand: "COPL",
  },
];

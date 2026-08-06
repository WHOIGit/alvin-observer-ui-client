import { STATIONS } from "../src/lib/imaging-client";
import type { StationId } from "../src/lib/imaging-client";
import {
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
  WS_SERVER_NAMESPACE_PILOT,
} from "../src/config.js";

export type SocketUserScenario = {
  name: string;
  stationId: StationId;
  namespace: string; // always begins with "/"
  cameraCommand: string;
};

export const SOCKET_USER_SCENARIOS: SocketUserScenario[] = [
  {
    name: "port observer",
    stationId: STATIONS.PORT,
    namespace: `/${WS_SERVER_NAMESPACE_PORT}`,
    cameraCommand: "COVP",
  },
  {
    name: "starboard observer",
    stationId: STATIONS.STARBOARD,
    namespace: `/${WS_SERVER_NAMESPACE_STARBOARD}`,
    cameraCommand: "COVS",
  },
  {
    name: "pilot",
    stationId: STATIONS.PILOT,
    namespace: `/${WS_SERVER_NAMESPACE_PILOT}`,
    cameraCommand: "COPL",
  },
];

import AppPilot from "./AppPilot.jsx";
import AppObserver from "./AppObserver.jsx";
import SystemMessageListener from "./features/listeners/SystemMessageListener.jsx";
import HeartbeatWatchdog from "./features/heartbeats/HeartbeatWatchdog.jsx";

export default function App() {
  return (
    <>
      <SystemMessageListener />
      <HeartbeatWatchdog />
      {window.PILOT_MODE === true ? <AppPilot /> : <AppObserver />}
    </>
  );
}

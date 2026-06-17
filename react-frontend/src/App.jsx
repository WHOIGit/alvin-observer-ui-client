import AppPilot from "./AppPilot.jsx";
import AppObserver from "./AppObserver.jsx";
import SystemMessageListener from "./features/listeners/SystemMessageListener.jsx";
import { WebRtcProvider } from "./features/camera-controls/WebRtcProvider.jsx";

export default function App() {
  return (
    <>
      <SystemMessageListener />
      <WebRtcProvider>
        {window.PILOT_MODE === true ? <AppPilot /> : <AppObserver />}
      </WebRtcProvider>
    </>
  );
}

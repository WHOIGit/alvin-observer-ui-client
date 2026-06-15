import AppPilot from "./AppPilot.jsx";
import AppObserver from "./AppObserver.jsx";
import SystemMessageListener from "./features/listeners/SystemMessageListener.jsx";
import { WebRtcProvider } from "./features/camera-controls/WebRtcProvider.jsx";
import SystemNotificationsBar from "./features/system-messages/SystemNotificationsBar.jsx";

export default function App() {
  return (
    <>
      <SystemMessageListener />
      <SystemNotificationsBar />
      <WebRtcProvider>
        {window.PILOT_MODE === true ? <AppPilot /> : <AppObserver />}
      </WebRtcProvider>
    </>
  );
}

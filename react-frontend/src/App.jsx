import AppPilot from "./AppPilot.jsx";
import AppObserver from "./AppObserver.jsx";
import SystemMessageListener from "./features/listeners/SystemMessageListener.jsx";
import SystemNotificationsBar from "./features/system-messages/SystemNotificationsBar.jsx";

export default function App() {
  return (
    <>
      <SystemMessageListener />
      <SystemNotificationsBar />
      {window.PILOT_MODE === true ? <AppPilot /> : <AppObserver />}
    </>
  );
}

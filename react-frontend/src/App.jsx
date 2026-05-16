import AppPilot from "./AppPilot.jsx";
import AppObserver from "./AppObserver.jsx";
import SystemMessageListener from "./features/listeners/SystemMessageListener.jsx";

export default function App() {
  return (
    <>
      <SystemMessageListener />
      {window.PILOT_MODE === true ? <AppPilot /> : <AppObserver />}
    </>
  );
}

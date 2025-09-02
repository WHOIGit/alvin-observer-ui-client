import AppPilot from "./AppPilot.jsx";
import AppObserver from "./AppObserver.jsx";

export default function App() {
  if (window.PILOT_MODE === true) {
    return <AppPilot />;
  } else {
    return <AppObserver />;
  }
}

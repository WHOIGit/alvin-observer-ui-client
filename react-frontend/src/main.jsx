import { createRoot } from 'react-dom/client';
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider as MuiStylesThemeProvider } from "@mui/styles";
import { Provider } from "react-redux";
import App from "./App";
import theme from "./theme";
import store from "./store";

const root = createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <MuiStylesThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </MuiStylesThemeProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </Provider>
);

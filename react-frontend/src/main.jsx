import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider as MuiStylesThemeProvider } from "@mui/styles";
import { Provider } from "react-redux";
import App from "./App";
import theme from "./theme";
import store from "./store";

ReactDOM.render(
  <Provider store={store}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <MuiStylesThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </MuiStylesThemeProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </Provider>,
  document.getElementById("root")
);

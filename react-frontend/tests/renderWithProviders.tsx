import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import type { Store } from "@reduxjs/toolkit";
import { StyledEngineProvider, ThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeProvider as MuiStylesThemeProvider } from "@mui/styles";

type Options = {
  store: Store;
  theme?: any;
} & Omit<RenderOptions, "wrapper">;

export function renderWithProviders(ui: ReactElement, { store, theme, ...options }: Options) {
  const muiTheme = theme ?? createTheme();
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <MuiStylesThemeProvider theme={muiTheme}>{children}</MuiStylesThemeProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

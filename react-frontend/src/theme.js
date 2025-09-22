import { red, green } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme({
  components: {
    MuiCardHeader: {
      styleOverrides: {
        // In MUIv5, the action element in the card header gained a -4px 
        // bottom margin. This reverts that change.
        //
        // FIXME: This is a temporary fix. The proper fix is probably to embrace
        // the newer grid system.
        action: {
          marginBottom: 0,
        },
      },
    },

    MuiCssBaseline: {
      styleOverrides: {
        // In MUI v5, the body font size increased, which caused some issues
        // with some text labels. This reverts to the v4 font size.
        //
        // https://mui.com/material-ui/migration/v5-component-changes/#update-body-font-size
        body: {
          fontSize: '0.875rem',
          lineHeight: 1.43,
          letterSpacing: '0.01071em',
        },
      },
    },
  },

  palette: {
    mode: "dark",
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#2195f2",
    },
    success: {
      main: green.A700,
      contrastText: "#fff",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fff",
    },
  },
});

export default theme;

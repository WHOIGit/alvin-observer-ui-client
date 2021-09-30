import { red, green } from "@material-ui/core/colors";
import { createMuiTheme } from "@material-ui/core/styles";

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    type: "dark",
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

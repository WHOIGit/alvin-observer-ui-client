import { red, green } from "@mui/material/colors";
import { createTheme, adaptV4Theme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme(adaptV4Theme({
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
}));

export default theme;

"use client";
import { createTheme } from "@mui/material/styles";

const URBANIST = 'var(--font-urbanist), system-ui, -apple-system, "Segoe UI", sans-serif';
const OUTFIT = 'var(--font-outfit), system-ui, -apple-system, "Segoe UI", sans-serif';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2d50d3" },
    success: { main: "#0F5818" },
    warning: { main: "#cb9f00" },
    error: { main: "#db2a2a" },
  },
  typography: {
    fontFamily: OUTFIT,
    h1: { fontFamily: URBANIST },
    h2: { fontFamily: URBANIST },
    h3: { fontFamily: URBANIST },
    h4: { fontFamily: URBANIST },
    h5: { fontFamily: URBANIST },
    h6: { fontFamily: URBANIST },
    subtitle1: { fontFamily: URBANIST },
    subtitle2: { fontFamily: URBANIST },
    button: { fontFamily: URBANIST },
  },
});

export default theme;

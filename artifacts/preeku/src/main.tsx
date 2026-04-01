import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const storedTheme = (() => { try { return localStorage.getItem("preeku-theme"); } catch { return null; } })();
if (storedTheme === "light") {
  document.documentElement.classList.add("light");
} else {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(<App />);

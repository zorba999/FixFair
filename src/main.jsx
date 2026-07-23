import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// NOTE: StrictMode is intentionally omitted — its dev-only double-invoke of
// effects reverts GSAP timelines mid-flight (the verdict/entrance animations).
ReactDOM.createRoot(document.getElementById("root")).render(<App />);

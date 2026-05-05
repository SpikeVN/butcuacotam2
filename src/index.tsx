/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import "solid-devtools";
export { type EventName } from "./registry";
export { GameStage, type Progress, type UserData } from "./types";
import App from "./App";

// Add prod-mode class to body in production mode for production-only animations
if (!import.meta.env.DEV) {
    document.body.classList.add("prod-mode");
}

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
    );
}

render(() => <App />, root!);

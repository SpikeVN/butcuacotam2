import { Match, Switch } from "solid-js";
import { sceneIs } from "../engine/script";
import Section1 from "./Section1";
import AuthenticationGuard from "./AuthenticationGuard";
import { AnimatedShow } from "../components/winlib/AnimatedShow";
import "./styles/Game.css";
import Section2 from "./Section2";
import ToBeContinued from "./ToBeContinued";
import Credits from "./Credits";

export default function Game() {
    return (
        <AuthenticationGuard>
            <AnimatedShow when={sceneIs(0, "s1")}>
                {(exiting) => (
                    <div
                        class="section-fade-container"
                        classList={{ exiting: exiting }}
                    >
                        <Section1 isExiting={exiting} />
                    </div>
                )}
            </AnimatedShow>

            <AnimatedShow when={sceneIs(0, "s2")}>
                {(exiting) => (
                    <div
                        class="section-fade-container"
                        classList={{ exiting: exiting }}
                    >
                        <Section2 isExiting={exiting} />
                    </div>
                )}
            </AnimatedShow>

            <AnimatedShow when={sceneIs(0, "tbc")}>
                {(exiting) => (
                    <div
                        class="section-fade-container"
                        classList={{ exiting: exiting }}
                    >
                        <ToBeContinued />
                    </div>
                )}
            </AnimatedShow>

            <AnimatedShow when={sceneIs(0, "credits")}>
                {(exiting) => (
                    <div
                        class="section-fade-container"
                        classList={{ exiting: exiting }}
                    >
                        <Credits />
                    </div>
                )}
            </AnimatedShow>
        </AuthenticationGuard>
    );
}

import { Match, Switch } from "solid-js";
import { sceneIs } from "../engine/script";
import Section1 from "./Section1";

export default function Game() {
    return (
        <Switch>
            <Match when={sceneIs(0, "s1")}>
                <Section1 />
            </Match>
        </Switch>
    );
}

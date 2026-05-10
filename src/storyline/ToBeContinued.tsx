import { Show } from "solid-js";
import FullScreenNarrator from "../components/FullScreenNarrator";
import { sceneIs } from "../engine/script";
import VisualNovelTextWindow from "../components/VisualNovelTextWindow";

export default function ToBeContinued() {
    return (
        <>
            <Show when={sceneIs(1, "blank")}>
                <FullScreenNarrator />
            </Show>
            <Show when={sceneIs(1, "text")}>
                <VisualNovelTextWindow />
            </Show>
        </>
    );
}

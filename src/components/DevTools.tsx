import { type Component, For } from "solid-js";
import { script, setScript } from "../engine/script";
import { SCRIPT_DATA } from "../gameScript";
import { saveUserdata } from "../engine/userdata";
import { invokeEvent } from "../engine/events";
import { GameStage } from "../types";
import StandardWindow from "./winlib/StandardWindow";

const DevTools: Component<{ currentStage: GameStage }> = (props) => {
    const paths = Object.keys(SCRIPT_DATA);

    return (
        <StandardWindow
            title="DevTools"
            initialX={20}
            initialY={20}
            initialWidth={300}
            initialHeight={500}
            alwaysOnTop={true}
            baseZIndex={999999}
            noPadding={false}
            draggableMode="topbar"
            draggableHeight={30}
        >
            <div class="flex flex-col gap-4 p-2 text-xs">
                <div class="flex flex-col gap-1">
                    <p class="font-bold text-accent">Nhánh kịch bản</p>
                    <select
                        class="bg-bg border border-fg2 p-1 text-fg rounded"
                        value={script.path}
                        onChange={async (e) => {
                            const newPath = e.currentTarget.value;
                            setScript({
                                path: newPath,
                                index: 0,
                            });
                            await saveUserdata(newPath, 0);
                        }}
                    >
                        <For each={paths}>
                            {(path) => (
                                <option
                                    value={path}
                                    selected={path === script.path}
                                >
                                    {path}
                                </option>
                            )}
                        </For>
                    </select>
                </div>

                <div class="flex flex-col gap-1">
                    <p class="font-bold text-accent">
                        Dòng ({script.index}/{script.data.length - 1})
                    </p>
                    <input
                        type="range"
                        min="0"
                        max={script.data.length - 1}
                        value={script.index}
                        onInput={async (e) => {
                            const newIndex = parseInt(e.currentTarget.value);
                            setScript("index", newIndex);
                            await saveUserdata(script.path, newIndex);
                        }}
                        class="w-full accent-accent"
                    />
                    <input
                        type="number"
                        min="0"
                        max={script.data.length - 1}
                        value={script.index}
                        onInput={async (e) => {
                            const val = parseInt(e.currentTarget.value);
                            if (!isNaN(val)) {
                                const newIndex = Math.min(
                                    Math.max(0, val),
                                    script.data.length - 1,
                                );
                                setScript("index", newIndex);
                                await saveUserdata(script.path, newIndex);
                            }
                        }}
                        class="bg-bg border border-fg2 p-1 text-fg rounded"
                    />
                </div>

                <div class="flex flex-col gap-1">
                    <p class="font-bold text-accent">GameStage</p>
                    <select
                        class="bg-bg border border-fg2 p-1 text-fg rounded"
                        value={(() => {
                            const key = GameStage[props.currentStage];
                            return key === "LOADING_SCREEN"
                                ? "loading"
                                : key.toLowerCase().replace(/_/g, "_");
                        })()}
                        onChange={(e) => {
                            const stageName = e.currentTarget.value;
                            if (!stageName) return;
                            invokeEvent(`changescreen_${stageName}` as any);
                        }}
                    >
                        <For
                            each={Object.keys(GameStage).filter((k) =>
                                isNaN(Number(k)),
                            )}
                        >
                            {(key) => {
                                const eventSuffix =
                                    key === "LOADING_SCREEN"
                                        ? "loading"
                                        : key.toLowerCase().replace(/_/g, "_");
                                return (
                                    <option value={eventSuffix}>{key}</option>
                                );
                            }}
                        </For>
                    </select>
                </div>

                <div class="mt-2 p-2 border border-fg2 rounded bg-bg/50">
                    <div class="font-bold text-accent mb-1">Cảnh hiện tại</div>
                    <div class="break-all opacity-80 mb-2">{script.scene}</div>
                    <div class="font-bold text-accent mb-1">Lời thoại</div>
                    <div class="opacity-80">
                        {script.line?.[2] || "(trống)"}
                    </div>
                </div>

                <div class="flex flex-col gap-2 mt-2">
                    <button
                        class="btn"
                        onClick={() => {
                            console.log(
                                "Current Script State:",
                                JSON.parse(JSON.stringify(script)),
                            );
                        }}
                    >
                        In ra console
                    </button>
                    <button
                        class="btn"
                        onClick={async () => {
                            await saveUserdata();
                            console.log("User data synced to server.");
                        }}
                    >
                        Up lên server
                    </button>
                </div>
            </div>
        </StandardWindow>
    );
};

export default DevTools;

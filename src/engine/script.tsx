import {
    createSignal,
    createMemo,
    batch,
    createEffect,
    createRoot,
} from "solid-js";
import { createStore } from "solid-js/store";
import { EventName } from "../registry";
import { SCRIPT_DATA } from "../gameScript";
import { invokeEvent } from "./events";
export {
    moveWindow,
    moveWindowByTitle,
    getWindowApi,
    getWindowApiByTitle,
} from "./windowManager";

export type ScriptEntry = [
    string,
    string,
    string,
    (EventName | (() => void) | null)?,
    string?,
];

export type ScriptPath = ScriptEntry[];

const TAG_INDEX: Record<string, Record<string, number>> = {};
Object.entries(SCRIPT_DATA).forEach(([pathName, entries]) => {
    TAG_INDEX[pathName] = {};
    entries.forEach((entry, idx) => {
        const tag = entry[4];
        if (tag) {
            TAG_INDEX[pathName][tag] = idx;
        }
    });
});

export const [script, setScript] = createStore({
    path: "intro_game1",
    index: 0,
    get line() {
        const pathData = SCRIPT_DATA[this.path] || SCRIPT_DATA["intro_game1"];
        return pathData[this.index];
    },
    get scene() {
        return this.line[0];
    },
    get sceneLevels() {
        return this.scene.split(".");
    },
    get data() {
        return SCRIPT_DATA[this.path] || SCRIPT_DATA["intro_game1"];
    }
});

// Export accessors for backward compatibility
export const currentPath = () => script.path;
export const currentScriptIndex = () => script.index;
export const currentLine = () => script.line;
export const currentScene = () => script.scene;
export const sceneLevels = () => script.sceneLevels;
export const currentPathData = () => script.data;

// Export setters for backward compatibility
export const setCurrentPath = (path: string) => setScript("path", path);
export const setCurrentScriptIndex = (index: number) => setScript("index", index);
export const setCurrentLine = (_line: ScriptEntry) => {
    // This setter is now less meaningful as line is derived, but we keep it for API compatibility if needed
    console.warn("setCurrentLine is deprecated. Use setScript('index', ...) or setScript('path', ...) instead.");
};

createRoot(() => {
    createEffect(() => {
        const line = script.line;
        if (line && line[1] === "" && line[2] === "") {
            invokeCurrentTrigger();
        }
    });
});

export const sceneAt = (level: number) => script.sceneLevels[level];

export const sceneIs = (level: number, ...values: string[]) => {
    return values.includes(script.sceneLevels[level]);
};

export const getNextText = (): ScriptEntry | null => {
    const nextIndex = script.index + 1;
    const path = script.data;

    if (nextIndex >= path.length) {
        return null;
    }

    setScript("index", nextIndex);
    return script.line;
};

export const switchPath = (pathName: string, startIndex: number = 0) => {
    batch(() => {
        setScript({
            path: pathName,
            index: startIndex
        });
    });
};

export const gotoLine = (tag: string, pathName?: string) => {
    const targetPath = pathName || script.path;
    const index = TAG_INDEX[targetPath]?.[tag];

    if (index !== undefined) {
        batch(() => {
            setScript({
                path: targetPath,
                index: index
            });
        });
    } else {
        console.error(`Tag "${tag}" not found in path "${targetPath}"`);
    }
};

export const invokeCurrentTrigger = () => {
    const line = script.line;
    if (!line) return;

    if (typeof line[3] === "string") {
        invokeEvent(line[3] as EventName);
    } else if (typeof line[3] === "function") {
        (line[3] as () => void)();
    }
};

export const handleDone = () => {
    setScript("index", 0);
};

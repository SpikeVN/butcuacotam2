import {
    Component,
    createSignal,
    onCleanup,
    onMount,
    createEffect,
    createMemo,
} from "solid-js";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";
import { invokeEvent } from "../engine/events";
import DraggableWindow from "./winlib/DraggableWindow";

import "./styles/VisualNovelTextWindow.css";
import {
    script,
    getNextText,
    ScriptEntry,
    invokeCurrentTrigger,
} from "../engine/script";
gsap.registerPlugin(TextPlugin, SplitText);

const CHAR_ANIMATION_DURATION = 0.05;

type TextFormat =
    | "normal"
    | "bold"
    | "italic"
    | "bold-italic"
    | "strikethrough"
    | "monospace";

interface ParsedText {
    text: string;
    format: TextFormat;
}

const parseMarkdown = (text: string): ParsedText => {
    let format: TextFormat = "normal";
    let cleanText = text;

    // Check for bold-italic (*** or ___ or **_ combinations)
    if (
        (text.startsWith("***") && text.endsWith("***")) ||
        (text.startsWith("___") && text.endsWith("___"))
    ) {
        format = "bold-italic";
        cleanText = text.slice(3, -3);
    }
    // Check for bold (** or __)
    else if (
        (text.startsWith("**") && text.endsWith("**")) ||
        (text.startsWith("__") && text.endsWith("__"))
    ) {
        format = "bold";
        cleanText = text.slice(2, -2);
    }
    // Check for italic (* or _)
    else if (
        (text.startsWith("*") &&
            text.endsWith("*") &&
            !text.startsWith("**")) ||
        (text.startsWith("_") && text.endsWith("_") && !text.startsWith("__"))
    ) {
        format = "italic";
        cleanText = text.slice(1, -1);
    }
    // Check for strikethrough (~~)
    else if (text.startsWith("~~") && text.endsWith("~~")) {
        format = "strikethrough";
        cleanText = text.slice(2, -2);
    }
    // Check for monospace (`)
    else if (
        text.startsWith("`") &&
        text.endsWith("`") &&
        !text.startsWith("``")
    ) {
        format = "monospace";
        cleanText = text.slice(1, -1);
    }

    return { text: cleanText, format };
};

interface VisualNovelTextWindowProps {
    isExiting?: boolean;
}

const VisualNovelTextWindow: Component<VisualNovelTextWindowProps> = (
    props,
) => {
    let textContainer: HTMLDivElement | undefined;
    let textElement: HTMLParagraphElement | undefined;

    const [currentText, setCurrentText] = createSignal<string | null>(null);
    const [textFormat, setTextFormat] = createSignal<TextFormat>("normal");
    const [isAnimating, setIsAnimating] = createSignal(false);
    const [isWaitingForInput, setIsWaitingForInput] = createSignal(false);
    const [characterName, setCharacterName] = createSignal("");

    const isHidden = createMemo(() => {
        return (
            characterName() === "" &&
            (currentText() === "" || currentText() === null)
        );
    });

    let timeline: gsap.core.Timeline | null = null;
    let mouseDownTime = 0;

    const animateText = () => {
        if (!textElement || currentText() === null) return;

        // Kill any existing timeline
        if (timeline) {
            timeline.kill();
        }

        // Reset the text element to be empty for animation
        textElement.textContent = "";

        if (currentText() === "") {
            setIsAnimating(false);
            setIsWaitingForInput(true);
            invokeCurrentTrigger();
            return;
        }

        setIsAnimating(true);

        // Small delay to ensure DOM update
        setTimeout(() => {
            if (!textElement) return;

            const text = currentText();
            if (!text) return;

            timeline = gsap.timeline({
                onComplete: () => {
                    setIsAnimating(false);
                    setIsWaitingForInput(true);
                    invokeCurrentTrigger();
                },
            });

            // Type out text character by character using TextPlugin
            timeline.to(textElement, {
                duration: text.length * CHAR_ANIMATION_DURATION,
                text: text,
                ease: "none",
            });
        }, 10);
    };

    const loadNextText = () => {
        setIsWaitingForInput(false);
        getNextText();
    };

    const handleAdvance = () => {
        if (isHidden()) return;
        if (isAnimating()) {
            // Skip to end of animation
            if (timeline) {
                timeline.progress(1);
            }
            setIsAnimating(false);
            setIsWaitingForInput(true);
        } else if (isWaitingForInput()) {
            // Load next text
            loadNextText();
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if typing in an input
        const isInput =
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLTextAreaElement ||
            document.activeElement instanceof HTMLInputElement ||
            document.activeElement instanceof HTMLTextAreaElement;

        if (isInput) return;

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleAdvance();
        }
    };

    const handleMouseDown = (e: MouseEvent) => {
        mouseDownTime = Date.now();
    };

    const handleMouseUp = (e: MouseEvent) => {
        const duration = Date.now() - mouseDownTime;
        // Only trigger if it was a quick click (less than 150ms)
        // This prevents triggering when dragging the window
        if (duration < 150) {
            handleAdvance();
        }
    };

    onMount(() => {
        // Add event listeners
        document.addEventListener("keydown", handleKeyDown);
        // Attach listeners to the text container
        if (textContainer) {
            textContainer.addEventListener("mousedown", handleMouseDown);
            textContainer.addEventListener("mouseup", handleMouseUp);
        }
    });

    createEffect(() => {
        // Synchronize with global script state
        const line = script.line;
        if (line) {
            const parsed = parseMarkdown(line[2]);
            setCharacterName(line[1]);
            setCurrentText(parsed.text);
            setTextFormat(parsed.format);
        }
    });

    createEffect(() => {
        // Trigger animation whenever currentText changes and it's not a hidden line
        if (currentText() !== null && !isHidden()) {
            animateText();
        }
    });

    onCleanup(() => {
        document.removeEventListener("keydown", handleKeyDown);
        if (textContainer) {
            textContainer.removeEventListener("mousedown", handleMouseDown);
            textContainer.removeEventListener("mouseup", handleMouseUp);
        }
        if (timeline) {
            timeline.kill();
        }
    });

    return (
        <div style={{ display: isHidden() ? "none" : "block" }}>
            <DraggableWindow
                draggableMode="anywhere"
                initialWidth={825}
                initialHeight={160}
                class="visualnovel-window"
                initialX={window.innerWidth / 2 - 412}
                initialY={window.innerHeight - 160 - 24}
                alwaysOnTop={true}
                isExiting={props.isExiting}
            >
                <div class="visualnovel-outer">
                    <div class="visualnovel-title text-md font-semibold select-none">
                        {characterName()}
                    </div>
                    <div
                        ref={textContainer}
                        class="visualnovel-content thick-shadow cursor-pointer"
                    >
                        <p
                            ref={textElement}
                            class={`text-lg font-normal text-white text-left px-4 pt-4 vn-text-${textFormat()}`}
                            style={{
                                "word-wrap": "break-word",
                            }}
                        />
                        <div class="absolute bottom-3 w-full flex items-center justify-center gap-6">
                            {/* <button class="font-bold text-white cursor-pointer">
                                lịch sử chat
                            </button> */}
                            <button
                                class="font-bold text-white cursor-pointer"
                                onClick={() =>
                                    invokeEvent("changescreen_main_menu")
                                }
                            >
                                về menu
                            </button>
                            {/* <button class="font-bold text-white cursor-pointer">
                                cài đặt
                            </button> */}
                        </div>
                    </div>
                </div>
            </DraggableWindow>
        </div>
    );
};

export default VisualNovelTextWindow;

import {
    Component,
    createSignal,
    onCleanup,
    onMount,
    createEffect,
    batch,
} from "solid-js";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { script, getNextText, invokeCurrentTrigger } from "../engine/script";

import "./styles/FullScreenNarrator.css";

gsap.registerPlugin(SplitText);

const WORD_ANIMATION_DURATION = 0.5;
const WORD_STAGGER = 0.1;
const WORD_RISE_DISTANCE = 20;

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

const FullScreenNarrator: Component = () => {
    let textElement!: HTMLParagraphElement;

    const [isAnimating, setIsAnimating] = createSignal(false);
    const [isWaitingForInput, setIsWaitingForInput] = createSignal(false);
    const [textFormat, setTextFormat] = createSignal<TextFormat>("normal");
    const [displayText, setDisplayText] = createSignal("");

    let timeline: gsap.core.Timeline | null = null;
    let splitText: InstanceType<typeof SplitText> | null = null;
    let mouseDownTime = 0;

    const animateText = () => {
        if (!textElement) return;

        // Reset state for new animation
        if (timeline) timeline.kill();
        if (splitText) splitText.revert();

        // Hide the element immediately to prevent flashing the full text
        // before SplitText can hide the individual words
        textElement.style.opacity = "0";

        setIsAnimating(true);
        setIsWaitingForInput(false);

        // Small delay to ensure DOM update
        setTimeout(() => {
            if (!textElement) return;

            splitText = SplitText.create(textElement, {
                type: "words",
                wordsClass: "fsn-word",
            });

            // Show the element now that words are split and hidden by their own class
            textElement.style.opacity = "1";

            timeline = gsap.timeline({
                onComplete: () => {
                    setIsAnimating(false);
                    setIsWaitingForInput(true);
                    invokeCurrentTrigger();
                },
            });

            timeline.fromTo(
                splitText.words,
                {
                    y: WORD_RISE_DISTANCE,
                    opacity: 0,
                },
                {
                    duration: WORD_ANIMATION_DURATION,
                    y: 0,
                    opacity: 1,
                    stagger: WORD_STAGGER,
                    ease: "power2.out",
                },
            );
        }, 10);
    };

    const handleAdvance = () => {
        if (isAnimating()) {
            if (timeline) {
                timeline.progress(1);
            }
            setIsAnimating(false);
            setIsWaitingForInput(true);
        } else if (isWaitingForInput()) {
            // Prevent multiple clicks while fading out
            setIsWaitingForInput(false);

            // Fade out current text before moving to the next line
            gsap.to(textElement, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                    getNextText();
                },
            });
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
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
        if (duration < 150) {
            handleAdvance();
        }
    };

    onMount(() => {
        document.addEventListener("keydown", handleKeyDown);
    });

    createEffect(() => {
        const line = script.line;
        if (line && line[2]) {
            const parsed = parseMarkdown(line[2]);
            batch(() => {
                setDisplayText(parsed.text);
                setTextFormat(parsed.format);
            });
            animateText();
        }
    });

    onCleanup(() => {
        document.removeEventListener("keydown", handleKeyDown);
        if (timeline) timeline.kill();
        if (splitText) splitText.revert();
    });

    return (
        <div
            class="fullscreen-narrator cursor-pointer flex flex-col gap-3 select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <p
                ref={textElement}
                style={{
                    "font-family": "Cormorant Garamond, serif",
                }}
                class={`text-accent font-medium text-4xl w-[80%] lg:w-[40%] fsn-text fsn-text-${textFormat()}`}
            >
                {displayText()}
            </p>
            <p class="text-fg2">Bấm bất kỳ phím nào hoặc click để tiếp tục.</p>
        </div>
    );
};

export default FullScreenNarrator;

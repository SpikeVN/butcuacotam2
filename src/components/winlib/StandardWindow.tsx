import { type Component, type JSX, onMount, onCleanup } from "solid-js";
import DraggableWindow, { type DraggableWindowAPI } from "./DraggableWindow";
import "./styles/StandardWindow.css";

/**
 * API exposed by StandardWindow to allow programmatic control.
 */
export type StandardWindowAPI = DraggableWindowAPI;

/**
 * Props for configuring the StandardWindow component.
 */
interface StandardWindowProps {
    /** Unique identifier for the window. */
    id?: string;
    /** The title displayed in the window's title bar. */
    title?: string;
    /** The child elements to render inside the window. */
    children?: JSX.Element;
    /** The initial X position of the window. Defaults to center of screen. */
    initialX?: number;
    /** The initial Y position of the window. Defaults to center of screen. */
    initialY?: number;
    /** The initial width of the window in pixels or 'auto'. Defaults to 'auto'. */
    initialWidth?: number | "auto";
    /** The initial height of the window in pixels or 'auto'. Defaults to 'auto'. */
    initialHeight?: number | "auto";
    /** Callback fired when the window receives focus. */
    onFocus?: (zIndex: number) => void;
    /** If true, uses a higher z-index layer. */
    alwaysOnTop?: boolean;
    /** Custom base z-index. Overrides normal and alwaysOnTop behavior. */
    baseZIndex?: number;
    /**
     * The dragging mode.
     * 'selector' uses draggableSelector.
     * 'topbar' uses draggableHeight.
     * 'anywhere' allows dragging from any part of the window.
     */
    draggableMode?: "selector" | "topbar" | "anywhere";
    /** Height in pixels from the window top that is draggable. Used when mode is 'topbar'. */
    draggableHeight?: number;
    /** CSS selector for the draggable area. Used when mode is 'selector'. */
    draggableSelector?: string;
    /** If true, the window can be dragged off-screen. Defaults to true. */
    allowOffScreen?: boolean;
    /** If true, removes the default padding from the content area. */
    noPadding?: boolean;
    /** If true, removes the titlebar overlap/spacing. */
    noTitlebarSpacing?: boolean;
    /** Callback to receive the StandardWindowAPI instance. */
    apiRef?: (api: StandardWindowAPI) => void;
    /** If true, the window is in its exit animation phase. */
    isExiting?: boolean;
}

const StandardWindow: Component<StandardWindowProps> = (props) => {
    const title = () => props.title ?? "Window";
    let contentRef: HTMLDivElement | undefined;
    let windowAPI: StandardWindowAPI | undefined;
    // Generate unique ID if not provided to avoid key collisions between windows
    const windowId =
        props.id || `window-${Math.random().toString(36).substr(2, 9)}`;
    const scrollStorageKey = `scroll-pos-${windowId}`;
    const positionStorageKey = `window-pos-${windowId}`;

    const handleApiRef = (api: StandardWindowAPI) => {
        windowAPI = api;
        props.apiRef?.(api);

        if (import.meta.env.DEV) {
            let lastSavedPos: { x: number; y: number } | null = null;
            let saveTimeout: any;
            let hasRestoredPosition = false;

            // Restore window position on mount
            const savedPos = sessionStorage.getItem(positionStorageKey);
            if (savedPos) {
                try {
                    const pos = JSON.parse(savedPos);
                    lastSavedPos = pos;
                    hasRestoredPosition = true;
                    // Defer restore to after component fully mounts
                    Promise.resolve().then(() => {
                        api.moveTo(pos.x, pos.y);
                        // Mark as restored to prevent collision with polling
                        hasRestoredPosition = true;
                    });
                } catch {
                    // Ignore parse errors
                    hasRestoredPosition = true;
                }
            } else {
                hasRestoredPosition = true;
            }

            // Debounced position saver
            const savePosition = () => {
                if (saveTimeout) clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    const pos = api.getPosition();
                    // Only save if position changed
                    if (
                        !lastSavedPos ||
                        pos.x !== lastSavedPos.x ||
                        pos.y !== lastSavedPos.y
                    ) {
                        lastSavedPos = pos;
                        sessionStorage.setItem(
                            positionStorageKey,
                            JSON.stringify(pos),
                        );
                    }
                }, 100);
            };

            // Poll for position changes with debouncing
            const positionPollInterval = setInterval(savePosition, 300);

            onCleanup(() => {
                clearInterval(positionPollInterval);
                if (saveTimeout) clearTimeout(saveTimeout);
                // Final save on unmount
                const finalPos = api.getPosition();
                sessionStorage.setItem(
                    positionStorageKey,
                    JSON.stringify(finalPos),
                );
            });
        }
    };

    // Only enable scroll preservation in development mode
    if (import.meta.env.DEV) {
        onMount(() => {
            // Restore scroll position on mount
            if (contentRef) {
                const savedScroll = sessionStorage.getItem(scrollStorageKey);
                if (savedScroll) {
                    const scrollPos = parseInt(savedScroll, 10);
                    contentRef.scrollTop = scrollPos;
                }
            }
        });

        onCleanup(() => {
            // Save scroll position before unmount
            if (contentRef) {
                sessionStorage.setItem(
                    scrollStorageKey,
                    contentRef.scrollTop.toString(),
                );
            }
        });
    }

    const handleScroll = () => {
        if (import.meta.env.DEV && contentRef) {
            sessionStorage.setItem(
                scrollStorageKey,
                contentRef.scrollTop.toString(),
            );
        }
    };

    return (
        <DraggableWindow
            id={props.id}
            apiRef={handleApiRef}
            title={props.title}
            draggableMode={props.draggableMode ?? "selector"}
            draggableHeight={props.draggableHeight}
            draggableSelector={props.draggableSelector ?? ".standard-titlebar"}
            class="standard-window"
            initialX={props.initialX}
            initialY={props.initialY}
            initialWidth={props.initialWidth}
            initialHeight={props.initialHeight}
            onFocus={props.onFocus}
            alwaysOnTop={props.alwaysOnTop}
            baseZIndex={props.baseZIndex}
            allowOffScreen={props.allowOffScreen}
            isExiting={props.isExiting}
        >
            <div class="standard-window-inner">
                <div
                    class="standard-titlebar thick-shadow"
                    classList={{ "no-spacing": props.noTitlebarSpacing }}
                >
                    {title()}
                </div>
                <div
                    ref={contentRef}
                    class="standard-content thick-shadow"
                    classList={{
                        "no-padding": props.noPadding,
                        "no-spacing": props.noTitlebarSpacing,
                    }}
                    onScroll={handleScroll}
                >
                    {props.children}
                </div>
            </div>
        </DraggableWindow>
    );
};

export default StandardWindow;

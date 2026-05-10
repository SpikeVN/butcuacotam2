import {
    createSignal,
    onCleanup,
    onMount,
    createEffect,
    batch,
    type Component,
    type JSX,
    type Accessor,
} from "solid-js";
import { gsap } from "gsap";
import { registerWindow, unregisterWindow } from "../../engine/windowManager";
import "./styles/DraggableWindow.css";

/**
 * API exposed by DraggableWindow to allow programmatic control.
 */
export interface DraggableWindowAPI {
    /**
     * Moves the window to a specific position.
     * @param x The target X coordinate.
     * @param y The target Y coordinate.
     * @param options Optional GSAP animation properties.
     */
    moveTo: (x: number, y: number, options?: gsap.TweenVars) => void;

    /**
     * Resizes the window to specific dimensions.
     * @param width The target width in pixels.
     * @param height The target height in pixels.
     * @param options Optional GSAP animation properties.
     */
    resizeTo: (width: number, height: number, options?: gsap.TweenVars) => void;

    /**
     * Gets the current position of the window.
     * @returns An object containing the current x and y coordinates.
     */
    getPosition: () => { x: number; y: number };

    /**
     * Gets the current size of the window.
     * @returns An object containing the current width and height.
     */
    getSize: () => { width: number; height: number };
}

/**
 * Props for configuring the DraggableWindow component.
 */
interface DraggableWindowProps {
    /** Unique identifier for the window. */
    id?: string;
    /** Human-readable title for the window. */
    title?: string;
    /** The child elements to render inside the window. */
    children?: JSX.Element;
    /** The initial X position of the window. Defaults to center of screen. */
    initialX?: number;
    /** The initial Y position of the window. Defaults to center of screen. */
    initialY?: number;
    /** The initial width of the window in pixels. Can be a number or a signal. Defaults to 'auto'. */
    initialWidth?: number | Accessor<number> | "auto";
    /** The initial height of the window in pixels. Can be a number or a signal. Defaults to 'auto'. */
    initialHeight?: number | Accessor<number> | "auto";
    /** Callback fired when window width changes. Useful for updating external signals. */
    onWidthChange?: (width: number) => void;
    /** Callback fired when window height changes. Useful for updating external signals. */
    onHeightChange?: (height: number) => void;
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
    /** CSS selector for the draggable area. Used when mode is 'selector'. */
    draggableSelector?: string;
    /** Height in pixels from the window top that is draggable. Used when mode is 'topbar'. */
    draggableHeight?: number;
    /** Custom CSS class for theming. */
    class?: string;
    /** If true, the window can be dragged off-screen. Defaults to true. */
    allowOffScreen?: boolean;
    /** Minimum width of the window in pixels. Defaults to 200. */
    minWidth?: number;
    /** Minimum height of the window in pixels. Defaults to 100. */
    minHeight?: number;
    /** Whether the window is resizable. Defaults to true. */
    resizable?: boolean;
    /** Callback to receive the DraggableWindowAPI instance. */
    apiRef?: (api: DraggableWindowAPI) => void;
    /** If true, the window is in its exit animation phase. */
    isExiting?: boolean;
}

let globalZIndex = 1000;
let alwaysOnTopZIndex = 10000;

const DraggableWindow: Component<DraggableWindowProps> = (props) => {
    // Helper function to get value from number or signal
    const getValue = (
        val: number | Accessor<number> | "auto" | undefined,
        defaultVal: number | "auto",
    ): number | "auto" => {
        if (val === undefined) return defaultVal;
        if (val === "auto") return "auto";
        return typeof val === "function" ? (val as Accessor<number>)() : val;
    };

    const initialWidthValue = () => getValue(props.initialWidth, "auto");
    const initialHeightValue = () => getValue(props.initialHeight, "auto");

    const [size, setSize] = createSignal<{
        width: number | "auto";
        height: number | "auto";
    }>({
        width: initialWidthValue(),
        height: initialHeightValue(),
    });

    const initialX = () => {
        if (props.initialX !== undefined) return props.initialX;
        const w = size().width;
        if (w === "auto") return 0;
        return Math.max(0, (window.innerWidth - w) / 2);
    };
    const initialY = () => {
        if (props.initialY !== undefined) return props.initialY;
        const h = size().height;
        if (h === "auto") return 0;
        return Math.max(0, (window.innerHeight - h) / 2);
    };

    const [position, setPosition] = createSignal({
        x: initialX(),
        y: initialY(),
    });

    const [isDragging, setIsDragging] = createSignal(false);
    const [isResizing, setIsResizing] = createSignal(false);
    const [resizeType, setResizeType] = createSignal<string | null>(null);
    const [dragOffset, setDragOffset] = createSignal({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = createSignal({
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        px: 0,
        py: 0,
    });

    const getInitialZIndex = () => {
        if (props.baseZIndex !== undefined) {
            return props.baseZIndex;
        } else if (props.alwaysOnTop) {
            alwaysOnTopZIndex += 1;
            return alwaysOnTopZIndex;
        } else {
            globalZIndex += 1;
            return globalZIndex;
        }
    };

    const [zIndex, setZIndex] = createSignal(getInitialZIndex());

    let windowRef: HTMLDivElement | undefined;

    // Surgical update for position to ensure maximum smoothness
    createEffect(() => {
        const pos = position();
        if (windowRef) {
            windowRef.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        }
    });

    const api: DraggableWindowAPI = {
        moveTo: (x: number, y: number, options?: gsap.TweenVars) => {
            if (!options || options.duration === 0) {
                batch(() => setPosition({ x, y }));
                return;
            }

            if (windowRef) {
                // Animate DOM directly for 60fps smoothness
                gsap.to(windowRef, {
                    x,
                    y,
                    ...options,
                    onStart: () => {
                        windowRef!.style.willChange = "transform";
                        options?.onStart?.();
                    },
                    onComplete: () => {
                        windowRef!.style.willChange = "auto";
                        // Sync signal once at the end
                        batch(() => setPosition({ x, y }));
                        options?.onComplete?.();
                    },
                });
            }
        },
        resizeTo: (width: number, height: number, options?: gsap.TweenVars) => {
            if (!options || options.duration === 0) {
                setSize({ width, height });
                props.onWidthChange?.(width);
                props.onHeightChange?.(height);
                return;
            }
            const currentSize = { ...size() };
            gsap.to(currentSize, {
                width,
                height,
                ...options,
                onUpdate: () => {
                    setSize({
                        width: currentSize.width as number,
                        height: currentSize.height as number,
                    });
                    props.onWidthChange?.(currentSize.width as number);
                    props.onHeightChange?.(currentSize.height as number);
                },
            });
        },
        getPosition: () => position(),
        getSize: () => size() as { width: number; height: number },
    };

    if (props.apiRef) {
        props.apiRef(api);
    }

    onMount(() => {
        const id = props.id || `win-${Math.random().toString(36).substr(2, 9)}`;
        registerWindow(id, props.title || id, api);

        // If size is auto, measure and fix it
        if (
            windowRef &&
            (size().width === "auto" || size().height === "auto")
        ) {
            const rect = windowRef.getBoundingClientRect();
            batch(() => {
                const newWidth =
                    size().width === "auto"
                        ? Math.max(props.minWidth ?? 200, rect.width)
                        : (size().width as number);
                const newHeight =
                    size().height === "auto"
                        ? Math.max(props.minHeight ?? 100, rect.height)
                        : (size().height as number);
                setSize({ width: newWidth, height: newHeight });

                // Recalculate position if it was supposed to be centered
                if (
                    props.initialX === undefined ||
                    props.initialY === undefined
                ) {
                    const newX =
                        props.initialX !== undefined
                            ? props.initialX
                            : Math.max(0, (window.innerWidth - newWidth) / 2);
                    const newY =
                        props.initialY !== undefined
                            ? props.initialY
                            : Math.max(0, (window.innerHeight - newHeight) / 2);
                    setPosition({ x: newX, y: newY });
                }

                // Trigger callbacks
                props.onWidthChange?.(newWidth);
                props.onHeightChange?.(newHeight);
            });
        }

        onCleanup(() => unregisterWindow(id));
    });

    const bringToFront = () => {
        if (props.baseZIndex !== undefined) {
            setZIndex(props.baseZIndex);
        } else if (props.alwaysOnTop) {
            alwaysOnTopZIndex += 1;
            setZIndex(alwaysOnTopZIndex);
            props.onFocus?.(alwaysOnTopZIndex);
        } else {
            globalZIndex += 1;
            setZIndex(globalZIndex);
            props.onFocus?.(globalZIndex);
        }
    };

    const handleMouseDown = (e: MouseEvent) => {
        // Bring window to front on any interaction
        bringToFront();

        let canDrag = false;
        const mode = props.draggableMode || "selector";

        if (mode === "selector") {
            // Drag from elements matching the selector
            const draggableSelector =
                props.draggableSelector || ".textwindow-titlebar";
            canDrag = !!(e.target as HTMLElement).closest(draggableSelector);
        } else if (mode === "topbar") {
            // Drag from the top N pixels of the window
            const windowY = position().y;
            const draggableHeight = props.draggableHeight ?? 40;
            const clickYRelativeToWindow = e.clientY - windowY;
            // Allow negative values to support protruding handles (like StandardWindow titles)
            canDrag = clickYRelativeToWindow <= draggableHeight;
        } else if (mode === "anywhere") {
            // Drag from anywhere on the window
            canDrag = true;
        }

        if (canDrag) {
            setIsDragging(true);
            const currentPos = position();
            setDragOffset({
                x: e.clientX - currentPos.x,
                y: e.clientY - currentPos.y,
            });

            document.addEventListener("mousemove", handleGlobalMouseMove);
            document.addEventListener("mouseup", handleGlobalMouseUp);
        }
    };

    const handleResizeMouseDown = (e: MouseEvent, type: string) => {
        // Cannot resize if size is still auto (though it should be fixed by onMount)
        if (size().width === "auto" || size().height === "auto") return;

        e.stopPropagation();
        // Bring window to front on resize
        bringToFront();

        setIsResizing(true);
        setResizeType(type);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            w: size().width as number,
            h: size().height as number,
            px: position().x,
            py: position().y,
        });

        document.addEventListener("mousemove", handleGlobalMouseMove);
        document.addEventListener("mouseup", handleGlobalMouseUp);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isDragging()) {
            const offset = dragOffset();
            const currentSize = size();
            const width = currentSize.width as number;
            const height = currentSize.height as number;

            let newX = e.clientX - offset.x;
            let newY = e.clientY - offset.y;

            const maxInBoundsX = window.innerWidth - width;
            const maxInBoundsY = window.innerHeight - height;
            const snapThreshold = 10; // Pixels to snap/stay on edge

            // Bounds check
            if (props.allowOffScreen ?? true) {
                // Snapping logic for edges
                if (Math.abs(newX) < snapThreshold) {
                    newX = 0;
                } else if (Math.abs(newX - maxInBoundsX) < snapThreshold) {
                    newX = maxInBoundsX;
                }

                if (Math.abs(newY) < snapThreshold) {
                    newY = 0;
                } else if (Math.abs(newY - maxInBoundsY) < snapThreshold) {
                    newY = maxInBoundsY;
                }

                // Hard limits (keep at least 50 pixels visible)
                newX = Math.max(
                    -(width - 50),
                    Math.min(newX, window.innerWidth - 50),
                );
                newY = Math.max(
                    0, // Prevent window from being dragged above the screen
                    Math.min(newY, window.innerHeight - 50),
                );
            } else {
                // Keep completely within bounds
                newX = Math.max(0, Math.min(newX, window.innerWidth - width));
                newY = Math.max(0, Math.min(newY, window.innerHeight - height));
            }

            setPosition({ x: newX, y: newY });
        } else if (isResizing()) {
            const start = resizeStart();
            const type = resizeType();
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;

            let newWidth = start.w;
            let newHeight = start.h;
            let newX = start.px;
            let newY = start.py;

            const minWidth = props.minWidth ?? 200;
            const minHeight = props.minHeight ?? 100;

            if (type?.includes("e")) {
                newWidth = Math.max(minWidth, start.w + dx);
                if (props.allowOffScreen ?? true) {
                    // Allow extending off-screen but keep at least 50 pixels visible
                    if (newX + newWidth > window.innerWidth + 50)
                        newWidth = window.innerWidth + 50 - newX;
                } else if (newX + newWidth > window.innerWidth) {
                    newWidth = window.innerWidth - newX;
                }
            }
            if (type?.includes("s")) {
                newHeight = Math.max(minHeight, start.h + dy);
                if (props.allowOffScreen ?? true) {
                    // Allow extending off-screen but keep at least 50 pixels visible
                    if (newY + newHeight > window.innerHeight + 50)
                        newHeight = window.innerHeight + 50 - newY;
                } else if (newY + newHeight > window.innerHeight) {
                    newHeight = window.innerHeight - newY;
                }
            }
            if (type?.includes("w")) {
                const possibleX = start.px + dx;
                const cappedX =
                    (props.allowOffScreen ?? true)
                        ? Math.max(-(start.w - 50), possibleX)
                        : Math.max(0, possibleX);
                const widthDiff = start.px - cappedX;
                const possibleWidth = start.w + widthDiff;

                if (possibleWidth >= minWidth) {
                    newX = cappedX;
                    newWidth = possibleWidth;
                } else {
                    // Capped by minWidth
                    newWidth = minWidth;
                    newX = start.px + (start.w - minWidth);
                }
            }
            if (type?.includes("n")) {
                const possibleY = start.py + dy;
                const cappedY =
                    (props.allowOffScreen ?? true)
                        ? Math.max(0, possibleY)
                        : Math.max(0, possibleY);
                const heightDiff = start.py - cappedY;
                const possibleHeight = start.h + heightDiff;

                if (possibleHeight >= minHeight) {
                    newY = cappedY;
                    newHeight = possibleHeight;
                } else {
                    // Capped by minHeight
                    newHeight = minHeight;
                    newY = start.py + (start.h - minHeight);
                }
            }

            setSize({ width: newWidth, height: newHeight });
            setPosition({ x: newX, y: newY });

            // Trigger size change callbacks
            props.onWidthChange?.(newWidth);
            props.onHeightChange?.(newHeight);
        }
    };

    const handleGlobalMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeType(null);
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
    };

    onCleanup(() => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
    });

    return (
        <div
            ref={windowRef}
            class={`textwindow ${props.class || ""} ${props.isExiting ? "exiting" : ""}`}
            onClick={() => bringToFront()}
            style={{
                width: size().width === "auto" ? "auto" : `${size().width}px`,
                height:
                    size().height === "auto" ? "auto" : `${size().height}px`,
                "z-index": zIndex(),
                visibility:
                    size().width === "auto" || size().height === "auto"
                        ? "hidden"
                        : "visible",
                "user-select":
                    props.draggableMode === "anywhere" ? "none" : "auto",
                cursor: isDragging()
                    ? "grabbing"
                    : isResizing()
                      ? "crosshair"
                      : props.draggableMode === "anywhere"
                        ? "default"
                        : "auto",
            }}
            onMouseDown={handleMouseDown}
        >
            {props.children}

            {/* Resize Handles */}
            {(props.resizable ?? true) && (
                <>
                    <div
                        class="resize-handle n"
                        onMouseDown={(e) => handleResizeMouseDown(e, "n")}
                    />
                    <div
                        class="resize-handle s"
                        onMouseDown={(e) => handleResizeMouseDown(e, "s")}
                    />
                    <div
                        class="resize-handle e"
                        onMouseDown={(e) => handleResizeMouseDown(e, "e")}
                    />
                    <div
                        class="resize-handle w"
                        onMouseDown={(e) => handleResizeMouseDown(e, "w")}
                    />
                    <div
                        class="resize-handle nw"
                        onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
                    />
                    <div
                        class="resize-handle ne"
                        onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
                    />
                    <div
                        class="resize-handle sw"
                        onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
                    />
                    <div
                        class="resize-handle se"
                        onMouseDown={(e) => handleResizeMouseDown(e, "se")}
                    />
                </>
            )}
        </div>
    );
};

export default DraggableWindow;

import { type Component, type JSX } from "solid-js";
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

    return (
        <DraggableWindow
            id={props.id}
            apiRef={props.apiRef}
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
                    class="standard-content thick-shadow"
                    classList={{
                        "no-padding": props.noPadding,
                        "no-spacing": props.noTitlebarSpacing,
                    }}
                >
                    {props.children}
                </div>
            </div>
        </DraggableWindow>
    );
};

export default StandardWindow;

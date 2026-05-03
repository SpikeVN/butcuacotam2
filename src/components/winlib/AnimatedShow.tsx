import { createSignal, createEffect, Show, JSX, onCleanup } from "solid-js";

interface AnimatedShowProps {
    when: boolean;
    children: (isExiting: boolean) => JSX.Element;
    exitBeforeEnter?: boolean;
    duration?: number;
}

/**
 * A component that keeps its children in the DOM after the 'when' condition
 * becomes false, allowing for exit animations.
 */
export function AnimatedShow(props: AnimatedShowProps) {
    const [shouldRender, setShouldRender] = createSignal(props.when);
    const [isExiting, setIsExiting] = createSignal(false);
    const duration = props.duration ?? 300;

    createEffect(() => {
        if (props.when) {
            setShouldRender(true);
            setIsExiting(false);
        } else if (shouldRender()) {
            setIsExiting(true);
            const timer = setTimeout(() => {
                // Check if condition is still false before unrendering
                if (!props.when) {
                    setShouldRender(false);
                    setIsExiting(false);
                }
            }, duration);
            onCleanup(() => clearTimeout(timer));
        }
    });

    return <Show when={shouldRender()}>{props.children(isExiting())}</Show>;
}

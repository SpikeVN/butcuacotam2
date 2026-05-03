import { EventName } from "../registry";

let EVENT_DB: Record<string, Array<() => void>> = {};

/**
 * Registers a listener for a specific event.
 * @param trigger The event name to listen for.
 * @param callback The function to call when the event is invoked.
 * @returns A function to unregister the listener.
 */
export function registerEvent(trigger: EventName, callback: () => void) {
    if (!EVENT_DB[trigger]) {
        EVENT_DB[trigger] = [];
    }
    EVENT_DB[trigger].push(callback);

    return () => {
        if (EVENT_DB[trigger]) {
            EVENT_DB[trigger] = EVENT_DB[trigger].filter((cb) => cb !== callback);
        }
    };
}

/**
 * Invokes all listeners registered for a specific event.
 * @param trigger The event name to invoke.
 */
export function invokeEvent(trigger: EventName) {
    if (EVENT_DB[trigger]) {
        // Create a copy to avoid issues if listeners are modified during execution
        const listeners = [...EVENT_DB[trigger]];
        listeners.forEach((callback) => callback());
    } else {
        console.warn(`No event found for: ${trigger}`);
    }
}
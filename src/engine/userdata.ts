import { createSignal, Signal } from "solid-js";
import { UserData } from "../types";
import { script, setScript } from "./script";
import { fromb64 } from "./crypto";

const ENDPOINT = (import.meta.env.VITE_API_ENDPOINT ? import.meta.env.VITE_API_ENDPOINT : "http://localhost:6942").replace(/\/$/, "");

export let [authenticated, setAuthenticated] = createSignal(false);

// @ts-ignore
export let [userdata, setUserdata]: Signal<UserData> = createSignal({});

export const saveUserdata = async (path?: string, index?: number) => {
    const data = {
        timestamp: Date.now(),
        path: path ? path : script.path,
        index: index !== undefined ? index : script.index,
    };

    await fetch(ENDPOINT + "/user/saveProgress", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        keepalive: true,
        credentials: "include",
        body: JSON.stringify(data),
    });
};

export const loadUserdata = async () => {
    try {
        const s = await fetch(
            ENDPOINT + "/user/profile",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            },
        );

        if (!s.ok) {
            console.debug("Session validation failed with status:", s.status);
            setAuthenticated(false);
            return;
        }

        const res = await s.json();
        setUserdata(res);
        if (res.progress) {
            setScript({
                path: res.progress.path,
                index: res.progress.index,
            });
            setAuthenticated(true);
        } else {
            setAuthenticated(false);
        }
    } catch (err) {
        console.debug(
            "Network error or request cancelled during session validation",
        );
        setAuthenticated(false);
    }
};

export const login = async (spell: string) => {
    const res = await fetch(ENDPOINT + "/auth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ spell_hash: spell }),
    });

    if (res.ok) {
        const data = await res.json();
        if (data.status === "OK") {
            setAuthenticated(true);
            await loadUserdata();
            return true;
        }
    }
    return false;
};

export const register = async (name: string, email: string, spell_hash: string) => {
    const res = await fetch(
        ENDPOINT + "/auth/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                name,
                email,
                spell_hash,
            }),
        },
    );

    if (res.ok) {
        setAuthenticated(true);
        await loadUserdata();
        return true;
    }
    return false;
};

export const handleSpellFromUrl = async (): Promise<boolean> => {
    const params = new URLSearchParams(window.location.search);
    const spellParam = params.get("spell");

    if (!spellParam) {
        return false;
    }

    try {
        const decodedSpell = fromb64(spellParam);
        const success = await login(decodedSpell);

        if (success) {
            // Clean up URL by removing the spell parameter
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("spell");
            window.history.replaceState({}, document.title, newUrl.toString());
        }

        return success;
    } catch (e) {
        console.debug("Failed to process spell from URL", e);
        return false;
    }
};

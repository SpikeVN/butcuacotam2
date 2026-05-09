/**
 * Player verification and cryptographic utilities.
 */

import { blake2b } from "blakejs";

/**
 * 
 * The content in the TOKEN_SET should be kept secret. It is highly
 * recommended that you heavily obfuscate the content of this file,
 * so the token set is not knowable by browsing source code.
 * 
 * The token contained in this file may be used to reverse engineer and
 * brute force
 * 
 */
import TOKEN_SET from "../../spellbook.json";



export const spell2token = (rawSpell: string): string => {
    let spell = rawSpell.split(" ");
    spell[spell.length - 2] = spell.slice(-2).join(" ");
    spell = spell.slice(4, 10)

    let token = ""

    for (let [i, fragment] of spell.entries()) {
        token += TOKEN_SET[i].indexOf(fragment);
    }

    return token;
}

export const token2spell = (token: `${number}`) => {
    let spell = "bống bống bang bang";

    for (let [i, tok] of token.split("").entries()) {
        spell += ` ${TOKEN_SET[i][parseInt(tok)]}`;
    }

    return spell;
}


export const computeHash = (input: string): string => {
    const inputBuffer = new TextEncoder().encode(input);
    const hashBuffer = blake2b(inputBuffer, undefined, 32);
    return Array.from(hashBuffer)
        .map((b) => ("00" + b.toString(16)).slice(-2))
        .join("");
};

export const tob64 = (input: string): string => {
    const bytes = new TextEncoder().encode(input);
    return btoa(Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("")).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const fromb64 = (b64: string): string => {
    let base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
};

export const generateRandomToken = (): { token: `${number}`; spell: string; spellb64: string; hash: string } => {
    let spell = "bống bống bang bang";
    // @ts-ignore
    let token: `${number}` = "";
    const randomValues = new Uint8Array(6);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < 6; i++) {
        const randomIndex = randomValues[i] % TOKEN_SET[i].length
        spell += ` ${TOKEN_SET[i][randomIndex]}`;
        token += `${randomIndex}`;
    }

    return {
        token: token,
        spell: spell,
        spellb64: tob64(spell),
        hash: computeHash(spell)
    };
};

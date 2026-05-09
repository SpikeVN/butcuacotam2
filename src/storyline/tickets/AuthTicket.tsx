import "./AuthTicket.css";

import authTicket from "../../../assets/images/auth-ticket.avif";
import QRCodeStyling from "qr-code-styling";
import { onMount } from "solid-js";
import { tob64 } from "../../engine/crypto";

export default function AuthTicket(props: {
    name: string;
    spell: string;
    token: string;
}) {
    let qrTarget!: HTMLDivElement;

    onMount(() => {
        let qrCode = new QRCodeStyling({
            width: 100,
            height: 100,
            type: "svg",
            data:
                "https://butcuacotam.cteftu.id.vn/?token=" + tob64(props.token),
            dotsOptions: {
                color: "var(--color-fg)",
                type: "dots",
            },
            cornersSquareOptions: {
                color: "var(--color-fg)",
                type: "extra-rounded",
            },
            cornersDotOptions: {
                color: "var(--color-fg)",
                type: "dot",
            },
            backgroundOptions: {
                color: "transparent",
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 0,
            },
        });

        qrCode.append(qrTarget);
    });

    return (
        <div class="relative">
            <img
                class="w-[600px] h-auto"
                src={authTicket}
                alt="ticket background"
            />
            <p class="text-name glow">{props.name}</p>
            <p class="text-spell glow">{props.spell}</p>
            <p class="text-date glow">
                {new Date().toLocaleDateString("vi-VN")}
            </p>

            <div ref={qrTarget} class="qr-image" draggable={false}></div>
        </div>
    );
}

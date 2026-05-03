import { onMount } from "solid-js";
import gsap from "gsap";

import { GameStage } from "../types";

import landingGraphics from "../../assets/images/landing-graphics.svg";
import "./styles/MainMenu.css";

export default function MainMenu(props: {
    doneCallback: (_: GameStage) => void;
}) {
    let mainMenu!: HTMLDivElement;
    let blurred!: HTMLDivElement;
    let blurrer!: HTMLDivElement;

    onMount(() => {
        gsap.timeline()
            .from(mainMenu, {
                autoAlpha: 0,
                duration: 1,
            })
            .from(
                blurred,
                {
                    autoAlpha: 0,
                    duration: 2,
                },
                "<",
            );
    });

    return (
        <div class="absolute w-full h-full flex flex-col items-start justify-start">
            <div
                ref={mainMenu}
                class="z-10 absolute main-menu w-full h-full flex flex-col gap-5 items-center justify-center"
            >
                <div class="absolute w-full h-full flex items-center justify-center">
                    {starryPath}
                </div>

                <div class="w-full h-full flex flex-col items-center justify-center gap-11 select-none z-20">
                    <img
                        class="h-1/2 w-auto"
                        src={landingGraphics}
                        fetchpriority="high"
                        alt="Landing Graphics featuring a bird with sparkles and orbit rings around it."
                        draggable="false"
                    />

                    <div class="flex flex-row gap-0">
                        <div class="flex flex-col gap-1 items-start justify-center">
                            <button
                                class="lighten animated-underline px-9 py-3 flex flex-row gap-3 items-center justify-center"
                                onClick={() =>
                                    props.doneCallback(GameStage.PLAY)
                                }
                            >
                                <p class="text-accent text-xl font-semibold">
                                    Bắt đầu
                                </p>
                                <ArrowRight />
                            </button>
                            <button
                                class="lighten animated-underline px-9 py-3 flex flex-row gap-3 items-center justify-center"
                                onClick={() =>
                                    props.doneCallback(GameStage.CREDITS)
                                }
                            >
                                <p class="text-accent text-xl font-semibold">
                                    Credits
                                </p>
                                <ArrowRight />
                            </button>
                        </div>
                        <div class="flex flex-col gap-1 items-start justify-center">
                            <button
                                class="lighten animated-underline px-9 py-3 flex flex-row gap-3 items-center justify-center"
                                onClick={() =>
                                    props.doneCallback(GameStage.SETTINGS)
                                }
                            >
                                <p class="text-accent text-xl font-semibold">
                                    Cài đặt
                                </p>
                                <ArrowRight />
                            </button>
                            <button class="lighten animated-underline px-9 py-3 flex flex-row gap-3 items-center justify-center">
                                <p class="text-accent text-xl font-semibold">
                                    Về trang chủ
                                </p>
                                <ArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
                <p class="absolute text-fg2 text-sm bottom-3 max-w-3/5 text-center">
                    Bụt của cô Tấm 0.0.1-ALPHA. Bản quyền © 2026 CLB
                    Khoa&nbsphọc Công&nbspnghệ trong Kinh&nbsptế và
                    Kinh&nbspdoanh. Phát hành theo giấy phép GPLv3.
                </p>
            </div>

            <div class="absolute noisy-blur w-full h-full -z-10">
                <br />
            </div>

            <div
                ref={blurred}
                class="absolute w-full h-full flex items-center justify-center -z-20"
            >
                <img
                    class="mt-[-4rem] h-[60%] w-auto"
                    fetchpriority="high"
                    src={landingGraphics}
                />

                <svg
                    class="absolute"
                    style={{
                        transform: "translateX(30px) translateY(30px)",
                    }}
                    width="196"
                    height="196"
                    viewBox="0 0 196 196"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="98" cy="98" r="98" fill="#BEFDA3" />
                </svg>
                <svg
                    class="absolute"
                    style={{
                        transform: "translateX(-70px) translateY(-70px)",
                    }}
                    width="196"
                    height="196"
                    viewBox="0 0 196 196"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="98" cy="98" r="98" fill="#B4A3FD" />
                </svg>
                <svg
                    class="fixed"
                    style={{
                        width: "196px",
                        height: "196px",
                        top: "-50px",
                        left: "-50px",
                    }}
                    width="196"
                    height="196"
                    viewBox="0 0 196 196"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="98" cy="98" r="98" fill="#D2F66C" />
                </svg>
                <svg
                    class="fixed"
                    style={{
                        width: "196px",
                        height: "196px",
                        top: "-50px",
                        right: "-50px",
                    }}
                    width="196"
                    height="196"
                    viewBox="0 0 196 196"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="98" cy="98" r="98" fill="#F66C6C" />
                </svg>
            </div>
        </div>
    );
}

const starryPath = (
    <svg
        class="fixed w-[100vw] mix-blend-plus-lighter"
        style={{
            top: "10px",
            left: 0,
        }}
        viewBox="0 0 1366 155"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M0 0.2612C15.7212 25.9218 174.5 162.832 374.5 82.2612C655 -30.7388 918.99 8.21172 1050 93.2612C1137.34 149.961 1331.06 54.0021 1366 41.1718"
            stroke="#AB98CC"
            stroke-dasharray="5 5"
        />
        <g filter="url(#filter0_d_283_918)">
            <path
                d="M278.172 93.2612C279.532 101.003 282.164 103.971 291 106.204C282.815 108.022 279.909 110.781 278.172 119.261C276.441 110.64 273.349 107.995 265 106.204C273.495 104.517 276.41 101.716 278.172 93.2612Z"
                fill="white"
            />
        </g>
        <g filter="url(#filter1_d_283_918)">
            <path
                d="M1017.17 61.2612C1018.53 69.0031 1021.16 71.9709 1030 74.2037C1021.81 76.0216 1018.91 78.7805 1017.17 87.2612C1015.44 78.6395 1012.35 75.9953 1004 74.2037C1012.49 72.5169 1015.41 69.7156 1017.17 61.2612Z"
                fill="white"
            />
        </g>
        <defs>
            <filter
                id="filter0_d_283_918"
                x="249.6"
                y="77.8612"
                width="56.8"
                height="56.8"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
            >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="7.7" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
                />
                <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_283_918"
                />
                <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_283_918"
                    result="shape"
                />
            </filter>
            <filter
                id="filter1_d_283_918"
                x="988.6"
                y="45.8612"
                width="56.8"
                height="56.8"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
            >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="7.7" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
                />
                <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_283_918"
                />
                <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_283_918"
                    result="shape"
                />
            </filter>
        </defs>
    </svg>
);

const ArrowRight = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-arrow-right-icon lucide-arrow-right"
        >
            <path stroke="var(--color-accent)" d="M5 12h14" />
            <path stroke="var(--color-accent)" d="m12 5 7 7-7 7" />
        </svg>
    );
};

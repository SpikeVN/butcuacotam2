import { Component, createSignal, Match, onMount, Switch } from "solid-js";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";

import ftuLogoFile from "../../assets/images/FTU_logo.png";
import fyuLogoFile from "../../assets/images/fyu.png";
import ntqLogoFile from "../../assets/images/NTQ-logo.png";
import AudioManager from "../engine/audioManager";

gsap.registerPlugin(TextPlugin, ScrambleTextPlugin, SplitText);

const LOGO_ANIMATION_DURATION_SECS = 0.8;

export default function LoadingScreen(props: { doneCallback: () => void }) {
    const [showingLogo, setShowingLogo] = createSignal(-1);

    const nextLogo = () => {
        if (showingLogo() == 2) {
            props.doneCallback();
            return;
        }

        setShowingLogo(showingLogo() + 1);
    };
    const handleKeyStart = (_: any) => {
        document.removeEventListener("keydown", handleKeyStart);
        nextLogo();
        AudioManager.BGM.play();
    };

    onMount(() => {
        document.addEventListener("keydown", handleKeyStart);
    });

    return (
        <div class="w-[100vw] h-[100vh] relative">
            <Switch>
                <Match when={showingLogo() == -1}>
                    <button
                        class="w-full h-full flex items-center justify-center"
                        onclick={() => {
                            document.removeEventListener(
                                "keydown",
                                handleKeyStart,
                            );
                            nextLogo();
                            AudioManager.BGM.play();
                        }}
                    >
                        Click hoặc bấm bất kỳ phím nào để bắt đầu trò chơi.
                    </button>
                </Match>
                <Match when={showingLogo() == 0}>
                    <LogoCTE doneCallback={nextLogo} />
                </Match>
                <Match when={showingLogo() == 1}>
                    <LogoFTUAndFYU doneCallback={nextLogo} />
                </Match>
                <Match when={showingLogo() == 2}>
                    <LogoNTQ doneCallback={nextLogo} />
                </Match>
            </Switch>
        </div>
    );
}

function LogoCTE(props: { doneCallback: () => void }) {
    let text!: HTMLParagraphElement;
    let cteLogoImageElement!: HTMLDivElement;
    let cteLogo!: HTMLDivElement;

    onMount(async () => {
        let split = SplitText.create(text!, {
            type: "words",
        });

        gsap.timeline()
            .fromTo(
                cteLogoImageElement,
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    alpha: 0,
                    ease: "expo.out",
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                    yPercent: 100,
                },
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    alpha: 1,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    yPercent: 0,
                },
            )
            .from(
                split.words,
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    y: 50,
                    alpha: 0,
                    ease: "expo.out",
                    stagger:
                        LOGO_ANIMATION_DURATION_SECS /
                        text.textContent.split(" ").length,
                    filter: "blur(5px)",
                },
                "<",
            )
            .from(
                split.words,
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    x: text.offsetWidth,
                },
                "<",
            )
            .to("#cte-line1", {
                delay: 0.5,
                duration: LOGO_ANIMATION_DURATION_SECS,
                scrambleText: "CLB KHOA HỌC CÔNG NGHỆ",
            })
            .to(
                "#cte-line2",
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    scrambleText: "TRONG KT VÀ KD",
                },
                "<",
            )
            .to(cteLogo, {
                delay: LOGO_ANIMATION_DURATION_SECS,
                autoAlpha: 0,
                duration: LOGO_ANIMATION_DURATION_SECS,
            })
            .then(() => {
                props.doneCallback();
            });
    });

    return (
        // <div class="w-[100vw] h-[100vh] relative">
        <div
            ref={cteLogo}
            class="absolute flex flex-row gap-10 items-center justify-start"
            style={{
                inset: 0,
                margin: "auto",
                width: "410px",
                height: "72px",
            }}
        >
            <div id="cteLogo" ref={cteLogoImageElement} class="h-18 w-auto">
                <svg
                    style={{
                        width: "auto",
                        height: "100%",
                    }}
                    viewBox="0 0 39 39"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g clip-path="url(#clip0_82_150)">
                        <path
                            d="M7 0H0V39H7H15V32H7V7H16V39H23V7H32V16H26V23H32V32H24V39H32H39V7V0H7Z"
                            fill="white"
                        />
                    </g>
                    <defs>
                        <clipPath id="clip0_82_150">
                            <rect width="39" height="39" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
            </div>
            <div ref={text} class="flex flex-col w-full text-xl font-semibold">
                <p id="cte-line1">CLUB OF TECHNOLOGY</p>
                <p id="cte-line2">IN ECONOMICS</p>
            </div>
        </div>
        // </div>
    );
}

function LogoFTUAndFYU(props: { doneCallback: () => void }) {
    let ftuLogo!: HTMLImageElement;
    let fyuLogo!: HTMLImageElement;

    let ftuText!: HTMLDivElement;
    let fyuText!: HTMLDivElement;
    let ftuAndFyuLogo!: HTMLDivElement;

    onMount(() => {
        let splitFtu = SplitText.create(ftuText!, {
            type: "words",
        });

        let splitFyu = SplitText.create(fyuText!, {
            type: "words",
        });

        gsap.timeline()
            .fromTo(
                [ftuLogo, fyuLogo],
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    alpha: 0,
                    ease: "expo.out",
                    clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
                    xPercent: 100,
                },
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    alpha: 1,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    xPercent: 0,
                },
            )
            .from(
                splitFtu.words,
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    y: 25,
                    alpha: 0,
                    ease: "expo.out",
                    stagger:
                        (0.5 * LOGO_ANIMATION_DURATION_SECS) /
                        ftuText.textContent.split(" ").length,
                    filter: "blur(5px)",
                },
                "<",
            )
            .from(
                splitFyu.words,
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    y: 25,
                    alpha: 0,
                    ease: "expo.out",
                    stagger:
                        (0.5 * LOGO_ANIMATION_DURATION_SECS) /
                        fyuText.textContent.split(" ").length,
                    filter: "blur(5px)",
                },
                "<",
            )
            .from(
                splitFtu.words,
                {
                    duration: (LOGO_ANIMATION_DURATION_SECS * 3) / 5,
                    x: ftuText.offsetWidth,
                },
                "<",
            )
            .from(
                splitFyu.words,
                {
                    duration: (LOGO_ANIMATION_DURATION_SECS * 4) / 5,
                    x: ftuText.offsetWidth,
                },
                "<",
            )
            .to(ftuAndFyuLogo, {
                autoAlpha: 0,
                duration: LOGO_ANIMATION_DURATION_SECS,
                delay: LOGO_ANIMATION_DURATION_SECS,
            })
            .then(() => {
                props.doneCallback();
            });
    });

    return (
        <div
            ref={ftuAndFyuLogo}
            class="h-full w-full flex md:flex-row sm:flex-col gap-20 sm:item-start justify-center sm:mx-[25vw] md:mx-0 md:items-center"
        >
            <div class="flex flex-row gap-5 items-center justify-start">
                <img
                    ref={ftuLogo}
                    src={ftuLogoFile}
                    class="h-24 sm:h-18 w-auto"
                    data-preload
                />
                <div ref={ftuText} class="hidden sm:block">
                    <p class="leading-5 font-semibold">TRƯỜNG ĐẠI HỌC</p>
                    <p class="leading-5 font-semibold">NGOẠI THƯƠNG</p>
                </div>
            </div>
            <div class="flex flex-row gap-5 items-center justify-start">
                <img
                    ref={fyuLogo}
                    src={fyuLogoFile}
                    class="h-24 sm:h-18 w-auto"
                    data-preload
                />
                <div ref={fyuText} class="hidden sm:block">
                    <p class="leading-5 font-semibold">ĐOÀN TNCS HỒ CHÍ MINH</p>
                    <p class="leading-5 font-semibold">
                        TRƯỜNG ĐH NGOẠI THƯƠNG
                    </p>
                </div>
            </div>
        </div>
    );
}

function LogoNTQ(props: { doneCallback: () => void }) {
    let ntqImage!: HTMLImageElement;
    let ntqText!: HTMLDivElement;
    let ntqLogo!: HTMLDivElement;

    onMount(() => {
        let split = SplitText.create(ntqText!, {
            type: "words",
        });

        gsap.timeline()
            .fromTo(
                ntqImage,
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    alpha: 0,
                    ease: "expo.out",
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                    yPercent: 100,
                },
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    alpha: 1,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    yPercent: 0,
                },
            )
            .from(
                split.words,
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    y: 50,
                    alpha: 0,
                    ease: "expo.out",
                    stagger:
                        LOGO_ANIMATION_DURATION_SECS /
                        ntqText.textContent.split(" ").length,
                    filter: "blur(5px)",
                },
                "<",
            )
            .from(
                split.words,
                {
                    duration: LOGO_ANIMATION_DURATION_SECS,
                    x: ntqText.offsetWidth,
                },
                "<",
            )
            .to(ntqLogo, {
                autoAlpha: 0,
                duration: LOGO_ANIMATION_DURATION_SECS,
                delay: LOGO_ANIMATION_DURATION_SECS,
            })
            .then(() => {
                props.doneCallback();
            });
    });

    return (
        <div
            ref={ntqLogo}
            class="h-full w-full flex items-center justify-center"
        >
            <div class="flex flex-col gap-10 items-center justify-start">
                <div ref={ntqText} class="flex flex-col items-center">
                    <p class="leading-5 italic text-gray-400 font-semibold">
                        in collaboration with
                    </p>
                    <p class="leading-5 text-xl font-semibold">
                        NTQ Solutions, JSC
                    </p>
                </div>
                <img
                    ref={ntqImage}
                    src={ntqLogoFile}
                    class="h-24 sm:h-18 w-auto"
                    data-preload
                />
            </div>
        </div>
    );
}

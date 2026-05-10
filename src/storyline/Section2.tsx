import { gotoLine, sceneAt, sceneIs, setScript } from "../engine/script";
import FullScreenNarrator from "../components/FullScreenNarrator";
import { AnimatedShow } from "../components/winlib/AnimatedShow";
import StandardWindow from "../components/winlib/StandardWindow";
import VisualNovelTextWindow from "../components/VisualNovelTextWindow";

import ticketPassenger from "../../assets/images/ticket-passenger.avif";

import "./styles/Section2.css";
import { setCheckpoint, userdata } from "../engine/userdata";
import { showNotification } from "../engine/notification";
import { Match, onMount, Switch } from "solid-js";
import Challenge2 from "../challenges/Challenge2";

export default function Section2(props: { isExiting: boolean }) {
    return (
        <>
            <AnimatedShow when={sceneIs(1, "blank")}>
                {(_) => <FullScreenNarrator />}
            </AnimatedShow>

            <AnimatedShow when={sceneIs(1, "leadin", "turnoff")}>
                {(exiting) => (
                    <>
                        <TicketWindow isExiting={exiting || props.isExiting} />
                    </>
                )}
            </AnimatedShow>

            <AnimatedShow when={sceneIs(1, "turnoff")}>
                {(exiting) => (
                    <>
                        <TurnOff isExiting={exiting || props.isExiting} />
                    </>
                )}
            </AnimatedShow>

            <AnimatedShow when={sceneIs(1, "challenge", "challenge_header")}>
                {(exiting) => (
                    <>
                        <ChallengeTwo isExiting={exiting || props.isExiting} />
                    </>
                )}
            </AnimatedShow>

            <AnimatedShow when={!sceneIs(1, "blank")}>
                {(exiting) => (
                    <>
                        <VisualNovelTextWindow
                            isExiting={exiting || props.isExiting}
                        />
                    </>
                )}
            </AnimatedShow>
        </>
    );
}

function TicketWindow(props: { isExiting: boolean }) {
    return (
        <StandardWindow
            initialWidth={1000}
            initialHeight={500}
            draggableMode="anywhere"
            title="Vé Concert"
        >
            <div class="w-full h-full flex flex-col items-center justify-center gap-6">
                <p>Bạn đã đăng ký thành công. Đây là vé của bạn.</p>

                <div class="relative">
                    <img
                        class="h-[300px] w-[615px] top-0 left-0 select-none"
                        src={ticketPassenger}
                        alt="ticket background"
                        draggable="false"
                    />

                    <p class="glow absolute top-[75px] left-[61px]">
                        {userdata().name}
                    </p>

                    <p class="glow absolute top-[165px] left-[61px]">
                        {new Date().toLocaleDateString("vi-VN")}
                    </p>

                    <p class="glow absolute top-[75px] left-[249px] w-32">
                        một góc phố bé nhỏ
                    </p>

                    <p class="glow absolute top-[165px] left-[249px] w-32">
                        một vùng đất xa xôi
                    </p>
                </div>
            </div>
        </StandardWindow>
    );
}

function TurnOff(props: { isExiting: boolean }) {
    return (
        <StandardWindow initialHeight={300} initialWidth={300}>
            <div class="w-full h-full flex flex-col items-center justify-center gap-6">
                <p class="text-center">Bạn có thực sự muốn tắt máy tính?</p>
                <button
                    class="btn"
                    onclick={() => {
                        showNotification(
                            "Thành tựu",
                            "Lần đầu tiên thấy ông bụt nào thấy khó đã giục rage quit.",
                        );
                        setCheckpoint("sectionTwoClickedQuitButton");
                    }}
                >
                    Tắt máy
                </button>
            </div>
        </StandardWindow>
    );
}

function ChallengeTwo(props: { isExiting: boolean }) {
    return (
        <StandardWindow
            initialWidth={900}
            initialHeight={500}
            draggableMode="topbar"
            draggableHeight={30}
            title="Thử thách"
            noPadding={true}
            noTitlebarSpacing={true}
            resizable={false}
        >
            <Switch>
                <Match when={sceneIs(1, "challenge_header")}>
                    <div class="w-full h-full flex flex-col items-center justify-center gap-6">
                        <p class="font-serif text-accent italic text-4xl font-medium">
                            Thử thách 2. Gập ghềnh
                        </p>
                        <p class="text-center">
                            Tấm phải vượt qua ngõ ngách hiểm trở để đến được
                            concert. <br /> Bạn hãy giúp Tấm vượt qua nhé!
                        </p>

                        <button
                            onclick={() => {
                                gotoLine("challenge_start");
                            }}
                            class="btn"
                        >
                            Bắt đầu
                        </button>
                    </div>
                </Match>
                <Match when={sceneIs(1, "challenge")}>
                    <div class="w-full h-full overflow-hidden">
                        <Challenge2 />
                    </div>
                </Match>
            </Switch>
        </StandardWindow>
    );
}

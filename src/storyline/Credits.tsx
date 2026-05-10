import { createSignal, createEffect, onCleanup, onMount } from "solid-js";
import { invokeEvent } from "../engine/events";
import "./styles/Credits.css";

type CreditName =
    | string
    | [displayName: string, linkLabel: string, url: string];
type CreditsEntry = { role: string; name: CreditName | CreditName[] };

const CREDITS_DATA: CreditsEntry[] = [
    { role: "Dự án", name: "Bụt của cô Tấm" },
    { role: "", name: "" },
    {
        role: "Sản phẩm của",
        name: [
            [
                "CLB Khoa học Công nghệ trong Kinh tế và Kinh doanh",
                "@cteftu",
                "https://www.facebook.com/cteftu",
            ],
        ],
    },
    { role: "", name: "" },
    {
        role: "Executive Producer",
        name: [
            [
                "Nguyễn Tri Phương",
                "@lilbijzz",
                "https://www.facebook.com/triphuog.bonjour/",
            ],
        ],
    },
    { role: "", name: "" },

    {
        role: "Advisors",
        name: [
            [
                "chị Hoàng Vân Chi",
                "@cloudchiii",
                "https://www.facebook.com/cloudchiii/",
            ],
            [
                "anh Bùi Đăng Quang",
                "@quang.bui",
                "https://www.facebook.com/quang.bui.291157",
            ],
            [
                "chị Vũ Thị Thanh Huyền",
                "@thanh.huyen",
                "https://www.facebook.com/thanh.huyen.671601",
            ],
        ],
    },
    { role: "", name: "" },

    {
        role: "Developer",
        name: [
            [
                "Nguyễn Tri Phương",
                "@lilbijzz",
                "https://www.facebook.com/triphuog.bonjour/",
            ],
            [
                "Nguyễn Xuân Phúc",
                "@phuc.xuan",
                "https://www.facebook.com/phuc.xuan.7549",
            ],
        ],
    },
    {
        role: "Kịch bản",
        name: [
            [
                "Nguyễn Tri Phương",
                "@lilbijzz",
                "https://www.facebook.com/triphuog.bonjour/",
            ],
            [
                "Đinh Thanh Hằng",
                "@dinhhang",
                "https://www.facebook.com/inhhang.15306",
            ],
            [
                "Trần Đức Thắng",
                "@win.senpa.1",
                "https://www.facebook.com/win.senpa.1",
            ],
            [
                "Nguyễn Quán Quân",
                "@dowkiki9",
                "https://www.facebook.com/dowkiki9",
            ],
        ],
    },
    {
        role: "Game Design",
        name: [
            [
                "Hà Quốc Việt",
                "@ha.viet",
                "https://www.facebook.com/ha.viet.110910",
            ],
        ],
    },
    { role: "Âm nhạc", name: ["Purrple Cat - Loading Screen"] },
    {
        role: "Đồ họa",
        name: [
            [
                "Nguyễn Trần Thu Uyên",
                "@thuuyen.nguyentran",
                "https://www.facebook.com/thuuyen.nguyentran",
            ],
            [
                "Nguyễn Tri Phương",
                "@lilbijzz",
                "https://www.facebook.com/triphuog.bonjour/",
            ],
        ],
    },
    { role: "", name: "" },
    { role: "", name: "" },
    {
        role: "Xin chân thành cảm ơn",
        name: [["NTQ Solutions, JSC", "ntq.com.vn", "https://ntq.com.vn/"]],
    },
    { role: "", name: "" },
    { role: "", name: "" },
    { role: "", name: "Hẹn gặp lại!" },
    { role: "", name: "" },
    { role: "", name: "" },
    { role: "", name: "" },
    {
        role: "",
        name: [
            "© 2026 Club of Technology in Economics",
            [
                "Phát hành theo giấy phép AGPL3.",
                "Xem mã nguồn",
                "https://github.com/SpikeVN/butcuacotam2/",
            ],
        ],
    },
];

const BASE_SCROLL_SPEED = 0.5; // pixels per frame
const SCROLL_BOOST = 3; // additional pixels per scroll event
const SPEED_DECAY = 0.92; // multiplier per frame when not scrolling

function CreditNameDisplay(props: { name: CreditName; index: number }) {
    if (Array.isArray(props.name)) {
        const [displayName, linkLabel, url] = props.name;
        return (
            <div class="credits-name">
                <span>{displayName}</span>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="credits-link"
                >
                    {linkLabel}
                </a>
            </div>
        );
    }
    return <div class="credits-name">{props.name}</div>;
}

export default function Credits() {
    let containerRef!: HTMLDivElement;
    let contentRef!: HTMLDivElement;
    const [scrollOffset, setScrollOffset] = createSignal(0);
    const [speedMultiplier, setSpeedMultiplier] = createSignal(1);

    let animationId: number;
    let currentSpeed = 1;

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        // Scroll down (positive deltaY) = speed up; scroll up = slow down
        const delta = e.deltaY > 0 ? 0.5 : -0.5;
        currentSpeed = Math.max(0.1, Math.min(5, currentSpeed + delta));
        setSpeedMultiplier(currentSpeed);
    };

    onMount(() => {
        containerRef.addEventListener("wheel", handleWheel, { passive: false });

        const animate = () => {
            if (!contentRef) return;

            // Decay speed back toward 1
            currentSpeed += (1 - currentSpeed) * (1 - SPEED_DECAY);
            setSpeedMultiplier(currentSpeed);

            const totalHeight = contentRef.scrollHeight;
            const containerHeight = containerRef.clientHeight;
            const maxScroll = Math.max(0, totalHeight - containerHeight);

            setScrollOffset((prev) => {
                const next = prev + BASE_SCROLL_SPEED * currentSpeed;
                // Loop: once all credits have scrolled past, reset
                if (next > maxScroll + containerHeight) {
                    return -containerHeight;
                }
                return next;
            });

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
    });

    onCleanup(() => {
        containerRef?.removeEventListener("wheel", handleWheel);
        cancelAnimationFrame(animationId);
    });

    return (
        <div class="credits-container" ref={containerRef}>
            <button
                class="credits-back-button"
                onClick={() => invokeEvent("changescreen_main_menu")}
                title="Quay lại menu chính"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                </svg>
            </button>
            <div
                class="credits-content"
                ref={contentRef}
                style={{
                    transform: `translateY(${-scrollOffset()}px)`,
                }}
            >
                <div class="credits-title">
                    Cảm ơn bạn đã tham gia trò chơi!
                </div>
                {CREDITS_DATA.map((entry, i) =>
                    entry.role === "" && entry.name === "" ? (
                        <div class="credits-spacer" />
                    ) : (
                        <div class="credits-entry" data-index={i}>
                            {entry.role && (
                                <div class="credits-role">{entry.role}</div>
                            )}
                            {Array.isArray(entry.name) ? (
                                entry.name.map((n, j) => (
                                    <CreditNameDisplay name={n} index={j} />
                                ))
                            ) : (
                                <CreditNameDisplay
                                    name={entry.name}
                                    index={0}
                                />
                            )}
                        </div>
                    ),
                )}
                <div class="credits-spacer" />
                <div class="credits-spacer" />
                <div class="credits-spacer" />
            </div>
            <div class="credits-speed-indicator">
                {speedMultiplier() >= 1.2
                    ? `⏩ x${speedMultiplier().toFixed(1)}`
                    : speedMultiplier() <= 0.7
                      ? `⏪ x${speedMultiplier().toFixed(1)}`
                      : ""}
            </div>
        </div>
    );
}

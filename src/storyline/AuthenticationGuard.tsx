import { createSignal, Show } from "solid-js";
import { authenticated, login, register, userdata } from "../engine/userdata";

import "./styles/AuthenticationGuard.css";
import { showNotification } from "../engine/notification";
import { computeHash, generateRandomToken } from "../engine/crypto";
import AuthTicket from "./tickets/AuthTicket";
import { AnimatedShow } from "../components/winlib/AnimatedShow";

let [branch, setBranch] = createSignal("none");
let [spellntoken, setspellntoken] = createSignal(["", ""]);

let [doneSetup, setDoneSetup] = createSignal(authenticated());

export default function AuthenticationGuard(props: { children: any }) {
    const showAuth = () => !(authenticated() && doneSetup());

    return (
        <>
            <AnimatedShow when={showAuth()} duration={400}>
                {(isExiting) => (
                    <div
                        class="fixed inset-0 z-[90] bg-bg"
                        classList={{ "auth-fade-out": isExiting }}
                    >
                        <div class="noise-blur-bg" aria-hidden="true" />
                    </div>
                )}
            </AnimatedShow>

            <AnimatedShow
                when={branch() === "none" && !authenticated()}
                duration={400}
            >
                {(isExiting) => (
                    <div
                        class="auth-screen z-[100] flex-col gap-6"
                        classList={{
                            "auth-fade-in": !isExiting,
                            "auth-fade-out": isExiting,
                        }}
                    >
                        <h1 class="text-4xl font-serif font-medium text-accent italic">
                            Chào mừng bạn đến với Bụt của cô Tấm!
                        </h1>

                        <div class="flex flex-col justify-around gap-6">
                            <button
                                class="btn"
                                onclick={() => setBranch("register")}
                            >
                                Bắt đầu
                            </button>

                            <p class="text-center">
                                hoặc nếu bạn đã đăng ký rồi <br /> hãy nhập thần
                                chú vào ô dưới và bấm Enter
                            </p>

                            <form
                                class="flex justify-center"
                                onsubmit={async (ev) => {
                                    ev.preventDefault();
                                    const formData = new FormData(
                                        ev.currentTarget,
                                    );
                                    const spell = formData.get(
                                        "spell",
                                    ) as string;
                                    if (spell) {
                                        const success = await login(
                                            computeHash(spell),
                                        );
                                        if (!success) {
                                            showNotification(
                                                "Lỗi",
                                                "Thần chú không đúng hoặc có lỗi xảy ra. Nếu bạn đã nhập đúng thần chú rồi mà vẫn không đăng nhập được, hãy liên hệ với chúng mình.",
                                            );
                                        } else {
                                            setTimeout(
                                                () => setDoneSetup(true),
                                                500,
                                            );
                                        }
                                    }
                                }}
                            >
                                <input
                                    type="text"
                                    name="spell"
                                    class="shadow px-6 py-3 font-mono w-full"
                                    placeholder="Nhập thần chú của bạn"
                                />
                            </form>
                        </div>
                    </div>
                )}
            </AnimatedShow>

            <AnimatedShow
                when={branch() === "register" && !authenticated()}
                duration={400}
            >
                {(isExiting) => (
                    <div
                        class="register-container z-[100]"
                        classList={{
                            "auth-fade-in": !isExiting,
                            "auth-fade-out": isExiting,
                        }}
                    >
                        <div class="register-content">
                            <div class="flex flex-col gap-3">
                                <h1 class="register-title">
                                    Chào mừng bạn đến với Bụt của cô Tấm!
                                </h1>

                                <div class="register-info">
                                    <p>
                                        Để bắt đầu, chúng mình cần một số thông
                                        tin của bạn. <br /> Chúng mình sẽ liên
                                        lạc với bạn bằng những thông tin này.{" "}
                                        <br /> Chính sách bảo mật thông tin cá
                                        nhân của CTE{" "}
                                        <a href="#" class="privacy-link">
                                            ở đây
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <RegisterForm
                                onBranchChange={() => setBranch("none")}
                            />
                        </div>
                    </div>
                )}
            </AnimatedShow>

            <AnimatedShow
                when={branch() == "showing_ticket" && !doneSetup()}
                duration={400}
            >
                {(isExiting) => (
                    <div
                        class="z-[100]"
                        classList={{
                            "auth-fade-in": !isExiting,
                            "auth-fade-out": isExiting,
                        }}
                    >
                        <ShowingTicket />
                    </div>
                )}
            </AnimatedShow>

            <Show when={!showAuth()}>
                <div class="game-content-fade-in">{props.children}</div>
            </Show>
        </>
    );
}

interface RegisterFormProps {
    onBranchChange: () => void;
}

function RegisterForm(props: RegisterFormProps) {
    let [formData, setFormData] = createSignal({ name: "", email: "" });
    let formRef: HTMLFormElement | undefined;

    const handleGenerateSpell = async () => {
        const name = formData().name;
        const email = formData().email;

        if (!name || !email) {
            showNotification(
                "Lỗi",
                "Vui lòng nhập họ tên và email trước khi tạo thần chú.",
            );
            return;
        }
    };

    const handleSubmit = async (ev: Event) => {
        ev.preventDefault();
        const name = formData().name;
        const email = formData().email;
        const spell = generateRandomToken();

        if (!name || !email || !spell) {
            showNotification("Lỗi", "Vui lòng điền đầy đủ thông tin.");
            return;
        }

        const success = await register(name, email, spell.hash);
        setBranch("showing_ticket");
        setspellntoken([spell.spell, spell.token]);

        if (!success) {
            showNotification(
                "Lỗi",
                "Đăng ký thất bại. Vui lòng thử lại hoặc liên hệ với chúng mình.",
            );
        }
    };

    return (
        <form class="register-form" onsubmit={handleSubmit} ref={formRef}>
            <div class="form-group">
                <p class="form-label">Bạn muốn chúng mình gọi bạn là?</p>
                <p class="form-description">
                    Nếu như bạn không muốn tiết lộ, có thể nhập biệt danh. Biệt
                    danh có từ ngữ không phù hợp sẽ không được chấp nhận.
                </p>
                <input
                    type="text"
                    name="name"
                    class="form-input shadow"
                    value={formData().name}
                    oninput={(e) =>
                        setFormData({
                            ...formData(),
                            name: e.currentTarget.value,
                        })
                    }
                    required
                />
            </div>

            <div class="form-group">
                <p class="form-label">Email của bạn?</p>
                <p class="form-description">
                    Bạn có thể bỏ trống hoặc nhập bừa nếu không muốn nhận quà.
                </p>
                <input
                    type="email"
                    name="email"
                    class="form-input shadow"
                    value={formData().email}
                    oninput={(e) =>
                        setFormData({
                            ...formData(),
                            email: e.currentTarget.value,
                        })
                    }
                />
            </div>

            <button type="submit" class="btn submit-btn">
                Tiếp tục
                <IconArrowRight />
            </button>

            <button
                type="button"
                class="back-btn mt-[-12px]"
                onclick={props.onBranchChange}
            >
                Quay lại
            </button>
        </form>
    );
}

function ShowingTicket() {
    return (
        <div class="auth-screen overflow-hidden flex-col gap-6">
            <h1 class="text-4xl font-serif font-medium text-accent italic">
                Hãy chụp lại tấm vé này!
            </h1>

            <div class="flex flex-col gap-1">
                <p class="text-center">
                    Bạn sẽ cần cung cấp thần chú/mã QR trong vé này để xác minh
                    khi nhận thưởng.
                </p>
                <p class="text-center">
                    Đây là lần đầu tiên và cuối cùng bạn thấy tấm vé này. Bạn là
                    người duy nhất biết thần chú của mình.
                </p>
                <p class="text-center text-accent font-semibold">
                    BTC không biết thần chú của bạn là gì, nên cũng không thể
                    gửi lại nếu bạn quên.
                </p>
                <p class="text-center">
                    P/S: Bạn sẽ được nhận một tấm vé khác để Locket sau. Đừng lo
                    :D
                </p>
            </div>

            <div>
                <AuthTicket
                    name={userdata().name || "tên cậu là gì?"}
                    spell={spellntoken()[0] || "bống bống bang bang"}
                    token={spellntoken()[1] || "000000"}
                />
            </div>

            <button
                class="btn"
                onclick={() => {
                    setDoneSetup(true);
                    setBranch("none");
                }}
            >
                Bắt đầu trò chơi
                <IconArrowRight />
            </button>
        </div>
    );
}

const IconArrowRight = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-arrow-right-icon lucide-arrow-right"
    >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

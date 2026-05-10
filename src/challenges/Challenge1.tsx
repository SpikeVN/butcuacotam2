import {
    createSignal,
    For,
    Match,
    onMount,
    Setter,
    Signal,
    Switch,
} from "solid-js";
import StandardWindow from "../components/winlib/StandardWindow";

import "./Challenge1.css";
import { showNotification } from "../engine/notification";
import {
    setCheckpoint,
    submitChallenge,
    uploadSolution,
} from "../engine/userdata";
import { IconArrowRight } from "../storyline/AuthenticationGuard";

export default function Challenge1(props: { isExiting?: boolean; onComplete: () => void }) {
    onMount(() => {
        setCheckpoint("challengeOneStart");
    });

    return (
        <StandardWindow
            title="Thử thách"
            isExiting={props.isExiting}
            initialWidth={900}
            initialHeight={500}
            noPadding={true}
            draggableMode="topbar"
            draggableHeight={30}
            initialY={25}
            initialX={81}
        >
            <div class="w-full">
                <div class="w-full max-w-full px-12 py-8 prose prose-invert text-justify text-fg">
                    <h1 class="font-serif font-bold text-4xl italic text-accent">
                        Thử thách 1. Cám và marketing
                    </h1>
                    <p>
                        Dì ghẻ và Cám đang chạy chiến dịch marketing cho thương
                        hiệu quần áo Cám Luxury trên nhiều nền tảng MXH khác
                        nhau. Mụ dùng tool để scrape toàn bộ comment trên các
                        nền tảng như Facebook, Shopee, Threads, Zalo.
                    </p>
                    <p>
                        Sau khi scrape xong, mụ có được một tệp dữ liệu chứa hơn
                        1.000 comment. Nhưng những comment này chưa rất nhiều
                        comment spam, bot, troll; và nếu không lọc ra những
                        comment này thì khó có thể nào đo được hiệu quả của
                        chiến dịch marketing vừa rồi.
                    </p>
                    <p>Những comment như sau thì coi là comment rác:</p>
                    <ul>
                        <li>
                            Có văng tục (trong dữ liệu sẽ bị che thành năm dấu
                            sao <span class="font-mono text-accent">*****</span>
                            ).
                        </li>
                        <li>
                            Tài khoản người comment dưới 30 ngày tuổi (tính từ
                            khi scrape lúc 05/5/2026)
                        </li>
                        <li>
                            Bình luận 1 sao nhưng không có nội dung comment.
                        </li>
                        <li>
                            Một người bình luận nhiều lần (chỉ giữ comment đầu
                            tiên)
                        </li>
                        <li>
                            Thiếu một hoặc nhiều trường dữ liệu (trong dữ liệu
                            để là{" "}
                            <span class="font-mono text-accent">null</span> cho
                            văn bản hoặc{" "}
                            <span class="font-mono text-accent">NaN</span> cho
                            số. Lưu ý rằng comment trống không phải là{" "}
                            <span class="font-mono text-accent">null</span> mà
                            là chuỗi trống{" "}
                            <span class="font-mono text-accent">
                                &quot;&quot;
                            </span>
                            ).
                        </li>
                    </ul>
                    <p>Trong các tệp dữ liệu có các trường sau:</p>
                    <table>
                        <thead>
                            <tr>
                                <th class="font-bold text-accent">Cột</th>
                                <th class="font-bold text-accent">Dạng</th>
                                <th class="font-bold text-accent">Mô tả</th>
                                <th class="font-bold text-accent">Ví dụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="font-mono text-accent">username</td>
                                <td>văn bản</td>
                                <td>tên người comment</td>
                                <td class="font-mono text-accent">
                                    &quot;@anhtoi&quot;
                                </td>
                            </tr>
                            <tr>
                                <td class="font-mono text-accent">
                                    accountCreated
                                </td>
                                <td>YYYY-MM-DD</td>
                                <td>ngày tạo tài khoản người comment</td>
                                <td class="font-mono text-accent">
                                    2026-05-01
                                </td>
                            </tr>
                            <tr>
                                <td class="font-mono text-accent">
                                    commentCreated
                                </td>
                                <td>YYYY-MM-DD</td>
                                <td>ngày comment</td>
                                <td class="font-mono text-accent">
                                    2026-05-01
                                </td>
                            </tr>
                            <tr>
                                <td class="font-mono text-accent">rating</td>
                                <td>số thực dương</td>
                                <td>số sao đánh giá</td>
                                <td class="font-mono text-accent">5.0</td>
                            </tr>
                            <tr>
                                <td class="font-mono text-accent">comment</td>
                                <td>văn bản</td>
                                <td>nội dung bình luận</td>
                                <td class="font-mono text-accent">
                                    &quot;***** góp gạch xây trường&quot;
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p>
                        Để vượt qua thử thách, bạn sẽ phải tìm ra được câu trả
                        lời cho những câu hỏi dưới đây. Chúc bạn may mắn!
                    </p>
                </div>

                <svg
                    viewBox="0 0 861 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0 0.672363L8.9 8.67236L17.8 0.672363L26.7 8.67236L35.6 0.672363L44.5 8.67236L53.4 0.672363L62.3 8.67236L71.2 0.672363L80.1 8.67236L89 0.672363L97.9 8.67236L106.8 0.672363L115.7 8.67236L124.6 0.672363L133.5 8.67236L142.4 0.672363L151.3 8.67236L160.2 0.672363L169.1 8.67236L178 0.672363L186.9 8.67236L195.8 0.672363L204.7 8.67236L213.6 0.672363L222.5 8.67236L231.4 0.672363L240.3 8.67236L249.2 0.672363L258.1 8.67236L267 0.672363L275.9 8.67236L284.8 0.672363L293.7 8.67236L302.6 0.672363L311.5 8.67236L320.4 0.672363L329.3 8.67236L338.2 0.672363L347.1 8.67236L356 0.672363L364.9 8.67236L373.8 0.672363L382.7 8.67236L391.6 0.672363L400.5 8.67236L409.4 0.672363L418.3 8.67236L427.2 0.672363L436.1 8.67236L445 0.672363L453.9 8.67236L462.8 0.672363L471.7 8.67236L480.6 0.672363L489.5 8.67236L498.4 0.672363L507.3 8.67236L516.2 0.672363L525.1 8.67236L534 0.672363L542.9 8.67236L551.8 0.672363L560.7 8.67236L569.6 0.672363L578.5 8.67236L587.4 0.672363L596.3 8.67236L605.2 0.672363L614.1 8.67236L623 0.672363L631.9 8.67236L640.8 0.672363L649.7 8.67236L658.6 0.672363L667.5 8.67236L676.4 0.672363L685.3 8.67236L694.2 0.672363L703.1 8.67236L712 0.672363L720.9 8.67236L729.8 0.672363L738.7 8.67236L747.6 0.672363L756.5 8.67236L765.4 0.672363L774.3 8.67236L783.2 0.672363L792.1 8.67236L801 0.672363L809.9 8.67236L818.8 0.672363L827.7 8.67236L836.6 0.672363L845.5 8.67236L854.4 0.672363L863.3 8.67236"
                        stroke="#4C376F"
                    />
                </svg>

                <form
                    class="w-full max-w-full px-12 py-8 prose prose-invert"
                    onsubmit={async (ev) => {
                        ev.preventDefault();

                        submitChallenge(
                            "one",
                            Object.fromEntries(
                                // @ts-ignore
                                new FormData(ev.target).entries(),
                            ),
                        );

                        setCheckpoint("challengeOneComplete");
                        props.onComplete();
                    }}
                >
                    <p class="font-bold">
                        Tính cả cả comment thật lẫn spam/không hợp lệ, tổng cộng
                        có bao nhiêu comment?
                    </p>
                    <RadioQuestion
                        name="question1"
                        options={["120", "149", "150", "200"]}
                    />

                    <p class="font-bold">
                        Có bao nhiêu comment là không hợp lệ?
                    </p>
                    <input
                        type="number"
                        name="question2"
                        class="shadow px-6 py-3 mt-[-0.8rem] w-md"
                        placeholder="Nhập đáp án số"
                    />

                    <p class="font-bold">
                        Tỉ lệ comment spam (là từ một người comment nhiều lần
                        hoặc có văng tục, không phải thiếu dữ liệu) dưới 50%.
                    </p>
                    <TrueOrFalse name="question3" />

                    <p class="font-bold">
                        Sau khi loại bỏ hết comment không hợp lệ đi, rating
                        trung bình của shop là bao nhiêu?
                    </p>
                    <input
                        type="number"
                        name="question4"
                        class="shadow px-6 py-3 mt-[-0.8rem] w-md"
                        placeholder="Nhập đáp án số"
                    />

                    <p class="font-bold">
                        Có phải những comment spam thường đưa ra đánh giá cao
                        hơn không? Vì sao bạn cho rằng như vậy?
                    </p>
                    <input
                        type="text"
                        name="question5"
                        class="shadow px-6 py-3 mt-[-0.8rem] w-md"
                        placeholder="Nhập câu trả lời"
                    />

                    <p class="italic font-sans">
                        Những câu hỏi sau đây là tùy chọn, bạn có thể không trả
                        lời.
                    </p>

                    <p class="font-bold">
                        Bạn có thể cho chúng mình biết rằng bạn đã sử dụng định
                        dạng dataset nào không?
                    </p>
                    <RadioQuestion
                        name="question6"
                        options={["CSV", "JSON", "Excel", "Scratch sb3"]}
                    />

                    <p class="font-bold">
                        Nếu có thể, bạn có thể chia sẻ cho chúng mình tệp bạn
                        dùng để tính toán được không (dưới 10MB)?
                    </p>

                    <UploadBeg />

                    <p>Khi bạn đã chắc chắn với đáp án của mình, bấm Gửi.</p>

                    <button type="submit" value="Gửi" class="btn">
                        Gửi <IconArrowRight />
                    </button>
                </form>
            </div>
        </StandardWindow>
    );
}

function RadioQuestion(props: {
    name: string;
    options: Array<string>;
    onSubmit?: () => void;
}) {
    return (
        <div class="flex flex-row gap-3 mt-[-0.8rem]">
            <For each={props.options}>
                {(children) => (
                    <>
                        <input
                            type="radio"
                            class="mcq-input"
                            name={props.name}
                            id={`${props.name}-${children}`}
                            value={children}
                        />
                        <label for={`${props.name}-${children}`}>
                            {children}
                        </label>
                    </>
                )}
            </For>
        </div>
    );
}

function TrueOrFalse(props: { name: string; onSubmit?: () => void }) {
    let trueinp!: HTMLInputElement;
    let falseinp!: HTMLInputElement;
    const [selectedValue, setSelectedValue] = createSignal<string>("");

    const handleChange = (value: string) => {
        setSelectedValue(value);
    };

    return (
        <div class="flex flex-row gap-3 mt-[-0.8rem]">
            <input
                ref={trueinp}
                type="radio"
                class="mcq-input"
                name={props.name}
                id={`${props.name}-true`}
                value="true"
                onChange={() => handleChange("true")}
            />
            <label
                for={`${props.name}-true`}
                class="flex flex-row gap-1.5 items-center"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M20 6L9 17L4 12"
                        stroke={
                            selectedValue() === "true"
                                ? "var(--color-bg)"
                                : "var(--color-fg)"
                        }
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>

                <span>Đúng</span>
            </label>

            <input
                ref={falseinp}
                type="radio"
                class="mcq-input"
                name={props.name}
                id={`${props.name}-false`}
                value="false"
                onChange={() => handleChange("false")}
            />
            <label
                for={`${props.name}-false`}
                class="flex flex-row gap-1.5 items-center"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke={
                            selectedValue() === "false"
                                ? "var(--color-bg)"
                                : "var(--color-fg)"
                        }
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
                <span>Sai</span>
            </label>
        </div>
    );
}

function UploadBeg() {
    let [fileUpload, setFileUpload] = createSignal([false, null]);
    let filinput!: HTMLInputElement;
    return (
        <>
            <input
                ref={filinput}
                type="file"
                name="question7"
                id="fileupload"
                class="hidden"
                placeholder="Nhập đáp án số"
                onChange={(f) => {
                    if (
                        filinput.files &&
                        filinput.files[0].size > 10 * 1024 * 1024
                    ) {
                        showNotification(
                            "Nhắc bạn",
                            "File bạn upload vượt quá 10MB cho phép.",
                            3000,
                        );
                        return;
                    } else {
                        console.log(filinput);
                        // @ts-ignore
                        setFileUpload([true, filinput.files[0]]);
                        uploadSolution(filinput.files![0]);
                    }
                }}
            />
            <Switch
                fallback={
                    <label
                        for="fileupload"
                        class="bg-bg shadow mt-[-0.8rem] w-fit px-6 flex flex-row items-center justify-center"
                    >
                        <span class="ml-1.5">
                            Đã upload{" "}
                            <span class="font-mono text-accent">
                                {/* @ts-ignore */}

                                {fileUpload()[1].name}
                            </span>{" "}
                            {/* @ts-ignore */}(
                            {(fileUpload()[1].size / 1024).toFixed(2)} KB)
                        </span>
                    </label>
                }
            >
                <Match when={!fileUpload()[0]}>
                    <label
                        for="fileupload"
                        class="bg-fg2 btn mt-[-0.8rem] w-fit px-6 flex flex-row items-center justify-center"
                    >
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
                            class="lucide lucide-upload-icon lucide-upload"
                        >
                            <path d="M12 3v12" />
                            <path d="m17 8-5-5-5 5" />
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        </svg>
                        <span class="ml-1.5">Bấm để upload file</span>
                    </label>
                </Match>
            </Switch>
        </>
    );
}

import StandardWindow from "../components/winlib/StandardWindow";

export default function Challenge1(props: { isExiting?: boolean }) {
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
        >
            <div class="w-full">
                <div class="w-full max-w-full px-12 py-8 prose prose-invert">
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
                                <td class="font-mono">username</td>
                                <td>văn bản</td>
                                <td>tên người comment</td>
                                <td class="font-mono text-accent">
                                    &quot;@anhtoi&quot;
                                </td>
                            </tr>
                            <tr>
                                <td class="font-mono">accountCreated</td>
                                <td>YYYY-MM-DD</td>
                                <td>ngày tạo tài khoản người comment</td>
                                <td class="font-mono text-accent">
                                    2026-05-01
                                </td>
                            </tr>
                            <tr>
                                <td class="font-mono">commentCreated</td>
                                <td>YYYY-MM-DD</td>
                                <td>ngày comment</td>
                                <td class="font-mono text-accent">
                                    2026-05-01
                                </td>
                            </tr>
                            <tr>
                                <td class="font-mono">rating</td>
                                <td>số nguyên</td>
                                <td>số sao đánh giá</td>
                                <td class="font-mono text-accent">5</td>
                            </tr>
                            <tr>
                                <td class="font-mono">comment</td>
                                <td>văn bản</td>
                                <td>nội dung bình luận</td>
                                <td class="font-mono text-accent">
                                    &quot;***** góp gạch xây trường&quot;
                                </td>
                            </tr>
                        </tbody>
                    </table>
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

                <div class="w-full max-w-full px-12 py-8 prose prose-invert">
                    <p>Câu 1.</p>
                </div>
            </div>
        </StandardWindow>
    );
}

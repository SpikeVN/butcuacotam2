import { showNotification } from "./engine/notification";
import { ScriptEntry } from "./engine/script";
import { saveUserdata, setCheckpoint } from "./engine/userdata";

// prettier-ignore
export const SCRIPT_DATA: Record<string, ScriptEntry[]> = {
    "intro_game1": [
        // ===== SECTION 1 =====
        // ----- lead-in -----
/* 0 */ ["s1.blank", "System", "*Ở một ngôi làng bé nhỏ xưa kia, có hai chị em cùng cha khác mẹ tên là Tấm và Cám.*", () => {
            setCheckpoint("firstStartScript");
        }],
/* 1 */ ["s1.blank", "System", "*Còn tại một ngôi nhà mặt phố Hà Nội, cũng có hai chị em tên là Tấm và Cám.*"],
/* 2 */ ["s1.blank", "System", "*Cha Tấm hết mực yêu thương cô, song chẳng bao lâu thì ông qua đời.*"],
        ["s1.blank", "System", "*Tấm từ đó sống chung mái nhà với mụ dì ghẻ lắm điều và người em gái luôn xem bà chị như cái gai trước mắt.*"],
/* 3 */ ["s1.blank", "System", "*Hẳn nhiên là trừ khi nó sai khiến cái gai ấy đi làm những việc mà nó không muốn làm.*"],
/* 4 */ ["s1.blank", "System", "*Trong khi Cám hàng ngày la cà check-in, lên story, bóp ảnh; thì cuộc đời Tấm lại ngập tràn những đơn hàng trên sàn S và đống quần áo chưa gấp.*"],

/* 5 */ ["s1.leadin", "Cám", "Tấm! Phần mới trong cái clip Morning Routine em quay hôm qua chị edit xong chưa? Phần cũ em đăng từ tối qua mà giờ này mới có 7 tim :((", () => {
            showNotification("Gợi ý", "Bạn có thể kéo thả các cửa sổ bằng cách nhấn giữ phần gần đỉnh và kéo cửa sổ. Một số có thể kéo thả ở bất kỳ vị trí nào.", 5000);
            setTimeout(() => {
                showNotification("Gợi ý", "Game tự động lưu tiến trình. Bấm vào menu BụtOS ở góc dưới bên trái màn hình để xem các tùy chọn.", 5000);
            }, 5000)
        }],
/* 6 */ ["s1.leadin", "Cám", "LÀ BẢY TIM ĐÓOOO!!! Mà filter kiểu gì mà da mặt em vẫn đen thế này!?"],
/* 7 */ ["s1.leadin", "Tấm", "Chị đang render, máy nó nóng quá nó lag."],
/* 8 */ ["s1.leadin", "Tấm", "Mà Cám này, chị nói thật nhé: em quay ngược sáng thì app nào cũng bó tay, đừng đổ tội cho chị."],
/* 9 */ ["s1.leadin", "Cám", "Chị cứ bào chữa lung tung! Mấy đứa KOL trên TikTok người ta cũng quay ngược sáng mà vẫn xinh như tiên giáng trần kìa!"],
/* 10*/ ["s1.leadin", "Tấm", "Mấy cô tiên trên mạng người ta có gimbal, có diffuser, có tiền mua ring light xịn. Chị chưa thấy ai dùng đèn học từ năm lớp 8 bao giờ."],
/* 11*/ ["s1.leadin", "Cám", "Gimbal? Diffuser? Ring light? Là gì hả chị?"],
/* 12*/ ["s1.leadin", "Tấm", "Gimbal để quay cho đỡ rung. Diffuser và ring light cho nó sáng đều. Haizzz."],
/* 13*/ ["s1.leadin", "Dì ghẻ", "Tấm! Nhiệm vụ của mày là phải lo cho em nó lên xu hướng, cấm có mở miệng cãi!"],
/* 14*/ ["s1.leadin", "Dì ghẻ", "À, mà tí nữa check cho mẹ 500 cái inbox của shop nhé. Khách hỏi giá thì cứ copy-paste cái mẫu trong đấy là được. Làm xong rồi thì tao mới cho đi chơi."],
/* 15*/ ["s1.leadin", "Tấm", "Ơ... nhưng con phải săn vé-"],
/* 16*/ ["s1.leadin", "Dì ghẻ", "Hừ. Vé với chả viếc. Nhà còn bao việc. Đây, nhìn đống này đi!", "s1_challenge_shock_open"],
/* 17*/ ["s1.challenge_shock", "Tấm", "..."],
/* 18*/ ["s1.challenge_shock", "Tấm", "Mẹ! Chỗ này phải mấy nghìn dòng, lại còn hỏng lung tung, con lọc bằng tay đến Tết ạ?"],
/* 19*/ ["s1.challenge_shock", "Dì ghẻ", "Tao tưởng mày giỏi IT mà, tự xử đi."],
/* 20*/ ["s1.challenge_shock", "Dì ghẻ", "Nào Cám! Đi với mẹ chuẩn bị đồ. Tối nay hai mẹ con mình đi concert, nghe đồn có nhiều anh được lắm!"],
/* 21*/ ["s1.challenge_shock", "Cám", "Biết rồi mẹ, con đang chọn outfit chụp ảnh đây."],
/* 21*/ ["s1.challenge_shock", "System", "*Mụ đóng sập cửa. Tấm ngồi một mình giữa đống việc chồng chất.*"],
/* 22*/ ["s1.challenge", "Tấm", "Ông Bụt ơi! Xin ông hãy giúp con với!"],
    ],

    "game_1_success": [
        ["s1.success", "Dì ghẻ", "TẤM!!! Tao về rồi đây, mày làm xong chưa hay lại ngồi-"],
        ["s1.success", "System", "*Mụ dừng lại giữa câu. Liếc nhìn màn hình của Tấm, mụ thấy cả núi công việc chẳng mấy chốc đã hoàn thành.*"],
        ["s1.success", "Dì ghẻ", "..."],
        ["s1.success", "Dì ghẻ", "X... xong rồi hả?"],
        ["s1.success", "Tấm", "Dạ. Con gửi báo cáo tổng hợp vào mail của mẹ rồi ạ. Con còn tính cả các số liệu liên quan, phòng khi mẹ cần."],
        ["s1.success", "Dì ghẻ", "Không... không thể nào! Cái máy tính của mày... cái máy đấy tao nhớ là mở Chrome còn lag cơ mà? Sao mày chạy được hết thế này? Mày... mày..."],
        ["s1.success", "Tấm", "*mỉm cười*"],
        ["s1.success", "Dì ghẻ", "Đấy! Mày nhìn chị mày đi Cám! Suốt ngày chỉ biết nhảy nhót lung tung, trong khi con Tấm nó chạy rầm rầm thế này đây!"],
        ["s1.success", "Cám", "Ơ... sao mẹ mắng con..."],
        ["s1.success", "System", "*Hình như dì ghẻ quay sang mắng Cám để chữa thẹn. Nhưng mà có vẻ không thành công lắm.*"],
        ["s1.success", "Dì ghẻ", "Thôi được rồi. Coi như hôm nay mày gặp may. Nhưng đừng tưởng thế là xong nhé. Tao cấm mày vác cái xác đấy đi concert. Xấu hết cả mặt tao với em mày."],
        ["s1.success", "System", "*Dì ghẻ lại quay đi. Miệng vẫn đang lẩm bẩm gì đấy cũng không rõ.*", () => {
            setCheckpoint("sectionOneComplete");
            saveUserdata();
        }],

        ["s2.blank", "System", "*Chẳng mấy chốc đã đến ngày concert.*"],
        ["s2.blank", "System", "*Nhưng Tấm (và chắc là biên kịch của game này nữa) không tin rằng dì ghẻ sẽ buông tha cho Tấm dễ dàng như vậy.*"],
        ["s2.blank", "System", "*Tấm ngoảnh ra khỏi màn hình một lúc lâu.*", () => {
            showNotification("Thư từ Vấn Danh Concert", "Tấm ơi, đêm concert sắp đến rồi! Hẹn gặp bạn ở concert Vấn Danh nhé!", 5000);
        }],
        ["s2.leadin", "Tấm", "Vé VIP... mà không được đi. Thôi vậy chứ biết sao giờ..."],
        ["s2.turnoff", "Tấm", "Haizzz... tắt máy đi ngủ thôi.", () => {
            showNotification("Thư từ Bụt", "Con tính bỏ vé thật à?", 5000);
        }],
        ["s2.turnoff", "Tấm", "Mẹ không cho con đi rồi. Biết làm gì bây giờ."],
        ["s2.turnoff", "Bụt", "Tấm ngày xưa vẫn đi được hội của nhà vua đấy thôi. Mẹ con có nhốt con ở trong nhà đâu đúng không?"],
        ["s2.turnoff", "Tấm", "..."],
        ["s2.turnoff", "Bụt", "Concert vẫn chưa bắt đầu. Còn tầm hai tiếng nữa. Vé VIP của con có cả quyền vào khu backstage, con đến đúng giờ là được."],
        ["s2.turnoff", "Tấm", "Nhưng ông Bụt ơi, con không biết đường. Khu đó xa lắm, con lại chưa đến bao giờ, rồi còn không có xe nữa ạ."],
        ["s2.turnoff", "Bụt", "Ta biết. Nên ta mới còn ở đây."],
        ["s2.turnoff", "Tấm", "Vậy là con phải làm gì ạ?"],
        ["s2.turnoff", "Bụt", "Chút nữa ta sẽ đưa cho con tấm bản đồ cũ của ta. Muốn đến đúng giờ, con phải đi đường tắt, mà đường tắt ở đó thì... phải nói là hơi phức tạp một chút."],
        ["s2.turnoff", "Tấm", "\"Phức tạp một chút\" là sao ạ?"],
        ["s2.turnoff", "Bụt", "Là hẻm chồng hẻm, ngõ thông ngõ, ngách sâu mười dấu gạch chéo. Người dân sống ở đó hai mươi năm còn lạc, con đừng lo."],
        ["s2.turnoff", "System", "*Tấm hoàn toàn không \"đừng lo\" chút nào.*"],
        ["s2.turnoff", "Bụt", "Con giải được mấy nghìn dòng dữ liệu nhiễu kia rồi còn gì. Mẫy cái ngõ nhỏ đó thì có đáng gì. Đi đi. Và nhớ tắt định vị trước khi ra khỏi nhà nhé."],
        ["s2.turnoff", "Tấm", "Thưa ông, tắt định vị để làm gì ạ?", () => {
            showNotification("Mất kết nối", "Ông Bụt đã rời khỏi đoạn chat.", 5000);
        }],

        ["s2.turnoff", "Tấm", "..."],
        ["s2.challenge_header", "Tấm", "Thôi được rồi."],
        ["s2.challenge", "", "", null, "challenge_start"],
    ],

    "game2_saves": [
        ["s2.challenge.r1_complete", "", "", null, "challenge_r1_complete"],
        ["s2.challenge.r2_complete", "", "", null, "challenge_r2_complete"],
    ],

    "to_be_continued": [
        ["tbc.blank", "System", "*Hành trình của Tấm không dừng lại ở đây.*", () => {
            setCheckpoint("challenge2End");
        }],
        ["tbc.blank", "System", "*Có lẽ Tấm cũng phần nào cảm thấy được điều đó. Và Tấm cũng còn rất nhiều câu hỏi chưa trả lời.*"],
        ["tbc.blank", "System", "*Tên người đang chờ ở Vấn Danh là gì?*"],
        ["tbc.blank", "System", "*Dì ghẻ đang lẩm bẩm những gì?*"],
        ["tbc.blank", "System", "*Vì sao Tấm lại phải tắt định vị?*"],
        ["tbc.text", "Bụt", "Hẹn gặp lại nhé, con."],
        ["credits", "", ""]
    ]
};

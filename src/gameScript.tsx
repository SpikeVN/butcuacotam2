import { showNotification } from "./engine/notification";
import { ScriptEntry } from "./engine/script";

// prettier-ignore
export const SCRIPT_DATA: Record<string, ScriptEntry[]> = {
    "intro_game1": [
        // ===== SECTION 1 =====
        // ----- lead-in -----
/* 0 */ ["s1.blank", "System", "*Ở một ngôi làng bé nhỏ xưa kia, có hai chị em cùng cha khác mẹ tên là Tấm và Cám.*"],
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
/* 22*/ ["s1.challenge", "Tấm", "Ông Bụt ơi! Nếu ông có linh ứng, xin hãy giúp con với!"],
    ],

    "game_1_success": [
        ["s1.success", "Dì ghẻ", "Tấm! Tao về rồi đây, mày làm xong chưa hay lại ngồi-"],
        ["s1.success", "System", "*Mụ dừng lại giữa câu. Liếc nhìn màn hình của Tấm, mụ thấy cả núi công việc chẳng mấy chốc đã hoàn thành.*"],
        ["s1.success", "Dì ghẻ", "..."],
        ["s1.success", "Dì ghẻ", "X... xong rồi hả?"],
        ["s1.success", "Tấm", "Dạ. Con gửi báo cáo tổng hợp vào mail của mẹ rồi ạ. Con còn tính cả các số liệu liên quan, phòng khi mẹ cần."],
        ["s1.success", "Dì ghẻ", "Không... không thể nào! Cái máy tính của mày... cái máy đấy tao nhớ là mở Chrome còn lag cơ mà? Sao mày chạy được cả triệu dòng thế này? Mày... mày..."],
        ["s1.success", "Tấm", "*mỉm cười*"],
        ["s1.success", "Dì ghẻ", "Đấy! Mày nhìn chị mày đi Cám! Suốt ngày chỉ biết nhảy nhót lung tung, trong khi con Tấm nó chạy rầm rầm thế này đây!"],
        ["s1.success", "Dì ghẻ", "Ơ... sao mẹ mắng con..."],
        ["s1.success", "System", "*Hình như dì ghẻ quay sang mắng Cám để chữa thẹn. Nhưng mà có vẻ không thành công lắm.*"],
        ["s1.success", "Dì ghẻ", "Thôi được rồi. Coi như hôm nay mày gặp may. Nhưng đừng tưởng thế là xong nhé. Tao cấm mày vác cái xác đấy đi concert. Xấu hết cả mặt tao với em mày."],
        ["s1.success", "System", "*Dì ghẻ lại quay đi. Miệng vẫn đang lẩm bẩm gì đấy. Không biết sắp tới mụ sẽ giở chiêu trò gì.*"]
    ]
};

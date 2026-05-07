import { showNotification } from "./engine/notification";
import { ScriptEntry } from "./engine/script";

// prettier-ignore
export const SCRIPT_DATA: Record<string, ScriptEntry[]> = {
    "intro_game1": [
        // ===== SECTION 1 =====
        // ----- lead-in -----
/* 0 */ ["s1.blank", "System", "*Ở một ngôi làng bé nhỏ xưa kia, có hai chị em cùng cha khác mẹ tên là Tấm và Cám.*"],
/* 1 */ ["s1.blank", "System", "*Ở một thị trấn bé nhỏ khác, cũng có hai chị em tên là Tấm và Cám.*"],
/* 2 */ ["s1.blank", "System", "*Cha Tấm hết mực yêu thương cô, nhưng không lâu sau đó ông cũng qua đời. Tấm lại phải sống chung với mụ dì ghẻ và người em gái luôn coi mình là cái gai trong mắt.*"],
/* 3 */ ["s1.blank", "System", "*Khi Cám được la cà vui chơi, check-in sống ảo hằng ngày, cuộc sống của Tấm lại đám chìm trong những đơn hàng trên sàn S và đống quần áo chưa gấp.*"],

/* 4 */ ["s1.leadin", "Cám", "Tấm! Phần mới trong cái clip Morning Routine em quay hôm qua chị edit xong chưa? Phần cũ em đăng từ tối qua mà giờ này mới có 7 tim :((.", () => {
            showNotification("Mẹo", "Bạn có thể kéo thả các cửa sổ bằng cách nhấn giữ phần gần đỉnh và kéo cửa sổ. Một số có thể kéo thả ở bất kỳ vị trí nào.", 5000);
            setTimeout(() => {
                showNotification("Mẹo", "Game tự động lưu tiến trình. Bấm vào menu BụtOS ở góc dưới bên trái màn hình để xem các tùy chọn.", 5000);
            }, 5000)
        }],
/* 5 */ ["s1.leadin", "Cám", "LÀ BẢY TIM ĐÓOOO!!! Mà filter kiểu gì mà da mặt em vẫn đen thế này!?"],
/* 6 */ ["s1.leadin", "Tấm", "Chị đang render, máy nóng quá nó lag."],
/* 7 */ ["s1.leadin", "Tấm", "Mà Cám này, chị nói thật nhé: em quay ngược sáng thì app nào cũng bó tay, đừng đổ tội cho chị."],
/* 8 */ ["s1.leadin", "Cám", "Chị cứ bào chữa lung tung! Mấy bạn KOL trên TikTok người ta cũng quay ngược sáng mà vẫn đẹp như thường!"],
/* 9 */ ["s1.leadin", "Tấm", "KOL trên mạng người ta có gimbal, có diffuser, có tiền mua đèn xịn. Chị chưa thấy ai dùng đèn học từ năm lớp 8 bao giờ."],
/* 10*/ ["s1.leadin", "Dì ghẻ", "Tấm! Nhiệm vụ của mày là cho em nó lên xu hướng, cấm cãi!"],
/* 11*/ ["s1.leadin", "Dì ghẻ", "À, mà tí nữa check cho tao 500 cái inbox của shop. Khách hỏi giá thì cứ copy-paste cái mẫu trong đấy là được. Làm xong rồi thì mới được đi chơi."],
/* 12*/ ["s1.leadin", "Tấm", "Ơ... nhưng con phải săn vé..."],
/* 13*/ ["s1.leadin", "Dì ghẻ", "Hừ. Vé với chả viếc. Nhà còn bao việc. Đây, nhìn đống này đi!", "s1_challenge_shock_open"],
/* 14*/ ["s1.challenge_shock", "Tấm", "..."],
/* 15*/ ["s1.challenge_shock", "Tấm", "Mẹ! Chỗ này phải mấy nghìn dòng, lại còn nhiễu lung tung, lọc bằng tay đến Tết ạ?"],
/* 16*/ ["s1.challenge_shock", "Dì ghẻ", "Thì mày giỏi IT mà, xử lý đi. Cám, đi với mẹ chuẩn bị đồ, chiều mẹ con mình đi concert luôn. Nghe là có nhiều anh đẹp trai lắm!"],
/* 17*/ ["s1.challenge_shock", "Cám", "Biết rồi mẹ, con đang chọn outfit chụp ảnh đây."],
/* 18*/ ["s1.challenge", "Tấm", "Ông Bụt ơi! Hãy giúp con với!"],
    ],
};

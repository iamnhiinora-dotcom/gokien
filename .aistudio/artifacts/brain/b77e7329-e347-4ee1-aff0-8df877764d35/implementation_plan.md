# Kế Hoạch & Nhật Ký Phát Triển: Nền Tảng "Gõ Kiến" (Gõ)

## 1. Tổng Quan Kiến Trúc & Thiết Kế
- **Ứng dụng**: Web rèn luyện tư duy phản biện, nhận diện bẫy ngụy biện và tranh biện học đường theo mô hình Gamification dành cho học sinh THPT.
- **Bảng màu giao diện Sáng đồng nhất (Light Mode)**:
  - Nền trang: `#F8F6F1` (trắng ngà)
  - Thẻ card, header, modal, menu: `#FFFFFF`, viền `#E5E1D8`, đổ bóng rất nhẹ
  - Nền phụ (ô input, ô nhỏ, hàng bảng xen kẽ): `#F2EFE8`
  - Màu chữ chính & tiêu đề: `#1E2433`
  - Màu chữ phụ, mô tả: `#4A5263`
  - Màu chữ chú thích, placeholder: `#6B7280`
  - Màu vàng thương hiệu (nút chính, tab chọn): nền `#FACC15`, chữ `#1E2433`, hover `#EAB308`. Khi dùng làm icon/chữ trên nền sáng: `#A16207`. Badge vàng: `#FEF3C7` chữ `#92400E`.
  - Màu báo lỗi / ngụy biện: viền đỏ `#FCA5A5`, nền đỏ nhạt `#FEF2F2`, chữ đỏ `#DC2626`.
  - Typography: Tiêu đề Literata (serif) và nội dung Lexend (sans-serif) chuẩn tiếng Việt 100%.

---

## 2. Cấu Trúc 6 Module Điều Hướng Chính

### 1. Giới thiệu (`landing_guide`)
- Giới thiệu triết lý hình tượng chim gõ kiến "Gõ" (tìm sâu bọ trong thân cây = nhặt lỗi trong lập luận).
- Tình huống thực nghiệm làm thử ngay tại chỗ với bút dạ quang bôi vàng và con dấu phát hiện.
- 4 thẻ chức năng chính có số thứ tự liền mạch:
  1. Vạch Lá Tìm Sâu
  2. Đấu Trường Phản Biện (với 2 nút: "Đấu 1v1 với AI" và "Thi đấu WSDC 3v3")
  3. Chơi Game Với Bạn Bè (Cờ cá ngựa & Đấu 2 người)
  4. Tiến Độ & Bảng Xếp Hạng (với 2 nút: "Xem tiến độ cá nhân" và "Xem bảng xếp hạng")

### 2. Vạch Lá Tìm Sâu (`fallacy_challenge`)
- 5 hình thức đời thực: bong bóng chat nhóm lớp, bài đăng mạng xã hội, bình luận video ngắn, biên bản họp phụ huynh, tiêu đề báo chí.
- Quy trình 3 bước:
  - Bước 1: Dùng bút dạ quang bôi đúng cụm từ có lỗi (`flawText`).
  - Bước 2: Chọn tên lỗi ngụy biện.
  - Bước 3: Viết câu phản biện bẻ lại để AI chấm điểm và cộng XP.

### 3. Đấu Trường Phản Biện (`debate_arena`) - Gộp 1v1 & WSDC 3v3
- Tiêu đề "Đấu trường phản biện" cùng **Segmented Control**:
  - `1v1 với AI` (mặc định)
  - `WSDC 3v3`
- Hộp tóm tắt luật động thay đổi theo chế độ đang chọn:
  - *1v1*: Thanh máu 100 HP, Dựng Người Thép đạt từ 6/10 mới vào trận, điểm Công tâm.
  - *WSDC*: Bài chính 8 phút, Reply 4 phút, POI từ phút 1 đến phút 7, thang 60–80, không có kết quả hòa.
- **Bước 1 "Chọn chủ đề" dùng CHUNG cho cả 2 chế độ**:
  - 27 chủ đề đa lĩnh vực (Giáo dục, Môi trường, Y tế & Sức khỏe, Xã hội) kèm thanh tìm kiếm, bộ lọc danh mục, nhãn độ khó và nút "Tự nhập chủ đề".
  - Chủ đề đã chọn được lưu giữ liên tục khi chuyển đổi qua lại giữa 1v1 và WSDC.
- Các bước tiếp theo thích ứng linh hoạt:
  - *1v1*: Chọn phe (Ủng hộ / Phản đối), chọn bạn tranh luận AI (3 nhân vật), Dựng Người Thép rồi vào trận.
  - *WSDC*: Chọn 1 trong 6 vai (Prop 1–3, Opp 1–3), tùy chọn phát biểu bài Reply, nút "Vào phòng thi đấu WSDC".
- Xóa hoàn toàn banner dư thừa; giao diện trong trận đấu của cả 2 chế độ giữ nguyên 100% logic và cách tính điểm.

### 4. Chơi Cùng Bạn (`multiplayer_games`)
- Phần 1: Bàn cờ cá ngựa phản biện 4 người chơi với xúc xắc, ô câu hỏi tri thức và lá chắn.
- Phần 2: Đấu trường đối kháng 2 người cục bộ với thanh máu 100 HP và 4 lựa chọn phản biện chiến thuật.

### 5. Tiến Độ (`progress_hub`)
Sắp xếp thông tin cá nhân của học sinh theo đúng thứ tự 9 phần quy định:
1. Banner chế độ khách + nút "Đăng nhập Google" (chỉ hiện khi chưa đăng nhập)
2. Thẻ hồ sơ học sinh: tên, lớp, cấp độ (Level 1–6), danh hiệu, thanh tiến trình XP
3. Thống kê nhanh: Chuỗi ngày, Thắng trận, Vạch lỗi, Tổng XP
4. Chuỗi 7 ngày rèn luyện (T2 đến CN)
5. Nhiệm vụ rèn luyện mỗi ngày (cập nhật mô tả nhiệm vụ Đấu trường tính chung cả 1v1 và WSDC)
6. Biểu đồ radar năng lực tư duy phản biện
7. Lịch sử các trận đấu trường
8. Bộ sưu tập huy hiệu
9. Lộ trình các cấp bậc (từ Lv.1 Tập sự đến Lv.6 Đại sư)

### 6. Bảng Xếp Hạng (`leaderboard_hub`)
Tập trung thi đua học tập giữa các học sinh toàn diện:
1. Tiêu đề "Bảng xếp hạng học sinh" và mô tả ngắn.
2. Bộ lọc theo lớp THPT VÀ nút chuyển sắp xếp (theo Điểm XP hoặc theo Số trận thắng).
3. Bục vinh danh Top 3 (Podium):
   - Hạng 1 ở giữa cao nhất (viền vàng `#FACC15`, icon vương miện vàng)
   - Hạng 2 bên trái (viền bạc `#94A3B8`, icon huy chương bạc)
   - Hạng 3 bên phải (viền đồng `#B45309`, icon huy chương đồng)
   - Đầy đủ avatar chữ cái, tên, lớp, danh hiệu và chỉ số thi đua.
4. Bảng danh sách từ hạng 4 trở đi:
   - Các cột: Hạng, Học sinh, Lớp, Danh hiệu, Thắng, XP.
   - Dòng của học sinh hiện tại được đánh dấu bằng nền vàng nhạt `#FEF3C7`.
   - Nếu học sinh chưa nằm trong danh sách đang hiển thị, luôn ghim 1 dòng "Hạng của bạn" ở dưới cùng bảng.
5. Thông báo chế độ khách "Đăng nhập để có tên trên bảng xếp hạng" cùng nút Đăng nhập Google.
6. Trạng thái trống "Chưa có học sinh nào ở lớp này" khi lọc lớp chưa có dữ liệu.
7. 100% dữ liệu thực từ Firestore Database.

---

## 3. Quy Chuẩn Điều Hướng (Navigation)
- Thanh menu luôn hiển thị 6 mục trên một dòng duy nhất (`whitespace-nowrap`):
  `Giới thiệu · Vạch lá tìm sâu · Đấu trường · Chơi cùng bạn · Tiến độ · Bảng xếp hạng`
- Khi màn hình hẹp: hỗ trợ cuộn ngang không thanh cuộn (`overflow-x-auto no-scrollbar`) và thanh bottom navigation cố định trên thiết bị di động.
- Mục đang chọn: nền vàng `#FACC15`, chữ `#1E2433`.
- Nút dẫn chéo từ các module và modal (Sổ tay PEEL, Landing, Modal Mở đầu...) điều hướng chính xác đến đúng module và phân hệ (submode).

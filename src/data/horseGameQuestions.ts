/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NGÂN HÀNG CÂU HỎI TƯ DUY PHẢN BIỆN CHO CỜ CÁ NGỰA
 * Bao gồm ít nhất 90 câu hỏi (>= 30 Dễ, >= 30 Vừa, >= 30 Khó)
 * Bối cảnh học sinh THPT: chat nhóm lớp, bình luận mạng xã hội, họp phụ huynh, đời sống học đường.
 */

export interface HorseGameQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  situation: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export const HORSE_GAME_QUESTIONS: HorseGameQuestion[] = [
  // ==========================================
  // 32 CÂU MỨC DỄ (EASY) - Xúc xắc 1 hoặc 2
  // ==========================================
  {
    id: 'easy_01',
    difficulty: 'easy',
    category: 'Ngụy biện phổ biến',
    situation: '"Bác sĩ khuyên không nên thức khuya học bài? Nhưng ổng cũng toàn thức trắng đêm trực cấp cứu đấy thôi, nghe làm gì!"',
    question: 'Lập luận trên mắc lỗi ngụy biện nào?',
    options: [
      'Ngụy biện "Anh cũng vậy" (Tu Quoque)',
      'Ngụy biện theo số đông (Ad Populum)',
      'Ngụy biện dốc trượt (Slippery Slope)',
      'Ngụy biện người rơm (Strawman)'
    ],
    correctIndex: 0,
    explanation: 'Bác sĩ thức đêm vì đặc thù cấp cứu không làm cho chân lý y khoa về tác hại của việc thức khuya bị sai.'
  },
  {
    id: 'easy_02',
    difficulty: 'easy',
    category: 'Công kích cá nhân',
    situation: '"Cậu chê bài thuyết trình của mình thiếu số liệu à? Cậu nhìn lại điểm thi Văn kỳ trước của cậu xem có bằng ai không mà bày đặt dạy đời!"',
    question: 'Người nói đã dùng chiêu thức tranh luận sai lầm nào?',
    options: [
      'Công kích cá nhân (Ad Hominem)',
      'Khái quát hóa vội vã',
      'Đánh tráo khái niệm',
      'Ngụy biện nhân quả'
    ],
    correctIndex: 0,
    explanation: 'Thay vì phản hồi về việc bài thuyết trình có thiếu số liệu hay không, người nói lại quay sang chê bai điểm thi của bạn.'
  },
  {
    id: 'easy_03',
    difficulty: 'easy',
    category: 'Theo số đông',
    situation: '"Cả lớp ai cũng mang điện thoại vào giờ học để chơi game, cậu không chơi là đồ lập dị, thầy cô có cấm cũng vô ích!"',
    question: 'Ý kiến trên dựa vào lỗi ngụy biện nào để biện minh cho hành vi sai?',
    options: [
      'Ngụy biện dựa vào số đông (Ad Populum)',
      'Ngụy biện viện dẫn quyền uy',
      'Ngụy biện dốc trượt',
      'Ngụy biện đòn bẩy cảm xúc'
    ],
    correctIndex: 0,
    explanation: 'Số lượng người vi phạm nhiều không bao giờ biến một hành vi sai quy định thành đúng đắn.'
  },
  {
    id: 'easy_04',
    difficulty: 'easy',
    category: 'Khái quát vội vàng',
    situation: '"Hôm qua mình gặp hai bạn trường X đi xe máy không đội mũ bảo hiểm. Đúng là học sinh trường X toàn đứa vô ý thức!"',
    question: 'Lỗi tư duy căn bản trong nhận xét trên là gì?',
    options: [
      'Khái quát hóa vội vã (Hasty Generalization)',
      'Ngụy biện người rơm',
      'Ngụy biện viện dẫn truyền thống',
      'Lập luận hoàn toàn hợp lý'
    ],
    correctIndex: 0,
    explanation: 'Chỉ quan sát 2 học sinh cá biệt mà đã vội vàng quy kết cho hàng ngàn học sinh toàn trường.'
  },
  {
    id: 'easy_05',
    difficulty: 'easy',
    category: 'Lưỡng phân sai',
    situation: '"Hoặc là bạn ủng hộ kế hoạch đi dã ngoại của lớp, hoặc là bạn không coi tập thể này ra gì!"',
    question: 'Câu nói trên ép đối phương vào cái bẫy logic nào?',
    options: [
      'Ngụy biện nhị nguyên sai / Lưỡng phân giả (False Dilemma)',
      'Ngụy biện ranh giới mờ',
      'Ngụy biện người rơm',
      'Ngụy biện đòn bẩy chi phí chìm'
    ],
    correctIndex: 0,
    explanation: 'Tự ý giới hạn chỉ có 2 thái cực đối lập, trong khi bạn có thể yêu quý lớp nhưng đang gặp khó khăn tài chính hoặc bận việc gia đình.'
  },
  {
    id: 'easy_06',
    difficulty: 'easy',
    category: 'Ngụy biện phổ biến',
    situation: '"Sao mẹ lại bắt con học đàn piano? Bác bảo vệ đầu phố cũng có biết nốt nhạc nào đâu mà vẫn sống vui vẻ đấy thôi!"',
    question: 'Học sinh trên đã mắc lỗi ngụy biện gì?',
    options: [
      'Ngụy biện "Bạn cũng thế" / So sánh khập khiễng',
      'Ngụy biện người rơm',
      'Ngụy biện viện dẫn tự nhiên',
      'Ngụy biện dốc trượt'
    ],
    correctIndex: 0,
    explanation: 'Lấy lối sống và mục tiêu của một người khác không liên quan để gạt bỏ mục đích rèn luyện của bản thân.'
  },
  {
    id: 'easy_07',
    difficulty: 'easy',
    category: 'Công kích cá nhân',
    situation: '"Ý tưởng cải tiến bảng tin Đoàn trường của Nam rất hay. Nhưng Nam vốn ít nói, tính tình lại hơi lập dị nên chắc đề xuất đó vứt đi."',
    question: 'Lỗi lập luận ở đây là gì?',
    options: [
      'Công kích tính cách cá nhân thay vì đánh giá ý tưởng',
      'Khái quát hóa có căn cứ',
      'Phân tích khách quan',
      'Ngụy biện viện dẫn uy tín'
    ],
    correctIndex: 0,
    explanation: 'Giá trị của ý tưởng phải được đo bằng tính khả thi và lợi ích, không phụ thuộc vào tính cách hướng nội của người nghĩ ra nó.'
  },
  {
    id: 'easy_08',
    difficulty: 'easy',
    category: 'Theo số đông',
    situation: '"Hàng triệu người đều tin vào cung hoàng đạo để chọn nghề nghiệp, lẽ nào hàng triệu người đó lại ngu ngốc hơn bạn?"',
    question: 'Lập luận trên sử dụng thủ thuật nào?',
    options: [
      'Lấy số đông áp đảo chân lý khoa học',
      'Lập luận dựa trên chứng cứ thực nghiệm',
      'Bác bỏ bằng phản ví dụ',
      'Tam đoạn luận chuẩn mực'
    ],
    correctIndex: 0,
    explanation: 'Khoa học hướng nghiệp dựa trên năng lực và tính cách thực tế, niềm tin số đông không phải bằng chứng khoa học.'
  },
  {
    id: 'easy_09',
    difficulty: 'easy',
    category: 'Khái quát vội vàng',
    situation: '"Tôi vừa đọc một bài báo về một thủ khoa đại học nhưng sau đó bị sa thải. Học đại học đúng là phí tiền vô ích!"',
    question: 'Nhận định trên mắc lỗi gì?',
    options: [
      'Lấy một ví dụ cá biệt để phủ nhận cả hệ thống giáo dục',
      'Lập luận có bằng chứng xác thực',
      'Ngụy biện vòng vo',
      'So sánh chính xác'
    ],
    correctIndex: 0,
    explanation: 'Một trường hợp thất bại riêng lẻ không đại diện cho giá trị tri thức của bậc đại học đối với số đông xã hội.'
  },
  {
    id: 'easy_10',
    difficulty: 'easy',
    category: 'Lưỡng phân sai',
    situation: '"Nếu bạn không thức đêm cày đề thì chắc chắn bạn sẽ trượt tốt nghiệp."',
    question: 'Câu cảnh báo này sai ở điểm nào?',
    options: [
      'Ép buộc chỉ có hai lựa chọn cực đoan: thức đêm hoặc trượt',
      'Rất thực tế vì ai cũng phải thức đêm',
      'Đầy đủ dẫn chứng khoa học',
      'Không có lỗi logic nào'
    ],
    correctIndex: 0,
    explanation: 'Học sinh hoàn toàn có thể quản lý thời gian ban ngày hiệu quả, ngủ đủ giấc mà vẫn đạt kết quả cao.'
  },
  {
    id: 'easy_11',
    difficulty: 'easy',
    category: 'Ngụy biện phổ biến',
    situation: '"Bạn nhắc mình đừng vứt rác bừa bãi? Tuần trước chính mắt mình thấy bạn làm rơi cái vé xe bus xuống sân trường kìa!"',
    question: 'Lỗi phản bác ở đây là:',
    options: [
      'Ngụy biện "Anh cũng vậy" để né tránh việc mình vứt rác',
      'Phản biện thẳng thắn',
      'Tìm ra nguyên nhân gốc rễ',
      'Lập luận theo cơ chế PEEL'
    ],
    correctIndex: 0,
    explanation: 'Bạn mình có từng sơ suất làm rơi vé xe hay không thì hành vi cố tình vứt rác của mình lúc này vẫn sai.'
  },
  {
    id: 'easy_12',
    difficulty: 'easy',
    category: 'Công kích cá nhân',
    situation: '"Hùng đề xuất lớp mình nên tiết kiệm điện bằng cách tắt quạt khi ra chơi. Mọi người đừng nghe, nhà Hùng nghèo rớt mồng tơi nên mới ky bo thế!"',
    question: 'Người phản đối đã phạm lỗi gì?',
    options: [
      'Lôi hoàn cảnh gia đình người khác ra để bôi nhọ',
      'Phản bác có cơ sở kinh tế',
      'Lập luận bảo vệ quyền lợi chung',
      'Ngụy biện nhân quả'
    ],
    correctIndex: 0,
    explanation: 'Tiết kiệm điện là ý thức công cộng tốt, đem hoàn cảnh kinh tế của bạn ra xúc phạm là ngụy biện công kích cá nhân.'
  },
  {
    id: 'easy_13',
    difficulty: 'easy',
    category: 'Theo số đông',
    situation: '"Cả bàn ai cũng đồng thanh chọn đáp án C rồi, cậu đừng có bày đặt tính toán lại làm gì cho mất thời gian!"',
    question: 'Thuyết phục theo cách này sai vì:',
    options: [
      'Chân lý toán học không phụ thuộc vào biểu quyết số đông',
      'Số đông luôn luôn đúng trong trắc nghiệm',
      'Tính toán lại là không tôn trọng bạn bè',
      'Không có lỗi nào'
    ],
    correctIndex: 0,
    explanation: 'Cả nhóm có thể cùng mắc một bẫy đề bài, việc kiểm tra lại độc lập là cốt lõi của tư duy logic.'
  },
  {
    id: 'easy_14',
    difficulty: 'easy',
    category: 'Khái quát vội vàng',
    situation: '"Mình ăn thử một cái bánh mì ở căng tin mới thấy hơi nguội. Căng tin mới này dở tệ toàn tập, cạch mặt luôn!"',
    question: 'Lập luận này yếu vì:',
    options: [
      'Mẫu thử quá ít (chỉ 1 cái bánh mì) để đánh giá chất lượng toàn bộ căng tin',
      'Bánh mì nguội là lỗi nghiêm trọng nhất của ẩm thực',
      'Căng tin không bao giờ thay đổi được chất lượng',
      'Khái quát hóa có độ tin cậy cao'
    ],
    correctIndex: 0,
    explanation: 'Đánh giá một quán ăn hay dịch vụ cần căn cứ trên thực đơn đa dạng và nhiều lần trải nghiệm.'
  },
  {
    id: 'easy_15',
    difficulty: 'easy',
    category: 'Lưỡng phân sai',
    situation: '"Hoặc bạn chọn học khối A để kiếm nhiều tiền, hoặc bạn chọn khối C rồi sau này chịu cảnh thất nghiệp."',
    question: 'Cái bẫy nhị nguyên trong câu tư vấn trên là:',
    options: [
      'Vẽ ra bức tranh trắng đen, phủ nhận hàng trăm cơ hội nghề nghiệp đa dạng của khối C',
      'Rất đúng vì thời nay chỉ có khối A là có việc làm',
      'Lời khuyên khoa học và khách quan',
      'Lập luận có số liệu thống kê đầy đủ'
    ],
    correctIndex: 0,
    explanation: 'Mỗi ngành nghề đều có chỗ đứng và cơ hội thành công nếu người học có năng lực xuất sắc và kỹ năng mềm.'
  },
  {
    id: 'easy_16',
    difficulty: 'easy',
    category: 'Ngụy biện phổ biến',
    situation: '"Mẹ đừng cấm con chơi game online. Bố hồi xưa bằng tuổi con cũng nghiện điện tử 4 nút suốt ngày đó thôi!"',
    question: 'Học sinh đang dùng chiêu thức gì để thoái thác trách nhiệm?',
    options: [
      'Ngụy biện "Anh cũng vậy" để hợp thức hóa việc chơi game quá đà',
      'Học hỏi tấm gương tốt',
      'Phân tích nhân quả hợp lý',
      'Bảo vệ quyền tự do cá nhân'
    ],
    correctIndex: 0,
    explanation: 'Việc bố từng chơi game trong quá khứ không làm thay đổi rủi ro mất cân bằng học tập của học sinh hiện tại.'
  },
  {
    id: 'easy_17',
    difficulty: 'easy',
    category: 'Công kích cá nhân',
    situation: '"Cậu ấy nói nước giải khát có ga hại cho dạ dày? Đừng tin, cậu ta đeo kính cận dày cộp trông ngố chết đi được!"',
    question: 'Người nói đã ngụy biện bằng cách nào?',
    options: [
      'Chế giễu ngoại hình của người nói thay vì bàn về tác hại của nước ngọt',
      'Đưa ra bằng chứng y khoa đối lập',
      'Lập luận khoa học',
      'Khái quát hóa dựa trên mẫu lớn'
    ],
    correctIndex: 0,
    explanation: 'Ngoại hình hay việc đeo kính cận hoàn toàn không liên quan đến kiến thức sinh học về dạ dày.'
  },
  {
    id: 'easy_18',
    difficulty: 'easy',
    category: 'Theo số đông',
    situation: '"Video đó có tới 2 triệu lượt thích trên TikTok, chắc chắn tin tức đó là sự thật 100%!"',
    question: 'Sai lầm logic ở đây là gì?',
    options: [
      'Đánh đồng lượng tương tác trên mạng xã hội với tính xác thực của thông tin',
      'TikTok luôn kiểm duyệt tin tức chính xác',
      '2 triệu lượt thích là một bằng chứng khoa học',
      'Không có sai lầm nào'
    ],
    correctIndex: 0,
    explanation: 'Tin giả giật gân thường lan truyền nhanh và hút lượt thích hơn tin tức chính thống có kiểm chứng.'
  },
  {
    id: 'easy_19',
    difficulty: 'easy',
    category: 'Khái quát vội vàng',
    situation: '"Tôi vừa quen một bạn học chuyên Toán nói chuyện hơi vụng về. Học sinh chuyên Toán đúng là toàn người thiếu kỹ năng giao tiếp!"',
    question: 'Nhận xét này phạm lỗi:',
    options: [
      'Khái quát vội vàng từ một cá nhân sang cả tập thể',
      'Quan sát tâm lý học sinh sâu sắc',
      'Phân tích thống kê diện rộng',
      'Lập luận dựa trên sự thật'
    ],
    correctIndex: 0,
    explanation: 'Mỗi học sinh chuyên Toán có tính cách riêng, rất nhiều bạn hoạt bát và làm MC, lãnh đạo câu lạc bộ.'
  },
  {
    id: 'easy_20',
    difficulty: 'easy',
    category: 'Lưỡng phân sai',
    situation: '"Một là bạn cùng tôi trốn tiết đi uống trà sữa, hai là chúng ta chấm dứt tình bạn thân từ hôm nay!"',
    question: 'Áp lực tình huống trên thuộc loại ngụy biện nào?',
    options: [
      'Ngụy biện song đề giả / Tống tiền cảm xúc bằng bẫy nhị nguyên',
      'Lập luận bảo vệ tình bạn chân chính',
      'Lập luận logic chặt chẽ',
      'Phản biện có căn cứ'
    ],
    correctIndex: 0,
    explanation: 'Ép người khác phải vi phạm kỷ luật học đường hoặc mất tình bạn là bẫy nhị nguyên độc hại.'
  },
  {
    id: 'easy_21',
    difficulty: 'easy',
    category: 'Ngụy biện phổ biến',
    situation: '"Mày phê bình tao đi học muộn à? Mày nhớ tuần trước mày cũng bị ghi sổ đầu bài một lần không?"',
    question: 'Chiêu thức "Tu Quoque" thể hiện ở chỗ nào?',
    options: [
      'Bới lại lỗi cũ của người nhắc nhở để phủ nhận việc mình đi muộn hôm nay',
      'Thừa nhận lỗi lầm và xin lỗi',
      'Đưa ra lý do chính đáng',
      'Tìm giải pháp đi học đúng giờ'
    ],
    correctIndex: 0,
    explanation: 'Hành vi đi muộn của bạn tuần trước không thể làm cho việc mình đi muộn hôm nay thành đúng giờ.'
  },
  {
    id: 'easy_22',
    difficulty: 'easy',
    category: 'Công kích cá nhân',
    situation: '"Cô giáo dạy Địa lý bảo Trái Đất đang nóng lên toàn cầu. Nhưng cô chưa từng đi du lịch nước ngoài thì biết gì về toàn cầu!"',
    question: 'Lỗi trong câu nói này là:',
    options: [
      'Tấn công trải nghiệm du lịch cá nhân của giáo viên thay vì dữ liệu khí hậu khoa học',
      'Nhận xét sâu sắc về chuyên môn',
      'Phản biện địa lý chính xác',
      'Ngụy biện viện dẫn truyền thống'
    ],
    correctIndex: 0,
    explanation: 'Khoa học khí hậu dựa trên dữ liệu đo đạc vệ tinh và trạm quan trắc quốc tế, không phụ thuộc vào việc cá nhân đi du lịch.'
  },
  {
    id: 'easy_23',
    difficulty: 'easy',
    category: 'Theo số đông',
    situation: '"Học sinh cả nước đều đi học thêm 3 ca mỗi ngày, con ở nhà tự học là tự mình thụt lùi so với xã hội!"',
    question: 'Phụ huynh trên đang dựa vào điều gì để ép con học thêm?',
    options: [
      'Tâm lý đám đông thay vì năng lực và nhu cầu thực tế của con',
      'Phương pháp giáo dục cá nhân hóa',
      'Đánh giá đúng năng lực tự học',
      'Dữ liệu y tế về giấc ngủ học đường'
    ],
    correctIndex: 0,
    explanation: 'Học thêm tràn lan theo phong trào chưa chắc hiệu quả bằng tự học có phương pháp và tập trung.'
  },
  {
    id: 'easy_24',
    difficulty: 'easy',
    category: 'Khái quát vội vàng',
    situation: '"Môn Lịch sử chán òm, tiết học hôm nay thầy chỉ đọc chép nguyên cuốn sách giáo khoa."',
    question: 'Kết luận "môn Lịch sử chán òm" bị coi là vội vã vì:',
    options: [
      'Quy chụp bản chất của cả một ngành khoa học từ trải nghiệm một tiết học chưa sinh động',
      'Lịch sử là môn học thú vị nhất trần đời',
      'Học sinh không được phép nhận xét thầy cô',
      'Không có lỗi logic nào'
    ],
    correctIndex: 0,
    explanation: 'Cách truyền tải của một buổi học cụ thể khác với giá trị hấp dẫn vốn có của dòng chảy lịch sử.'
  },
  {
    id: 'easy_25',
    difficulty: 'easy',
    category: 'Lưỡng phân sai',
    situation: '"Nếu bạn thực sự thông minh, bạn đã thi đỗ vào lớp chọn. Bạn không vào được nghĩa là bạn kém cỏi."',
    question: 'Câu nói trên bỏ qua sự thật nào?',
    options: [
      'Trí thông minh đa dạng và kết quả thi cử còn phụ thuộc vào sức khỏe, sở thích, tâm lý ngày thi',
      'Lớp chọn là nơi duy nhất dành cho người thông minh',
      'Không đỗ lớp chọn là hết cơ hội',
      'Mọi người đều có điểm thi giống nhau'
    ],
    correctIndex: 0,
    explanation: 'Kết quả một kỳ thi không phản ánh trọn vẹn trí tuệ và tiềm năng phát triển của một con người.'
  },
  {
    id: 'easy_26',
    difficulty: 'easy',
    category: 'Ngụy biện phổ biến',
    situation: '"Anh bảo tôi không được hút thuốc lá điện tử trong nhà vệ sinh? Ngày xưa anh cũng từng bị phạt vì hút thuốc lá đấy thôi!"',
    question: 'Hành động dùng quá khứ của người khác để bào chữa cho lỗi hiện tại là:',
    options: [
      'Ngụy biện "Anh cũng thế" (Tu Quoque)',
      'Bài học lịch sử',
      'So sánh công bằng',
      'Lập luận dựa trên sự khoan dung'
    ],
    correctIndex: 0,
    explanation: 'Quá khứ sai lầm của người khác là bài học cảnh tỉnh chứ không phải tấm giấy phép cho ta lặp lại cái sai.'
  },
  {
    id: 'easy_27',
    difficulty: 'easy',
    category: 'Công kích cá nhân',
    situation: '"Bạn lớp trưởng nhắc cả lớp giữ trật tự. Một bạn nam hét lên: Mày tưởng mày làm lớp trưởng thì mày là mẹ thiên hạ à!"',
    question: 'Hành vi phản ứng của bạn nam là:',
    options: [
      'Xúc phạm cá nhân để lảng tránh nghĩa vụ giữ trật tự chung',
      'Góp ý xây dựng cho lớp trưởng',
      'Thể hiện tinh thần tự do ngôn luận',
      'Phản biện có căn cứ kỷ luật'
    ],
    correctIndex: 0,
    explanation: 'Thay vì xem lại việc lớp có ồn hay không, bạn nam lại buông lời mạt sát chức danh của lớp trưởng.'
  },
  {
    id: 'easy_28',
    difficulty: 'easy',
    category: 'Theo số đông',
    situation: '"Tất cả các bạn trong nhóm đều đồng ý trốn lao động công ích, không ai bị phạt đâu mà sợ!"',
    question: 'Lời rủ rê này chứa đựng cạm bẫy:',
    options: [
      'Ảo tưởng rằng số đông vi phạm sẽ giúp miễn trừ trách nhiệm cá nhân',
      'Quyết định dân chủ tuyệt đối',
      'Tinh thần đoàn kết nhóm',
      'Bằng chứng pháp lý vững chắc'
    ],
    correctIndex: 0,
    explanation: 'Quy chế kỷ luật áp dụng cho từng học sinh, đông người cùng làm sai không làm cho hành vi đó thành đúng.'
  },
  {
    id: 'easy_29',
    difficulty: 'easy',
    category: 'Khái quát vội vàng',
    situation: '"Hôm nay máy chiếu lớp mình bị hỏng. Đồ công nghệ mua cho trường học toàn là đồ rác rưởi!"',
    question: 'Phát biểu trên là ví dụ tiêu biểu của:',
    options: [
      'Khái quát hóa quá đà từ một sự cố thiết bị đơn lẻ',
      'Báo cáo kỹ thuật chuẩn xác',
      'Kiểm định chất lượng khách quan',
      'Đánh giá dựa trên xác suất'
    ],
    correctIndex: 0,
    explanation: 'Thiết bị điện tử có tỷ lệ hỏng hóc nhất định, không thể vì một lần hỏng mà kết luận tất cả đều là rác.'
  },
  {
    id: 'easy_30',
    difficulty: 'easy',
    category: 'Lưỡng phân sai',
    situation: '"Một là cậu bao cả nhóm chầu trà sữa này, hai là cậu là đứa bủn xỉn ki bo nhất quả đất!"',
    question: 'Bẫy nhị nguyên này cố tình che giấu điều gì?',
    options: [
      'Học sinh có quyền chi tiêu theo khả năng tài chính cá nhân mà không phải người bủn xỉn',
      'Mọi người bạn tốt đều phải bao trà sữa',
      'Không bao trà sữa là có tội',
      'Trà sữa là thước đo duy nhất của tình bạn'
    ],
    correctIndex: 0,
    explanation: 'Ép người khác tiêu tiền bằng cách gắn nhãn bủn xỉn là thao túng tâm lý bằng bẫy lưỡng phân sai.'
  },
  {
    id: 'easy_31',
    difficulty: 'easy',
    category: 'Ngụy biện phổ biến',
    situation: '"Chị bảo em không được xem phim khi đang làm bài tập? Chính mắt em thấy chị vừa nghe nhạc vừa lướt mạng xã hội lúc học tối qua!"',
    question: 'Lập luận của em mắc lỗi:',
    options: [
      'Ngụy biện "Chị cũng thế" để trốn tránh việc mình mất tập trung',
      'Bằng chứng khoa học về đa nhiệm',
      'Lời khuyên sư phạm bổ ích',
      'Tập trung học tập hiệu quả'
    ],
    correctIndex: 0,
    explanation: 'Việc chị gái mất tập trung không chứng minh rằng vừa xem phim vừa làm bài tập là phương pháp học đúng.'
  },
  {
    id: 'easy_32',
    difficulty: 'easy',
    category: 'Công kích cá nhân',
    situation: '"Bạn ấy đề xuất mở câu lạc bộ Sách trong trường. Một bạn bảo: Bạn ấy nhìn quê mùa thế kia thì hiểu gì về văn hóa đọc mà bày đặt!"',
    question: 'Lỗi lập luận nghiêm trọng ở đây là:',
    options: [
      'Đánh giá đề xuất văn hóa qua vẻ bề ngoài mộc mạc của người nói',
      'Thẩm định giá trị sách chính xác',
      'Phản biện có căn cứ nghệ thuật',
      'Lập luận bảo vệ học sinh'
    ],
    correctIndex: 0,
    explanation: 'Tình yêu sách và ý nghĩa của CLB Sách không liên quan gì đến phong cách ăn mặc hay xuất thân của học sinh.'
  },

  // ==========================================
  // 32 CÂU MỨC VỪA (MEDIUM) - Xúc xắc 3 hoặc 4
  // ==========================================
  {
    id: 'med_01',
    difficulty: 'medium',
    category: 'Người rơm (Strawman)',
    situation: '"Nam đề xuất: Nên lắp bình nước lọc tự động ở mỗi tầng học để học sinh đỡ phải mua chai nhựa. Bình phản bác: Nam muốn biến trường học thành công viên giải trí, bỏ bê việc dạy học chỉ lo phục vụ ăn uống à?"',
    question: 'Bình đã sử dụng ngụy biện "Người rơm" như thế nào?',
    options: [
      'Bóp méo đề xuất lắp bình nước thành "biến trường thành công viên bỏ bê dạy học" rồi tấn công vào ý tưởng méo mó đó',
      'Tấn công trực diện vào chi phí lắp đặt bình nước',
      'Chỉ ra nguồn nước lọc chưa được kiểm định',
      'Đưa ra phản ví dụ về học sinh làm hỏng bình nước'
    ],
    correctIndex: 0,
    explanation: 'Ngụy biện Người Rơm dựng lên một hình nộm méo mó, lố bịch của đối thủ để dễ bề đập tan thay vì đối diện với đề xuất thật.'
  },
  {
    id: 'med_02',
    difficulty: 'medium',
    category: 'Dốc trượt (Slippery Slope)',
    situation: '"Nếu hôm nay nhà trường cho phép học sinh mặc áo phông tự do vào thứ Sáu, tuần sau các em sẽ mặc đồ ngủ đến lớp, rồi trường học sẽ trở thành cái chợ trời vô kỷ luật!"',
    question: 'Lỗi dốc trượt trong phát biểu này nằm ở chuỗi suy diễn nào?',
    options: [
      'Suy diễn liên hoàn từ mặc áo phông thứ Sáu đến mặc đồ ngủ và thành chợ trời mà không có bằng chứng',
      'Ủng hộ mặc đồng phục truyền thống',
      'Phân tích chi phí may mặc của học sinh',
      'Không có lỗi logic nào'
    ],
    correctIndex: 0,
    explanation: 'Giả định rằng một bước đi nhỏ có kiểm soát sẽ tất yếu trượt dài xuống vực thẳm mà không có bất kỳ mắt xích chứng minh nào.'
  },
  {
    id: 'med_03',
    difficulty: 'medium',
    category: 'Nhân quả sai (False Cause)',
    situation: '"Kể từ khi nhà trường gắn thêm camera giám sát ở hành lang, điểm kiểm tra môn Toán của khối 12 tăng vọt. Rõ ràng camera giúp học sinh giỏi Toán hơn!"',
    question: 'Nhận định trên đã nhầm lẫn điều gì?',
    options: [
      'Đánh đồng hai sự kiện xảy ra nối tiếp nhau thành quan hệ nhân quả (Post Hoc Ergo Propter Hoc)',
      'Camera ghi lại bài giảng Toán rất tốt',
      'Học sinh khối 12 sợ camera nên chăm học',
      'Lập luận thống kê hoàn hảo'
    ],
    correctIndex: 0,
    explanation: 'Sự kiện camera xảy ra trước không có nghĩa là nguyên nhân trực tiếp làm tăng điểm Toán (có thể do đề thi dễ hơn hoặc học sinh ôn tập kỹ).'
  },
  {
    id: 'med_04',
    difficulty: 'medium',
    category: 'Viện dẫn thẩm quyền sai',
    situation: '"Ca sĩ thần tượng X nói rằng uống nước chanh mật ong nguyên chất mỗi ngày sẽ chữa khỏi hoàn toàn bệnh đau dạ dày, nên em tuyệt đối không cần uống thuốc bác sĩ kê nữa."',
    question: 'Cái bẫy trong lời tin tưởng này là gì?',
    options: [
      'Viện dẫn thẩm quyền sai lĩnh vực (ca sĩ không có chuyên môn y khoa trị liệu)',
      'Ca sĩ là người nổi tiếng nên lời nói có độ tin cậy cao nhất',
      'Thuốc tây luôn có hại hơn nước chanh',
      'Không có lỗi lập luận'
    ],
    correctIndex: 0,
    explanation: 'Thẩm quyền của một người nổi tiếng trong âm nhạc không thể thay thế cho bằng chứng và chẩn đoán của chuyên gia y tế.'
  },
  {
    id: 'med_05',
    difficulty: 'medium',
    category: 'Đánh lạc hướng (Red Herring)',
    situation: '"Bố mẹ hỏi con về việc chưa nộp học phí tháng này. Con trả lời: Bố mẹ có biết là hôm nay đường Nguyễn Trãi kẹt xe khủng khiếp, con suýt bị xe máy quẹt trúng không?"',
    question: 'Học sinh trên đã áp dụng chiến thuật gì?',
    options: [
      'Tung hỏa mù đánh lạc hướng (Red Herring) sang chuyện kẹt xe để né tránh câu hỏi học phí',
      'Trả lời trung thực câu hỏi của bố mẹ',
      'Chứng minh việc đi lại khó khăn',
      'Cung cấp luận điểm PEEL chặt chẽ'
    ],
    correctIndex: 0,
    explanation: 'Đưa ra một chủ đề cảm xúc kịch tính hoàn toàn không liên quan để kéo sự chú ý ra khỏi trách nhiệm chính.'
  },
  {
    id: 'med_06',
    difficulty: 'medium',
    category: 'Cấu trúc PEEL',
    situation: '"Trong cấu trúc tranh biện PEEL (Point - Luận điểm, Explanation - Giải thích cơ chế, Evidence - Dẫn chứng, Link - Liên kết), thành phần nào đóng vai trò trả lời câu hỏi \'TẠI SAO và BẰNG CƠ CHẾ NÀO\'?"',
    question: 'Thành phần cốt lõi đó là:',
    options: [
      'Explanation (Giải thích cơ chế nhân quả)',
      'Point (Tiêu đề luận điểm)',
      'Evidence (Dữ liệu số liệu)',
      'Link (Liên kết về kiến nghị)'
    ],
    correctIndex: 0,
    explanation: 'Explanation làm rõ mắt xích nhân quả vì sao A dẫn tới B và giải thích cơ chế tác động sâu sắc của luận điểm.'
  },
  {
    id: 'med_07',
    difficulty: 'medium',
    category: 'Người rơm (Strawman)',
    situation: '"Bạn A: Mình nghĩ nên giới hạn thời gian lướt mạng xã hội dưới 2 tiếng mỗi ngày để tập trung học. Bạn B: Cậu muốn cách ly giới trẻ khỏi thế giới hiện đại, biến tụi mình thành người tối cổ sống trong hang đá chắc?"',
    question: 'Hành vi của bạn B là:',
    options: [
      'Tự dựng lên hình ảnh "người tối cổ trong hang đá" để công kích bạn A',
      'Phản biện thẳng thắn lợi ích của internet',
      'Đưa ra giải pháp cân bằng thời gian',
      'Chứng minh mạng xã hội an toàn'
    ],
    correctIndex: 0,
    explanation: 'Bạn A chỉ đề xuất quản lý thời gian có chừng mực, bạn B đã bóp méo thành triệt tiêu toàn bộ tiếp cận công nghệ.'
  },
  {
    id: 'med_08',
    difficulty: 'medium',
    category: 'Dốc trượt (Slippery Slope)',
    situation: '"Nếu bạn lỡ quên làm một bài tập về nhà môn Hóa, bạn sẽ bị điểm 0, rồi bạn sẽ chán học, bỏ học, thi trượt tốt nghiệp và sau này không xin được việc làm!"',
    question: 'Đây là ví dụ kinh điển của lỗi gì?',
    options: [
      'Ngụy biện dốc trượt (Slippery Slope)',
      'Ngụy biện người rơm',
      'Ngụy biện đòn bẩy thẩm quyền',
      'Lập luận dự báo chính xác'
    ],
    correctIndex: 0,
    explanation: 'Phóng đại một sai sót nhỏ thành chuỗi thảm họa tất yếu nhằm gây sợ hãi thay vì khuyến khích khắc phục.'
  },
  {
    id: 'med_09',
    difficulty: 'medium',
    category: 'Nhân quả sai (False Cause)',
    situation: '"Mỗi lần em đeo chiếc vòng tay đá đỏ này là làm bài thi trắc nghiệm điểm cao. Hôm nay quên đeo vòng nên chắc chắn em sẽ bị điểm kém."',
    question: 'Tư duy trên mắc sai lầm gì?',
    options: [
      'Gán ghép mê tín ngẫu nhiên thành mối quan hệ nhân quả quyết định điểm số',
      'Tâm lý học tập có cơ sở khoa học',
      'Năng lực trắc nghiệm dựa vào màu sắc',
      'Không có lỗi logic nào'
    ],
    correctIndex: 0,
    explanation: 'Điểm số phụ thuộc vào kiến thức và kỹ năng làm bài, chiếc vòng tay chỉ là sự trùng hợp ngẫu nhiên.'
  },
  {
    id: 'med_10',
    difficulty: 'medium',
    category: 'Đánh tráo khái niệm',
    situation: '"Nhà nước tuyên bố người dân có quyền tự do. Vậy nên tôi có toàn quyền vượt đèn đỏ và phóng nhanh vượt ẩu vì đó là quyền tự do của tôi!"',
    question: 'Người nói đã đánh tráo khái niệm như thế nào?',
    options: [
      'Đánh tráo "quyền tự do trong khuôn khổ pháp luật" thành "sự tùy tiện vô kỷ luật xâm phạm an toàn người khác"',
      'Hiểu đúng bản chất tự do tuyệt đối',
      'Phản biện có căn cứ hiến pháp',
      'Sử dụng tam đoạn luận hợp lệ'
    ],
    correctIndex: 0,
    explanation: 'Tự do công dân luôn gắn liền với trách nhiệm bảo vệ an toàn và quyền lợi hợp pháp của người khác trong xã hội.'
  },
  {
    id: 'med_11',
    difficulty: 'medium',
    category: 'Cấu trúc PEEL',
    situation: '"Một học sinh viết luận điểm: \'Mạng xã hội rất có hại vì bạn em bị lừa tiền qua mạng.\' Bài viết thiếu thành phần quan trọng nào trong PEEL?"',
    question: 'Phần thiếu sót lớn nhất là:',
    options: [
      'Thiếu Explanation (Giải thích cơ chế thuật toán, tâm lý người dùng) và Evidence khái quát có kiểm chứng',
      'Thiếu chữ Point',
      'Thiếu lời kêu gọi hành động',
      'Bài viết đã hoàn hảo'
    ],
    correctIndex: 0,
    explanation: 'Chỉ nêu một ví dụ vụn vặt mà không giải thích cơ chế vì sao mạng xã hội dẫn tới nguy cơ lừa đảo khiến luận điểm rất mỏng manh.'
  },
  {
    id: 'med_12',
    difficulty: 'medium',
    category: 'Đánh lạc hướng (Red Herring)',
    situation: '"Giáo viên hỏi: Tại sao nhóm em chưa hoàn thành mô hình STEM đúng hạn? Đại diện nhóm: Thưa cô, hôm nay lớp bên cạnh có bạn được giải Nhất cuộc thi cờ vua cấp quận ạ!"',
    question: 'Câu trả lời của đại diện nhóm phạm lỗi:',
    options: [
      'Đánh lạc hướng sang thành tích của lớp khác để né tránh lý do trễ hạn',
      'Cung cấp thông tin hữu ích cho cô giáo',
      'Tinh thần chung vui với trường',
      'Giải trình trách nhiệm rõ ràng'
    ],
    correctIndex: 0,
    explanation: 'Thành tích cờ vua của lớp khác hoàn toàn không liên quan đến tiến độ dự án STEM của nhóm.'
  },
  {
    id: 'med_13',
    difficulty: 'medium',
    category: 'Viện dẫn thẩm quyền sai',
    situation: '"Một nhà vật lý đạt giải Nobel tuyên bố rằng ăn chay trường 100% sẽ chữa khỏi bệnh tự kỷ ở trẻ em."',
    question: 'Tại sao không thể dùng tuyên bố này làm bằng chứng khoa học?',
    options: [
      'Nhà vật lý có giải Nobel nhưng không có chuyên môn y sinh và tâm thần học trẻ em',
      'Giải Nobel chứng minh người đó thông thái trong mọi lĩnh vực',
      'Ăn chay trường luôn luôn có lợi cho mọi bệnh',
      'Khoa học vật lý bao trùm y học'
    ],
    correctIndex: 0,
    explanation: 'Thành tựu trong lĩnh vực vật lý không cấp cho chuyên gia đó thẩm quyền khoa học về y khoa và thần kinh học.'
  },
  {
    id: 'med_14',
    difficulty: 'medium',
    category: 'Người rơm (Strawman)',
    situation: '"Lan: Mình nghĩ thư viện trường nên bổ sung thêm một số tiểu thuyết văn học kinh điển. Mai: Cậu muốn biến trường học thành nơi đọc truyện giải trí vô bổ thay vì học các môn khoa học à?"',
    question: 'Mai đã bóp méo ý của Lan bằng cách nào?',
    options: [
      'Quy chụp "tiểu thuyết văn học kinh điển" thành "truyện giải trí vô bổ" để dễ bác bỏ',
      'Đánh giá đúng ngân sách thư viện',
      'Ủng hộ phát triển môn khoa học',
      'Phân tích chi phí mua sách'
    ],
    correctIndex: 0,
    explanation: 'Văn học kinh điển có giá trị bồi đắp tư duy ngôn ngữ và nhân văn, bị biến thành "truyện vô bổ" là ngụy biện Người Rơm.'
  },
  {
    id: 'med_15',
    difficulty: 'medium',
    category: 'Dốc trượt (Slippery Slope)',
    situation: '"Nếu hôm nay ta đồng ý cho học sinh dùng máy tính cầm tay trong giờ Toán lớp 10, các em sẽ không thèm học thuộc bảng cửu chương, rồi sau này ra đời không biết tính tiền thừa khi đi chợ!"',
    question: 'Lỗi dốc trượt thể hiện ở điểm nào?',
    options: [
      'Suy đoán một chuỗi tụt lùi kỹ năng vô căn cứ từ máy tính lớp 10 đến mất khả năng tính tiền chợ',
      'Bảo vệ kỹ năng tính nhẩm của học sinh',
      'Đưa ra giải pháp giảng dạy toán thực tế',
      'Lập luận hoàn toàn chuẩn xác'
    ],
    correctIndex: 0,
    explanation: 'Học sinh lớp 10 đã thành thạo bảng cửu chương từ tiểu học, việc dùng máy tính để giải hệ phương trình không làm mất kỹ năng cơ bản.'
  },
  {
    id: 'med_16',
    difficulty: 'medium',
    category: 'Nhân quả sai (False Cause)',
    situation: '"Mỗi buổi sáng chú gà trống gáy xong thì mặt trời mọc. Vậy tiếng gà gáy là nguyên nhân làm mặt trời mọc!"',
    question: 'Lập luận ngớ ngẩn này phạm sai lầm logic gì?',
    options: [
      'Nhầm lẫn giữa thứ tự thời gian trước sau với mối quan hệ nhân quả thực sự',
      'Con gà trống có quyền năng kỳ diệu',
      'Khoa học thiên văn học cần chứng minh lại',
      'Tam đoạn luận hợp lệ'
    ],
    correctIndex: 0,
    explanation: 'Trái Đất tự quay quanh trục tạo nên bình minh, tiếng gà gáy chỉ trùng hợp diễn ra vào rạng sáng.'
  },
  {
    id: 'med_17',
    difficulty: 'medium',
    category: 'Đánh tráo khái niệm',
    situation: '"Luật bảo vệ động vật quy định không được hành hạ súc vật. Nhưng muỗi và gián cũng là động vật, vậy dùng bình xịt muỗi là phạm luật à?"',
    question: 'Lỗi lập luận ở đây là gì?',
    options: [
      'Đánh tráo khái niệm pháp lý "vật nuôi / động vật được bảo vệ" với "côn trùng truyền bệnh gây hại"',
      'Muỗi và gián cần được đối xử bình đẳng',
      'Pháp luật quy định chưa chặt chẽ',
      'Không có lỗi lập luận'
    ],
    correctIndex: 0,
    explanation: 'Khái niệm trong văn bản quy phạm pháp luật luôn có phạm vi định nghĩa cụ thể, không thể đánh tráo theo nghĩa sinh học rộng rãi.'
  },
  {
    id: 'med_18',
    difficulty: 'medium',
    category: 'Cấu trúc PEEL',
    situation: '"Trong một bài tranh biện WSDC, vai trò của chữ \'L\' (Link) ở cuối đoạn văn là gì?"',
    question: 'Chọn câu trả lời chính xác nhất:',
    options: [
      'Kết nối toàn bộ lập luận và bằng chứng vừa nêu trở lại để khẳng định trực tiếp kiến nghị',
      'Cung cấp một đường dẫn link trang web trên mạng',
      'Liên kết sang một câu chuyện ngoài đời của người nói',
      'Chỉ trích bài nói của đối phương'
    ],
    correctIndex: 0,
    explanation: 'Link là chốt chặn khép lại đoạn văn, chứng minh luận điểm vừa phân tích đóng góp thế nào vào chiến thắng của toàn bộ ca tranh biện.'
  },
  {
    id: 'med_19',
    difficulty: 'medium',
    category: 'Người rơm (Strawman)',
    situation: '"Thầy giáo: Các em nên tập thói quen đọc sách 15 phút trước khi đi ngủ. Học sinh: Thầy muốn tụi em đọc sách thâu đêm suốt sáng để cận thị hết à?"',
    question: 'Học sinh đã dùng ngụy biện Người Rơm bằng cách:',
    options: [
      'Cường điệu hóa "15 phút đọc sách" thành "đọc thâu đêm suốt sáng gây cận thị"',
      'Chỉ ra tác hại của việc đọc sách thiếu ánh sáng',
      'Bảo vệ đôi mắt học sinh có căn cứ y khoa',
      'Đưa ra phản ví dụ thực tế'
    ],
    correctIndex: 0,
    explanation: 'Thay đổi hoàn toàn nội dung và thời lượng của lời khuyên để tạo ra một luận cứ nguy hại dễ phản đối.'
  },
  {
    id: 'med_20',
    difficulty: 'medium',
    category: 'Dốc trượt (Slippery Slope)',
    situation: '"Nếu cho học sinh tự chọn đề tài thuyết trình, các em sẽ chọn toàn chủ đề nhảm nhí, rồi không ai học bài nghiêm túc, và kỳ thi quốc gia sẽ sụp đổ!"',
    question: 'Đâu là mắt xích dốc trượt thiếu căn cứ?',
    options: [
      'Tự tiện suy diễn từ việc chọn đề tài đến sự sụp đổ của kỳ thi quốc gia',
      'Học sinh luôn luôn chọn đề tài xuất sắc',
      'Giáo viên không có quyền can thiệp',
      'Không có lỗi logic nào'
    ],
    correctIndex: 0,
    explanation: 'Giáo viên luôn có quy trình duyệt đề tài và tiêu chí chấm điểm, không thể trượt dài đến hậu quả vô lý đó.'
  },
  {
    id: 'med_21',
    difficulty: 'medium',
    category: 'Nhân quả sai (False Cause)',
    situation: '"Sau khi trường mình thay đồng phục mới, tỉ lệ học sinh đậu đại học tăng 5%. Rõ ràng đồng phục mới có phong thủy tốt giúp học sinh đỗ đạt!"',
    question: 'Sai lầm cốt lõi của kết luận trên là:',
    options: [
      'Gán nguyên nhân đậu đại học cho yếu tố tâm linh "phong thủy áo quần" thay vì chất lượng dạy và học',
      'Đồng phục mới may đẹp tạo cảm hứng học tập',
      'Số liệu 5% là quá nhỏ để tính toán',
      'Tỉ lệ đỗ đại học do đồng phục quyết định'
    ],
    correctIndex: 0,
    explanation: 'Sự tăng trưởng học lực là kết quả của nỗ lực ôn tập và giảng dạy, gắn với phong thủy áo quần là nhân quả sai.'
  },
  {
    id: 'med_22',
    difficulty: 'medium',
    category: 'Đánh lạc hướng (Red Herring)',
    situation: '"Thành viên nhóm A: Slide của cậu nhiều chữ quá, người nghe sẽ khó theo dõi. Thành viên nhóm B: Cậu có thấy hôm nay trời lạnh ghê không, lát nữa đi ăn lẩu ở đâu đây?"',
    question: 'Mục đích của bạn B khi nói về thời tiết và ăn lẩu là:',
    options: [
      'Đánh lạc hướng khỏi lời góp ý chỉnh sửa slide',
      'Quan tâm đến sức khỏe bạn bè',
      'Lên kế hoạch liên hoan khoa học',
      'Tiếp thu ý kiến chân thành'
    ],
    correctIndex: 0,
    explanation: 'Chuyển chủ đề đột ngột sang ăn lẩu để trốn tránh việc phải sửa lại slide bài giảng.'
  },
  {
    id: 'med_23',
    difficulty: 'medium',
    category: 'Viện dẫn thẩm quyền sai',
    situation: '"Một diễn viên điện ảnh nổi tiếng quảng cáo rằng kem dưỡng da này có thể xóa bỏ hoàn toàn sẹo lồi lâu năm chỉ sau 3 ngày."',
    question: 'Người tiêu dùng thông minh cần nhận định thế nào?',
    options: [
      'Diễn viên nhận tiền quảng cáo, không có chuyên môn da liễu và lời hứa xóa sẹo 3 ngày phi khoa học',
      'Diễn viên có làn da đẹp nên chắc chắn sản phẩm đúng',
      'Người nổi tiếng không bao giờ nói dối',
      'Nên mua ngay vì được bảo chứng thương hiệu'
    ],
    correctIndex: 0,
    explanation: 'Quảng cáo thương mại của người nổi tiếng không thể thay thế cho thử nghiệm lâm sàng và chứng nhận y khoa.'
  },
  {
    id: 'med_24',
    difficulty: 'medium',
    category: 'Cấu trúc PEEL',
    situation: '"Khi xây dựng phần Evidence (Dẫn chứng) trong tranh biện học đường, nguồn dẫn chứng nào có độ tin cậy cao nhất?"',
    question: 'Nguồn dẫn chứng chuẩn xác là:',
    options: [
      'Báo cáo thống kê từ các tổ chức uy tín (UNESCO, Tổng cục Thống kê, nghiên cứu khoa học phản biện)',
      'Lời đồn trên nhóm chat mạng xã hội',
      'Kinh nghiệm cá nhân của một người bạn cùng lớp',
      'Bài viết không rõ tác giả trên blog cá nhân'
    ],
    correctIndex: 0,
    explanation: 'Dẫn chứng có giá trị phản biện phải có phương pháp thu thập dữ liệu minh bạch và được thẩm định độc lập.'
  },
  {
    id: 'med_25',
    difficulty: 'medium',
    category: 'Người rơm (Strawman)',
    situation: '"Minh: Mình ủng hộ việc cho học sinh mang máy tính bảng đến lớp để tra cứu tài liệu. Tuấn: Minh muốn học sinh suốt ngày cắm mặt vào màn hình, đui mù hết mắt à?"',
    question: 'Tuấn đã phạm ngụy biện Người Rơm khi:',
    options: [
      'Quy chụp việc dùng thiết bị học tập thành "suốt ngày cắm mặt đui mù mắt"',
      'Chỉ ra bệnh khúc xạ mắt ở học sinh',
      'Đưa ra giải pháp giảm thời gian nhìn màn hình',
      'Bảo vệ phương pháp ghi chép truyền thống'
    ],
    correctIndex: 0,
    explanation: 'Minh đề xuất công cụ học tập có kiểm soát, Tuấn bóp méo thành hành vi cực đoan hủy hoại thị lực.'
  },
  {
    id: 'med_26',
    difficulty: 'medium',
    category: 'Dốc trượt (Slippery Slope)',
    situation: '"Nếu cho phép các bạn nữ đánh son dưỡng nhẹ đến trường, các bạn sẽ bắt đầu trang điểm lòe loẹt, rồi đua đòi ăn chơi, sa đọa đạo đức!"',
    question: 'Đâu là lỗ hổng logic nghiêm trọng nhất của nhận định này?',
    options: [
      'Gán ghép việc dùng son dưỡng chống nẻ môi với sự sa đọa đạo đức mà không có mắt xích nhân quả',
      'Son dưỡng môi rất đắt tiền',
      'Đánh son là vi phạm pháp luật',
      'Không có lỗi logic nào'
    ],
    correctIndex: 0,
    explanation: 'Chăm sóc sức khỏe môi cơ bản không có mối liên hệ nhân quả trực tiếp dẫn tới sa đọa đạo đức.'
  },
  {
    id: 'med_27',
    difficulty: 'medium',
    category: 'Nhân quả sai (False Cause)',
    situation: '"Mỗi lần có học sinh bị kỷ luật là trời lại đổ mưa lớn. Rõ ràng thời tiết đang bày tỏ sự giận dữ với học sinh đó!"',
    question: 'Sai lầm tư duy ở đây là:',
    options: [
      'Ngụy biện gán ghép hiện tượng tự nhiên ngẫu nhiên với hành vi đạo đức con người',
      'Khoa học khí tượng có mối liên hệ với đạo đức',
      'Học sinh vi phạm có năng lực thay đổi khí hậu',
      'Lập luận có bằng chứng khách quan'
    ],
    correctIndex: 0,
    explanation: 'Thời tiết vận hành theo các quy luật khí tượng thủy văn, hoàn toàn độc lập với kỷ luật học sinh.'
  },
  {
    id: 'med_28',
    difficulty: 'medium',
    category: 'Đánh lạc hướng (Red Herring)',
    situation: '"Thủ quỹ lớp: Bạn ơi nộp tiền quỹ lớp tháng này nhé. Bạn học: Sao cậu cứ hỏi tiền mãi thế, cậu đã xem tập mới phim One Piece hôm qua chưa?"',
    question: 'Thao tác tranh luận của bạn học là:',
    options: [
      'Dùng anime One Piece làm vật đánh lạc hướng để tránh nộp tiền quỹ',
      'Hỏi thăm sở thích của thủ quỹ',
      'Gợi ý đề tài giải trí lành mạnh',
      'Thương lượng tài chính khéo léo'
    ],
    correctIndex: 0,
    explanation: 'Đánh lạc hướng sự chú ý sang một chủ đề giải trí để thoát khỏi nghĩa vụ tài chính tập thể.'
  },
  {
    id: 'med_29',
    difficulty: 'medium',
    category: 'Viện dẫn thẩm quyền sai',
    situation: '"Bác trưởng thôn bảo rằng học sinh không cần học môn Tiếng Anh vì người Việt Nam chỉ cần nói tiếng Việt là đủ giỏi rồi."',
    question: 'Lập luận này yếu vì:',
    options: [
      'Bác trưởng thôn không có chuyên môn về chiến lược hội nhập và phát triển giáo dục toàn cầu',
      'Tiếng Anh là ngôn ngữ duy nhất trên thế giới',
      'Bác trưởng thôn luôn luôn đúng',
      'Người Việt không được học tiếng mẹ đẻ'
    ],
    correctIndex: 0,
    explanation: 'Tiếng Anh là công cụ hội nhập quốc tế mở ra cơ hội tiếp cận tri thức nhân loại, ý kiến cá nhân của bác trưởng thôn không có căn cứ chuyên môn.'
  },
  {
    id: 'med_30',
    difficulty: 'medium',
    category: 'Cấu trúc PEEL',
    situation: '"Một luận điểm tranh biện có chữ \'P\' là \'Point\'. Một Point tốt cần đạt tiêu chí nào?"',
    question: 'Tiêu chuẩn của một Point hiệu quả là:',
    options: [
      'Ngắn gọn, rõ ràng, nêu bật một ý tưởng duy nhất và định hướng trực tiếp lập trường của đội',
      'Càng dài dòng và hoa mỹ càng tốt',
      'Chứa đầy đủ mọi số liệu chi tiết',
      'Chỉ trích đích danh diễn giả đội bạn'
    ],
    correctIndex: 0,
    explanation: 'Point là chiếc mỏ neo định vị, cần sắc bén và ngắn gọn để ban giám khảo và người nghe nắm bắt ngay thông điệp chính.'
  },
  {
    id: 'med_31',
    difficulty: 'medium',
    category: 'Người rơm (Strawman)',
    situation: '"Học sinh A: Cần kiểm tra lại các thiết bị điện trong phòng thí nghiệm. Học sinh B: Cậu muốn đóng cửa phòng thí nghiệm, cấm học sinh thực hành luôn đúng không?"',
    question: 'B đã phạm lỗi Người Rơm bằng cách:',
    options: [
      'Biến đề xuất bảo trì an toàn thành hành vi cấm đoán thực hành cực đoan',
      'Bảo vệ quyền thực hành của học sinh',
      'Đánh giá an toàn điện chuẩn xác',
      'Đưa ra giải pháp kỹ thuật'
    ],
    correctIndex: 0,
    explanation: 'Bảo trì định kỳ là để học sinh thực hành an toàn hơn, không phải để tước đoạt quyền thực hành.'
  },
  {
    id: 'med_32',
    difficulty: 'medium',
    category: 'Dốc trượt (Slippery Slope)',
    situation: '"Nếu tha thứ cho bạn ấy một lần quên thẻ học sinh, ngày mai cả trường sẽ bỏ thẻ ở nhà, rồi người lạ tự do vào trường, và trường học sẽ bị trộm sạch đồ!"',
    question: 'Chuỗi suy diễn trên bị chỉ trích vì:',
    options: [
      'Thổi phồng mức độ nguy hại bằng một chuỗi dốc trượt phi thực tế không có cơ chế trung gian',
      'Rất cảnh giác và có tầm nhìn an ninh sâu sắc',
      'Trường học sẽ bị trộm sạch thật',
      'Không có lỗi logic nào'
    ],
    correctIndex: 0,
    explanation: 'Một quyết định nhắc nhở cá biệt có kiểm soát không thể tự động dẫn tới sự sụp đổ an ninh của toàn trường.'
  },

  // ==========================================
  // 32 CÂU MỨC KHÓ (HARD) - Xúc xắc 5, 6 & Ô Sâu
  // ==========================================
  {
    id: 'hard_01',
    difficulty: 'hard',
    category: 'Phản biện tối ưu',
    situation: '"Đội Ủng hộ đưa ra luận điểm: \'Cần cấm hoàn toàn xe máy xăng của học sinh THPT để bảo vệ môi trường, vì xe máy thải ra khí CO2 gây hiệu ứng nhà kính.\'"',
    question: 'Đâu là đòn phản biện (Rebuttal) sắc bén và triệt để nhất từ phe Phản đối?',
    options: [
      'Chỉ ra tính thiếu khả thi và bất cân xứng: Học sinh ngoại thành chưa có mạng lưới xe buýt công cộng thuận tiện, việc cấm hoàn toàn mà không có giải pháp giao thông thay thế sẽ tước đoạt quyền tiếp cận giáo dục của học sinh nghèo',
      'Nói rằng người lớn cũng đi xe máy xăng đầy đường sao không cấm mà lại cấm học sinh',
      'Bảo rằng khí thải từ xe máy của học sinh chỉ chiếm 0.0001% nên không đáng kể',
      'Chê trách đội Ủng hộ không hiểu gì về đời sống học sinh'
    ],
    correctIndex: 0,
    explanation: 'Đòn phản biện xuất sắc tấn công vào cơ chế thay thế, tính khả thi và hậu quả xã hội bất bình đẳng (trade-off) thay vì ngụy biện né tránh.'
  },
  {
    id: 'hard_02',
    difficulty: 'hard',
    category: 'Phát hiện không ngụy biện',
    situation: '"Xét lập luận sau: \'Theo thống kê của Bộ Y tế năm 2023, việc tiêm chủng đầy đủ vắc-xin sởi cho trẻ em đã giúp giảm 90% số ca biến chứng nặng tại các bệnh viện nhi. Do đó, duy trì chương trình tiêm chủng mở rộng là cần thiết để bảo vệ sức khỏe cộng đồng.\'"',
    question: 'Lập luận trên mắc lỗi ngụy biện nào?',
    options: [
      'KHÔNG mắc lỗi ngụy biện; đây là lập luận quy nạp vững chắc dựa trên dữ liệu thống kê kiểm chứng',
      'Ngụy biện viện dẫn thẩm quyền sai (Argument from False Authority)',
      'Ngụy biện khái quát hóa vội vã (Hasty Generalization)',
      'Ngụy biện người rơm (Strawman)'
    ],
    correctIndex: 0,
    explanation: 'Lập luận có nguồn dữ liệu chuẩn y tế, mẫu quan sát toàn quốc và kết luận hợp lý với mục tiêu bảo vệ sức khỏe cộng đồng.'
  },
  {
    id: 'hard_03',
    difficulty: 'hard',
    category: 'Phân biệt 2 lỗi gần giống',
    situation: '"Tình huống A: \'Mày không hiểu bài thì im đi, đồ ngu!\' vs Tình huống B: \'Lời khuyên của ông ta về tài chính không đáng tin vì ông ta từng bị kết án tội lừa đảo tài chính và chiếm đoạt tài sản.\'"',
    question: 'Phân tích bản chất logic của hai tình huống trên:',
    options: [
      'Tình huống A là ngụy biện công kích cá nhân (Ad Hominem bôi nhọ); Tình huống B là đánh giá tư cách đạo đức liên quan trực tiếp đến độ tin cậy của chuyên môn (hợp lý, không ngụy biện)',
      'Cả hai tình huống đều là ngụy biện công kích cá nhân',
      'Tình huống A là lập luận sắc bén; Tình huống B là ngụy biện',
      'Cả hai đều là ngụy biện người rơm'
    ],
    correctIndex: 0,
    explanation: 'Tiền án lừa đảo tài chính liên quan trực tiếp đến độ tin cậy của lời khuyên tài chính, trong khi xúc phạm "đồ ngu" là thuần túy thóa mạ vô căn cứ.'
  },
  {
    id: 'hard_04',
    difficulty: 'hard',
    category: 'Tìm điểm yếu PEEL',
    situation: '"Luận điểm: \'Nên bỏ các kỳ thi tuyển sinh vào lớp 10 (Point). Vì thi cử gây áp lực nặng nề làm học sinh căng thẳng trầm cảm (Explanation). Dẫn chứng là một bài báo kể về một học sinh bị mất ngủ trước kỳ thi (Evidence). Vì vậy bỏ kỳ thi sẽ làm học sinh hạnh phúc hơn (Link).\'"',
    question: 'Điểm yếu chí mạng nhất trong cấu trúc PEEL của đoạn văn này là gì?',
    options: [
      'Phần Explanation và Evidence mắc bẫy khái quát vội vàng từ 1 bài báo, đồng thời phần Link bỏ qua câu hỏi cốt lõi: \'Nếu bỏ thi thì dùng tiêu chí nào để phân bổ học sinh vào các trường một cách công bằng?\'',
      'Đoạn văn viết câu quá ngắn',
      'Dẫn chứng không có hình ảnh minh họa',
      'Chữ Point viết chưa đủ hoa mỹ'
    ],
    correctIndex: 0,
    explanation: 'Một luận điểm chính sách yếu khi chỉ nói đến mặt hại của cái cũ mà không đưa ra mô hình thay thế khả thi giải quyết được bài toán tuyển sinh công bằng.'
  },
  {
    id: 'hard_05',
    difficulty: 'hard',
    category: 'Phản biện tối ưu',
    situation: '"Phe Ủng hộ: \'Cần phạt lao động công ích nặng đối với mọi học sinh vi phạm bạo lực học đường để răn đe tuyệt đối.\'"',
    question: 'Lời phản biện nào thể hiện tư duy sâu sắc nhất về mặt tâm lý và xã hội?',
    options: [
      'Chỉ phạt lao động công ích chỉ giải quyết phần ngọn; bạo lực học đường thường bắt nguồn từ tổn thương gia đình hoặc bất ổn tâm lý. Nếu không có tham vấn tâm lý song hành, sự trừng phạt công khai còn có thể làm học sinh bị kỳ thị, gia tăng thù hận và tái phạm nặng hơn',
      'Bảo rằng phạt lao động công ích là vi phạm nhân quyền của học sinh',
      'Cho rằng học sinh còn nhỏ tuổi thì làm gì cũng nên bỏ qua hết',
      'Đổ lỗi cho nhà trường không lắp đủ camera giám sát'
    ],
    correctIndex: 0,
    explanation: 'Phản biện đa chiều chỉ ra tác dụng phụ tiêu cực của giải pháp thuần trừng phạt và đề xuất cơ chế can thiệp căn nguyên tâm lý.'
  },
  {
    id: 'hard_06',
    difficulty: 'hard',
    category: 'Phát hiện không ngụy biện',
    situation: '"Xét nhận định: \'Nghiên cứu của Đại học Harvard theo dõi 700 người trong 75 năm chỉ ra rằng mối quan hệ ấm áp, tin cậy là yếu tố quan trọng nhất quyết định sức khỏe và hạnh phúc dài hạn của con người. Do đó, đầu tư thời gian xây dựng tình bạn sâu sắc có ý nghĩa lớn đối với cuộc đời.\'"',
    question: 'Nhận định trên có phạm lỗi logic không?',
    options: [
      'KHÔNG phạm lỗi; nghiên cứu có cỡ mẫu dài hạn lớn (75 năm), phương pháp khoa học chuẩn mực và rút ra hàm ý phù hợp',
      'Phạm lỗi ngụy biện số đông (Ad Populum)',
      'Phạm lỗi viện dẫn thẩm quyền Harvard sai',
      'Phạm lỗi dốc trượt'
    ],
    correctIndex: 0,
    explanation: 'Đây là nghiên cứu Grant Study nổi tiếng trong tâm lý học thực nghiệm, dẫn chứng vững chắc và kết luận hoàn toàn tương xứng với dữ liệu.'
  },
  {
    id: 'hard_07',
    difficulty: 'hard',
    category: 'Phân biệt 2 lỗi gần giống',
    situation: '"Phân biệt giữa ngụy biện \'Dốc trượt\' (Slippery Slope) và \'Dự báo rủi ro có cơ chế\' (Risk Assessment):"',
    question: 'Điểm phân biệt cốt tử nằm ở đâu?',
    options: [
      'Dốc trượt vẽ ra hậu quả thảm họa mà không chứng minh được các mắt xích trung gian; Dự báo rủi ro chỉ ra từng cơ chế cụ thể và xác suất xảy ra dựa trên tiền lệ thực tế',
      'Dốc trượt luôn luôn sai, dự báo rủi ro luôn luôn đúng',
      'Hai khái niệm hoàn toàn giống hệt nhau không có cách phân biệt',
      'Dốc trượt dùng cho học sinh, dự báo rủi ro dùng cho người lớn'
    ],
    correctIndex: 0,
    explanation: 'Sự khác biệt căn bản là cơ chế chứng minh (evidence-based causality): có bằng chứng cho từng bước nhảy hệ quả hay không.'
  },
  {
    id: 'hard_08',
    difficulty: 'hard',
    category: 'Tìm điểm yếu PEEL',
    situation: '"Luận điểm đề xuất: \'Cần lắp điều hòa 100% các lớp học để nâng cao thành tích học tập.\' Phần Explanation giải thích: Nhiệt độ mát mẻ giúp não bộ tập trung hơn. Phần Evidence đưa ra hóa đơn tiền điện của tháng trước."',
    question: 'Lỗ hổng logic ở phần Evidence là gì?',
    options: [
      'Hóa đơn tiền điện tháng trước chỉ chứng minh chi phí năng lượng, hoàn toàn không chứng minh được nhiệt độ mát mẻ có làm tăng điểm thi hay khả năng tiếp thu của học sinh',
      'Hóa đơn tiền điện quá ít số liệu',
      'Học sinh không được xem hóa đơn tiền điện',
      'Điều hòa không cần dùng điện'
    ],
    correctIndex: 0,
    explanation: 'Dẫn chứng bị lệch pha với tuyên bố nhân quả: bằng chứng tài chính không thể đo lường hiệu quả học tập.'
  },
  {
    id: 'hard_09',
    difficulty: 'hard',
    category: 'Phản biện tối ưu',
    situation: '"Ý kiến: \'Nên cấm hoàn toàn trí tuệ nhân tạo (AI) trong mọi kỳ thi và bài tập học đường để đảm bảo tính trung thực tuyệt đối.\'"',
    question: 'Luận điểm phản biện nào mang tính tầm nhìn chiến lược nhất?',
    options: [
      'AI là công cụ thực tế không thể đảo ngược của kỷ nguyên số; thay vì cấm đoán bất khả thi, nhà trường cần thay đổi phương pháp kiểm tra: chuyển từ ghi nhớ máy móc sang đánh giá tư duy phản biện, giải quyết vấn đề thực tế và thuyết trình trực tiếp',
      'Nói rằng AI làm bài nhanh hơn con người nhiều nên cấm là thiệt thòi',
      'Bảo rằng học sinh nào cũng dùng lén được nên cấm không có tác dụng',
      'Chỉ trích giáo viên cổ hủ không bắt kịp thời đại'
    ],
    correctIndex: 0,
    explanation: 'Phản biện đỉnh cao không dừng lại ở việc phản đối mà định hình lại tư duy giáo dục: thay đổi hình thức đánh giá để thích ứng với tương lai.'
  },
  {
    id: 'hard_10',
    difficulty: 'hard',
    category: 'Phát hiện không ngụy biện',
    situation: '"Xét tranh luận: \'Dù bạn Tuấn học giỏi Toán, nhưng bài giải vừa rồi của bạn ở bước thứ 3 bị nhầm dấu âm thành dương, dẫn đến kết quả cuối cùng sai lệch. Vì vậy đáp án này chưa chính xác.\'"',
    question: 'Lời nhận xét trên có phải là công kích cá nhân không?',
    options: [
      'KHÔNG; nhận xét tập trung hoàn toàn vào lỗi kỹ thuật ở bước giải cụ thể, không hề phủ nhận tài năng hay xúc phạm cá nhân bạn Tuấn',
      'Có; đã chê bai bài giải của một bạn học giỏi Toán',
      'Phạm lỗi ngụy biện người rơm',
      'Phạm lỗi ngụy biện hai sai thành một đúng'
    ],
    correctIndex: 0,
    explanation: 'Chỉ ra lỗi sai khách quan trong lập luận toán học là nguyên tắc phản biện lành mạnh, không phải công kích cá nhân.'
  },
  {
    id: 'hard_11',
    difficulty: 'hard',
    category: 'Phân biệt 2 lỗi gần giống',
    situation: '"Phân biệt giữa \'Người rơm\' (Strawman) và \'Đánh lạc hướng\' (Red Herring):"',
    question: 'Điểm khác nhau căn bản là:',
    options: [
      'Người rơm bóp méo, xuyên tạc luận điểm gốc để đánh gục nó; Đánh lạc hướng bỏ mặc luận điểm gốc và chuyển hướng sang một chủ đề hoàn toàn khác',
      'Người rơm dùng cho văn học, đánh lạc hướng dùng cho toán học',
      'Người rơm luôn nói thật, đánh lạc hướng luôn nói dối',
      'Hai lỗi này là một, chỉ khác tên gọi'
    ],
    correctIndex: 0,
    explanation: 'Strawman vẫn xoay quanh chủ đề nhưng xuyên tạc nó; Red Herring lôi kéo người nghe rời bỏ hẳn chủ đề đang tranh luận.'
  },
  {
    id: 'hard_12',
    difficulty: 'hard',
    category: 'Tìm điểm yếu PEEL',
    situation: '"Luận điểm: \'Nên cho học sinh lớp 12 tự học ở nhà vào học kỳ II.\' Phần Giải thích: Học ở nhà tự do hơn. Phần Dẫn chứng: Nhà em có phòng học riêng rất yên tĩnh. Phần Link: Vì vậy toàn bộ học sinh lớp 12 cả nước nên ở nhà tự học."',
    question: 'Lỗ hổng lớn nhất ở luận điểm này là:',
    options: [
      'Mắc bẫy thiên kiến vị kỷ (Egocentric Bias) và khái quát hóa từ điều kiện gia đình cá nhân lý tưởng cho toàn bộ học sinh có hoàn cảnh đa dạng',
      'Phần Point viết chưa đủ dài',
      'Không trích dẫn câu danh ngôn nào',
      'Phần Link không có số liệu'
    ],
    correctIndex: 0,
    explanation: 'Không phải học sinh nào cũng có điều kiện tự học lý tưởng (không gian yên tĩnh, tính tự giác cao, có người hướng dẫn).'
  },
  {
    id: 'hard_13',
    difficulty: 'hard',
    category: 'Phản biện tối ưu',
    situation: '"Quan điểm: \'Học sinh THPT không nên tham gia các hoạt động tình nguyện xã hội vì việc quan trọng duy nhất lúc này là điểm số thi đại học.\'"',
    question: 'Phản biện nào bộc lộ tầm nhìn toàn diện nhất về giáo dục?',
    options: [
      'Điểm số chỉ là một phần của hồ sơ; hoạt động tình nguyện rèn luyện sự thấu cảm, kỹ năng làm việc nhóm, quản lý dự án và mở rộng vốn sống – những năng lực cốt lõi giúp thích ứng và thành công ở bậc đại học và thị trường lao động tương lai',
      'Tình nguyện vui hơn học nên cứ đi chơi thoải mái',
      'Bảo rằng thi đại học thời nay rất dễ đỗ',
      'Chỉ trích người phản đối là ích kỷ hẹp hòi'
    ],
    correctIndex: 0,
    explanation: 'Chứng minh được hoạt động tình nguyện bổ trợ đắc lực cho năng lực đường dài chứ không triệt tiêu mục tiêu học tập.'
  },
  {
    id: 'hard_14',
    difficulty: 'hard',
    category: 'Phát hiện không ngụy biện',
    situation: '"Một nhà nghiên cứu kết luận: \'Dữ liệu đối chứng ngẫu nhiên trên 1.000 bệnh nhân cho thấy loại thuốc mới này rút ngắn thời gian điều trị trung bình 3 ngày so với giả dược (p < 0.01). Do đó thuốc có hiệu quả sinh học thực sự.\'"',
    question: 'Tính logic của kết luận này như thế nào?',
    options: [
      'Hoàn toàn chuẩn mực khoa học (có nhóm đối chứng ngẫu nhiên double-blind, chỉ số thống kê p-value có ý nghĩa)',
      'Phạm lỗi ngụy biện khái quát vội vàng',
      'Phạm lỗi ngụy biện viện dẫn quyền uy',
      'Phạm lỗi ngụy biện đánh tráo khái niệm'
    ],
    correctIndex: 0,
    explanation: 'Thử nghiệm lâm sàng có đối chứng ngẫu nhiên (RCT) với kiểm định thống kê p < 0.01 là tiêu chuẩn vàng của khoa học thực nghiệm.'
  },
  {
    id: 'hard_15',
    difficulty: 'hard',
    category: 'Phân biệt 2 lỗi gần giống',
    situation: '"Phân biệt giữa ngụy biện \'Nhị nguyên sai\' (False Dilemma) và \'Lựa chọn đánh đổi thực tế\' (Trade-off):"',
    question: 'Điểm khác biệt chính là:',
    options: [
      'Nhị nguyên sai cố tình giả mạo rằng chỉ có 2 thái cực loại trừ nhau; Trade-off phản ánh giới hạn thực tế về nguồn lực (thời gian, ngân sách) buộc phải cân đối và ưu tiên',
      'Trade-off là ngụy biện, Nhị nguyên sai là khoa học',
      'Hai khái niệm giống nhau hoàn toàn',
      'Trade-off chỉ dùng trong kinh doanh'
    ],
    correctIndex: 0,
    explanation: 'Ngân sách hay thời gian là hữu hạn (ví dụ có 24 giờ/ngày thì ngủ 8 tiếng nghĩa là còn 16 tiếng) là sự thật đánh đổi, không phải nhị nguyên sai.'
  },
  {
    id: 'hard_16',
    difficulty: 'hard',
    category: 'Tìm điểm yếu PEEL',
    situation: '"Luận điểm: \'Nên tăng học phí trường công để cải thiện cơ sở vật chất.\' Giải thích: Có tiền sẽ mua máy tính mới. Dẫn chứng: Trường tư thục B học phí cao có sân bóng đá rất đẹp. Link: Do đó tăng học phí trường công là giải pháp tốt nhất.\'"',
    question: 'Điểm nghẽn logic nghiêm trọng nhất ở đây là:',
    options: [
      'Bỏ qua sứ mệnh an sinh của trường công lập: tăng học phí sẽ tước đoạt cơ hội đến trường của học sinh có hoàn cảnh khó khăn, tạo rào cản bất bình đẳng xã hội',
      'Sân bóng đá trường tư thục không đẹp bằng trường công',
      'Máy tính mới không cần thiết',
      'Chưa phỏng vấn hiệu trưởng trường tư thục B'
    ],
    correctIndex: 0,
    explanation: 'Bản chất trường công lập là phổ cập giáo dục công bằng, so sánh cơ học với mô hình trường tư thục thương mại là sai lầm cốt lõi.'
  },
  {
    id: 'hard_17',
    difficulty: 'hard',
    category: 'Phản biện tối ưu',
    situation: '"Quan điểm ủng hộ: \'Nên kiểm tra cặp sách và điện thoại của tất cả học sinh đầu mỗi buổi học để đảm bảo không ai mang vũ khí hoặc chất cấm.\'"',
    question: 'Đòn phản biện sắc bén nhất từ góc độ văn hóa học đường và pháp lý là:',
    options: [
      'Biện pháp này biến môi trường giáo dục thành nhà tù, phá vỡ niềm tin giữa thầy và trò, vi phạm quyền riêng tư và tạo tâm lý thù địch, trong khi có thể giải quyết bằng cổng từ an ninh và tham vấn tâm lý',
      'Bảo rằng cặp sách học sinh toàn đồ bẩn không ai muốn sờ vào',
      'Nói rằng học sinh thích mang gì là quyền tự do không ai được cấm',
      'Đổ lỗi cho bác bảo vệ làm việc lười biếng'
    ],
    correctIndex: 0,
    explanation: 'Phản biện sâu sắc chứng minh cái giá phải trả (xói mòn niềm tin, xâm hại nhân phẩm) lớn hơn nhiều so với lợi ích an ninh hạn hẹp.'
  },
  {
    id: 'hard_18',
    difficulty: 'hard',
    category: 'Phát hiện không ngụy biện',
    situation: '"Học sinh phát biểu: \'Sau khi đối chiếu kết quả khảo sát ẩn danh 500 bạn trong trường, 75% cho biết căng thẳng tâm lý tăng cao trong mùa thi vì thiếu phòng tự học yên tĩnh. Vì vậy em đề xuất mở cửa phòng đọc vào buổi tối.\'"',
    question: 'Lập luận của học sinh này có giá trị logic như thế nào?',
    options: [
      'Lập luận thực chứng vững chắc, có khảo sát mẫu đủ lớn, bảo mật danh tính và đề xuất gắn kết trực tiếp với nhu cầu được phản ánh',
      'Phạm lỗi ngụy biện theo số đông (Ad Populum)',
      'Phạm lỗi ngụy biện khái quát vội vàng',
      'Phạm lỗi ngụy biện người rơm'
    ],
    correctIndex: 0,
    explanation: 'Khảo sát ẩn danh nội bộ trường học với tỷ lệ mẫu lớn (500 học sinh) là căn cứ thực nghiệm vững chắc cho đề xuất chính sách học đường.'
  },
  {
    id: 'hard_19',
    difficulty: 'hard',
    category: 'Phân biệt 2 lỗi gần giống',
    situation: '"Phân biệt giữa \'Lý lẽ hợp lý dựa vào thẩm quyền\' và \'Ngụy biện dựa vào thẩm quyền giả mạo\':"',
    question: 'Tiêu chí đánh giá là:',
    options: [
      'Chuyên gia đó có bằng cấp chuyên môn đúng lĩnh vực, nghiên cứu được đồng nghiệp thẩm định (peer-reviewed) và không có xung đột lợi ích tài chính',
      'Chuyên gia đó có nhiều người theo dõi trên mạng xã hội',
      'Chuyên gia đó là người lớn tuổi hơn',
      'Chuyên gia đó nói giọng truyền cảm'
    ],
    correctIndex: 0,
    explanation: 'Đúng chuyên môn, có sự đồng thuận khoa học trong ngành và minh bạch lợi ích là ranh giới giữa thẩm quyền thực sự và ngụy biện.'
  },
  {
    id: 'hard_20',
    difficulty: 'hard',
    category: 'Tìm điểm yếu PEEL',
    situation: '"Một bài luận có Point: \'Học trực tuyến tốt hơn học trực tiếp\'. Explanation: \'Vì ngồi ở nhà thoải mái mát mẻ\'. Evidence: \'Em cảm thấy vui hơn\'. Link: \'Vậy học trực tuyến vượt trội hơn.\'"',
    question: 'Phân tích điểm yếu chí mạng của bài viết:',
    options: [
      'Toàn bộ bài viết dựa trên cảm xúc cá nhân hạn hẹp (Subjective Feelings), hoàn toàn bỏ qua các tiêu chí đo lường giáo dục: chất lượng tương tác, thí nghiệm thực hành, kỷ luật tự giác và sức khỏe tâm thần',
      'Bài viết dùng từ ngữ chưa đủ trang trọng',
      'Cần thêm 10 bức ảnh chụp màn hình máy tính',
      'Không có lỗi nào vì học ở nhà thoải mái thật'
    ],
    correctIndex: 0,
    explanation: 'Đo lường chất lượng một phương thức giáo dục phải dựa trên kết quả đầu ra học tập và tương tác xã hội, không thể dựa vào sự thoải mái cá nhân.'
  },
  {
    id: 'hard_21',
    difficulty: 'hard',
    category: 'Phản biện tối ưu',
    situation: '"Kiến nghị: \'Nhà này sẽ phạt tiền phụ huynh khi học sinh trốn học nhiều ngày.\'"',
    question: 'Phản biện nào làm sụp đổ hoàn toàn cơ chế của phe Ủng hộ?',
    options: [
      'Học sinh trốn học thường xuất phát từ gia đình nghèo khó, bất hòa hoặc thiếu sự quan tâm. Phạt tiền làm kiệt quệ tài chính gia đình, khiến phụ huynh trút giận lên học sinh và đẩy các em bỏ học hẳn thay vì quay lại trường',
      'Phụ huynh không có nghĩa vụ quản lý con cái',
      'Trường học không có tài khoản ngân hàng để nhận tiền phạt',
      'Học sinh trốn học là chuyện bình thường tuổi mới lớn'
    ],
    correctIndex: 0,
    explanation: 'Chỉ ra nghịch lý chính sách (perverse incentive): biện pháp trừng phạt tài chính trực tiếp làm trầm trọng thêm nguyên nhân gốc rễ của vấn đề.'
  },
  {
    id: 'hard_22',
    difficulty: 'hard',
    category: 'Phát hiện không ngụy biện',
    situation: '"Thầy giáo phân tích: \'Nếu các em không đeo kính bảo hộ khi làm thí nghiệm Axit Sunfuric đặc, giọt axit bắn vào mắt có thể làm bỏng giác mạc không thể phục hồi theo các phản ứng ăn mòn hóa học đã biết. Vì vậy đeo kính là bắt buộc.\'"',
    question: 'Cảnh báo của thầy giáo có phải ngụy biện dốc trượt không?',
    options: [
      'KHÔNG; đây là quy tắc an toàn phòng thí nghiệm dựa trên cơ chế phản ứng hóa học thực tế đã được chứng minh khoa học',
      'Có; thầy đang đe dọa làm học sinh sợ hãi',
      'Phạm lỗi ngụy biện người rơm',
      'Phạm lỗi ngụy biện nhị nguyên sai'
    ],
    correctIndex: 0,
    explanation: 'Axit ăn mòn mô sinh học là cơ chế vật lý hóa học trực tiếp, cảnh báo dựa trên khoa học phòng hộ chứ không phải suy diễn viển vông.'
  },
  {
    id: 'hard_23',
    difficulty: 'hard',
    category: 'Phân biệt 2 lỗi gần giống',
    situation: '"Phân biệt \'Tương quan thống kê\' (Correlation) và \'Quan hệ nhân quả\' (Causation):"',
    question: 'Mệnh đề nào diễn giải chuẩn xác nhất?',
    options: [
      'Hai hiện tượng biến thiên cùng chiều chỉ là tương quan; để khẳng định nhân quả bắt buộc phải chứng minh được cơ chế tác động trực tiếp và loại trừ các biến số thứ ba',
      'Tương quan chính là nhân quả nhưng ở mức độ nhẹ hơn',
      'Tương quan luôn là ngụy biện, nhân quả luôn là chân lý',
      'Không có cách nào phân biệt được trong thực tế'
    ],
    correctIndex: 0,
    explanation: 'Ví dụ doanh số bán kem và số vụ chết đuối cùng tăng vào mùa hè (tương quan do thời tiết nóng), nhưng ăn kem không phải nguyên nhân gây chết đuối.'
  },
  {
    id: 'hard_24',
    difficulty: 'hard',
    category: 'Tìm điểm yếu PEEL',
    situation: '"Trong một bài biện luận về việc cấm đồ uống có đường ở trường học, đội tranh biện đưa ra dẫn chứng số người mắc bệnh tiểu đường ở người cao tuổi."',
    question: 'Lỗi đối sánh dẫn chứng ở đây là gì?',
    options: [
      'Thiếu tính liên đới nhóm đối tượng: Học sinh THPT có thể trạng và thói quen sinh hoạt khác người già, dẫn chứng thiếu số liệu trực tiếp về học sinh và nguy cơ béo phì học đường',
      'Người già không bao giờ uống nước ngọt',
      'Tiểu đường không liên quan đến đường',
      'Học sinh không thể mắc bệnh gì'
    ],
    correctIndex: 0,
    explanation: 'Dẫn chứng phải gắn liền trực tiếp với đối tượng của kiến nghị (học sinh THPT) mới tạo nên sức nặng thuyết phục.'
  },
  {
    id: 'hard_25',
    difficulty: 'hard',
    category: 'Phản biện tối ưu',
    situation: '"Ý kiến: \'Nên phân loại lớp học hoàn toàn theo học lực từ đầu cấp 3 để học sinh giỏi không bị bạn học kém kéo lùi.\'"',
    question: 'Phản biện sắc sảo nhất từ góc độ giáo dục bình đẳng và kỹ năng xã hội là:',
    options: [
      'Mô hình tách biệt hoàn toàn sẽ tạo ra hiệu ứng gắn nhãn tiêu cực (Labeling Effect), triệt tiêu động lực của lớp yếu, đồng thời tước bỏ môi trường tương trợ đa dạng – nơi học sinh giỏi rèn luyện kỹ năng hướng dẫn, thấu cảm và học sinh yếu có tấm gương phấn đấu',
      'Bảo rằng học sinh nào cũng thông minh như nhau không cần phân loại',
      'Nói rằng thầy cô sẽ lười chấm điểm nếu chia lớp',
      'Chỉ trích nhà trường thiếu phòng học'
    ],
    correctIndex: 0,
    explanation: 'Phản biện bóc tách tâm lý học giáo dục: hiệu ứng nhãn dán tiêu cực làm giảm sút lòng tự trọng và cản trở sự phát triển toàn diện của học sinh.'
  },
  {
    id: 'hard_26',
    difficulty: 'hard',
    category: 'Phát hiện không ngụy biện',
    situation: '"Xét nhận định: \'Nghiên cứu của Viện Dinh dưỡng Quốc gia trên 2.000 học sinh THPT cho thấy bỏ bữa sáng làm giảm 30% tốc độ xử lý bài tập tư duy vào buổi sáng. Vì vậy học sinh cần ăn sáng đầy đủ trước khi đến trường.\'"',
    question: 'Đoạn văn trên có tính chất logic thế nào?',
    options: [
      'Lập luận có bằng chứng khoa học vững vàng, mẫu số liệu đủ lớn và khuyến nghị thực tế sát sườn',
      'Ngụy biện dựa vào số đông',
      'Ngụy biện dốc trượt phi lý',
      'Ngụy biện công kích cá nhân'
    ],
    correctIndex: 0,
    explanation: 'Có cơ quan nghiên cứu uy tín, mẫu khảo sát 2.000 học sinh THPT và kết luận phù hợp với cơ chế sinh học về cung cấp đường huyết cho não bộ.'
  },
  {
    id: 'hard_27',
    difficulty: 'hard',
    category: 'Phân biệt 2 lỗi gần giống',
    situation: '"Phân biệt giữa \'Tam đoạn luận hợp lệ\' (Valid Syllogism) và \'Tam đoạn luận đúng sự thật\' (Sound Syllogism):"',
    question: 'Một tam đoạn luận được coi là Sound (hoàn hảo) khi nào?',
    options: [
      'Khi cấu trúc suy luận tuân thủ đúng quy tắc logic (Valid) VÀ tất cả các tiền đề đều đúng với thực tế khách quan (True Premises)',
      'Chỉ cần kết luận nghe có vẻ hợp lý',
      'Chỉ cần tiền đề dài trên 3 câu',
      'Hai khái niệm hoàn toàn trùng khít'
    ],
    correctIndex: 0,
    explanation: 'Một suy luận có thể chuẩn về cấu trúc nhưng sai tiền đề (ví dụ: Mọi loài chim biết bay, gà là chim -> gà bay như đại bàng: hợp lệ hình thức nhưng sai thực tế).'
  },
  {
    id: 'hard_28',
    difficulty: 'hard',
    category: 'Tìm điểm yếu PEEL',
    situation: '"Luận điểm: \'Nên trang bị máy lọc không khí cho mọi phòng học\'. Explanation: \'Không khí sạch tốt cho sức khỏe\'. Evidence: \'Nhiều chuyên gia cho biết bụi mịn PM2.5 rất nguy hiểm\'. Link: \'Do đó trường học nên mua ngay máy lọc.\'"',
    question: 'Khoảng trống lập luận ở đây là gì?',
    options: [
      'Chưa chứng minh được máy lọc không khí có thực sự giải quyết được bụi mịn trong điều kiện cửa sổ lớp học thường xuyên mở thông gió hay không',
      'Không nêu nhãn hiệu máy lọc không khí cụ thể',
      'Bụi mịn không nguy hiểm đối với học sinh',
      'Học sinh không cần hít thở không khí sạch'
    ],
    correctIndex: 0,
    explanation: 'Một giải pháp kỹ thuật cần được chứng minh tính hiệu quả trong môi trường thực địa (lớp học đông người, mở cửa thông gió liên tục).'
  },
  {
    id: 'hard_29',
    difficulty: 'hard',
    category: 'Phản biện tối ưu',
    situation: '"Kiến nghị: \'Nhà này sẽ loại bỏ hoàn toàn các kỳ thi xếp hạng học sinh ở bậc THPT.\'"',
    question: 'Luận điểm bảo vệ việc giữ lại kỳ thi chuẩn hóa có sức nặng nhất là:',
    options: [
      'Kỳ thi chuẩn hóa khách quan là công cụ công bằng nhất giúp học sinh nghèo hoặc vùng xa khẳng định năng lực mà không bị phụ thuộc vào định kiến chủ quan của giáo viên địa phương',
      'Học sinh nếu không thi thì sẽ ngủ cả ngày',
      'Bỏ thi thì giáo viên không có việc gì làm',
      'Mọi trường đại học đều bắt buộc phải có điểm thi'
    ],
    correctIndex: 0,
    explanation: 'Bảo vệ giá trị bình đẳng xã hội: bài thi chuẩn hóa khách quan bảo vệ người yếu thế trước sự thiên vị chủ quan.'
  },
  {
    id: 'hard_30',
    difficulty: 'hard',
    category: 'Phát hiện không ngụy biện',
    situation: '"Xét phát biểu: \'Thuật toán mã hóa RSA được xây dựng trên độ phức tạp của bài toán phân tích một số nguyên cực lớn thành tích các thừa số nguyên tố. Cho đến nay chưa có thuật toán cổ điển nào giải quyết bài toán này trong thời gian đa thức.\'"',
    question: 'Phát biểu toán học - mật mã học này:',
    options: [
      'Là mệnh đề khoa học khách quan mô tả thực trạng an toàn mật mã học hiện nay',
      'Phạm ngụy biện viện dẫn sự thiếu hiểu biết (Argument from Ignorance)',
      'Phạm ngụy biện khái quát vội vàng',
      'Phạm ngụy biện dốc trượt'
    ],
    correctIndex: 0,
    explanation: 'Đây là sự thật toán học nền tảng của ngành an toàn thông tin, không chứa đựng yếu tố ngụy biện.'
  },
  {
    id: 'hard_31',
    difficulty: 'hard',
    category: 'Phân biệt 2 lỗi gần giống',
    situation: '"Phân biệt giữa ngụy biện \'Anh cũng vậy\' (Tu Quoque) và việc chỉ ra \'Sự mâu thuẫn trong lập trường nguyên tắc\' (Principle Inconsistency):"',
    question: 'Điểm khác biệt tinh tế là:',
    options: [
      'Tu Quoque lấy thói quen cá nhân để lấp liếm lỗi sai; Chỉ ra mâu thuẫn nguyên tắc chứng minh hệ thống giá trị của đối phương tự triệt tiêu lẫn nhau trong chính ca tranh biện của họ',
      'Hai chiêu thức này giống nhau hoàn toàn',
      'Tu Quoque luôn được chấp nhận trong tranh biện WSDC',
      'Mâu thuẫn nguyên tắc chỉ dùng cho toán học'
    ],
    correctIndex: 0,
    explanation: 'Chỉ ra đối thủ tự mâu thuẫn về mặt triết lý nguyên tắc (ví dụ: vừa đòi hỏi tự do cá nhân tuyệt đối vừa đòi cấm đoán người khác) là đòn phản biện hợp lệ cao cấp.'
  },
  {
    id: 'hard_32',
    difficulty: 'hard',
    category: 'Tìm điểm yếu PEEL',
    situation: '"Luận điểm: \'Nên cấm mạng xã hội đối với người dưới 16 tuổi vì thuật toán gây nghiện làm giảm năng suất học tập\'. Evidence: Khảo sát tại 5 trường học ở Anh cho thấy thời gian học bài giảm 25% ở nhóm dùng mạng xã hội trên 4 tiếng/ngày."',
    question: 'Điểm cần củng cố thêm để luận điểm này hoàn toàn thuyết phục là:',
    options: [
      'Cần chứng minh tính khả thi của lệnh cấm (làm thế nào để xác minh độ tuổi chính xác mà không xâm phạm quyền riêng tư dữ liệu cá nhân của học sinh)',
      'Cần thêm lời khen cho mạng xã hội',
      'Bỏ phần giải thích về thuật toán gây nghiện',
      'Đổi số liệu từ nước Anh sang số liệu tự bịa'
    ],
    correctIndex: 0,
    explanation: 'Một kiến nghị chính sách (Policy Motion) không chỉ cần chứng minh vấn đề tồn tại mà bắt buộc phải chỉ ra tính khả thi (feasibility) của giải pháp đề xuất.'
  }
];

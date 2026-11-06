/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BỘ ĐỀ KIỂM TRA CHẨN ĐOÁN NĂNG LỰC TƯ DUY PHẢN BIỆN (20 CÂU - 15 PHÚT)
 * Gồm 2 bộ đề tương đương song song: Bộ A (Đầu vào) và Bộ B (Đánh giá sau 4 tuần).
 * Bao phủ 5 nhóm năng lực cốt lõi:
 * 1. Nhận ra giả định ngầm (implicit_assumptions) - 4 câu
 * 2. Suy luận có hợp lệ không (logical_validity) - 4 câu
 * 3. Đánh giá độ mạnh của bằng chứng (evidence_strength) - 4 câu
 * 4. Nhận ra ngụy biện (fallacy_recognition) - 4 câu
 * 5. Phân biệt sự thật với ý kiến (fact_vs_opinion) - 4 câu
 */

export type DiagnosticSkillGroupKey = 
  | 'implicit_assumptions'
  | 'logical_validity'
  | 'evidence_strength'
  | 'fallacy_recognition'
  | 'fact_vs_opinion';

export interface DiagnosticQuestion {
  id: string;
  groupKey: DiagnosticSkillGroupKey;
  groupName: string;
  contextScenario: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const DIAGNOSTIC_GROUP_INFO: Record<DiagnosticSkillGroupKey, { name: string; description: string; shortLabel: string }> = {
  implicit_assumptions: {
    name: 'Nhận ra giả định ngầm',
    shortLabel: 'Giả định ngầm',
    description: 'Khả năng bóc trần những tiền đề ẩn mà người nói mặc định là đúng dù chưa chứng minh.'
  },
  logical_validity: {
    name: 'Suy luận hợp lệ',
    shortLabel: 'Suy luận logic',
    description: 'Đánh giá tính hợp lệ của mối liên kết nhân quả, tam đoạn luận và logic hình thức.'
  },
  evidence_strength: {
    name: 'Đánh giá độ mạnh bằng chứng',
    shortLabel: 'Độ mạnh bằng chứng',
    description: 'Phân định độ tin cậy của nguồn số liệu, tính đại diện của mẫu khảo sát và tính khách quan.'
  },
  fallacy_recognition: {
    name: 'Nhận ra ngụy biện',
    shortLabel: 'Nhận diện ngụy biện',
    description: 'Phát hiện chính xác các bẫy ngụy biện tâm lý, nhị nguyên giả, dốc trượt và công kích.'
  },
  fact_vs_opinion: {
    name: 'Phân biệt sự thật vs ý kiến',
    shortLabel: 'Sự thật & Ý kiến',
    description: 'Phân định rõ ràng giữa dữ kiện thực chứng khách quan và cảm nhận, phán xét chủ quan.'
  }
};

// ==========================================
// BỘ ĐỀ A (PRE-TEST: ĐẦU VÀO) - 20 CÂU
// ==========================================
export const DIAGNOSTIC_SET_A: DiagnosticQuestion[] = [
  // --- NHÓM 1: NHẬN RA GIẢ ĐỊNH NGẦM (Câu 1 - 4) ---
  {
    id: 'qa_01',
    groupKey: 'implicit_assumptions',
    groupName: 'Nhận ra giả định ngầm',
    contextScenario: 'Trong buổi họp phụ huynh đầu năm, một phụ huynh phát biểu: "Lớp 11A1 là lớp chọn Toán của trường, vì vậy tất cả các cháu sau này nhất định sẽ thi đỗ vào các trường đại học khối kinh tế - kỹ thuật hàng đầu."',
    questionText: 'Phát biểu trên dựa trên giả định ngầm nào dưới đây?',
    options: [
      'Học sinh lớp chọn Toán không có hứng thú với các ngành khoa học xã hội hay nghệ thuật.',
      'Năng lực học giỏi môn Toán ở phổ thông là điều kiện bảo đảm duy nhất hoặc quyết định để đỗ đại học hàng đầu.',
      'Đại học hàng đầu chỉ tuyển sinh dựa trên bài thi môn Toán.',
      'Tất cả học sinh lớp 11A1 đều chăm chỉ học thêm ngoài giờ.'
    ],
    correctIndex: 1,
    explanation: 'Người nói suy từ "lớp chọn Toán" sang kết luận "chắc chắn đỗ đại học hàng đầu", ngầm mặc định rằng năng lực học tốt Toán thời phổ thông là yếu tố bảo đảm chắc chắn việc trúng tuyển đại học top đầu, bỏ qua các yếu tố môn thi khác, ý chí cá nhân, định hướng nghề nghiệp và phương thức xét tuyển đa dạng.'
  },
  {
    id: 'qa_02',
    groupKey: 'implicit_assumptions',
    groupName: 'Nhận ra giả định ngầm',
    contextScenario: 'Trong nhóm Zalo thảo luận kế hoạch làm video truyền thông cho hội trại trường, bạn trưởng nhóm nhắn: "Chúng ta nên mời bạn Nam đóng vai chính vì trang cá nhân TikTok của bạn ấy có hơn 100.000 lượt theo dõi."',
    questionText: 'Ý kiến của trưởng nhóm đã dựa trên giả định ngầm nào?',
    options: [
      'Số lượng người theo dõi trên mạng xã hội tỷ lệ thuận với khả năng diễn xuất và phù hợp với thông điệp của video.',
      'Bạn Nam chắc chắn sẽ đồng ý tham gia không điều kiện.',
      'Các bạn khác trong lớp không có ai dùng mạng xã hội.',
      'Hội trại trường bắt buộc phải có video triệu view.'
    ],
    correctIndex: 0,
    explanation: 'Trưởng nhóm đề xuất chọn Nam đóng vai chính chỉ vì Nam có lượng follower lớn, ngầm giả định rằng người có đông follower thì sẽ có diễn xuất tốt hoặc giúp video hội trại đạt mục tiêu truyền thông, dù hai năng lực này không nhất thiết đi kèm nhau.'
  },
  {
    id: 'qa_03',
    groupKey: 'implicit_assumptions',
    groupName: 'Nhận ra giả định ngầm',
    contextScenario: 'Một bài viết chia sẻ phương pháp học: "Em chỉ cần mua bộ sách tham khảo này và làm hết các đề luyện thi thì kỳ thi đánh giá năng lực sắp tới chắc chắn sẽ nằm trong top 5% toàn quốc."',
    questionText: 'Tác giả bài viết ngầm coi điều nào sau đây là hiển nhiên đúng?',
    options: [
      'Tất cả đề luyện thi trong sách đều được lấy từ ngân hàng đề thi chính thức.',
      'Kỳ thi đánh giá năng lực chỉ kiểm tra kiến thức có trong bộ sách tham khảo và phương pháp giải đề một chiều.',
      'Đọc sách tham khảo là cách duy nhất để tiếp thu kiến thức tư duy phản biện.',
      'Người mua sách sẽ không xem lại lời giải chi tiết.'
    ],
    correctIndex: 1,
    explanation: 'Lời khẳng định chắc nịch "chắc chắn nằm trong top 5%" ngầm giả định đề thi chỉ đóng khung trong những bài luyện của cuốn sách, và việc giải hết đề đồng nghĩa với việc đã thành thạo mọi năng lực tư duy mà bài thi đánh giá.'
  },
  {
    id: 'qa_04',
    groupKey: 'implicit_assumptions',
    groupName: 'Nhận ra giả định ngầm',
    contextScenario: 'Giáo viên chủ nhiệm nhắc nhở học sinh: "Em cần phải giảm bớt thời gian chơi đàn guitar lại để tập trung toàn lực cho việc học văn hóa, nếu không sau này tương lai sẽ rất bấp bênh."',
    questionText: 'Lời nhắc nhở của giáo viên chứa giả định ngầm nào dưới đây?',
    options: [
      'Học đàn guitar hoàn toàn không mang lại giá trị nào cho tư duy hay nghề nghiệp tương lai, và thời gian dành cho nghệ thuật đang lấy mất cơ hội thành công của học tập văn hóa.',
      'Chơi đàn guitar là sở thích tốn kém chi phí của học sinh THPT.',
      'Học sinh này không có năng khiếu âm nhạc.',
      'Mọi học sinh giỏi văn hóa đều không có năng khiếu văn nghệ.'
    ],
    correctIndex: 0,
    explanation: 'Giáo viên ngầm cho rằng thời gian luyện đàn không hỗ trợ tương lai và chỉ có học các môn văn hóa trên lớp mới là con đường bảo đảm tương lai vững vàng, xem hai hoạt động này triệt tiêu lẫn nhau.'
  },

  // --- NHÓM 2: SUY LUẬN CÓ HỢP LỆ KHÔNG (Câu 5 - 8) ---
  {
    id: 'qa_05',
    groupKey: 'logical_validity',
    groupName: 'Suy luận hợp lệ',
    contextScenario: 'Cho hai tiền đề sau:\n1. Mọi thành viên của Đội tuyển Tranh biện trường đều phải vượt qua vòng phỏng vấn tư duy logic.\n2. Bạn Hương đã vượt qua vòng phỏng vấn tư duy logic.',
    questionText: 'Từ hai tiền đề trên, kết luận: "Bạn Hương chắc chắn là thành viên của Đội tuyển Tranh biện trường" là đúng hay sai về mặt logic?',
    options: [
      'Hợp lệ: vì Hương đã đạt đủ tiêu chuẩn nêu trong tiền đề 1.',
      'Không hợp lệ: vì việc vượt qua phỏng vấn chỉ là điều kiện cần, có thể còn các vòng xét duyệt khác hoặc Hương chọn không gia nhập.',
      'Hợp lệ: vì đây là tam đoạn luận chuẩn khẳng định tiền đề.',
      'Không thể xác định vì không biết Hương học lớp mấy.'
    ],
    correctIndex: 1,
    explanation: 'Đây là lỗi ngụy biện hình thức "Khẳng định hậu quả" (Affirming the consequent). Mọi thành viên đội tuyển đều qua phỏng vấn (A -> B), Hương qua phỏng vấn (B), không thể kết luận Hương là thành viên đội tuyển (A).'
  },
  {
    id: 'qa_06',
    groupKey: 'logical_validity',
    groupName: 'Suy luận hợp lệ',
    contextScenario: 'Xét chuỗi suy luận sau:\n- Tiền đề 1: Nếu thời tiết sáng mai có mưa lớn, nhà trường sẽ hoãn lễ chào cờ ngoài sân.\n- Tiền đề 2: Sáng mai trời nắng ráo, hoàn toàn không có mưa.\n- Kết luận: Nhà trường chắc chắn sẽ không hoãn lễ chào cờ ngoài sân.',
    questionText: 'Lập luận trên có giá trị logic như thế nào?',
    options: [
      'Hoàn toàn chặt chẽ và hợp lệ theo phép loại trừ.',
      'Không hợp lệ, mắc lỗi "Phủ định tiền đề" (Denying the antecedent), vì nhà trường có thể hoãn chào cờ vì lý do khác như cắt điện, sự kiện đột xuất.',
      'Hợp lệ, vì thời tiết nắng thì không có lý do gì để hủy sự kiện ngoài trời.',
      'Không hợp lệ chỉ khi có thông báo của Ban Giám hiệu.'
    ],
    correctIndex: 1,
    explanation: 'Nếu P thì Q (Mưa -> Hoãn). Không P (Không mưa) không suy ra được Không Q, vì Q có thể xảy ra do nhiều nguyên nhân khác (lỗi Phủ định tiền đề).'
  },
  {
    id: 'qa_07',
    groupKey: 'logical_validity',
    groupName: 'Suy luận hợp lệ',
    contextScenario: 'Cho các tiền đề sau:\n- Không có học sinh nào bị kỷ luật được xét danh hiệu Học sinh 3 Tốt.\n- Tuấn là học sinh đạt danh hiệu Học sinh 3 Tốt cấp trường.',
    questionText: 'Kết luận nào sau đây được rút ra một cách HỢP LỆ VÀ CHẮC CHẮN từ hai tiền đề trên?',
    options: [
      'Tuấn là học sinh có điểm trung bình học tập cao nhất khối.',
      'Tuấn chắc chắn chưa từng bị kỷ luật.',
      'Tuấn là thành viên Ban Chấp hành Đoàn trường.',
      'Mọi học sinh không bị kỷ luật đều được danh hiệu Học sinh 3 Tốt.'
    ],
    correctIndex: 1,
    explanation: 'Tam đoạn luận phủ định hợp lệ: Tập "Học sinh 3 Tốt" hoàn toàn tách rời tập "Bị kỷ luật". Do Tuấn thuộc tập Học sinh 3 Tốt nên Tuấn bắt buộc không thuộc tập Bị kỷ luật.'
  },
  {
    id: 'qa_08',
    groupKey: 'logical_validity',
    groupName: 'Suy luận hợp lệ',
    contextScenario: 'Một học sinh lập luận: "Trong hai môn tự chọn năm nay, tớ chỉ có thể chọn hoặc môn Tin học hoặc môn Mỹ thuật. Tớ đã điền phiếu đăng ký môn Tin học. Do đó, tớ chắc chắn không chọn môn Mỹ thuật."',
    questionText: 'Suy luận trên thuộc dạng nào và có hợp lệ không?',
    options: [
      'Hợp lệ: Suy luận tuyển loại trừ (Disjunctive Syllogism) chuẩn xác khi hai phương án triệt tiêu nhau.',
      'Không hợp lệ: Vì học sinh có thể xin học thêm cả hai môn.',
      'Không hợp lệ: Mắc lỗi ngụy biện nhị nguyên giả.',
      'Không thể kết luận khi chưa có chữ ký giáo viên chủ nhiệm.'
    ],
    correctIndex: 0,
    explanation: 'Tiền đề đã xác định rõ quan hệ loại trừ tuyệt đối (hoặc A hoặc B, không thể cả hai). Khi A xảy ra thì phủ định B là suy luận diễn dịch hoàn toàn hợp lệ.'
  },

  // --- NHÓM 3: ĐÁNH GIÁ ĐỘ MẠNH CỦA BẰNG CHỨNG (Câu 9 - 12) ---
  {
    id: 'qa_09',
    groupKey: 'evidence_strength',
    groupName: 'Đánh giá độ mạnh bằng chứng',
    contextScenario: 'Để bảo vệ luận điểm: "Học sinh THPT ngày nay dành quá nhiều thời gian cho mạng xã hội gây sa sút học lực", một bạn đưa ra 4 dẫn chứng sau.',
    questionText: 'Dẫn chứng nào có ĐỘ MẠNH VÀ ĐỘ TIN CẬY CAO NHẤT trong tranh biện học thuật?',
    options: [
      'Trải nghiệm cá nhân của bản thân bạn ấy khi lướt TikTok đến 1h sáng và bị điểm kém kiểm tra 15 phút.',
      'Ý kiến của một nam ca sĩ nổi tiếng trả lời trong buổi phỏng vấn báo chí về việc giới trẻ lạm dụng điện thoại.',
      'Khảo sát trên 5 bạn cùng bàn trong lớp 11A2.',
      'Báo cáo thống kê từ nghiên cứu diện rộng của Viện Khoa học Giáo dục trên 3.500 học sinh THPT tại 10 tỉnh thành với phương pháp lấy mẫu ngẫu nhiên phân tầng.'
    ],
    correctIndex: 3,
    explanation: 'Báo cáo từ cơ quan nghiên cứu chuyên ngành với cỡ mẫu 3.500 học sinh trên 10 tỉnh thành và phương pháp lấy mẫu ngẫu nhiên phân tầng có độ đại diện, tính khách quan và độ tin cậy vượt trội so với trải nghiệm cá nhân hay ý kiến người nổi tiếng.'
  },
  {
    id: 'qa_10',
    groupKey: 'evidence_strength',
    groupName: 'Đánh giá độ mạnh bằng chứng',
    contextScenario: 'Một nhãn hàng trà thảo mộc quảng cáo: "95% người dùng cảm thấy trí óc minh mẫn hơn ngay sau khi uống sản phẩm của chúng tôi!". Khi đọc kỹ phần chú thích cỡ chữ 8pt dưới chân trang, người ta thấy dòng chữ: "Khảo sát thực hiện trên 20 khách hàng thân thiết tại cửa hàng trải nghiệm vào ngày 15/8".',
    questionText: 'Điểm yếu cốt tử trong bằng chứng của nhãn hàng này là gì?',
    options: [
      'Thời gian khảo sát diễn ra vào mùa hè thay vì mùa thi.',
      'Kích thước mẫu quá nhỏ (chỉ 20 người) và có thiên kiến chọn mẫu trầm trọng (khách hàng thân thiết), không mang tính đại diện cho người tiêu dùng nói chung.',
      'Không nêu rõ độ tuổi của 20 khách hàng này.',
      'Không có giấy phép kinh doanh của Bộ Y tế in kèm trên tờ rơi.'
    ],
    correctIndex: 1,
    explanation: 'Cỡ mẫu 20 người là quá nhỏ để đưa ra kết luận khái quát, đặc biệt nhóm khách hàng thân thiết vốn đã có sẵn thiện cảm và kỳ vọng tích cực (placebo effect + sampling bias).'
  },
  {
    id: 'qa_11',
    groupKey: 'evidence_strength',
    groupName: 'Đánh giá độ mạnh bằng chứng',
    contextScenario: 'Khi tranh luận về câu hỏi: "Có nên chuyển toàn bộ bài kiểm tra định kỳ sang hình thức trực tuyến?", bạn A trích dẫn: "Một giáo sư chuyên ngành Khoa học Máy tính khẳng định thi trực tuyến hoàn toàn ưu việt và công bằng hơn thi trên giấy."',
    questionText: 'Cách sử dụng bằng chứng này gặp hạn chế lớn nào?',
    options: [
      'Giáo sư Khoa học Máy tính am hiểu công nghệ nhưng không nhất thiết là chuyên gia về Tâm lý học đo lường giáo dục và Thiết kế khảo thí đánh giá học sinh.',
      'Giáo sư không dạy ở trường THPT nên không được phát biểu.',
      'Ý kiến này không có đồ thị biểu diễn đi kèm.',
      'Thi trên giấy từ xưa đến nay luôn là chuẩn mực không thể thay đổi.'
    ],
    correctIndex: 0,
    explanation: 'Hạn chế về tính tương thích chuyên môn: Chuyên gia công nghệ hiểu về phần mềm, nhưng câu hỏi đánh giá thi cử liên quan trực tiếp đến Phương pháp Khảo thí, Đo lường Giáo dục và Gian lận thi cử.'
  },
  {
    id: 'qa_12',
    groupKey: 'evidence_strength',
    groupName: 'Đánh giá độ mạnh bằng chứng',
    contextScenario: 'Một nghiên cứu quan sát ghi nhận: "Tại các trường THPT có tỷ lệ học sinh ăn sáng bằng bánh mì cao, điểm trung bình môn Tiếng Anh cũng cao hơn rõ rệt so với các trường khác."',
    questionText: 'Kết luận nào sau đây là CẨN TRỌNG VÀ CHUẨN XÁC NHẤT về mặt tư duy phản biện?',
    options: [
      'Ăn bánh mì vào bữa sáng giúp phát triển khả năng ngôn ngữ Tiếng Anh.',
      'Học sinh muốn điểm Tiếng Anh cao nên chuyển sang ăn bánh mì mỗi sáng.',
      'Đây chỉ là mối tương quan thống kê (Correlation), không chứng minh được quan hệ nhân quả (Causation) vì có thể có biến ẩn như mức sống đô thị hay điều kiện kinh tế gia đình.',
      'Dữ liệu nghiên cứu này chắc chắn bị làm giả.'
    ],
    correctIndex: 2,
    explanation: 'Nguyên tắc vàng của tư duy khoa học: Tương quan không đồng nghĩa với nhân quả. Cả hai yếu tố này có thể cùng chịu ảnh hưởng từ biến thứ ba (khu vực thành thị có nhiều tiệm bánh mì và cũng có nhiều trung tâm ngoại ngữ).'
  },

  // --- NHÓM 4: NHẬN RA NGỤY BIỆN (Câu 13 - 16) ---
  {
    id: 'qa_13',
    groupKey: 'fallacy_recognition',
    groupName: 'Nhận ra ngụy biện',
    contextScenario: 'Trong buổi tranh biện về trang phục học đường, khi một học sinh đề xuất cho phép mặc áo phông tự do vào thứ Sáu, một bạn phản bác: "Bạn ấy học kỳ trước xếp loại rèn luyện Khá, hay đi học muộn thì làm sao có tư cách nói về việc xây dựng văn hóa kỷ luật cho trường!"',
    questionText: 'Người phản bác đã phạm phải ngụy biện nào?',
    options: [
      'Ngụy biện người rơm (Straw Man).',
      'Ngụy biện công kích cá nhân (Ad Hominem).',
      'Ngụy biện dốc trượt (Slippery Slope).',
      'Ngụy biện lập luận vòng vo (Begging the Question).'
    ],
    correctIndex: 1,
    explanation: 'Người phản bác tấn công vào lịch sử đi học muộn và xếp loại rèn luyện của người nói thay vì phân tích tính hợp lý hay bất cập của đề xuất mặc áo phông vào thứ Sáu.'
  },
  {
    id: 'qa_14',
    groupKey: 'fallacy_recognition',
    groupName: 'Nhận ra ngụy biện',
    contextScenario: 'Bình luận trên một diễn đàn học sinh: "Nếu nhà trường cho phép học sinh mang điện thoại vào lớp học, các bạn sẽ chỉ mải chơi game trong giờ, rồi dẫn đến chểnh mảng thi cử, trượt tốt nghiệp hàng loạt, và cả thế hệ học sinh sẽ mất hết tương lai!"',
    questionText: 'Lập luận trên mắc lỗi ngụy biện gì?',
    options: [
      'Ngụy biện dốc trượt (Slippery Slope).',
      'Ngụy biện viện dẫn thẩm quyền sai (Appeal to False Authority).',
      'Ngụy biện thiên kiến kẻ sống sót.',
      'Ngụy biện đánh tráo khái niệm (Equivocation).'
    ],
    correctIndex: 0,
    explanation: 'Người nói vẽ ra chuỗi hệ quả thảm họa liên hoàn từ việc mang điện thoại đến mất cả tương lai một thế hệ mà không chứng minh được tính tất yếu của từng mắt xích chuyển tiếp.'
  },
  {
    id: 'qa_15',
    groupKey: 'fallacy_recognition',
    groupName: 'Nhận ra ngụy biện',
    contextScenario: 'Một bạn phát biểu trong giờ sinh hoạt lớp: "Bây giờ chỉ có hai lựa chọn: Một là cả lớp đồng lòng chi tiền thuê trang phục nhảy hiện đại đắt tiền, hai là chúng ta hoàn toàn chấp nhận để lớp mình bẽ mặt và đội sổ trong hội diễn văn nghệ."',
    questionText: 'Phát biểu trên là ví dụ điển hình của ngụy biện nào?',
    options: [
      'Ngụy biện Tu Quoque (Anh cũng thế).',
      'Ngụy biện nhị nguyên giả / Tình huống khó xử sai lầm (False Dilemma).',
      'Ngụy biện khái quát hóa vội vã (Hasty Generalization).',
      'Ngụy biện cá trích đỏ (Red Herring).'
    ],
    correctIndex: 1,
    explanation: 'Người nói ép vấn đề vào đúng 2 thái cực cực đoan (thuê đồ đắt hoặc bẽ mặt đội sổ), cố tình bỏ qua rất nhiều giải pháp trung gian hợp lý như tự làm đồ diễn, mượn trang phục hoặc đầu tư vào kịch bản sáng tạo.'
  },
  {
    id: 'qa_16',
    groupKey: 'fallacy_recognition',
    groupName: 'Nhận ra ngụy biện',
    contextScenario: 'Khi bị nhắc nhở vì nói chuyện riêng trong giờ học, học sinh A cãi lại: "Ủa sao cô chỉ nhắc em? Lúc nãy bạn Hùng với bạn Thắng ở bàn cuối cũng thì thầm suốt cả tiết có thấy cô nói gì đâu!"',
    questionText: 'Học sinh A đã sử dụng ngụy biện gì để lảng tránh lỗi của mình?',
    options: [
      'Ngụy biện Tu Quoque / Anh cũng thế (Appeal to Hypocrisy).',
      'Ngụy biện viện dẫn lòng trắc ẩn (Appeal to Pity).',
      'Ngụy biện người rơm (Straw Man).',
      'Ngụy biện lạm dụng sự thiếu hiểu biết (Appeal to Ignorance).'
    ],
    correctIndex: 0,
    explanation: 'Thay vì nhìn nhận hành vi nói chuyện riêng của bản thân là sai quy định, học sinh A cố tình chuyển hướng sang lỗi của người khác (Tu Quoque) để biện minh cho hành động của mình.'
  },

  // --- NHÓM 5: PHÂN BIỆT SỰ THẬT VỚI Ý KIẾN (Câu 17 - 20) ---
  {
    id: 'qa_17',
    groupKey: 'fact_vs_opinion',
    groupName: 'Phân biệt sự thật vs ý kiến',
    contextScenario: 'Đọc 4 câu phát biểu sau về trường học:\n(1) Trường ta có diện tích khuôn viên 25.000 mét vuông.\n(2) Khuôn viên trường ta là nơi có cảnh quan truyền cảm hứng học tập nhất thành phố.\n(3) Thư viện trường hiện có hơn 12.000 đầu sách các loại.\n(4) Đội tuyển bóng rổ của trường đã vô địch giải thể thao học sinh cấp quận năm 2025.',
    questionText: 'Câu nào trong số các câu trên là MỘT Ý KIẾN CHỦ QUAN (Opinion)?',
    options: [
      'Câu (1)',
      'Câu (2)',
      'Câu (3)',
      'Câu (4)'
    ],
    correctIndex: 1,
    explanation: 'Câu (2) chứa từ ngữ thẩm mỹ chủ quan "truyền cảm hứng học tập nhất", không thể đo lường khách quan. Các câu (1), (3), (4) đều là các sự thật (Facts) có số liệu, văn bản hoặc kết quả thực chứng kiểm tra được.'
  },
  {
    id: 'qa_18',
    groupKey: 'fact_vs_opinion',
    groupName: 'Phân biệt sự thật vs ý kiến',
    contextScenario: 'Trong một bài xã luận báo học trò: "Năm 2025, tỷ lệ học sinh tốt nghiệp THPT toàn quốc đạt 98.8%. Đây là một kết quả cực kỳ đáng ngờ và phản ánh sự dễ dãi của kỳ thi."',
    questionText: 'Mệnh đề nào trong đoạn văn trên thể hiện SỰ THẬT KHÁCH QUAN (Fact)?',
    options: [
      '"Tỷ lệ học sinh tốt nghiệp THPT toàn quốc năm 2025 đạt 98.8%".',
      '"Đây là một kết quả cực kỳ đáng ngờ".',
      '"Phản ánh sự dễ dãi của kỳ thi".',
      'Cả ba mệnh đề đều là ý kiến chủ quan của tác giả.'
    ],
    correctIndex: 0,
    explanation: 'Tỷ lệ 98.8% là số liệu thống kê được công bố chính thức (Fact), trong khi việc coi nó là "đáng ngờ" hay "phản ánh sự dễ dãi" là phán xét và cách diễn giải chủ quan của tác giả (Opinion).'
  },
  {
    id: 'qa_19',
    groupKey: 'fact_vs_opinion',
    groupName: 'Phân biệt sự thật vs ý kiến',
    contextScenario: 'Khi đọc một bài báo hoặc nghe phát biểu tranh luận trong lớp học, dấu hiệu ngôn từ đóng vai trò quyết định trong việc phân định bản chất câu nói.',
    questionText: 'Dấu hiệu ngôn từ nào dưới đây thường BÁO HIỆU MỘT Ý KIẾN CHỦ QUAN hơn là một sự thật khách quan?',
    options: [
      'Các danh từ chỉ số liệu: "theo báo cáo của Tổng cục Thống kê", "kết quả đo đạc ngày 12/5".',
      'Các tính từ chỉ mức độ phán xét giá trị: "đẹp hơn", "tuyệt vời nhất", "đáng chê trách", "bất công".',
      'Các mốc thời gian và địa điểm xác định: "tại Hà Nội vào năm 1945".',
      'Các thuật ngữ quy chuẩn đã định nghĩa: "tam giác đều có 3 góc 60 độ".'
    ],
    correctIndex: 1,
    explanation: 'Các tính từ mang màu sắc cảm xúc và thang đo giá trị cá nhân (đẹp hơn, tuyệt vời, đáng chê trách...) là dấu hiệu nhận diện ý kiến chủ quan, không phải sự thật độc lập.'
  },
  {
    id: 'qa_20',
    groupKey: 'fact_vs_opinion',
    groupName: 'Phân biệt sự thật vs ý kiến',
    contextScenario: 'Xét phát biểu: "Trí tuệ nhân tạo (AI) đã hỗ trợ bác sĩ phát hiện sớm dấu hiệu ung thư phổi với độ chính xác 94% trong thử nghiệm lâm sàng năm 2024, vì thế nó là phát minh vĩ đại và đáng tự hào nhất của nhân loại trong thế kỷ 21."',
    questionText: 'Cấu trúc phát biểu trên gồm những thành phần nào?',
    options: [
      'Hoàn toàn là sự thật khách quan vì có con số 94% và năm 2024.',
      'Hoàn toàn là ý kiến vì người nói thiên vị công nghệ AI.',
      'Nửa đầu là Sự thật kiểm chứng được (kết quả thử nghiệm 94%), nửa sau là Ý kiến chủ quan ("phát minh vĩ đại nhất").',
      'Là một câu ngụy biện không có căn cứ.'
    ],
    correctIndex: 2,
    explanation: 'Người tư duy phản biện sắc bén cần tách bạch: phần dữ liệu thử nghiệm 94% là Sự thật khách quan, nhưng tuyên bố "phát minh vĩ đại và đáng tự hào nhất" là Ý kiến đánh giá mang tính cảm xúc.'
  }
];

// ==========================================
// BỘ ĐỀ B (POST-TEST: SAU 4 TUẦN) - 20 CÂU
// Độ khó và cấu trúc tương đương chuẩn hóa
// ==========================================
export const DIAGNOSTIC_SET_B: DiagnosticQuestion[] = [
  // --- NHÓM 1: NHẬN RA GIẢ ĐỊNH NGẦM (Câu 1 - 4) ---
  {
    id: 'qb_01',
    groupKey: 'implicit_assumptions',
    groupName: 'Nhận ra giả định ngầm',
    contextScenario: 'Trong một buổi tư vấn hướng nghiệp, diễn giả tuyên bố: "Các em nên đăng ký vào các ngành Trí tuệ nhân tạo hoặc Khoa học dữ liệu, vì đây là những ngành duy nhất sẽ không bao giờ bị thất nghiệp trong 20 năm tới."',
    questionText: 'Phát biểu trên dựa trên giả định ngầm nào dưới đây?',
    options: [
      'Học sinh hiện nay đều có máy tính cấu hình cao để học tập.',
      'Sự phát triển công nghệ sẽ chỉ tạo thêm việc làm cho ngành AI mà không tạo ra nguy cơ dư thừa nhân lực hay tự động hóa chính các khâu lập trình cơ bản.',
      'Tất cả học sinh nghe tư vấn đều có năng khiếu toán học vượt trội.',
      'Các trường đại học đều đã có giáo trình AI cập nhật hàng tuần.'
    ],
    correctIndex: 1,
    explanation: 'Người nói ngầm giả định rằng ngành AI sẽ mãi mãi khan hiếm nhân lực và không bị bão hòa hoặc không bị chính AI thế hệ sau thay thế công việc của sinh viên mới ra trường.'
  },
  {
    id: 'qb_02',
    groupKey: 'implicit_assumptions',
    groupName: 'Nhận ra giả định ngầm',
    contextScenario: 'Một phụ huynh nói với con: "Bố mẹ cho con tiền đi học ở trung tâm luyện thi đắt đỏ nhất thành phố, nên con buộc phải đứng trong top 3 của lớp vào kỳ thi học kỳ này."',
    questionText: 'Người phụ huynh đã ngầm chấp nhận tiền đề nào là hiển nhiên?',
    options: [
      'Chi phí học tập đắt đỏ ở trung tâm tự động chuyển hóa thành điểm số cao, độc lập với năng lực tiếp thu và sự nỗ lực cá nhân của học sinh.',
      'Học sinh ở trường không được giáo viên dạy bài kỹ.',
      'Học sinh trong lớp không ai đi học thêm trung tâm.',
      'Kỳ thi học kỳ được ra đề dựa trên giáo trình của trung tâm.'
    ],
    correctIndex: 0,
    explanation: 'Phụ huynh đánh đồng mức học phí đắt đỏ của trung tâm với kết quả học tập top 3, bỏ qua các yếu tố quyết định như phương pháp tự học, tâm lý làm bài và sự khác biệt về năng lực.'
  },
  {
    id: 'qb_03',
    groupKey: 'implicit_assumptions',
    groupName: 'Nhận ra giả định ngầm',
    contextScenario: 'Bài đăng trên diễn đàn trường: "Nhà trường lắp đặt thêm 20 camera giám sát ở hành lang và lớp học, chứng tỏ Ban Giám hiệu hoàn toàn không còn tin tưởng vào tinh thần tự giác của học sinh."',
    questionText: 'Người viết bài đã đặt ra giả định ngầm nào?',
    options: [
      'Lắp camera là hành vi tốn kém ngân sách của nhà trường.',
      'Mục đích duy nhất hoặc chủ yếu của việc lắp camera là để rình bắt lỗi học sinh, chứ không vì an ninh trường học, bảo vệ tài sản hay ngăn ngừa người lạ xâm nhập.',
      'Học sinh trong trường luôn tự giác 100% trong mọi tình huống.',
      'Camera sẽ bị hỏng hóc sau một thời gian sử dụng.'
    ],
    correctIndex: 1,
    explanation: 'Tác giả quy kết việc lắp camera đồng nghĩa với "mất niềm tin", ngầm loại bỏ các chức năng an ninh quan trọng khác như phòng cháy, chống trộm hoặc bảo vệ học sinh trước bạo lực bên ngoài.'
  },
  {
    id: 'qb_04',
    groupKey: 'implicit_assumptions',
    groupName: 'Nhận ra giả định ngầm',
    contextScenario: 'Một học sinh bảo với bạn: "Bạn Chi vẽ tranh đẹp như vậy thì chắc chắn viết văn nghị luận xã hội cũng sẽ rất sâu sắc và điểm cao."',
    questionText: 'Suy nghĩ của học sinh này chứa giả định ngầm nào?',
    options: [
      'Môn Mỹ thuật và môn Ngữ văn đều do cùng một tổ chuyên môn chấm điểm.',
      'Khả năng cảm thụ thẩm mỹ thị giác trong hội họa có tính chuyển hóa tương đương sang tư duy lập luận logic và diễn đạt ngôn từ trong văn nghị luận.',
      'Bạn Chi dành toàn bộ thời gian rảnh rỗi để đọc sách báo.',
      'Học sinh giỏi vẽ tranh thì không thích học các môn tự nhiên.'
    ],
    correctIndex: 1,
    explanation: 'Giả định ngầm rằng năng khiếu hội họa (thẩm mỹ tạo hình) tự động kéo theo năng lực nghị luận xã hội (tư duy logic ngôn ngữ và vốn sống thực tiễn).'
  },

  // --- NHÓM 2: SUY LUẬN CÓ HỢP LỆ KHÔNG (Câu 5 - 8) ---
  {
    id: 'qb_05',
    groupKey: 'logical_validity',
    groupName: 'Suy luận hợp lệ',
    contextScenario: 'Cho các tiền đề sau:\n1. Mọi thí sinh mang tài liệu vào phòng thi đều bị đình chỉ thi ngay lập tức.\n2. Thí sinh Nam không bị đình chỉ thi.',
    questionText: 'Kết luận nào sau đây là SUY LUẬN HỢP LỆ VÀ CHẮC CHẮN?',
    options: [
      'Nam chắc chắn không mang tài liệu vào phòng thi.',
      'Nam là học sinh có học lực Giỏi.',
      'Giám thị phòng thi của Nam rất dễ tính.',
      'Nam đã làm bài thi đạt điểm tuyệt đối.'
    ],
    correctIndex: 0,
    explanation: 'Tam đoạn luận phủ định (Modus Tollens): Nếu P thì Q (Mang tài liệu -> Đình chỉ). Không Q (Không đình chỉ) -> Kết luận chắc chắn là Không P (Nam không mang tài liệu vào phòng thi).'
  },
  {
    id: 'qb_06',
    groupKey: 'logical_validity',
    groupName: 'Suy luận hợp lệ',
    contextScenario: 'Xét lập luận sau:\n- Tiền đề 1: Nếu một học sinh rèn luyện tư duy phản biện thường xuyên, bạn ấy sẽ dễ dàng nhận ra các chiêu trò lừa đảo trên mạng xã hội.\n- Tiền đề 2: Bạn Long vừa bị kẻ gian lừa mất tiền qua tin nhắn giả mạo trúng thưởng.\n- Kết luận: Bạn Long chắc chắn chưa từng rèn luyện tư duy phản biện.',
    questionText: 'Lập luận trên có hợp lệ về mặt logic không?',
    options: [
      'Hợp lệ: Vì Long bị lừa chứng tỏ bạn ấy không có tư duy phản biện.',
      'Không hợp lệ: Vì các thủ đoạn lừa đảo tinh vi có thể đánh vào điểm mù tâm lý hoặc cảm xúc khẩn cấp, một lần mắc bẫy không đủ để khẳng định người đó chưa từng rèn luyện.',
      'Hợp lệ theo quy tắc phủ định hậu quả.',
      'Không hợp lệ chỉ khi kẻ gian bị công an bắt.'
    ],
    correctIndex: 1,
    explanation: 'Tiền đề 1 chỉ khẳng định "dễ dàng nhận ra" (xác suất cao hơn), không phải là sự bảo đảm 100% trong mọi hoàn cảnh cảm xúc. Việc kết luận tuyệt đối "chưa từng rèn luyện" là suy diễn vượt quá giới hạn của tiền đề.'
  },
  {
    id: 'qb_07',
    groupKey: 'logical_validity',
    groupName: 'Suy luận hợp lệ',
    contextScenario: 'Một bạn lý giải: "Tất cả các bài viết đạt giải Nhất cuộc thi Sáng tạo Khoa học kỹ thuật đều có phần khảo sát số liệu thực tế. Bài dự thi của nhóm mình có phần khảo sát số liệu thực tế rất công phu. Do đó, bài của nhóm mình chắc chắn sẽ đạt giải Nhất."',
    questionText: 'Lập luận này mắc lỗi logic nào?',
    options: [
      'Khẳng định hậu quả (Affirming the consequent): Coi điều kiện cần như là điều kiện đủ.',
      'Phủ định tiền đề (Denying the antecedent).',
      'Tam đoạn luận hợp lệ chuẩn xác.',
      'Ngụy biện vòng vo.'
    ],
    correctIndex: 0,
    explanation: 'Khảo sát số liệu chỉ là đặc điểm cần có của các bài giải Nhất (A -> B). Có khảo sát (B) không bảo đảm bài thi sẽ giành giải Nhất (A) vì còn xét đến tính mới, ứng dụng và giải pháp kỹ thuật.'
  },
  {
    id: 'qb_08',
    groupKey: 'logical_validity',
    groupName: 'Suy luận hợp lệ',
    contextScenario: 'Cho hai tiền đề:\n- Hoặc là câu lạc bộ hoàn thành bản kế hoạch trước 17h chiều nay, hoặc là sự kiện cuối tuần sẽ bị hủy.\n- Câu lạc bộ đã nộp bản kế hoạch lúc 15h chiều nay.',
    questionText: 'Từ hai tiền đề trên, ta có thể suy ra chắc chắn sự kiện cuối tuần sẽ diễn ra hay không?',
    options: [
      'Chắc chắn diễn ra vì đã nộp đúng hạn.',
      'Chưa thể kết luận chắc chắn sự kiện sẽ diễn ra, vì việc nộp kế hoạch chỉ tránh việc bị hủy do thiếu kế hoạch, sự kiện vẫn có thể bị hủy vì lý do khác như địa điểm, thời tiết.',
      'Chắc chắn bị hủy vì nộp trước 17h là quá vội vã.',
      'Cần có sự đồng ý của Hội phụ huynh.'
    ],
    correctIndex: 1,
    explanation: 'Mệnh đề tuyển loại trừ chỉ chỉ ra điều kiện hủy sự kiện là do không nộp kế hoạch. Hoàn thành kế hoạch chỉ thỏa mãn một điều kiện tiên quyết, không bảo đảm 100% sự kiện được duyệt.'
  },

  // --- NHÓM 3: ĐÁNH GIÁ ĐỘ MẠNH CỦA BẰNG CHỨNG (Câu 9 - 12) ---
  {
    id: 'qb_09',
    groupKey: 'evidence_strength',
    groupName: 'Đánh giá độ mạnh bằng chứng',
    contextScenario: 'Trong một buổi tranh luận về chủ đề: "Nên bỏ hoàn toàn kỳ thi tuyển sinh lớp 10 công lập để giảm áp lực học tập", thí sinh đưa ra các bằng chứng sau.',
    questionText: 'Bằng chứng nào có sức thuyết phục và giá trị đối sánh CAO NHẤT?',
    options: [
      'Lời tâm sự đầy xúc động của một học sinh lớp 9 trên Facebook về việc phải thức học đến 2h sáng.',
      'Nghiên cứu so sánh theo dõi dọc 5 năm giữa các địa phương bỏ thi chuyển sang xét học bạ và các địa phương duy trì thi tuyển, đo lường các chỉ số về sức khỏe tâm thần và kết quả học tập ở cấp THPT.',
      'Bình luận của một tài khoản ẩn danh trên diễn đàn giáo dục cho rằng kỳ thi chỉ làm giàu cho các trung tâm dạy thêm.',
      'Video TikTok của một cựu học sinh kể về việc thi trượt lớp 10 nhưng nay vẫn mở quán trà sữa thành công.'
    ],
    correctIndex: 1,
    explanation: 'Nghiên cứu theo dõi dọc 5 năm (longitudinal comparative study) có nhóm đối chứng giữa 2 mô hình thi cử và đo lường đa chỉ số là bằng chứng thực chứng chuẩn mực nhất cho chính sách công.'
  },
  {
    id: 'qb_10',
    groupKey: 'evidence_strength',
    groupName: 'Đánh giá độ mạnh bằng chứng',
    contextScenario: 'Một KOL công nghệ đăng video khẳng định: "Chiếc điện thoại hãng X là smartphone có pin trâu nhất thế giới hiện nay, tôi dùng liên tục 3 ngày không cần sạc!". Dưới phần mô tả video có để link tiếp thị liên kết (affiliate link) và dòng chữ "Video được tài trợ bởi hãng X".',
    questionText: 'Tại sao người nghe cần thận trọng trước bằng chứng này?',
    options: [
      'Vì KOL này dùng hệ điều hành Android thay vì iOS.',
      'Vì có xung đột lợi ích trực tiếp (Conflict of Interest) do nhận tiền tài trợ từ nhãn hàng và thiếu quy trình kiểm thử độc lập có quy chuẩn đo lường tiêu hao pin.',
      'Vì 3 ngày là khoảng thời gian quá ngắn để làm video.',
      'Vì video không quay bằng máy quay chuyên nghiệp.'
    ],
    correctIndex: 1,
    explanation: 'Sự hiện diện của tài trợ thương mại và liên kết hoa hồng tạo ra xung đột lợi ích rõ rệt, làm giảm nghiêm trọng tính khách quan của lời nhận xét nếu không có kiểm nghiệm độc lập từ bên thứ ba.'
  },
  {
    id: 'qb_11',
    groupKey: 'evidence_strength',
    groupName: 'Đánh giá độ mạnh bằng chứng',
    contextScenario: 'Để chứng minh rằng: "Học sinh trường mình đều thích ăn đồ chiên rán ở căng tin hơn là cơm văn phòng", bạn Mai đã khảo sát 30 bạn đang xếp hàng mua cá viên chiên tại quầy đồ ăn nhanh lúc giờ ra chơi.',
    questionText: 'Mẫu khảo sát của bạn Mai mắc phải sai lầm nghiêm trọng nào?',
    options: [
      'Thiên kiến chọn mẫu (Selection Bias): Chọn khảo sát ngay tại chính quầy đồ ăn nhanh khiến mẫu chỉ toàn những bạn đã có sở thích ăn đồ chiên.',
      'Số lượng 30 người là quá nhiều gây nhiễu dữ liệu.',
      'Khảo sát vào giờ ra chơi khiến học sinh không kịp suy nghĩ.',
      'Mai không mang theo máy tính cầm tay để tính phần trăm.'
    ],
    correctIndex: 0,
    explanation: 'Sai lầm chọn mẫu kinh điển: Khảo sát đối tượng ngay tại nơi bán món đó sẽ chỉ thu về ý kiến của những người ưa chuộng món đó, hoàn toàn bỏ sót những học sinh chọn ăn cơm hay mang cơm từ nhà.'
  },
  {
    id: 'qb_12',
    groupKey: 'evidence_strength',
    groupName: 'Đánh giá độ mạnh bằng chứng',
    contextScenario: 'Một nghiên cứu phát hiện: "Những người thường xuyên chơi cờ vua có chỉ số IQ trung bình cao hơn 15% so với người không chơi". Người viết bài báo kết luận: "Chơi cờ vua là phương pháp hiệu quả nhất để làm tăng chỉ số IQ của một người."',
    questionText: 'Lỗ hổng phân tích của kết luận trên nằm ở đâu?',
    options: [
      'Đảo ngược nhân quả hoặc không tính đến hiện tượng tự chọn lọc: Có thể những người vốn có trí thông minh và tư duy không gian tốt từ trước sẽ có xu hướng yêu thích và gắn bó lâu dài với môn cờ vua hơn.',
      'Chỉ số IQ không thể đo lường bằng bài trắc nghiệm.',
      'Môn cờ vua chỉ dành cho người lớn tuổi.',
      'Mức 15% là quá thấp để rút ra kết luận.'
    ],
    correctIndex: 0,
    explanation: 'Vấn đề đảo ngược nhân quả (Reverse Causality): Liệu cờ vua làm tăng IQ, hay người có năng lực tư duy cao tự tìm đến cờ vua? Kết luận khẳng định nhân quả một chiều mà không kiểm chứng là phiến diện.'
  },

  // --- NHÓM 4: NHẬN RA NGỤY BIỆN (Câu 13 - 16) ---
  {
    id: 'qb_13',
    groupKey: 'fallacy_recognition',
    groupName: 'Nhận ra ngụy biện',
    contextScenario: 'Khi học sinh đề xuất tổ chức nhiều hoạt động câu lạc bộ ngoại khóa hơn, một phụ huynh gạt phắt đi: "Các cô cậu bây giờ chỉ toàn vẽ chuyện ăn chơi vô bổ, muốn biến trường học thành sàn diễn tạp kỹ chứ học hành gì!"',
    questionText: 'Vị phụ huynh trên đã sử dụng ngụy biện nào?',
    options: [
      'Ngụy biện người rơm (Straw Man): Bóp méo đề xuất ngoại khóa lành mạnh thành "sàn diễn tạp kỹ ăn chơi vô bổ" để dễ dàng tấn công.',
      'Ngụy biện viện dẫn lòng thương hại (Appeal to Pity).',
      'Ngụy biện dốc trượt.',
      'Ngụy biện Tu Quoque.'
    ],
    correctIndex: 0,
    explanation: 'Ngụy biện người rơm: Thay vì bàn về lợi ích hay cách cân đối hoạt động ngoại khóa, phụ huynh đã bóp méo đề xuất thành một hình ảnh cực đoan, lố bịch ("sàn diễn tạp kỹ") rồi bác bỏ hình nộm đó.'
  },
  {
    id: 'qb_14',
    groupKey: 'fallacy_recognition',
    groupName: 'Nhận ra ngụy biện',
    contextScenario: 'Trên mạng xã hội, một tài khoản bình luận: "Ai cũng đang dùng ứng dụng học tập này từ Nam chí Bắc, tất cả các thủ khoa đều cài đặt nó, nếu bạn không dùng thì chắc chắn bạn sẽ tụt hậu và thất bại trong kỳ thi tới!"',
    questionText: 'Bình luận trên mắc lỗi ngụy biện gì?',
    options: [
      'Ngụy biện ăn theo đám đông (Bandwagon Fallacy / Appeal to Popularity).',
      'Ngụy biện cá trích đỏ.',
      'Ngụy biện công kích cá nhân.',
      'Ngụy biện viện dẫn sự thiếu hiểu biết.'
    ],
    correctIndex: 0,
    explanation: 'Ngụy biện ăn theo đám đông: Dùng áp lực số đông ("ai cũng đang dùng") để ép người nghe tin theo thay vì chứng minh giá trị thực tế của nội dung học thuật trên ứng dụng.'
  },
  {
    id: 'qb_15',
    groupKey: 'fallacy_recognition',
    groupName: 'Nhận ra ngụy biện',
    contextScenario: 'Một bạn học sinh lập luận: "Ông bác họ của tớ hút thuốc lá từ năm 16 tuổi mà năm nay 88 tuổi vẫn đi xe đạp khỏe phao phao. Cho nên mấy cái nghiên cứu bảo thuốc lá gây ung thư chỉ là hù dọa quá đà thôi!"',
    questionText: 'Học sinh này đã phạm phải ngụy biện nào?',
    options: [
      'Ngụy biện chuyện kể cá nhân (Anecdotal Fallacy).',
      'Ngụy biện nhị nguyên giả.',
      'Ngụy biện người rơm.',
      'Ngụy biện Tu Quoque.'
    ],
    correctIndex: 0,
    explanation: 'Dùng một trường hợp ngoại lệ cá biệt (ông bác 88 tuổi) để bác bỏ các bằng chứng dịch tễ học và y khoa quy mô hàng triệu người về tác hại của thuốc lá.'
  },
  {
    id: 'qb_16',
    groupKey: 'fallacy_recognition',
    groupName: 'Nhận ra ngụy biện',
    contextScenario: 'Trong một buổi tranh luận về việc giảm bài tập về nhà, bạn B phát biểu: "Bài tập về nhà là điều cần thiết bởi vì học sinh bắt buộc phải có bài tập để làm ở nhà."',
    questionText: 'Phát biểu của bạn B mắc lỗi lập luận nào?',
    options: [
      'Ngụy biện lập luận vòng vo / Khẳng định lại tiền đề (Begging the question / Circular Reasoning).',
      'Ngụy biện dốc trượt.',
      'Ngụy biện công kích cá nhân.',
      'Ngụy biện viện dẫn cảm xúc.'
    ],
    correctIndex: 0,
    explanation: 'Lập luận vòng quanh: Kết luận ("cần thiết") chỉ là cách nói lại của tiền đề ("bắt buộc phải có bài tập về nhà"), hoàn toàn không đưa ra thêm lý lẽ hay cơ chế giải thích nào.'
  },

  // --- NHÓM 5: PHÂN BIỆT SỰ THẬT VỚI Ý KIẾN (Câu 17 - 20) ---
  {
    id: 'qb_17',
    groupKey: 'fact_vs_opinion',
    groupName: 'Phân biệt sự thật vs ý kiến',
    contextScenario: 'Đọc 4 câu sau về biến đổi khí hậu:\n(1) Nồng độ khí CO2 trong khí quyển năm 2024 đã vượt mức 420 ppm.\n(2) Nhiệt độ trung bình toàn cầu năm 2024 cao hơn khoảng 1.5°C so với thời kỳ tiền công nghiệp.\n(3) Các chính phủ đang hành động một cách quá chậm chạp và thiếu trách nhiệm đối với tương lai giới trẻ.\n(4) Băng ở hai cực đang tan với tốc độ đo được từ vệ tinh NASA.',
    questionText: 'Câu nào trong số 4 câu trên là Ý KIẾN CHỦ QUAN (Opinion)?',
    options: [
      'Câu (1)',
      'Câu (2)',
      'Câu (3)',
      'Câu (4)'
    ],
    correctIndex: 2,
    explanation: 'Câu (3) chứa các từ ngữ phán xét đạo đức và đánh giá chủ quan ("quá chậm chạp", "thiếu trách nhiệm"). Các câu (1), (2), (4) đều là các dữ kiện khoa học thực chứng (Facts) có số đo và dữ liệu vệ tinh.'
  },
  {
    id: 'qb_18',
    groupKey: 'fact_vs_opinion',
    groupName: 'Phân biệt sự thật vs ý kiến',
    contextScenario: 'Trong buổi thảo luận văn học, có các nhận định sau về tác phẩm "Truyện Kiều":\n- Ý 1: Truyện Kiều gồm 3.254 câu thơ lục bát.\n- Ý 2: Truyện Kiều là kiệt tác văn học vĩ đại nhất trong lịch sử dân tộc Việt Nam.',
    questionText: 'Bản chất của hai nhận định trên là gì?',
    options: [
      'Ý 1 là Sự thật (Fact), Ý 2 là Ý kiến đánh giá giá trị (Opinion).',
      'Cả hai đều là Sự thật vì đã được sách giáo khoa công nhận.',
      'Cả hai đều là Ý kiến vì tác phẩm văn học luôn mở cho nhiều cách hiểu.',
      'Ý 1 là Ý kiến, Ý 2 là Sự thật.'
    ],
    correctIndex: 0,
    explanation: 'Số lượng 3.254 câu thơ là sự thật kiểm đếm khách quan. Việc coi tác phẩm là "vĩ đại nhất" là một nhận định thẩm mỹ và đánh giá giá trị (Opinion), dù nhận định này nhận được sự đồng thuận rộng rãi.'
  },
  {
    id: 'qb_19',
    groupKey: 'fact_vs_opinion',
    groupName: 'Phân biệt sự thật vs ý kiến',
    contextScenario: 'Một phát biểu: "Nước sôi ở 100°C tại áp suất khí quyển tiêu chuẩn 1 atm."',
    questionText: 'Phát biểu này là Sự thật hay Ý kiến?',
    options: [
      'Sự thật khoa học: Có thể đo đạc, kiểm chứng và lặp lại bằng thực nghiệm khách quan trong điều kiện xác định.',
      'Ý kiến: Vì ở trên núi cao nước sôi ở nhiệt độ khác.',
      'Ý kiến: Vì các nhà khoa học tự đặt ra quy ước.',
      'Không thể xác định nếu không có nhiệt kế thủy ngân.'
    ],
    correctIndex: 0,
    explanation: 'Đây là sự thật khoa học đã được kiểm chứng bằng thực nghiệm và có giới hạn điều kiện rõ ràng (áp suất tiêu chuẩn 1 atm).'
  },
  {
    id: 'qb_20',
    groupKey: 'fact_vs_opinion',
    groupName: 'Phân biệt sự thật vs ý kiến',
    contextScenario: 'Trong một buổi sinh hoạt lớp về văn hóa tiếp nhận thông tin trên mạng xã hội, các bạn học sinh trao đổi về cách xác minh tin tức.',
    questionText: 'Làm thế nào để người đọc có tư duy phản biện nhận biết một phát biểu là SỰ THẬT KHÁCH QUAN?',
    options: [
      'Phát biểu đó được nhiều người thả tim và chia sẻ trên Facebook.',
      'Phát biểu đó có thể kiểm tra tính đúng/sai một cách độc lập dựa trên bằng chứng, số liệu hoặc tài liệu thực chứng mà không phụ thuộc vào cảm xúc người nói.',
      'Phát biểu đó nghe rất hợp tai và đúng với niềm tin sẵn có của mình.',
      'Phát biểu đó do một người nổi tiếng hoặc có chức vụ cao đưa ra.'
    ],
    correctIndex: 1,
    explanation: 'Tiêu chuẩn cốt lõi của Sự thật (Fact) trong tư duy phản biện là tính độc lập với cảm xúc cá nhân và khả năng kiểm chứng/bác bỏ bằng chứng thực nghiệm khách quan.'
  }
];

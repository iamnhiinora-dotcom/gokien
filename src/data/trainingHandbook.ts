/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TÀI LIỆU TRAINING & HUẤN LUYỆN TRANH BIỆN CHO HỌC SINH THPT
 * Hệ thống 2 khung phương pháp cốt lõi:
 * 1. Khung PEEL: Xây dựng luận điểm mạch lạc (với cơ chế nhân quả A -> B -> C trong chữ E - Explanation).
 * 2. Kỹ thuật Phản biện 4 bước: Bẻ gãy luận điểm đối thủ (Signal - State - Support - Summarize).
 */

export interface PeelElement {
  code: 'P' | 'E1' | 'E2' | 'L';
  letter: 'P' | 'E' | 'E' | 'L';
  name: string;
  englishName: string;
  shortDesc: string;
  detailGuide: string;
  questionsToAsk: string[];
  goodExample: string;
  badExample: string;
  iconName: string;
}

export interface MotionTypeInfo {
  type: 'chinh_sach' | 'gia_tri' | 'thuc_te';
  name: string;
  badge: string;
  keywords: string[];
  definition: string;
  strategy: string;
  examples: string[];
}

export interface RebuttalTechnique {
  id: string;
  name: string;
  code: string;
  principle: string;
  formula: string;
  explanation: string;
  sampleSpeech: string;
}

export interface AdvancedDebateStrategy {
  id: string;
  name: string;
  englishName: string;
  definition: string;
  application: string;
  example: string;
}

export const PEEL_FRAMEWORK: PeelElement[] = [
  {
    code: 'P',
    letter: 'P',
    name: 'Point - Luận điểm',
    englishName: 'Point',
    shortDesc: 'Tuyên bố ngắn gọn, trực diện về ý chính bạn muốn khẳng định.',
    detailGuide: 'Đưa ra luận điểm trong một câu rõ ràng, không vòng vo. Người nghe cần biết ngay bạn đang chứng minh điều gì cho phe của mình.',
    questionsToAsk: [
      'Luận điểm cốt lõi của bài nói này là gì?',
      'Ý kiến này ủng hộ hay phản đối khía cạnh nào của chủ đề?'
    ],
    goodExample: 'Luận điểm: Việc quản lý thời gian sử dụng điện thoại trong lớp học giúp giảm thiểu sự xao nhãng và tạo môi trường học tập tập trung hơn.',
    badExample: 'Điện thoại thông minh nói chung có nhiều điểm phức tạp cả tốt lẫn xấu.',
    iconName: 'Target'
  },
  {
    code: 'E1',
    letter: 'E',
    name: 'Explanation - Giải thích & Cơ chế nhân quả (A → B → C)',
    englishName: 'Explanation (Mechanism A → B → C)',
    shortDesc: 'Phân tích cơ chế nhân quả: Hành động A dẫn tới hệ quả B và tác động trực tiếp đến kết quả C.',
    detailGuide: 'Tránh khẳng định nhảy cóc. Bạn cần làm rõ chuỗi nhân quả từng bước: Vì sao thực hiện hành động A lại kéo theo hệ quả B, và từ B sinh ra kết quả C như thế nào.',
    questionsToAsk: [
      'Chuỗi tác động nhân quả diễn ra qua những bước trung gian nào?',
      'Động lực hành vi hay cơ chế tâm lý/xã hội nào khiến kết quả xảy ra?',
      'Có ý kiến cho rằng việc giảm thiểu thông báo giúp duy trì chú ý, hãy tìm số liệu kiểm chứng.'
    ],
    goodExample: 'Cơ chế nhân quả (A → B → C): Khi ban hành quy định cất điện thoại trong giờ học (A) -> Học sinh không còn bị ngắt quãng bởi thông báo ứng dụng và tin nhắn riêng (B) -> Tạo điều kiện thuận lợi để học sinh theo dõi bài giảng liền mạch và thảo luận nhóm sâu hơn (C). (Có ý kiến cho rằng điều này giúp duy trì nhịp độ chú ý của học sinh, hãy tìm số liệu kiểm chứng trong từng môi trường học đường).',
    badExample: 'Cứ cấm điện thoại là học sinh tự khắc sẽ chú ý nghe giảng 100%.',
    iconName: 'Cpu'
  },
  {
    code: 'E2',
    letter: 'E',
    name: 'Evidence - Dẫn chứng & Bằng chứng',
    englishName: 'Evidence',
    shortDesc: 'Dẫn chứng thực tế, báo cáo có nguồn kiểm chứng hoặc ví dụ cụ thể.',
    detailGuide: 'Cung cấp số liệu từ các tổ chức nghiên cứu hoặc ví dụ thực tiễn rõ nguồn gốc. Nếu chưa có nguồn chính xác, hãy trình bày cẩn trọng dưới dạng giả thuyết cần kiểm chứng.',
    questionsToAsk: [
      'Nguồn gốc của số liệu này từ đâu (tổ chức, báo cáo, năm công bố, liên kết)?',
      'Dẫn chứng này có đại diện cho hoàn cảnh đang tranh luận không?'
    ],
    goodExample: 'Theo Báo cáo Giám sát Giáo dục Toàn cầu (Global Education Monitoring Report 2023) của UNESCO (nguồn: https://unesdoc.unesco.org/ark:/48223/pf0000385723), việc để điện thoại gần nơi học tập có thể làm phân tán sự tập trung và ảnh hưởng đến kết quả học tập ở một số quốc gia được khảo sát.',
    badExample: 'Có nhiều nghiên cứu khoa học cho thấy sóng điện thoại làm hỏng 100% tế bào não.',
    iconName: 'Award'
  },
  {
    code: 'L',
    letter: 'L',
    name: 'Link - Liên kết & Chốt giá trị',
    englishName: 'Link',
    shortDesc: 'Kết nối luận điểm ngược lại với kiến nghị và khẳng định giá trị đối với trận đấu.',
    detailGuide: 'Khép lại luận điểm bằng cách giải thích vì sao ý này chứng minh lập trường của phe bạn là hợp lý và mang lại lợi ích vượt trội hơn.',
    questionsToAsk: [
      'Luận điểm này kết nối ngược lại chủ đề chính như thế nào?',
      'Ý này giúp phe bạn chiếm ưu thế gì trên bàn cân tranh biện?'
    ],
    goodExample: 'Vì vậy, chính sách quản lý thiết bị thông minh trong lớp học trực tiếp giải quyết vấn đề xao nhãng học đường, chứng minh rằng biện pháp này là cần thiết để bảo vệ chất lượng tiết học.',
    badExample: 'Đó là lý do phe tôi hoàn toàn đúng.',
    iconName: 'Scale'
  }
];

export const MOTION_TYPES: MotionTypeInfo[] = [
  {
    type: 'chinh_sach',
    name: 'Kiến nghị chính sách',
    badge: 'Chính sách (Policy)',
    keywords: ['Nên', 'Sẽ', 'Bắt buộc', 'Cấm', 'Áp dụng'],
    definition: 'Đưa ra một đề xuất hành động hoặc giải pháp pháp lý/chính sách cụ thể từ một chủ thể (Chính phủ, Nhà trường...).',
    strategy: 'Cần chứng minh 3 điểm: (1) Tính cấp bách của thực trạng; (2) Tính khả thi & cơ chế thực thi; (3) Lợi ích vượt trội so với tổn thất.',
    examples: [
      'Có nên bỏ bài tập về nhà? (Should Homework Be Abolished?)',
      'Có nên cấm hoàn toàn việc sử dụng túi nilon?',
      'Nên áp dụng chính sách Gap Year bắt buộc trước khi nhập học Đại học.'
    ]
  },
  {
    type: 'gia_tri',
    name: 'Kiến nghị giá trị',
    badge: 'Giá trị (Value)',
    keywords: ['Đáng để làm', 'Tốt hơn', 'Ưu tiên hơn', 'Bất công', 'Có hại hơn'],
    definition: 'Đánh giá một sự vật, hiện tượng hoặc hành vi là đáng hay không đáng, tốt hay xấu, ưu tiên giá trị đạo đức nào.',
    strategy: 'Cần thiết lập Hệ tiêu chuẩn (Criteria/Standard) rõ ràng để so sánh giữa hai thang giá trị đối lập.',
    examples: [
      'Nên ưu tiên năng lượng hạt nhân hơn năng lượng tái tạo trong chuyển dịch ngắn hạn.',
      'Đại học không còn là tiêu chí quan trọng hàng đầu để đánh giá năng lực lao động trong thế kỷ 21.',
      'Sự bùng nổ của khóa học kỹ năng mềm trực tuyến đang làm giảm giá trị bằng đại học truyền thống.'
    ]
  },
  {
    type: 'thuc_te',
    name: 'Kiến nghị thực tế',
    badge: 'Thực tế (Fact / Empirical)',
    keywords: ['Là nguyên nhân', 'Đang dẫn đến', 'Tồn tại', 'Sẽ xảy ra'],
    definition: 'Xem xét một vấn đề hoặc hiện tượng mà mọi người coi là thực tế liệu có thực sự tồn tại hoặc gây ra kết quả đó hay không.',
    strategy: 'Tập trung sâu vào chứng cứ thực nghiệm (Evidence), số liệu nghiên cứu có nguồn kiểm chứng và quan hệ nhân quả khách quan.',
    examples: [
      'Mạng xã hội đang mang lại nhiều tác hại hơn là lợi ích cho học sinh Gen Z.',
      'AI sẽ thay đổi vai trò hỗ trợ của giáo viên trong lớp học số.'
    ]
  }
];

export const FOUR_STEP_REBUTTAL: RebuttalTechnique[] = [
  {
    id: 'signal',
    name: 'Bước 1: Signal (Nhận diện & Trích dẫn)',
    code: 'Signal',
    principle: 'Chỉ rõ luận điểm cụ thể của đối phương mà bạn chuẩn bị phản hồi',
    formula: 'Phe bạn/Người nói trước vừa lập luận rằng: "[Trích dẫn trực tiếp luận điểm đối thủ]..."',
    explanation: 'Giúp người nghe và giám khảo định vị chính xác vị trí bạn chuẩn bị phản biện trên bảng ghi chép.',
    sampleSpeech: '"Phe đối phương vừa lập luận rằng: Việc cấm điện thoại sẽ giúp học sinh tập trung tuyệt đối trong giờ học..."'
  },
  {
    id: 'state',
    name: 'Bước 2: State (Tuyên bố phản bác)',
    code: 'State',
    principle: 'Đưa ra câu khẳng định phản biện ngắn gọn, trực diện',
    formula: 'Tuy nhiên, quan điểm này chưa đầy đủ/chưa thực tế vì: [Một câu khẳng định trực diện].',
    explanation: 'Khẳng định ngay lập trường phản bác một cách rõ ràng, không vòng vo.',
    sampleSpeech: '"...Tuy nhiên, nhận định này chưa toàn diện vì việc cấm đoán đơn thuần có thể tạo ra phản ứng đối phó lén lút nếu không có sự đồng thuận."'
  },
  {
    id: 'support',
    name: 'Bước 3: Support (Lý lẽ & Dẫn chứng)',
    code: 'Support',
    principle: 'Cung cấp cơ chế logic hoặc bằng chứng chứng minh phản biện có cơ sở',
    formula: 'Bởi vì: [Phân tích cơ chế nhân quả A -> B -> C hoặc áp dụng De-link / Turn / Mitigation].',
    explanation: 'Làm rõ vì sao đối thủ chưa thuyết phục (thiếu cơ chế, nhầm lẫn tương quan, số liệu chưa kiểm chứng, hoặc hệ quả ngược).',
    sampleSpeech: '"...Bởi vì khi bị cấm tuyệt đối mà không hướng dẫn kỹ năng số, học sinh có xu hướng giấu thiết bị để sử dụng vụng trộm. Khi ấy, sự xao nhãng thậm chí còn phức tạp hơn. (Có ý kiến cho rằng việc hướng dẫn văn hóa số mang lại hiệu quả bền vững hơn, hãy tìm số liệu kiểm chứng)."'
  },
  {
    id: 'summarize',
    name: 'Bước 4: Summarize (Tổng kết & Khẳng định)',
    code: 'Summarize',
    principle: 'Nêu bật kết luận và tác động của phản biện đối với trận đấu',
    formula: 'Vì vậy, luận điểm này của phe đối lập chưa đủ sức thuyết phục và chưa bảo vệ được đề xuất.',
    explanation: 'Chốt lại vấn đề với giám khảo và liên kết về giá trị cốt lõi của đội mình.',
    sampleSpeech: '"...Vì vậy, luận điểm về sự tập trung của phe bạn chưa vững chắc, và chính sách cấm cực đoan không phải là giải pháp tối ưu."'
  }
];

export const ADVANCED_STRATEGIES: AdvancedDebateStrategy[] = [
  {
    id: 'de_link',
    name: 'Cắt liên kết',
    englishName: 'De-link',
    definition: 'Chứng minh rằng dù bằng chứng hoặc lý lẽ của đối thủ đúng sự thật, nhưng nó không dẫn đến kết quả mà họ khẳng định.',
    application: 'Sử dụng khi đối phương đưa ra dữ liệu có thật nhưng kết luận nhảy cóc hoặc quy kết nguyên nhân sai.',
    example: 'Đối thủ chỉ ra: "Học sinh sử dụng điện thoại nhiều bị điểm kém". Phản biện De-link: Đúng là có mối tương quan trong một số trường hợp, nhưng nguyên nhân gốc rễ là phương pháp tự học và quản lý thời gian, chứ không phải bản thân thiết bị. Học sinh không có điện thoại nếu chưa có phương pháp học phù hợp vẫn gặp khó khăn trong học tập.'
  },
  {
    id: 'turn',
    name: 'Chuyển hướng / Đảo chiều',
    englishName: 'Turn (Perversity & Consequence)',
    definition: 'Biến chính lý lẽ hoặc dẫn chứng của đối phương thành lập luận hỗ trợ cho phe mình.',
    application: 'Đòn phản biện sắc bén: "Chính vì điều đối thủ nêu ra là quan trọng, nên phương án của phe chúng tôi mới là lựa chọn tối ưu".',
    example: 'Đối thủ nói: "Bài tập về nhà rèn luyện tính kỷ luật và tự giác". Phản biện Turn: "Chính vì chúng ta cần rèn luyện tính tự giác thực chất, nên ta cần thay đổi hình thức bài tập bắt buộc! Khi việc làm bài xuất phát từ sự hứng thú và dự án thực tế, học sinh mới hình thành tinh thần tự học lâu dài; còn bài tập rập khuôn dễ dẫn đến sự đối phó."'
  },
  {
    id: 'mitigation',
    name: 'Giảm thiểu quy mô',
    englishName: 'Mitigation',
    definition: 'Thừa nhận một phần tính hợp lý của đối thủ nhưng chỉ ra phạm vi ảnh hưởng hẹp để cân bằng sức nặng.',
    application: 'Sử dụng khi luận điểm đối phương không sai hoàn toàn nhưng chỉ ảnh hưởng tới nhóm nhỏ hoặc giải quyết vấn đề tạm thời.',
    example: 'Đối thủ nêu nguy cơ gian lận khi cho học sinh dùng AI trong bài tập. Phản biện Mitigation: "Nguy cơ gian lận chủ yếu xảy ra ở các bài tập nhớ vẹt truyền thống. Khi nhà trường chuyển đổi sang hình thức thuyết trình và đánh giá quá trình, rủi ro này được giảm thiểu đáng kể."'
  }
];

export const TIME_MANAGEMENT_RULES = {
  ruleName: 'Quy tắc phân bổ thời gian bài nói 20 - 60 - 20',
  sections: [
    {
      percentage: '20% Thời gian đầu',
      title: 'Khái quát & Phản biện trực diện (Rebuttal)',
      action: 'Áp dụng Kỹ thuật Phản biện 4 bước (Signal - State - Support - Summarize) để phản hồi 1-2 luận điểm then chốt của đối thủ.'
    },
    {
      percentage: '60% Thời gian giữa',
      title: 'Hệ thống luận điểm cốt lõi (PEEL)',
      action: 'Trình bày các luận điểm chính theo khung PEEL (Point -> Explanation với cơ chế nhân quả A -> B -> C -> Evidence -> Link).'
    },
    {
      percentage: '20% Thời gian cuối',
      title: 'Chốt giá trị & Tầm ảnh hưởng (Impact & Link back)',
      action: 'Quy về tiêu chí trọng tâm, so sánh bức tranh tương lai và giải thích tại sao lập trường của phe bạn thuyết phục hơn.'
    }
  ],
  preEmptionHint: 'Chiến thuật Dự đoán trước (Pre-emption): Trong giai đoạn chuẩn bị, hãy tự liệt kê các câu hỏi chất vấn mà đối phương có thể đặt ra cho đội mình và chuẩn bị sẵn phương án trả lời logic.'
};

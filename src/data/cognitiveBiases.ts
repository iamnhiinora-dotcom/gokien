/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TÀI LIỆU HUẤN LUYỆN: 8 THIÊN KIẾN NHẬN THỨC (COGNITIVE BIASES)
 * Dành cho học sinh THPT: Tự nhìn lại mình và nhận diện điểm mù tư duy
 */

export interface CognitiveBiasItem {
  id: string;
  name: string;              // Tên tiếng Anh (vd: Confirmation Bias)
  vietnameseName: string;    // Tên tiếng Việt (vd: Thiên kiến xác nhận)
  definition: string;        // Định nghĩa chuẩn xác 2 câu
  schoolExample: string;     // 1 ví dụ học đường đời thực
  selfCheckQuestion: string; // 1 câu tự vấn để phát hiện
  iconName: string;
}

export const BIAS_VS_FALLACY_DISTINCTION = {
  biasDefinition: 'Thiên kiến nhận thức (Cognitive Bias) là điểm mù và lỗi sai trong cách bộ não chúng ta tiếp nhận, chọn lọc và xử lý thông tin (lỗi trong cách mình nghĩ). Nó diễn ra âm thầm, vô thức bên trong tâm trí ngay trước khi ta kịp cất lời.',
  fallacyDefinition: 'Ngụy biện (Logical Fallacy) là sai sót trong cấu trúc logic, cách dùng lý lẽ và ngôn từ khi ta diễn đạt hoặc tranh luận với người khác (lỗi trong lập luận).',
  summary: 'Tóm lại: Thiên kiến là cách tư duy méo mó từ bên trong; Ngụy biện là cách lập luận sai lệch khi phát biểu ra bên ngoài.'
};

export const COGNITIVE_BIASES: CognitiveBiasItem[] = [
  {
    id: 'confirmation_bias',
    name: 'Confirmation Bias',
    vietnameseName: 'Thiên kiến xác nhận',
    definition: 'Xu hướng chỉ chủ động tìm kiếm, ghi nhớ và đánh giá cao những thông tin ủng hộ niềm tin sẵn có của bản thân. Đồng thời, bộ não thường phớt lờ, xem nhẹ hoặc gạt bỏ mọi số liệu và dẫn chứng trái chiều.',
    schoolExample: 'Khi tin rằng "thầy giáo dạy Văn luôn thiên vị học sinh lớp chọn", bạn chỉ nhớ những lần bạn lớp chọn được 9 điểm mà cố tình quên những lần bạn đó cũng bị điểm 6 như các bạn khác.',
    selfCheckQuestion: 'Mình đã bao giờ chủ động tìm kiếm bất kỳ bằng chứng nào chứng minh quan điểm hiện tại của mình là SAI chưa?',
    iconName: 'SearchCheck'
  },
  {
    id: 'anchoring_bias',
    name: 'Anchoring Bias',
    vietnameseName: 'Thiên kiến mỏ neo',
    definition: 'Khuynh hướng bị phụ thuộc quá mức vào mẩu thông tin đầu tiên nhận được (chiếc "mỏ neo") khi đưa ra các nhận định tiếp theo. Dù thông tin ban đầu có thể ngẫu nhiên hoặc thiếu căn cứ, não bộ vẫn dùng nó làm thước đo quy chiếu cho mọi so sánh.',
    schoolExample: 'Nghe bạn lớp bên đồn đề thi học kỳ Sử năm nay "khó đến mức không ai làm được quá 7 điểm", cả lớp lập tức hoang mang và chỉ đặt mục tiêu làm đúng nửa đề thay vì tự tin ôn tập toàn diện.',
    selfCheckQuestion: 'Con số hoặc thông tin đầu tiên mình nghe được có thực sự đáng tin và có cơ sở khoa học để làm mốc so sánh hay không?',
    iconName: 'Anchor'
  },
  {
    id: 'availability_heuristic',
    name: 'Availability Heuristic',
    vietnameseName: 'Thiên kiến sẵn có',
    definition: 'Đánh giá xác suất hoặc tầm quan trọng của một sự việc dựa trên mức độ dễ dàng gợi nhớ lại các ví dụ về nó trong trí nhớ. Những sự việc gây xúc động mạnh, vừa mới xảy ra hoặc được mạng xã hội nhắc đi nhắc lại thường bị phóng đại quá mức so với thực tế thống kê.',
    schoolExample: 'Vừa đọc tin một vụ xe đạp điện chập cháy trên mạng xã hội, bạn lập tức khẳng định xe đạp điện là phương tiện cực kỳ nguy hiểm và đòi bố mẹ mua xe máy xăng, dù tỷ lệ sự cố xe đạp điện trên thực tế là rất nhỏ.',
    selfCheckQuestion: 'Mình đang tin điều này vì nó thực sự phổ biến trong dữ liệu thống kê, hay chỉ vì một vài tin tức giật gân vừa đập vào mắt mình?',
    iconName: 'Zap'
  },
  {
    id: 'survivorship_bias',
    name: 'Survivorship Bias',
    vietnameseName: 'Thiên kiến kẻ sống sót',
    definition: 'Chỉ tập trung phân tích những cá nhân hoặc trường hợp đã vượt qua thử thách để đạt thành công vang dội. Ta vô tình phớt lờ số lượng khổng lồ những người thất bại trong hoàn cảnh tương tự nhưng không có cơ hội lên tiếng.',
    schoolExample: 'Thấy một vài tỷ phú công nghệ từng bỏ học đại học để khởi nghiệp thành công, bạn vội cho rằng việc học đại học là vô ích và bỏ học sẽ dễ làm giàu, mà quên mất hàng triệu người bỏ học khác đang chật vật tìm việc làm.',
    selfCheckQuestion: 'Những người làm theo cách này nhưng thất bại hiện ở đâu và câu chuyện của họ là gì mà mình chưa thấy được?',
    iconName: 'Trophy'
  },
  {
    id: 'sunk_cost_fallacy',
    name: 'Sunk Cost Fallacy',
    vietnameseName: 'Thiên kiến chi phí chìm',
    definition: 'Tiếp tục đổ thêm thời gian, tiền bạc hoặc công sức vào một kế hoạch không còn hiệu quả chỉ vì tiếc nuối những gì đã đầu tư trước đó. Sự nuối tiếc này khiến ta đưa ra những quyết định thiếu tỉnh táo thay vì dừng lại đúng lúc để bắt đầu phương án tốt hơn.',
    schoolExample: 'Dù nhận thấy bản thân hoàn toàn không phù hợp và kiệt sức với việc thi khối Tự nhiên, bạn vẫn cố bám trụ thêm một năm chỉ vì "tiếc công sức đã học thêm Toán - Lý - Hóa suốt 2 năm qua".',
    selfCheckQuestion: 'Nếu bây giờ được bắt đầu lại từ đầu mà không vướng bận những gì đã bỏ ra, mình có chọn đi tiếp con đường này hay không?',
    iconName: 'Hourglass'
  },
  {
    id: 'bandwagon_effect',
    name: 'Bandwagon Effect',
    vietnameseName: 'Hiệu ứng đám đông',
    definition: 'Xu hướng tin theo một quan điểm hoặc làm theo một hành vi nào đó chỉ vì thấy đa số mọi người xung quanh đang làm như vậy. Áp lực muốn hòa nhập khiến cá nhân tự tắt đi bộ lọc tư duy độc lập để tránh cảm giác bị cô lập.',
    schoolExample: 'Trong buổi biểu quyết chọn trang phục kỷ yếu của lớp, dù thấy phương án thuê đồ dạ hội rất tốn kém và không thoải mái, bạn vẫn giơ tay đồng ý chỉ vì thấy đa số các bạn khác đều giơ tay.',
    selfCheckQuestion: 'Nếu không có ai xung quanh đang làm điều này, bản thân mình có thực sự thấy nó đúng đắn và cần thiết hay không?',
    iconName: 'Users'
  },
  {
    id: 'halo_effect',
    name: 'Halo Effect',
    vietnameseName: 'Hiệu ứng hào quang',
    definition: 'Khuynh hướng để một ấn tượng tích cực ban đầu ở một khía cạnh cụ thể làm lu mờ và chi phối toàn bộ đánh giá về các phẩm chất khác của một người. Ta thường vô thức gán cho người có vẻ ngoài ưa nhìn hoặc nói năng lưu loát những đức tính như thông minh, trung thực và tài giỏi.',
    schoolExample: 'Một bạn học sinh ăn mặc phong cách, nói chuyện dí dỏm được cả lớp tự động tin tưởng bầu làm thủ quỹ, dù bạn chưa từng chứng minh được kỹ năng quản lý tài chính hay tính cẩn thận trong sổ sách.',
    selfCheckQuestion: 'Mình đang đánh giá người này dựa trên năng lực chuyên môn thực tế của họ ở việc này, hay chỉ vì cảm tình với vẻ ngoài và sự hoạt ngôn của họ?',
    iconName: 'Sparkles'
  },
  {
    id: 'dunning_kruger_effect',
    name: 'Dunning–Kruger Effect',
    vietnameseName: 'Hiệu ứng Dunning–Kruger',
    definition: 'Hiện tượng người mới tiếp cận một lĩnh vực và có năng lực còn hạn chế lại thường tự tin thái quá về hiểu biết của mình. Ngược lại, những người am hiểu sâu sắc lại có xu hướng thận trọng, khiêm tốn vì họ nhận thức rõ tính phức tạp và bao la của tri thức.',
    schoolExample: 'Mới đọc lướt một vài bài viết tóm tắt về trí tuệ nhân tạo trên mạng xã hội, bạn học sinh đã tự tin tranh cãi gay gắt với giáo viên Tin học và khẳng định mình đã làm chủ hoàn toàn công nghệ AI.',
    selfCheckQuestion: 'Lĩnh vực này có những khía cạnh chuyên sâu và ngoại lệ nào mà một người mới học như mình chưa hề biết tới?',
    iconName: 'TrendingUp'
  }
];

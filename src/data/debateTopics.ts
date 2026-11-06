/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BỘ ĐỀ TRANH BIỆN CHUẨN ĐỊNH DẠNG WSDC (WORLD SCHOOLS DEBATING CHAMPIONSHIP)
 * Được mở rộng toàn diện từ TÀI LIỆU HUẤN LUYỆN TRANH BIỆN CHO HỌC SINH THPT
 * Gồm 27 chủ đề thuộc 4 lĩnh vực: Giáo Dục, Môi Trường, Y Tế & Sức Khỏe, Xã Hội.
 * Mỗi chủ đề tích hợp sẵn gợi ý khung lập luận PEEL (cơ chế nhân quả A -> B -> C) và phân loại Kiến nghị.
 */

import { DebateTopic } from '../types';

export const DEBATE_TOPICS: DebateTopic[] = [
  // ==========================================
  // LĨNH VỰC 1: GIÁO DỤC (10 CHỦ ĐỀ)
  // ==========================================
  {
    id: 'edu_01',
    motion: 'Nhà này sẽ bãi bỏ hoàn toàn bài tập về nhà cho học sinh phổ thông (Should Homework Be Abolished?)',
    category: 'giao_duc',
    categoryLabel: 'Giáo Dục',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Bài tập về nhà từ lâu được coi là cách củng cố kiến thức, nhưng hiện nay đang tạo ra áp lực quá tải, cướp đi giấc ngủ và thời gian phát triển kỹ năng xã hội của học sinh.',
    proArgumentsSummary: [
      'Giải phóng 2-4 tiếng mỗi tối giúp học sinh tái tạo năng lượng, ngủ đủ 8 tiếng và gắn kết với gia đình.',
      'Thu hẹp khoảng cách bất bình đẳng giáo dục: học sinh nghèo không có góc học tập yên tĩnh hay cha mẹ kèm cặp.',
      'Khuyến khích học sinh chủ động tự nghiên cứu theo sở thích thay vì hoàn thành nghĩa vụ đối phó.'
    ],
    conArgumentsSummary: [
      'Bài tập về nhà là công cụ then chốt rèn luyện tính kỷ luật, tự giác và khả năng quản lý thời gian độc lập.',
      'Thời lượng trên lớp không đủ để giáo viên kiểm tra mức độ hiểu sâu kiến thức của từng cá nhân.',
      'Nếu không có bài tập, nhiều học sinh sẽ lãng phí toàn bộ thời gian vào mạng xã hội và trò chơi điện tử.'
    ],
    difficulty: 'Tap_su',
    peelGuidance: {
      explanation: 'Bỏ bài tập bắt buộc (A) -> Giảm áp lực bài vở dồn dập vào đêm muộn (B) -> Tạo điều kiện cho học sinh nghỉ ngơi đầy đủ (C). (Có ý kiến cho rằng điều này giúp giảm căng thẳng và cải thiện chất lượng giấc ngủ, hãy tìm số liệu kiểm chứng).',
      point: 'Học sinh THPT, phụ huynh lao động bận rộn, giáo viên chấm bài ngoài giờ.',
      evaluationMetric: 'Chất lượng sức khỏe tinh thần và hiệu suất học tập thực chất so với khối lượng bài tập hình thức.',
      link: 'So với thực trạng 75% học sinh kiệt sức mỗi tối, học sinh sẽ có thời gian trải nghiệm cuộc sống thực tế.',
      evidence: 'Có ý kiến cho rằng các quốc gia ít áp lực bài tập như Phần Lan vẫn duy trì được hiệu quả học tập tốt, học sinh có thể tra cứu số liệu đối sánh từ báo cáo PISA của OECD (nguồn: https://www.oecd.org/pisa/).'
    }
  },
  {
    id: 'edu_02',
    motion: 'Nhà này sẽ cho phép học sinh tự do sử dụng điện thoại thông minh trong lớp học phục vụ học tập.',
    category: 'giao_duc',
    categoryLabel: 'Giáo Dục',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Thay vì cấm đoán cực đoan, nhiều trường học hiện đại đang đề xuất biến smartphone thành máy tính bỏ túi đa năng hỗ trợ học tập số.',
    proArgumentsSummary: [
      'Cung cấp phương tiện tra cứu dữ liệu tức thì, tương tác bài giảng qua Quizizz, Kahoot và phòng thí nghiệm ảo.',
      'Dạy học sinh kỹ năng tự kiểm soát hành vi số (Digital Wellbeing) trong môi trường an toàn dưới sự hướng dẫn của thầy cô.',
      'Xóa bỏ chi phí mua sắm thiết bị chuyên dụng đắt đỏ bằng cách tận dụng thiết bị sẵn có của học sinh (BYOD).'
    ],
    conArgumentsSummary: [
      'Nguy cơ xao nhãng cực cao từ thông báo tin nhắn mạng xã hội và game trực tuyến làm đứt gãy luồng chú ý.',
      'Tạo ra sự bất bình đẳng và so sánh vật chất giữa học sinh dùng máy đời mới cao cấp và học sinh dùng máy giá rẻ.',
      'Gia tăng nguy cơ gian lận trong kiểm tra và quay lén, phát tán hình ảnh riêng tư trong lớp.'
    ],
    difficulty: 'Tap_su',
    peelGuidance: {
      explanation: 'Cho phép dùng có định hướng (A) -> Chuyển học sinh từ thụ động nghe giảng sang tự nghiên cứu dữ liệu (B) -> Tăng tính chủ động.',
      point: 'Học sinh Gen Z, giáo viên quản lý lớp, phụ huynh lo ngại con nghiện game.',
      evaluationMetric: 'Năng lực làm chủ công nghệ thực tế so với sự kiểm soát cưỡng bức tạm thời.',
      link: 'Thế giới nơi học sinh biết dùng smartphone như một thư viện tri thức thay vì chỉ là công cụ tiêu thụ nội dung vô bổ.',
      evidence: 'Báo cáo Giám sát Giáo dục Toàn cầu (GEM Report 2023) của UNESCO về công nghệ giáo dục (nguồn: https://unesdoc.unesco.org/ark:/48223/pf0000385723).'
    }
  },
  {
    id: 'edu_03',
    motion: 'Nhà này sẽ loại bỏ hoàn toàn mô hình trường chuyên, lớp chọn ở cấp THPT.',
    category: 'giao_duc',
    categoryLabel: 'Giáo Dục',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Mô hình trường chuyên từ lâu là niềm tự hào bồi dưỡng nhân tài mũi nhọn nhưng cũng đối mặt với chỉ trích về bất bình đẳng ngân sách và bệnh thành tích.',
    proArgumentsSummary: [
      'Tái phân bổ nguồn ngân sách nhà nước dồi dào để nâng cấp cơ sở vật chất cho toàn bộ các trường đại trà.',
      'Chấm dứt nạn học lệch, luyện "gà nòi" thi cử xa rời thực tiễn cuộc sống của học sinh chuyên.',
      'Xóa bỏ áp lực thi cử khốc liệt từ cấp 2 và tâm lý tự ti của học sinh không đỗ trường chuyên.'
    ],
    conArgumentsSummary: [
      'Trường chuyên là vườn ươm không thể thiếu để tập hợp và phát triển nhân tài khoa học công nghệ cho đất nước.',
      'Môi trường có nhiều bạn cùng chí hướng tạo áp lực đồng trang lứa tích cực, thúc đẩy tiềm năng vượt bậc.',
      'Học sinh có tố chất đặc biệt cần chương trình nâng cao tương xứng, nếu học chung đại trà sẽ kìm hãm tài năng.'
    ],
    difficulty: 'Cao_thu',
    peelGuidance: {
      explanation: 'Dồn ngân sách vào thiểu số (A) -> Thiếu hụt thiết bị thực hành ở trường vùng ven (B) -> Gia tăng phân hóa xã hội.',
      point: 'Học sinh năng khiếu, học sinh đại trà, ngân sách nhà nước, các viện nghiên cứu khoa học.',
      evaluationMetric: 'Công bằng xã hội và phổ cập giáo dục chất lượng cao so với mục tiêu đào tạo mũi nhọn tinh hoa.',
      link: 'Hệ thống giáo dục toàn diện nơi mọi trường học đều có phòng thí nghiệm và giáo viên chất lượng như trường chuyên.',
      evidence: 'Kinh nghiệm cải cách của Hàn Quốc và Phần Lan khi xóa bỏ các trường trung học ưu tú để nâng cao mặt bằng giáo dục quốc gia.'
    }
  },
  {
    id: 'edu_04',
    motion: 'Nhà này sẽ bắt buộc đưa giáo dục tài chính cá nhân và quản lý nợ vào chương trình dạy chính khóa THPT.',
    category: 'giao_duc',
    categoryLabel: 'Giáo Dục',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Nhiều thanh niên bước vào đời thiếu kiến thức quản lý chi tiêu, dễ rơi vào bẫy tín dụng đen, lừa đảo đa cấp và khủng hoảng nợ nần.',
    proArgumentsSummary: [
      'Trang bị kỹ năng sinh tồn thiết yếu: lập ngân sách, hiểu lãi suất kép, tiết kiệm và phòng tránh bẫy tài chính.',
      'Giảm thiểu tỷ lệ vỡ nợ sinh viên và nạn cho vay nặng lãi qua app nhắm vào giới trẻ.',
      'Xây dựng tư duy đầu tư dài hạn giúp thế hệ trẻ đạt được sự độc lập tài chính sớm.'
    ],
    conArgumentsSummary: [
      'Chương trình học hiện nay đã quá tải nặng nề, việc thêm môn học mới sẽ gây thêm áp lực thi cử.',
      'Học sinh THPT chưa tự kiếm ra tiền nên kiến thức về cổ phiếu, nợ và thuế sẽ mang tính lý thuyết suông.',
      'Thiếu đội ngũ giáo viên có chuyên môn tài chính thực chiến; dễ biến thành môn học nhớ vẹt công thức.'
    ],
    difficulty: 'Chien_binh',
    peelGuidance: {
      explanation: 'Học cơ chế tín dụng (A) -> Hiểu cách thức vận hành của lãi suất lũy kế (B) -> Miễn nhiễm trước các lời mời chào vay nợ độc hại.',
      point: 'Học sinh 15-18 tuổi chuẩn bị vào đại học, các tổ chức tài chính, phụ huynh.',
      evaluationMetric: 'Kỹ năng thực hành thiết thực phục vụ cuộc sống trưởng thành so với các môn lý thuyết hàn lâm.',
      link: 'Thế hệ công dân trẻ tự chủ tài chính, không bị nợ xấu đè nặng tương lai.',
      evidence: 'Khảo sát của Standard & Poor’s về tỷ lệ mù chữ tài chính ở người trẻ tại các nước đang phát triển trên 65%.'
    }
  },
  {
    id: 'edu_05',
    motion: 'Nhà này tin rằng sự bùng nổ của các khóa học kỹ năng mềm trực tuyến đang làm giảm giá trị thực tế của bằng đại học truyền thống.',
    category: 'giao_duc',
    categoryLabel: 'Giáo Dục',
    motionType: 'gia_tri',
    motionTypeLabel: 'Kiến nghị giá trị',
    background: 'Với sự trỗi dậy của Coursera, Udemy và các chứng chỉ thực chiến từ Google/Meta, nhiều nhà tuyển dụng bắt đầu ưu tiên kỹ năng thực tế hơn tấm bằng 4 năm.',
    proArgumentsSummary: [
      'Khóa học trực tuyến cập nhật công nghệ và xu hướng ngành nghề nhanh gấp nhiều lần giáo trình đại học cũ kỹ.',
      'Tiết kiệm hàng trăm triệu đồng học phí và 4 năm thanh xuân; cho phép người học tích lũy dự án thực chiến.',
      'Các tập đoàn công nghệ lớn (Google, Apple, Tesla) công khai không còn yêu cầu bằng cử nhân khi tuyển dụng.'
    ],
    conArgumentsSummary: [
      'Đại học truyền thống cung cấp nền tảng tư duy khoa học cơ bản, nghiên cứu chuyên sâu mà khóa học ngắn hạn không thể có.',
      'Môi trường đại học tạo ra vốn xã hội vô giá: mạng lưới bạn bè, giáo sư, câu lạc bộ và kỹ năng hợp tác thực tế.',
      'Khóa học online có tỷ lệ hoàn thành dưới 10% do thiếu kỷ luật và không có sự kiểm định chất lượng nghiêm ngặt.'
    ],
    difficulty: 'Chien_binh',
    peelGuidance: {
      explanation: 'Khóa học online bám sát nhu cầu tuyển dụng (A) -> Rút ngắn thời gian tiếp cận thị trường lao động (B) -> Làm xói mòn vị thế độc quyền của bằng cấp.',
      point: 'Sinh viên, nhà tuyển dụng doanh nghiệp, các trường đại học truyền thống.',
      evaluationMetric: 'Năng lực tạo ra giá trị công việc thực tế so với tính danh giá của bằng cấp học thuật.',
      link: 'Thị trường lao động dựa trên danh mục dự án (portfolio) và năng lực thực tế.',
      evidence: 'Báo cáo Diễn đàn Kinh tế Thế giới (WEF 2023) về kỹ năng tương lai và chính sách tuyển dụng không bằng cấp của Apple và Google.'
    }
  },
  {
    id: 'edu_06',
    motion: 'Nhà này sẽ tích hợp chính thức AI và các mô hình ngôn ngữ lớn vào chương trình giảng dạy trong lớp học.',
    category: 'giao_duc',
    categoryLabel: 'Giáo Dục',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Trước sự phổ biến của ChatGPT và Gemini, thay vì cấm đoán, nhiều chuyên gia đề xuất dạy học sinh cách trở thành "phi công lái AI" thông minh.',
    proArgumentsSummary: [
      'Đóng vai trò gia sư cá nhân hóa 24/7 giúp học sinh giải thích các khái niệm khó theo đúng tốc độ tiếp thu của bản thân.',
      'Giúp giáo viên giải phóng thời gian soạn giáo án và chấm bài để tập trung vào hướng dẫn cảm xúc và đạo đức.',
      'Chuẩn bị cho học sinh năng lực tương tác với AI (Prompt Engineering) - kỹ năng sinh tồn của thị trường lao động tương lai.'
    ],
    conArgumentsSummary: [
      'Làm xói mòn năng lực tự tư duy phản biện và khả năng viết lách độc lập do học sinh ỷ lại hoàn toàn vào câu trả lời có sẵn.',
      'Nguy cơ tạo ra sự lười biếng tư duy (Cognitive Offloading) và chấp nhận thông tin sai lệch do AI bịa đặt (Hallucination).',
      'Gia tăng khoảng cách công nghệ giữa trường học có tài khoản AI trả phí cao cấp và trường học khó khăn.'
    ],
    difficulty: 'Chien_binh',
    peelGuidance: {
      explanation: 'Tích hợp chính khóa (A) -> Dạy học sinh cách chất vấn và kiểm chứng thông tin của AI (B) -> Nâng cao tư duy phản biện bậc cao.',
      point: 'Học sinh phổ thông, giáo viên, nhà phát triển phần mềm giáo dục.',
      evaluationMetric: 'Khả năng cộng tác công nghệ thông minh so với nỗi sợ hãi lạc hậu.',
      link: 'Lớp học nơi AI là trợ giảng hỗ trợ học sinh tự khai phóng tiềm năng.',
      evidence: 'Thí điểm của Khan Academy với Khanmigo tại Mỹ và các báo cáo ứng dụng AI trong trường học của Bộ Giáo dục Singapore.'
    }
  },
  {
    id: 'edu_07',
    motion: 'Nhà này sẽ cấm học sinh dưới 15 tuổi sử dụng các công cụ tạo sinh AI (Generative AI) trong học tập.',
    category: 'giao_duc',
    categoryLabel: 'Giáo Dục',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Lứa tuổi dưới 15 là giai đoạn não bộ đang hoàn thiện các cấu trúc tư duy logic cơ bản, việc tiếp xúc sớm với AI tạo sinh có thể làm gián đoạn quá trình này.',
    proArgumentsSummary: [
      'Bảo vệ giai đoạn hình thành tư duy trừu tượng, kỹ năng tính toán nhẩm và khả năng diễn đạt ngôn từ tự thân.',
      'Tránh hiện tượng "đốt cháy giai đoạn" nhận thức khi trẻ em coi đáp án tức thì của máy móc là chân lý mà không hiểu bản chất.',
      'Bảo vệ sự an toàn thông tin và dữ liệu cá nhân của trẻ vị thành niên trước các thuật toán thu thập dữ liệu.'
    ],
    conArgumentsSummary: [
      'Cấm đoán chỉ kích thích sự tò mò lén lút và khiến trẻ em sử dụng thiếu an toàn ngoài tầm mắt của người lớn.',
      'Tước đoạt công cụ kích thích trí tưởng tượng: tạo tranh minh họa câu chuyện, học ngoại ngữ qua hội thoại tương tác.',
      'Quy định cấm theo độ tuổi là bất khả thi về mặt kỹ thuật và biến phụ huynh thành "cảnh sát công nghệ".'
    ],
    difficulty: 'Tap_su',
    peelGuidance: {
      explanation: 'Chặn AI giai đoạn dưới 15 (A) -> Buộc não bộ phải tự liên kết các vùng ngôn ngữ và logic tự thân (B) -> Xây móng vững chắc.',
      point: 'Trẻ em THCS (dưới 15 tuổi), phụ huynh, giáo viên ngữ văn và toán học.',
      evaluationMetric: 'Bảo vệ sự phát triển thần kinh nhận thức tự nhiên của trẻ em.',
      link: 'Học sinh nắm vững gốc rễ tư duy trước khi tiếp cận công cụ khuếch đại tư duy.',
      evidence: 'Khuyến cáo trong tài liệu hướng dẫn Generative AI trong Giáo dục và Nghiên cứu của UNESCO (2023, nguồn: https://unesdoc.unesco.org/ark:/48223/pf0000386693).'
    }
  },
  {
    id: 'edu_08',
    motion: 'Nhà này tin rằng bằng đại học không còn là tiêu chí quan trọng hàng đầu để đánh giá năng lực lao động trong thế kỷ 21.',
    category: 'giao_duc',
    categoryLabel: 'Giáo Dục',
    motionType: 'gia_tri',
    motionTypeLabel: 'Kiến nghị giá trị',
    background: 'Thị trường lao động biến đổi liên tục đòi hỏi khả năng thích ứng, tự học và kỹ năng giải quyết vấn đề phức tạp hơn là một tấm bằng tĩnh sau 4 năm.',
    proArgumentsSummary: [
      'Tấm bằng chỉ phản ánh khả năng thi cử trong môi trường lý thuyết hàn lâm, không phản ánh năng lực giao tiếp và xử lý khủng hoảng.',
      'Sự lỗi thời nhanh chóng của kiến thức khiến tấm bằng đại học mất dần giá trị chuyên môn sau 2-3 năm tốt nghiệp.',
      'Nhiều doanh nghiệp chuyển sang đánh giá dựa trên dự án thực tế (Portfolio), bài kiểm tra tư duy và thái độ làm việc.'
    ],
    conArgumentsSummary: [
      'Tấm bằng là bộ lọc uy tín chứng minh ứng viên có khả năng theo đuổi mục tiêu dài hạn, vượt qua kỷ luật học thuật khắt khe.',
      'Trong các ngành đặc thù (Y khoa, Kỹ thuật hạt nhân, Luật), bằng đại học là bảo chứng pháp lý bắt buộc cho tính mạng con người.',
      'Xóa bỏ vai trò của bằng cấp sẽ dẫn đến tình trạng hỗn loạn tiêu chuẩn tuyển dụng và thiệt thòi cho sinh viên nỗ lực học tập.'
    ],
    difficulty: 'Chien_binh',
    peelGuidance: {
      explanation: 'Tốc độ đổi mới công nghệ (A) -> Kiến thức trường lớp không kịp cập nhật (B) -> Năng lực tự học trở thành kỹ năng sinh tồn tối thượng.',
      point: 'Người tìm việc trẻ, doanh nghiệp, hệ thống giáo dục đại học.',
      evaluationMetric: 'Tính hữu dụng thực tế và khả năng thích ứng so với quy chuẩn học vị truyền thống.',
      link: 'Văn hóa đánh giá con người qua năng lực đóng góp thực tế thay vì mác trường lớp.',
      evidence: 'Khảo sát của LinkedIn 2023: 73% nhà tuyển dụng ưu tiên tuyển dụng theo kỹ năng (Skills-first hiring) hơn là bằng cấp.'
    }
  },
  {
    id: 'edu_09',
    motion: 'Nhà này sẽ áp dụng chính sách Gap Year (1 năm nghỉ ngơi, trải nghiệm thực tế) bắt buộc trước khi học sinh nhập học Đại học.',
    category: 'giao_duc',
    categoryLabel: 'Giáo Dục',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Học sinh tốt nghiệp cấp 3 thường rơi vào tình trạng mơ hồ về bản thân, chọn sai ngành nghề theo phong trào hoặc kỳ vọng của cha mẹ.',
    proArgumentsSummary: [
      'Cho phép học sinh va vấp với công việc thực tế, tình nguyện xã hội để thấu hiểu đam mê và điểm mạnh/yếu của chính mình.',
      'Giảm đáng kể tỷ lệ sinh viên chán học, bỏ học giữa chừng hoặc ra trường làm trái ngành.',
      'Rèn luyện sự độc lập, kỹ năng sống và năng lực tài chính trước khi bước vào môi trường đại học.'
    ],
    conArgumentsSummary: [
      'Tạo gánh nặng tài chính khổng lồ cho các gia đình khó khăn không đủ điều kiện chu cấp thêm 1 năm cho con trải nghiệm.',
      'Nguy cơ mất đà học tập, suy giảm kiến thức toán học và ngoại ngữ sau một năm không tiếp xúc với sách vở.',
      'Chính sách bắt buộc tước đoạt quyền tự quyết của những học sinh đã xác định rõ mục tiêu và muốn hoàn thành sớm việc học.'
    ],
    difficulty: 'Chien_binh',
    peelGuidance: {
      explanation: 'Có 1 năm trải nghiệm (A) -> Hiểu rõ thực tế công việc và bản thân (B) -> Đưa ra quyết định chọn ngành đại học chính xác và cam kết cao.',
      point: 'Học sinh 18 tuổi, phụ huynh, các trường đại học.',
      evaluationMetric: 'Độ chín muồi tâm lý và định hướng cuộc đời so với tốc độ hoàn thành lộ trình bằng cấp.',
      link: 'Thế hệ sinh viên vào đại học với động lực nội tại mãnh liệt thay vì sự hoang mang bị ép buộc.',
      evidence: 'Có ý kiến cho rằng trải nghiệm Gap Year giúp học sinh định hình rõ mục tiêu nghề nghiệp và tăng độ gắn kết khi học đại học, hãy tìm số liệu kiểm chứng từ các nghiên cứu khảo sát sinh viên.'
    }
  },
  {
    id: 'edu_10',
    motion: 'Nhà này sẽ chuyển đổi 50% thời lượng giảng dạy Đại học sang hình thức trực tuyến và tự nghiên cứu.',
    category: 'giao_duc',
    categoryLabel: 'Giáo Dục',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Mô hình học kết hợp (Hybrid Learning) mang lại tính linh hoạt cao nhưng đặt ra dấu hỏi về chất lượng đào tạo và sự kết nối giữa người với người.',
    proArgumentsSummary: [
      'Cho phép sinh viên chủ động quản lý thời gian, vừa học vừa đi làm thêm tích lũy kinh nghiệm nghề nghiệp thực tế.',
      'Giảm áp lực chi phí ăn ở, đi lại đắt đỏ tại các đô thị lớn; tối ưu hóa chi phí vận hành giảng đường.',
      'Tạo điều kiện để người học tiếp cận các bài giảng trực tuyến của các giáo sư hàng đầu thế giới.'
    ],
    conArgumentsSummary: [
      'Làm suy giảm nghiêm trọng sự tương tác trực tiếp, kỹ năng tranh biện và xây dựng mối quan hệ xã hội tại giảng đường.',
      'Thiếu hiệu quả đối với các môn học đòi hỏi thực hành thí nghiệm, lâm sàng y khoa hoặc thảo luận nhóm sâu.',
      'Phụ thuộc nặng nề vào đường truyền internet và mức độ tự giác của sinh viên; dễ dẫn đến tình trạng lười biếng bỏ bê.'
    ],
    difficulty: 'Chien_binh',
    peelGuidance: {
      explanation: 'Học online 50% (A) -> Linh hoạt địa điểm và thời gian (B) -> Tăng cơ hội thực tập sớm tại doanh nghiệp.',
      point: 'Sinh viên, giảng viên đại học, các nhà tuyển dụng.',
      evaluationMetric: 'Tính linh hoạt và khả năng tự chủ học tập so với giá trị trải nghiệm cộng đồng giảng đường.',
      link: 'Mô hình giáo dục đại học mở, chi phí thấp và gắn liền với thực tiễn việc làm.',
      evidence: 'Báo cáo hiệu quả của các chương trình MicroMasters từ MIT và edX đối với khả năng thăng tiến của người học.'
    }
  },

  // ==========================================
  // LĨNH VỰC 2: MÔI TRƯỜNG (6 CHỦ ĐỀ)
  // ==========================================
  {
    id: 'env_01',
    motion: 'Nhà này sẽ ưu tiên năng lượng hạt nhân hơn năng lượng tái tạo (gió, mặt trời) trong chiến lược chuyển dịch năng lượng ngắn hạn.',
    category: 'moi_truong',
    categoryLabel: 'Môi Trường',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Trước tình trạng biến đổi khí hậu khẩn cấp và nhu cầu phụ tải điện nền khổng lồ, năng lượng hạt nhân phát thải ròng carbon bằng 0 đang được tái cân nhắc.',
    proArgumentsSummary: [
      'Cung cấp nguồn điện nền liên tục, công suất cực lớn, không bị phụ thuộc vào điều kiện thời tiết thất thường như điện gió và mặt trời.',
      'Chiếm ít diện tích đất tự nhiên hơn hàng chục lần so với các cánh đồng pin mặt trời và tuabin gió khổng lồ.',
      'Mật độ năng lượng siêu cao: một viên nhiên liệu uranium nhỏ bằng đầu ngón tay tạo ra năng lượng tương đương 1 tấn than đá.'
    ],
    conArgumentsSummary: [
      'Chi phí đầu tư ban đầu cực kỳ đắt đỏ và thời gian xây dựng kéo dài 10-15 năm, không kịp ứng phó với khủng hoảng khí hậu trước mắt.',
      'Vấn đề xử lý chất thải phóng xạ nguy hại tồn tại hàng nghìn năm vẫn chưa có giải pháp an toàn triệt để toàn cầu.',
      'Nguy cơ thảm họa hạt nhân (như Chernobyl, Fukushima) và rủi ro phổ biến vũ khí hạt nhân trong bối cảnh xung đột địa chính trị.'
    ],
    difficulty: 'Cao_thu',
    peelGuidance: {
      explanation: 'Đầu tư hạt nhân (A) -> Ổn định nguồn điện nền cho công nghiệp không phát thải CO2 (B) -> Đạt Net Zero nhanh hơn.',
      point: 'Ngành năng lượng quốc gia, người dân sống gần nhà máy hạt nhân, các nhà bảo vệ môi trường.',
      evaluationMetric: 'An ninh năng lượng và tính ổn định công suất so với rủi ro thảm họa phóng xạ dài hạn.',
      link: 'Lưới điện sạch vận hành 24/7 không cần đốt than đá cứu vãn khí hậu.',
      evidence: 'Báo cáo của Cơ quan Năng lượng Quốc tế (IEA 2022) và mô hình chuyển đổi điện hạt nhân thành công của Pháp (70% điện sạch).'
    }
  },
  {
    id: 'env_02',
    motion: 'Nhà này sẽ cấm hoàn toàn quảng cáo đối với các ngành công nghiệp gây ô nhiễm nặng (thời trang nhanh, hàng không, nhiên liệu hóa thạch).',
    category: 'moi_truong',
    categoryLabel: 'Môi Trường',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Tương tự như việc cấm quảng cáo thuốc lá trong quá khứ, đề xuất cấm quảng cáo các sản phẩm hủy hoại khí hậu đang được vận động tại châu Âu.',
    proArgumentsSummary: [
      'Cắt đứt cỗ máy kích cầu chủ nghĩa tiêu dùng quá đà và thói quen mua sắm quần áo mặc một lần rồi vứt bỏ.',
      'Xóa bỏ hiện tượng "tẩy xanh" (Greenwashing) khi các tập đoàn dầu mỏ quảng cáo hình ảnh thân thiện để đánh lừa công chúng.',
      'Tạo áp lực buộc các thương hiệu phải chuyển dịch ngân sách sang nghiên cứu vật liệu bền vững thay vì chi tiền cho marketing.'
    ],
    conArgumentsSummary: [
      'Vi phạm quyền tự do kinh doanh và tự do ngôn luận thương mại hợp pháp của các doanh nghiệp đóng thuế đầy đủ.',
      'Gây sụp đổ nguồn thu của ngành truyền thông, báo chí và các nền tảng sáng tạo nội dung phụ thuộc vào tiền quảng cáo.',
      'Không giải quyết được gốc rễ vấn đề: người tiêu dùng vẫn cần đi máy bay và mặc quần áo; cấm quảng cáo không làm giảm nhu cầu thực tế.'
    ],
    difficulty: 'Chien_binh',
    peelGuidance: {
      explanation: 'Cấm quảng cáo (A) -> Giảm kích thích tâm lý mua sắm bốc đồng (B) -> Giảm lượng sản xuất thừa và rác thải dệt may.',
      point: 'Người tiêu dùng trẻ, các hãng thời trang nhanh (Zara, Shein), ngành hàng không, môi trường biển.',
      evaluationMetric: 'Trách nhiệm sinh thái toàn cầu so với quyền tự do thương mại của doanh nghiệp.',
      link: 'Xã hội hướng tới lối sống tiêu dùng bền vững, tôn trọng tài nguyên Trái Đất.',
      evidence: 'Lệnh cấm quảng cáo nhiên liệu hóa thạch của thành phố Amsterdam (Hà Lan) và tiền lệ thành công của luật cấm quảng cáo thuốc lá quốc tế.'
    }
  },
  {
    id: 'env_03',
    motion: 'Nhà này ủng hộ việc quy định trách nhiệm tái chế bắt buộc đối với các nhà sản xuất bao bì nhựa (EPR - Extended Producer Responsibility).',
    category: 'moi_truong',
    categoryLabel: 'Môi Trường',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Lâu nay trách nhiệm rác thải bị đẩy về phía người tiêu dùng và chính quyền, chính sách EPR buộc các công ty tạo ra rác nhựa phải bỏ tiền thu gom tái chế.',
    proArgumentsSummary: [
      'Thực hiện nguyên tắc công bằng sinh thái: "Người gây ô nhiễm phải trả tiền" (Polluter Pays Principle).',
      'Tạo động lực kinh tế trực tiếp buộc nhà sản xuất phải tái thiết kế bao bì: chuyển sang vật liệu phân hủy sinh học hoặc tái sử dụng.',
      'Huy động nguồn vốn tư nhân khổng lồ để xây dựng hạ tầng thu gom và tái chế rác thải hiện đại, giảm gánh nặng ngân sách nhà nước.'
    ],
    conArgumentsSummary: [
      'Doanh nghiệp sẽ cộng toàn bộ chi phí tái chế vào giá bán, khiến người tiêu dùng có thu nhập thấp phải gánh chịu giá hàng hóa đắt đỏ.',
      'Tạo ra gánh nặng tuân thủ thủ tục hành chính phức tạp bóp nghẹt các doanh nghiệp vừa và nhỏ (SMEs).',
      'Nguy cơ xuất hiện các liên minh thu gom giả tạo trên giấy tờ để hợp thức hóa chứng chỉ mà không thu gom thực tế.'
    ],
    difficulty: 'Chien_binh',
    peelGuidance: {
      explanation: 'Buộc chịu trách nhiệm tài chính (A) -> Tăng chi phí nếu dùng nhựa nguyên sinh (B) -> Doanh nghiệp tự giác chuyển sang vật liệu xanh.',
      point: 'Nhà sản xuất đồ uống, người tiêu dùng, người thu gom rác tự do (đồng nát), đại dương.',
      evaluationMetric: 'Trách nhiệm giải trình của doanh nghiệp đối với vòng đời sản phẩm.',
      link: 'Kinh tế tuần hoàn nơi nhựa được tái chế khép kín thay vì chôn lấp hoặc thải ra biển.',
      evidence: 'Hệ thống hoàn tiền vỏ chai Pfand tại Đức đạt tỷ lệ thu gom tái chế bao bì nhựa trên 98%.'
    }
  },
  {
    id: 'env_04',
    motion: 'Nhà này sẽ áp dụng chính sách phân phối theo định lượng (rationing) đối với các nguồn tài nguyên khan hiếm trong thời kỳ khủng hoảng khí hậu.',
    category: 'moi_truong',
    categoryLabel: 'Môi Trường',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Khi hạn hán và nắng nóng cực đoan làm cạn kiệt nước sạch và điện, phân phối theo giá thị trường sẽ khiến người giàu tha hồ phung phí còn người nghèo chết khát.',
    proArgumentsSummary: [
      'Bảo đảm công bằng xã hội: Mọi công dân đều được cấp một hạn mức sinh tồn cơ bản (nước sạch, điện, lương thực) bất kể giàu nghèo.',
      'Ngăn chặn tầng lớp thượng lưu sử dụng tiền để tích trữ đầu cơ hoặc lãng phí tài nguyên (tưới sân golf, hồ bơi riêng) giữa đại hạn.',
      'Ý thức được sự khan hiếm thực sự của thiên nhiên, thúc đẩy toàn dân đồng lòng tiết kiệm vì sự sống còn chung.'
    ],
    conArgumentsSummary: [
      'Hạn chế quyền tự do cá nhân và quyền sở hữu tài sản hợp pháp của công dân; tạo ra bộ máy kiểm soát quan liêu độc tài.',
      'Dễ dẫn đến thị trường chợ đen, buôn lậu và tham nhũng hối lộ trong việc cấp phát tem phiếu hạn mức tài nguyên.',
      'Triệt tiêu động lực lao động và đổi mới sáng tạo công nghệ khi người nỗ lực làm việc không thể hưởng thụ cuộc sống xứng đáng.'
    ],
    difficulty: 'Cao_thu',
    peelGuidance: {
      explanation: 'Áp đặt hạn mức (A) -> Chặn đứng hành vi tiêu xài hoang phí của tầng lớp thừa mứa (B) -> Giữ nguồn tài nguyên không cạn kiệt.',
      point: 'Người nghèo đô thị, tầng lớp trung lưu, nhà nước điều hành, nông dân chịu hạn.',
      evaluationMetric: 'Quyền sinh tồn bình đẳng thời chiến/khủng hoảng so với tự do thị trường tư bản.',
      link: 'Tài nguyên nước và năng lượng được bảo vệ bền vững cho toàn thể nhân loại.',
      evidence: 'Chính sách phân phối nước theo định lượng tại Cape Town (Nam Phi) cứu thành phố khỏi Ngày Số Không (Day Zero 2018).'
    }
  },
  {
    id: 'env_05',
    motion: 'Nhà này sẽ cấm hoàn toàn việc sản xuất, lưu hành và sử dụng túi nilon dùng một lần.',
    category: 'moi_truong',
    categoryLabel: 'Môi Trường',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Túi nilon mất hàng trăm năm để phân hủy, gây tắc nghẽn cống rãnh, ô nhiễm vi nhựa trong chuỗi thức ăn và giết chết sinh vật biển.',
    proArgumentsSummary: [
      'Chặn đứng ngay lập tức hàng tỷ túi nhựa đổ ra môi trường mỗi ngày, bảo vệ hệ sinh thái sông ngòi và biển cả.',
      'Thúc đẩy thói quen văn minh: người dân mang theo làn, túi vải tái sử dụng nhiều lần khi đi chợ và siêu thị.',
      'Kích thích sự phát triển mạnh mẽ của ngành công nghiệp sản xuất túi giấy, lá chuối và bao bì sinh học tự hủy.'
    ],
    conArgumentsSummary: [
      'Gây xáo trộn nghiêm trọng đời sống của hàng triệu tiểu thương chợ truyền thống và người nghèo do túi nilon quá rẻ và tiện lợi.',
      'Các vật liệu thay thế (túi vải cotton) cần lượng nước và năng lượng sản xuất khổng lồ; nếu không dùng hàng nghìn lần thì dấu chân carbon còn cao hơn túi nilon.',
      'Dẫn đến tình trạng vi phạm luật tràn lan do thiếu lực lượng thanh tra xử phạt tại các chợ cóc, chợ tạm.'
    ],
    difficulty: 'Tap_su',
    peelGuidance: {
      explanation: 'Lệnh cấm triệt để (A) -> Loại bỏ sự lựa chọn dễ dãi tại quầy thanh toán (B) -> Buộc người dân phải hình thành thói quen mang túi cá nhân.',
      point: 'Người nội trợ, tiểu thương chợ truyền thống, sinh vật biển bị tắc ruột vì túi nilon.',
      evaluationMetric: 'Hành động dứt khoát cứu vãn môi trường so với sự bất tiện sinh hoạt ngắn hạn.',
      link: 'Không còn cảnh "ô nhiễm trắng" trên các bãi biển và đồng ruộng.',
      evidence: 'Lệnh cấm túi nilon triệt để tại Rwanda từ năm 2008 biến thủ đô Kigali thành thành phố sạch nhất châu Phi.'
    }
  },
  {
    id: 'env_06',
    motion: 'Nhà này sẽ đánh thuế carbon trực tiếp trên từng sản phẩm tiêu dùng dựa trên dấu chân khí thải của chúng.',
    category: 'moi_truong',
    categoryLabel: 'Môi Trường',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Để giá cả phản ánh đúng chi phí môi trường (chi phí ngoại biên), thuế carbon trực tiếp sẽ làm các sản phẩm gây ô nhiễm đắt đỏ hơn.',
    proArgumentsSummary: [
      'Sử dụng bàn tay vô hình của thị trường: hàng hóa ô nhiễm (thịt bò công nghiệp, hàng nhập khẩu đường bay) sẽ đắt hơn, hướng người tiêu dùng sang sản phẩm xanh.',
      'Tạo nguồn thu ngân sách tái đầu tư phát triển năng lượng sạch và trợ cấp phương tiện giao thông công cộng.',
      'Minh bạch hóa lượng khí thải phát sinh trong quá trình sản xuất trên nhãn mác sản phẩm cho người tiêu dùng lựa chọn.'
    ],
    conArgumentsSummary: [
      'Đây là loại thuế lũy thoái (Regressive tax), đánh trực tiếp vào các mặt hàng tiêu dùng thiết yếu làm gia tăng gánh nặng lạm phát lên người nghèo.',
      'Cực kỳ phức tạp và tốn kém về mặt kỹ thuật để tính toán chính xác dấu chân carbon cho hàng triệu sản phẩm từ nông trại đến kệ hàng.',
      'Làm giảm sức cạnh tranh của hàng hóa nội địa so với hàng hóa nhập khẩu từ các quốc gia không đánh thuế carbon.'
    ],
    difficulty: 'Cao_thu',
    peelGuidance: {
      explanation: 'Tăng thuế carbon (A) -> Đẩy giá bán sản phẩm bẩn lên cao (B) -> Người tiêu dùng tự động đổi sang dùng hàng thân thiện môi trường vì lý do kinh tế.',
      point: 'Hộ gia đình thu nhập thấp, chuỗi bán lẻ, các nhà máy xả thải CO2.',
      evaluationMetric: 'Nội hóa chi phí ngoại biên môi trường vào quy luật cung cầu kinh tế.',
      link: 'Nền kinh tế carbon thấp được định hình bởi chính sự lựa chọn mua sắm hàng ngày của người dân.',
      evidence: 'Chính sách thuế carbon của Thụy Điển từ năm 1991 giúp giảm 27% khí thải nhà kính trong khi GDP vẫn tăng trưởng 83%.'
    }
  },

  // ==========================================
  // LĨNH VỰC 3: Y TẾ & SỨC KHỎE (7 CHỦ ĐỀ)
  // ==========================================
  {
    id: 'health_01',
    motion: 'Nhà này sẽ bắt buộc dán nhãn cảnh báo tác hại sức khỏe (màu đỏ/hình ảnh cảnh báo) lên thực phẩm đóng gói có hàm lượng đường cao.',
    category: 'y_te_suc_khoe',
    categoryLabel: 'Y Tế & Sức Khỏe',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Đại dịch béo phì, tiểu đường tuýp 2 và tim mạch ở trẻ em đang bùng nổ do tiêu thụ quá nhiều trà sữa, nước ngọt có ga và bánh kẹo công nghiệp.',
    proArgumentsSummary: [
      'Cung cấp thông tin trực quan, cảnh báo tức thì ngay tại thời điểm mua hàng giúp cha mẹ và học sinh nhận thức nguy cơ bệnh tật.',
      'Tạo áp lực buộc các tập đoàn thực phẩm phải cải tiến công thức, giảm lượng đường để tránh bị gắn nhãn cảnh báo đỏ.',
      'Giảm gánh nặng chi phí điều trị các bệnh mãn tính không lây nhiễm lên hệ thống bảo hiểm y tế quốc gia.'
    ],
    conArgumentsSummary: [
      'Tạo ra tâm lý sợ hãi, rối loạn ăn uống và kỳ thị ngoại hình (Fat shaming) đối với trẻ em thừa cân.',
      'Gây thiệt hại kinh tế nặng nề cho các nhà sản xuất thực phẩm truyền thống; người tiêu dùng vẫn có quyền tự do lựa chọn khẩu vị của mình.',
      'Nhãn cảnh báo dễ bị nhờn mắt sau một thời gian, không hiệu quả bằng việc giáo dục dinh dưỡng và rèn luyện thể thao.'
    ],
    difficulty: 'Tap_su',
    peelGuidance: {
      explanation: 'Nhãn cảnh báo đập vào mắt (A) -> Kích hoạt phản xạ e ngại nguy cơ bệnh tật (B) -> Giảm lượng tiêu thụ đường tinh luyện hàng ngày.',
      point: 'Thanh thiếu niên thích đồ ngọt, phụ huynh, ngành công nghiệp nước ngọt, bệnh nhân tiểu đường.',
      evaluationMetric: 'Quyền được biết thông tin sức khỏe và bảo vệ giống nòi so với quyền tự do ẩm thực.',
      link: 'Thế hệ trẻ lớn lên với chế độ ăn uống lành mạnh, đẩy lùi đại dịch tiểu đường tuổi học đường.',
      evidence: 'Hệ thống nhãn cảnh báo hình bát giác màu đen tại Chile (2016) giúp giảm 24% lượng mua đồ uống có đường chỉ sau 3 năm.'
    }
  },
  {
    id: 'health_02',
    motion: 'Nhà này sẽ miễn phí hoàn toàn các dịch vụ chăm sóc và tư vấn sức khỏe tâm thần cho học sinh, sinh viên.',
    category: 'y_te_suc_khoe',
    categoryLabel: 'Y Tế & Sức Khỏe',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Tỷ lệ trầm cảm, rối loạn lo âu và tự hại ở học sinh THPT gia tăng báo động, nhưng chi phí khám tâm lý tư nhân quá đắt đỏ so với túi tiền của các em.',
    proArgumentsSummary: [
      'Xóa bỏ rào cản tài chính giúp học sinh tiếp cận sớm các chuyên gia trị liệu trước khi khủng hoảng tâm lý biến thành bi kịch.',
      'Góp phần bình thường hóa và xóa bỏ định kiến xã hội xem việc đi khám tâm thần là "điên" hay yếu đuối.',
      'Đầu tư sinh lời cao nhất cho tương lai: cứu vớt cuộc đời của những người trẻ tài năng khỏi bóng tối tâm bệnh.'
    ],
    conArgumentsSummary: [
      'Tạo áp lực ngân sách khổng lồ cho nhà nước trong khi số lượng chuyên gia tâm lý học đường đạt chuẩn hiện nay còn quá thiếu thốn.',
      'Dễ dẫn đến tình trạng quá tải phòng khám và lạm dụng chẩn đoán, phụ thuộc vào thuốc an thần khi chưa thực sự cần thiết.',
      'Vấn đề tâm lý thường bắt nguồn từ áp lực gia đình và thi cử; miễn phí tư vấn chỉ giải quyết phần ngọn mà không chữa được gốc rễ.'
    ],
    difficulty: 'Chien_binh',
    peelGuidance: {
      explanation: 'Miễn phí dịch vụ tâm lý (A) -> Học sinh chủ động tìm kiếm trợ giúp bí mật (B) -> Can thiệp kịp thời ngăn ngừa hành vi tự hại.',
      point: 'Học sinh chịu áp lực học tập/bạo lực học đường, chuyên gia tâm lý, ngân sách y tế quốc gia.',
      evaluationMetric: 'Quyền được bảo vệ mạng sống và sự an lành tâm trí của trẻ vị thành niên.',
      link: 'Môi trường học đường nơi không có học sinh nào phải âm thầm chịu đựng nỗi đau tâm lý một mình.',
      evidence: 'Thống kê của Viện Sức khỏe Tâm thần Quốc gia và mô hình tư vấn tâm lý miễn phí toàn diện tại các trường trung học Úc (Headspace).'
    }
  },
  {
    id: 'health_03',
    motion: 'Nhà này sẽ quy định việc tiêm chủng các loại vắc-xin cơ bản là nghĩa vụ bắt buộc đối với toàn bộ công dân.',
    category: 'y_te_suc_khoe',
    categoryLabel: 'Y Tế & Sức Khỏe',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Sự trỗi dậy của phong trào "Anti-vaccine" đang đe dọa phá vỡ miễn dịch cộng đồng, làm bùng phát trở lại các bệnh truyền nhiễm chết người như sởi, bại liệt.',
    proArgumentsSummary: [
      'Thiết lập và bảo vệ vững chắc lá chắn Miễn dịch cộng đồng (Herd Immunity) để bảo vệ những người không thể tiêm chủng (trẻ sơ sinh, người ung thư).',
      'Tiêm chủng không chỉ là vấn đề sức khỏe cá nhân mà là trách nhiệm an ninh y tế công cộng đối với tính mạng của người xung quanh.',
      'Tiết kiệm hàng nghìn tỷ đồng chi phí dập dịch và ngăn ngừa nguy cơ phong tỏa nền kinh tế.'
    ],
    conArgumentsSummary: [
      'Xâm phạm nghiêm trọng quyền tự quyết đối với thân thể và quyền tự do tín ngưỡng, quan điểm y tế của mỗi cá nhân.',
      'Tiềm ẩn rủi ro sốc phản vệ hiếm gặp; nhà nước không thể ép buộc công dân đánh đổi sức khỏe cá nhân nếu không có sự đồng thuận tự nguyện.',
      'Gia tăng sự ngờ vực của người dân đối với chính quyền và các hãng dược phẩm lớn, kích động sự phản kháng xã hội mạnh mẽ hơn.'
    ],
    difficulty: 'Cao_thu',
    peelGuidance: {
      explanation: 'Bắt buộc tiêm chủng (A) -> Đạt tỷ lệ tiêm phủ trên 95% (B) -> Cắt đứt hoàn toàn chuỗi lây truyền virus trong cộng đồng.',
      point: 'Toàn bộ công dân, trẻ sơ sinh chưa đến tuổi tiêm, người già suy giảm miễn dịch, người bài trừ vắc-xin.',
      evaluationMetric: 'An toàn tính mạng của số đông cộng đồng so với quyền tự do thân thể của cá nhân.',
      link: 'Thế giới thanh toán hoàn toàn các dịch bệnh truyền nhiễm nguy hiểm.',
      evidence: 'Thành tựu xóa sổ hoàn toàn bệnh Đậu mùa trên toàn cầu và tiền lệ pháp lý bắt buộc tiêm chủng vắc-xin sởi tại Pháp, Ý.'
    }
  },
  {
    id: 'health_04',
    motion: 'Nhà này sẽ cho phép sử dụng công nghệ chỉnh sửa gen (CRISPR) trên phôi người để ngăn ngừa các bệnh di truyền nan y.',
    category: 'y_te_suc_khoe',
    categoryLabel: 'Y Tế & Sức Khỏe',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Công nghệ chỉnh sửa gen mở ra cánh cửa loại bỏ tận gốc các bệnh tan máu bẩm sinh (Thalassemia), xơ nang, nhưng vấp phải làn sóng phản đối đạo đức y sinh.',
    proArgumentsSummary: [
      'Chấm dứt nỗi đau truyền kiếp qua nhiều thế hệ của các gia đình mang gen bệnh hiểm nghèo không có thuốc chữa.',
      'Giảm bớt gánh nặng chăm sóc y tế suốt đời cho bệnh nhân và gia đình, mang lại cho trẻ em sinh ra một cơ thể khỏe mạnh trọn vẹn.',
      'Là bước tiến tất yếu của y học chính xác: nếu ta có công cụ cứu sống con người thì từ chối sử dụng là hành vi thiếu nhân đạo.'
    ],
    conArgumentsSummary: [
      'Nguy cơ trượt dốc đạo đức: từ chữa bệnh sẽ tiến tới tạo ra "những đứa trẻ thiết kế" (Designer Babies) theo chỉ số IQ, chiều cao và màu mắt.',
      'Khoét sâu bất bình đẳng sinh học: chỉ người siêu giàu mới đủ tiền chỉnh sửa gen ưu tú, tạo ra giai cấp thống trị về mặt sinh học so với người bình thường.',
      'Nguy cơ tạo ra các đột biến gen ngoài ý muốn (Off-target effects) chưa thể lường trước, di truyền vĩnh viễn vào vốn gen của nhân loại.'
    ],
    difficulty: 'Cao_thu',
    peelGuidance: {
      explanation: 'Cắt bỏ đoạn gen lỗi trên phôi (A) -> Loại bỏ hoàn toàn mầm mống dị tật bẩm sinh trước khi đứa trẻ chào đời (B) -> Trẻ sinh ra khỏe mạnh.',
      point: 'Các cặp cha mẹ mang gen bệnh, đứa trẻ tương lai, các nhà đạo đức sinh học, xã hội loài người.',
      evaluationMetric: 'Lợi ích cứu sống sinh mạng cụ thể so với nỗi sợ hãi về tương lai viễn tưởng.',
      link: 'Thế giới nơi không còn đứa trẻ nào phải chịu đau đớn vì các căn bệnh di truyền bẩm sinh.',
      evidence: 'Thử nghiệm lâm sàng thành công của liệu pháp CRISPR chữa bệnh hồng cầu hình liềm (được FDA phê duyệt năm 2023).'
    }
  },
  {
    id: 'health_05',
    motion: 'Nhà này sẽ cấm hoàn toàn việc bán dữ liệu y tế cá nhân cho các công ty dược phẩm và bảo hiểm, ngay cả khi dữ liệu đã được ẩn danh.',
    category: 'y_te_suc_khoe',
    categoryLabel: 'Y Tế & Sức Khỏe',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Hồ sơ bệnh án số và dữ liệu giải trình tự gen của bệnh nhân đang bị thương mại hóa thành món hàng béo bở cho các công ty công nghệ và bảo hiểm.',
    proArgumentsSummary: [
      'Bảo vệ quyền riêng tư tuyệt đối về thể chất và bệnh tật của con người; dữ liệu sức khỏe là thông tin nhạy cảm nhất của cá nhân.',
      'Ngăn chặn các thuật toán tái định danh (Re-identification) sử dụng AI để bóc trần danh tính người bệnh dù đã được che tên.',
      'Ngăn chặn các công ty bảo hiểm sử dụng dữ liệu bệnh án ngầm để từ chối bán bảo hiểm hoặc tăng phí cắt cổ đối với người có nguy cơ mắc bệnh.'
    ],
    conArgumentsSummary: [
      'Kìm hãm sự phát triển của y học hiện đại: việc nghiên cứu thuốc trị ung thư và vắc-xin mới đòi hỏi nguồn dữ liệu khổng lồ của hàng triệu bệnh nhân.',
      'Lãng phí kho tài nguyên tri thức quý giá giúp AI phát hiện sớm các đợt bùng phát dịch bệnh và phác đồ điều trị cá nhân hóa.',
      'Chỉ cần siết chặt khung pháp lý và bảo mật mã hóa thay vì cấm đoán cực đoan gây cản trở nghiên cứu khoa học phục vụ nhân loại.'
    ],
    difficulty: 'Cao_thu',
    peelGuidance: {
      explanation: 'Bảo hiểm mua dữ liệu sức khỏe (A) -> Thuật toán định giá phân biệt đối xử (B) -> Tước đoạt cơ hội bảo hiểm của người bệnh hiểm nghèo.',
      point: 'Bệnh nhân khám chữa bệnh, công ty bảo hiểm thương mại, các viện nghiên cứu dược phẩm.',
      evaluationMetric: 'Quyền bất khả xâm phạm về dữ liệu riêng tư so với lợi ích nghiên cứu dược phẩm.',
      link: 'Người dân hoàn toàn yên tâm đi khám chữa bệnh mà không sợ bệnh án bị đem bán trục lợi.',
      evidence: 'Nghiên cứu của Đại học Harvard chứng minh khả năng tái định danh thành công 85% hồ sơ y tế ẩn danh chỉ bằng 3 thông tin nhân khẩu học cơ bản.'
    }
  },
  {
    id: 'health_06',
    motion: 'Nhà này ủng hộ việc hợp pháp hóa và quản lý thị trường thương mại hóa các cơ quan nội tạng (hiến thận/gan có đền bù tài chính).',
    category: 'y_te_suc_khoe',
    categoryLabel: 'Y Tế & Sức Khỏe',
    motionType: 'gia_tri',
    motionTypeLabel: 'Kiến nghị giá trị',
    background: 'Hàng trăm nghìn người chết mỗi năm trên danh sách chờ ghép tạng, thúc đẩy ý tưởng cho phép nhà nước trả thù lao cho người hiến tạng để tăng nguồn cung.',
    proArgumentsSummary: [
      'Giải quyết dứt điểm thảm kịch khan hiếm nội tạng, cứu sống hàng trăm nghìn bệnh nhân suy thận giai đoạn cuối.',
      'Đưa thị trường chợ đen phi pháp ra ngoài ánh sáng để nhà nước kiểm soát chất lượng y tế, bảo đảm an toàn phẫu thuật và chăm sóc hậu phẫu cho người hiến.',
      'Tôn trọng quyền tự quyết thân thể của cá nhân: một người có quyền bán một bên thận của mình để trang trải cuộc sống và cứu người khác.'
    ],
    conArgumentsSummary: [
      'Biến thân xác con người thành món hàng hóa buôn bán, chà đạp phẩm giá con người và biến người nghèo thành "kho phụ tùng" cho người giàu.',
      'Tạo ra sự ép buộc kinh tế vô hình: người lâm vào bước đường cùng sẽ bị dồn ép phải bán nội tạng để trả nợ.',
      'Phá hủy tinh thần thiện nguyện cao đẹp của việc hiến tạng nhân đạo cứu người phi thương mại.'
    ],
    difficulty: 'Cao_thu',
    peelGuidance: {
      explanation: 'Tạo cơ chế bù đắp tài chính hợp pháp (A) -> Kích thích hàng triệu người sẵn sàng hiến thận (B) -> Xóa sạch danh sách chờ ghép tạng chết dần mòn.',
      point: 'Bệnh nhân suy thận mãn tính, người có hoàn cảnh khó khăn muốn hiến tạng, thị trường chợ đen.',
      evaluationMetric: 'Giá trị thực dụng cứu sống tính mạng con người so với nguyên tắc đạo đức chống thương mại hóa thân thể.',
      link: 'Hệ thống y tế nơi không còn ai phải chết vô vọng khi đang mòn mỏi chờ nguồn tạng hiến tặng.',
      evidence: 'Mô hình quản lý thị trường bù đắp tài chính cho người hiến thận có kiểm soát của chính phủ Iran - quốc gia duy nhất xóa bỏ danh sách chờ ghép thận.'
    }
  },
  {
    id: 'health_07',
    motion: 'Nhà này tin rằng chăm sóc sức khỏe thể chất và tinh thần nên là thước đo thành công hàng đầu của xã hội thay vì chỉ số GDP.',
    category: 'y_te_suc_khoe',
    categoryLabel: 'Y Tế & Sức Khỏe',
    motionType: 'gia_tri',
    motionTypeLabel: 'Kiến nghị giá trị',
    background: 'Chỉ số GDP đo lường mọi giao dịch kinh tế nhưng không đo lường sức khỏe, niềm vui và sự an lành của người dân.',
    proArgumentsSummary: [
      'GDP tăng trưởng có thể đến từ ô nhiễm môi trường, tiêu thụ rượu bia và chiến tranh - những thứ làm suy thoái con người.',
      'Định hướng chính sách quốc gia tập trung vào tuổi thọ khỏe mạnh, không khí sạch và thời gian nghỉ ngơi của người lao động.',
      'Con người khỏe mạnh cả về thể chất lẫn tinh thần chính là nguồn lực vững chắc nhất cho sự phát triển thịnh vượng thực sự.'
    ],
    conArgumentsSummary: [
      'GDP là chỉ số định lượng khách quan, chuẩn hóa toàn cầu và có thể đo lường chính xác; sức khỏe tinh thần và hạnh phúc là cảm tính, khó đo đạc.',
      'Phải có tăng trưởng kinh tế và nguồn lực tài chính dồi dào từ GDP thì nhà nước mới có tiền đầu tư vào bệnh viện và y tế công.',
      'Bỏ qua tăng trưởng GDP sẽ làm suy giảm sức cạnh tranh quốc gia và nguồn thu hút đầu tư nước ngoài.'
    ],
    difficulty: 'Chien_binh',
    peelGuidance: {
      explanation: 'Lấy sức khỏe làm thước đo tối thượng (A) -> Nhà nước ưu tiên đầu tư y tế dự phòng và bảo vệ môi trường sống (B) -> Nâng cao phẩm chất cuộc sống.',
      point: 'Toàn thể công dân, các nhà hoạch định chính sách kinh tế, thế hệ tương lai.',
      evaluationMetric: 'Chất lượng cuộc sống thực chất của con người so với những con số tăng trưởng cơ học vô cảm.',
      link: 'Xã hội thịnh vượng bền vững nơi người dân sống thọ, khỏe mạnh và hạnh phúc.',
      evidence: 'Chỉ số Hạnh phúc Quốc gia (GNH) của Bhutan và ngân sách hạnh phúc (Wellbeing Budget) của New Zealand.'
    }
  },

  // ==========================================
  // LĨNH VỰC 4: XÃ HỘI (4 CHỦ ĐỀ)
  // ==========================================
  {
    id: 'soc_01',
    motion: 'Nhà này sẽ bắt buộc học sinh phổ thông hoàn thành đủ số giờ hoạt động tình nguyện xã hội như một điều kiện tốt nghiệp.',
    category: 'xa_hoi',
    categoryLabel: 'Xã Hội',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Để giáo dục lòng nhân ái và trách nhiệm công dân, nhiều hệ sinh thái giáo dục đang xem xét đưa hoạt động thiện nguyện thành chỉ tiêu bắt buộc.',
    proArgumentsSummary: [
      'Kéo học sinh ra khỏi thế giới ảo và áp lực sách vở để tiếp xúc trực tiếp với những mảnh đời bất hạnh, nuôi dưỡng sự thấu cảm.',
      'Xây dựng kỹ năng mềm thực tế: làm việc nhóm, giao tiếp xã hội và tinh thần phụng sự cộng đồng.',
      'Cung cấp nguồn nhân lực trẻ trung dồi dào hỗ trợ các viện dưỡng lão, trại trẻ mồ côi và bảo vệ môi trường địa phương.'
    ],
    conArgumentsSummary: [
      'Biến "tình nguyện" xuất phát từ trái tim thành "nghĩa vụ" đối phó trên giấy tờ, làm biến chất ý nghĩa cao đẹp của lòng từ thiện.',
      'Gây thêm áp lực thời gian đè nặng lên học sinh nghèo vốn đã phải đi làm thêm kiếm sống ngoài giờ học.',
      'Tạo ra tệ nạn xin chữ ký khống, xác nhận giả và biến các tổ chức từ thiện thành nơi đối phó thủ tục tốt nghiệp.'
    ],
    difficulty: 'Tap_su',
    peelGuidance: {
      explanation: 'Bắt buộc trải nghiệm thiện nguyện (A) -> Học sinh va chạm với hoàn cảnh nghèo khó thực tế (B) -> Đánh thức lòng trắc ẩn tự nhiên.',
      point: 'Học sinh THPT, các cơ sở bảo trợ xã hội, các hoàn cảnh yếu thế trong cộng đồng.',
      evaluationMetric: 'Ý nghĩa giáo dục nhân cách thực tế so với sự bắt buộc hình thức.',
      link: 'Thế hệ công dân trẻ có trách nhiệm xã hội và biết sẻ chia với người xung quanh.',
      evidence: 'Chương trình 40 giờ hoạt động cộng đồng bắt buộc tại bang Ontario (Canada) (nguồn: https://www.ontario.ca/page/high-school-graduation-requirements). Có ý kiến cho rằng hoạt động này bồi dưỡng sự thấu cảm, hãy tìm số liệu kiểm chứng.'
    }
  },
  {
    id: 'soc_02',
    motion: 'Nhà này tin rằng học sinh THPT (dưới 18 tuổi) không nên yêu đương trong thời gian đi học.',
    category: 'xa_hoi',
    categoryLabel: 'Xã Hội',
    motionType: 'gia_tri',
    motionTypeLabel: 'Kiến nghị giá trị',
    background: 'Chủ đề "Tình yêu tuổi học trò" luôn là đề tài tranh cãi gay gắt giữa một bên ủng hộ cảm xúc tự nhiên trong sáng và một bên lo ngại hậu quả thi cử, mang thai ngoài ý muốn.',
    proArgumentsSummary: [
      'Giai đoạn cấp 3 là bước ngoặt quyết định tương lai (thi đại học); tình cảm đổ vỡ dễ gây khủng hoảng tâm lý, sa sút học tập nghiêm trọng.',
      'Học sinh dưới 18 tuổi chưa hoàn thiện về tâm sinh lý và kỹ năng giải quyết mâu thuẫn tình cảm, dễ dẫn đến hành vi bốc đồng, dại dột.',
      'Nguy cơ quan hệ tình dục không an toàn, mang thai ngoài ý muốn và mắc các bệnh lây truyền phá hủy tương lai khi còn ngồi trên ghế nhà trường.'
    ],
    conArgumentsSummary: [
      'Rung động tình cảm tuổi dậy thì là quy luật tâm sinh lý tự nhiên lành mạnh, cấm đoán chỉ tạo ra sự giấu giếm, lén lút nguy hiểm.',
      'Tình yêu tuổi học trò nếu được định hướng đúng đắn sẽ là nguồn động lực to lớn giúp nhau cùng tiến bộ trong học tập và rèn luyện.',
      'Là cơ hội đầu đời để học cách thấu hiểu, tôn trọng ranh giới cá nhân, sẻ chia và trưởng thành về mặt cảm xúc (EQ).'
    ],
    difficulty: 'Tap_su',
    peelGuidance: {
      explanation: 'Cấm đoán cảm xúc (A) -> Học sinh yêu lén lút không dám hỏi người lớn (B) -> Dễ gặp nguy hiểm khi xảy ra sự cố vì thiếu kiến thức an toàn.',
      point: 'Học sinh 15-18 tuổi, phụ huynh, thầy cô giáo chủ nhiệm.',
      evaluationMetric: 'Tôn trọng cảm xúc tự nhiên và giáo dục giới tính chủ động so với sự cấm đoán bảo thủ.',
      link: 'Môi trường nơi học sinh được trang bị kiến thức tình bạn, tình yêu trong sáng và kỹ năng tự bảo vệ bản thân.',
      evidence: 'Báo cáo của Quỹ Dân số Liên Hợp Quốc (UNFPA) về tác hại của việc cấm đoán so với hiệu quả của giáo dục giới tính toàn diện.'
    }
  },
  {
    id: 'soc_03',
    motion: 'Nhà này tin rằng các trường đại học và cơ quan công quyền nên có quy định cấm sinh viên và cán bộ xăm hình lộ ra ngoài.',
    category: 'xa_hoi',
    categoryLabel: 'Xã Hội',
    motionType: 'gia_tri',
    motionTypeLabel: 'Kiến nghị giá trị',
    background: 'Xăm hình ngày nay đã trở thành môn nghệ thuật thể hiện bản thân của giới trẻ, nhưng trong môi trường công quyền và sư phạm, định kiến về sự chỉn chu vẫn rất khắt khe.',
    proArgumentsSummary: [
      'Bảo đảm tính chuẩn mực, trang nghiêm và tôn nghiêm của môi trường giáo dục và cơ quan đại diện cho pháp luật nhà nước.',
      'Phù hợp với thuần phong mỹ tục và tâm lý đa số người dân khi đến làm việc tại cơ quan công quyền, tránh tạo cảm giác e ngại, thiếu tin tưởng.',
      'Rèn luyện tác phong chuyên nghiệp: nơi công cộng đòi hỏi kỷ luật tập thể cao hơn sự phóng khoáng cá nhân.'
    ],
    conArgumentsSummary: [
      'Xâm phạm quyền tự do biểu đạt nghệ thuật và quyền tự quyết đối với thân thể của công dân được hiến pháp bảo hộ.',
      'Đánh giá con người qua vẻ bề ngoài là biểu hiện của sự cổ hủ, định kiến và phân biệt đối xử vô căn cứ.',
      'Hình xăm trên da không làm suy giảm đạo đức, trí tuệ hay năng lực chuyên môn và tinh thần trách nhiệm của một cán bộ hay sinh viên.'
    ],
    difficulty: 'Tap_su',
    peelGuidance: {
      explanation: 'Đánh giá qua hình xăm (A) -> Bỏ lỡ những nhân tài có tâm huyết nhưng thích xăm hình nghệ thuật (B) -> Tạo sự phân biệt đối xử.',
      point: 'Thanh niên Gen Z yêu nghệ thuật xăm, người dân thế hệ trước, cơ quan nhà nước.',
      evaluationMetric: 'Quyền tự do biểu đạt cá nhân so với quy chuẩn trang nghiêm nơi công sở.',
      link: 'Xã hội bao dung, cởi mở, đánh giá con người qua phẩm hạnh và hiệu quả công việc thực chất.',
      evidence: 'Sự thay đổi chính sách cho phép sĩ quan quân đội và cảnh sát có hình xăm tại Mỹ, Canada và các nước phát triển.'
    }
  },
  {
    id: 'soc_04',
    motion: 'Nhà này khuyến khích học sinh cấp 3 (THPT) đi làm thêm các công việc bán thời gian trong năm học.',
    category: 'xa_hoi',
    categoryLabel: 'Xã Hội',
    motionType: 'chinh_sach',
    motionTypeLabel: 'Kiến nghị chính sách',
    background: 'Làm thêm giúp học sinh kiếm tiền và va chạm cuộc sống, nhưng nhiều phụ huynh phản đối vì sợ con chểnh mảng việc học tập chính khóa.',
    proArgumentsSummary: [
      'Hiểu được giá trị của đồng tiền và sự vất vả của cha mẹ thông qua mồ hôi công sức lao động thực tế.',
      'Trang bị kỹ năng giao tiếp, xử lý tình huống với khách hàng khó tính, quản lý thời gian và sự tự lập sớm.',
      'Tạo lợi thế vượt trội khi viết bài luận xin học bổng và hồ sơ xin việc trong tương lai so với những bạn chỉ biết học vẹt.'
    ],
    conArgumentsSummary: [
      'Gây kiệt sức thể chất và thiếu ngủ, ảnh hưởng trực tiếp đến kết quả học tập và các kỳ thi quan trọng cuối cấp.',
      'Học sinh chưa có hợp đồng lao động bảo vệ, dễ bị bóc lột sức lao động, quỵt lương hoặc lừa đảo vào các ổ nhóm đa cấp.',
      'Nhiệm vụ trọng tâm của lứa tuổi học sinh là tích lũy nền tảng tri thức hàn lâm; cơ hội kiếm tiền sẽ còn cả đời sau này.'
    ],
    difficulty: 'Tap_su',
    peelGuidance: {
      explanation: 'Đi làm thêm 5-10 tiếng/tuần (A) -> Va chạm thực tế và học cách quý trọng đồng tiền (B) -> Trưởng thành nhanh chóng về nhân cách.',
      point: 'Học sinh 16-18 tuổi, phụ huynh, người sử dụng lao động dịch vụ (quán cà phê, nhà sách).',
      evaluationMetric: 'Kinh nghiệm sống thực chiến so với điểm số học bạ đơn thuần.',
      link: 'Những người trẻ tự tin, tháo vát, không bỡ ngỡ khi bước ra xã hội.',
      evidence: 'Nghiên cứu của Cục Thống kê Lao động Hoa Kỳ (BLS) cho thấy học sinh đi làm thêm dưới 15 giờ/tuần có điểm GPA và tỷ lệ việc làm sau đại học cao hơn học sinh không đi làm.'
    }
  }
];

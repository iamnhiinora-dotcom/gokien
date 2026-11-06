/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DỮ LIỆU CỐT LÕI: TỪ ĐIỂN CÁC LỖI NGỤY BIỆN & NGÂN HÀNG TÌNH HUỐNG THỬ THÁCH
 * Biên soạn theo chuẩn Logic học ứng dụng cho học sinh THPT
 */

import { FallacyItem, ChallengeScenario } from '../types';
import scenariosJson from './scenarios.json';

// Danh sách 14 lỗi ngụy biện phổ biến nhất trong đời sống, học đường và mạng xã hội
export const FALLACIES: FallacyItem[] = [
  {
    id: 'ad_hominem',
    name: 'Ad Hominem',
    vietnameseName: 'Ngụy biện công kích cá nhân',
    definition: 'Thay vì phản bác nội dung luận điểm hoặc số liệu, người nói lại quay sang tấn công nhân cách, hoàn cảnh, trình độ, xuất thân hoặc ngoại hình của người đối thoại.',
    example: '"Bạn học môn Văn chỉ được 6 điểm thì có tư cách gì mà đòi bàn luận về tác phẩm của đại thi hào Nguyễn Du?"',
    counterStrategy: 'Tách biệt rõ ràng người nói và bản chất luận điểm: "Nội dung phản biện của tôi dựa trên chứng cứ khoa học, không liên quan đến điểm số hay lai lịch cá nhân của tôi. Xin hãy quay lại nội dung chính."',
    whenNotFallacy: 'Khi thông tin về tư cách cá nhân có liên quan trực tiếp và khách quan đến thẩm quyền, sự trung thực hoặc xung đột lợi ích của họ trong bối cảnh cụ thể (ví dụ: nhân chứng từng bị kết án vì khai man nhiều lần trước tòa, hoặc chuyên gia thẩm định chất lượng thuốc lại là cổ đông lớn sở hữu công ty sản xuất loại thuốc đó).',
    category: 'tam_ly',
    severity: 'de_gap'
  },
  {
    id: 'straw_man',
    name: 'Straw Man',
    vietnameseName: 'Ngụy biện người rơm',
    definition: 'Bóp méo, nói quá hoặc đơn giản hóa quá mức lập luận của đối phương thành một phiên bản ngớ ngẩn, sau đó tấn công vào phiên bản bị bóp méo đó.',
    example: 'Học sinh A: "Chúng ta nên giảm bớt số bài tập về nhà môn Toán để học sinh có thời gian ngủ đủ giấc." -> B: "Vậy là bạn muốn học sinh lười biếng, vứt bỏ toàn bộ kiến thức khoa học và dốt nát cả đời à?"',
    counterStrategy: 'Khẳng định lại định nghĩa gốc: "Tôi chưa từng đề xuất vứt bỏ kiến thức hay ngừng học. Luận điểm chính xác của tôi là điều chỉnh thời lượng bài tập về nhà cho phù hợp với sức khỏe sinh học."',
    whenNotFallacy: 'Khi bạn tóm tắt chính xác tinh thần và hệ quả tất yếu của luận điểm đối phương dựa trên phát biểu và dữ kiện thực tế của họ mà không phóng đại, bóp méo hay tự ý nhét chữ vào miệng đối phương.',
    category: 'cau_truc',
    severity: 'tinh_vi'
  },
  {
    id: 'red_herring',
    name: 'Red Herring',
    vietnameseName: 'Ngụy biện đánh lạc hướng (Cá trích đỏ)',
    definition: 'Đưa ra một chủ đề phụ hoặc một vấn đề cảm xúc không liên quan để chuyển hướng sự chú ý khỏi vấn đề tranh luận cốt lõi.',
    example: '"Tại sao lại kiểm điểm học sinh đi học muộn trong khi ngoài xã hội bao nhiêu kẻ trộm cắp, tham nhũng ngoài kia còn chưa bị xử lý?"',
    counterStrategy: 'Kéo trọng tâm về bài toán gốc: "Vấn đề trật tự xã hội rất quan trọng, nhưng việc đó không làm thay đổi hay hợp thức hóa việc vi phạm nội quy đi học muộn ở trường học hôm nay."',
    whenNotFallacy: 'Khi chủ đề được đưa ra là một tiền đề logic, một điều kiện tiên quyết hoặc thông tin bối cảnh bắt buộc phải làm rõ trước thì mới có thể giải quyết được vấn đề gốc.',
    category: 'danh_lac_huong',
    severity: 'de_gap'
  },
  {
    id: 'slippery_slope',
    name: 'Slippery Slope',
    vietnameseName: 'Ngụy biện dốc trượt phi lý',
    definition: 'Khẳng định một hành động nhỏ ban đầu tất yếu sẽ dẫn tới một chuỗi hậu quả thảm khốc mà không đưa ra bất kỳ bằng chứng logic hay mối liên hệ nhân quả xác đáng nào.',
    example: '"Nếu nhà trường cho phép học sinh nhuộm tóc màu nhẹ, các em sẽ bắt đầu đua đòi xăm mình, rồi bỏ học đàn đúm và cuối cùng sẽ trở thành tội phạm."',
    counterStrategy: 'Chỉ ra sự đứt gãy trong chuỗi nhân quả: "Không có bằng chứng thực nghiệm nào chứng minh việc đổi màu tóc tất yếu dẫn tới việc bỏ học hay phạm tội. Mỗi nấc thang cần được chứng minh độc lập."',
    whenNotFallacy: 'Khi dự báo chuỗi tác động dây chuyền có bằng chứng thực nghiệm, số liệu lịch sử hoặc chứng minh được cơ chế nhân quả rõ ràng cho từng mắt xích độc lập (ví dụ: giải thích cơ chế lạm phát gia tăng dẫn đến tăng lãi suất rồi tác động đến chi tiêu tiêu dùng).',
    category: 'cau_truc',
    severity: 'tinh_vi'
  },
  {
    id: 'false_dilemma',
    name: 'False Dilemma / Black-or-White',
    vietnameseName: 'Ngụy biện nhị nguyên giả tạo (Trắng hoặc Đen)',
    definition: 'Ép buộc đối phương chỉ được chọn giữa 2 phương án đối nghịch cực đoan, trong khi trên thực tế tồn tại rất nhiều giải pháp trung gian hoặc phương án thứ ba.',
    example: '"Hoặc là bạn ủng hộ việc cấm tiệt 100% điện thoại thông minh ở trường, hoặc là bạn đang tiếp tay cho việc học sinh nghiện game và phá hủy tương lai."',
    counterStrategy: 'Mở rộng không gian giải pháp: "Tại sao chỉ có cấm tiệt hoặc thả nổi? Chúng ta hoàn toàn có giải pháp thứ ba: cho phép dùng trong các tiết học có hướng dẫn và cất vào tủ trong giờ giải lao."',
    whenNotFallacy: 'Khi trong thực tế chỉ thực sự tồn tại 2 trạng thái loại trừ lẫn nhau theo nguyên lý bài trung của logic học (ví dụ: "Kết quả thi là Đỗ hoặc Trượt", hoặc "Hóa đơn này là Thật hoặc Giả").',
    category: 'cau_truc',
    severity: 'de_gap'
  },
  {
    id: 'appeal_to_authority',
    name: 'Appeal to Authority',
    vietnameseName: 'Ngụy biện viện dẫn uy quyền sai chỗ',
    definition: 'Dùng ý kiến của một người nổi tiếng, một chuyên gia trong lĩnh vực A để áp đặt chân lý cho một vấn đề thuộc lĩnh vực B hoàn toàn xa lạ.',
    example: '"Một ca sĩ thần tượng có 10 triệu người theo dõi vừa tuyên bố uống nước ép lá ổi có thể trị dứt điểm virus cúm, nên chắc chắn đó là phương pháp khoa học."',
    counterStrategy: 'Kiểm tra thẩm quyền chuyên môn: "Sự nổi tiếng trong nghệ thuật không đồng nghĩa với chuyên môn y khoa. Để khẳng định tác dụng chữa bệnh, chúng ta cần công bố từ các thử nghiệm lâm sàng độc lập."',
    whenNotFallacy: 'Khi dẫn lời hoặc công trình nghiên cứu của chuyên gia đúng chuyên ngành đào tạo, và luận điểm đó phản ánh sự đồng thuận khoa học (scientific consensus) đã qua bình duyệt (peer-reviewed), chứ không phải ý kiến chủ quan ngoài lĩnh vực chuyên môn.',
    category: 'du_lieu',
    severity: 'tinh_vi'
  },
  {
    id: 'hasty_generalization',
    name: 'Hasty Generalization',
    vietnameseName: 'Ngụy biện khái quát hóa vội vã',
    definition: 'Rút ra kết luận tổng quát về toàn bộ tập thể hay hiện tượng chỉ dựa trên một vài quan sát cá biệt hoặc cỡ mẫu quá nhỏ không có tính đại diện.',
    example: '"Tôi thấy hai bạn nam lớp 12A nghiện chơi game mà điểm thi thử vẫn thủ khoa. Suy ra chơi game điện tử chỉ giúp học sinh thông minh hơn chứ chẳng có hại gì."',
    counterStrategy: 'Phân tích tính đại diện của mẫu thống kê: "Hai trường hợp cá biệt không thể đại diện cho hàng triệu học sinh. Các nghiên cứu thống kê diện rộng mới là cơ sở xác định tương quan sức khỏe và kết quả học tập."',
    whenNotFallacy: 'Khi kết luận được rút ra từ một mẫu thống kê đủ lớn, được chọn ngẫu nhiên đại diện theo đúng phương pháp khoa học hoặc các cuộc tổng điều tra dân số diện rộng.',
    category: 'du_lieu',
    severity: 'de_gap'
  },
  {
    id: 'tu_quoque',
    name: 'Tu Quoque (Appeal to Hypocrisy)',
    vietnameseName: 'Ngụy biện "Bạn cũng thế" (Anh cũng vậy)',
    definition: 'Bào chữa cho hành vi sai trái hoặc bác bỏ lời khuyên của người khác chỉ bằng cách chỉ ra rằng người đưa ra lời khuyên cũng từng phạm lỗi tương tự.',
    example: 'A: "Cậu không nên vừa điều khiển xe đạp điện vừa đeo tai nghe nghe nhạc, rất nguy hiểm." -> B: "Hồi lớp 10 chính cậu cũng suốt ngày đeo tai nghe đấy thôi, cậu lấy quyền gì mà nhắc nhở tớ?"',
    counterStrategy: 'Phân định giữa hành vi trong quá khứ và tính đúng đắn của lời khuyên: "Lỗi lầm trong quá khứ của tôi không làm cho việc vừa đi xe vừa đeo tai nghe trở nên an toàn hơn. Lời cảnh báo vẫn hoàn toàn đúng đắn."',
    whenNotFallacy: 'Khi chất vấn sự mâu thuẫn để yêu cầu đối phương giải thích tính nhất quán hoặc tiêu chuẩn đánh giá, nhưng vẫn trực tiếp phân tích bản chất luận điểm chứ không dùng lỗi quá khứ của họ để hợp thức hóa cái sai hiện tại.',
    category: 'tam_ly',
    severity: 'de_gap'
  },
  {
    id: 'bandwagon',
    name: 'Bandwagon (Appeal to Popularity)',
    vietnameseName: 'Ngụy biện chạy theo đám đông',
    definition: 'Lập luận rằng một điều gì đó là đúng, tốt hoặc chuẩn mực chỉ vì đa số mọi người đang làm hoặc tin tưởng như vậy.',
    example: '"Cả lớp ai cũng tải tài liệu quay cóp môn Sử vào máy tính bảng hết rồi, cậu không làm theo thì cậu chỉ là đồ cổ lỗ sĩ và dại dột."',
    counterStrategy: 'Số lượng không định đoạt tính chân lý: "Việc nhiều người cùng vi phạm quy chế thi cử chỉ chứng minh tính phổ biến của sai phạm chứ không biến hành vi gian lận thành một hành động đạo đức hay hợp lệ."',
    whenNotFallacy: 'Khi tính phổ biến hay sự đồng thuận của số đông chính là bản chất của vấn đề đang xét (ví dụ: lựa chọn ngôn ngữ giao tiếp quốc tế, tuân thủ quy tắc đi bên phải đường để đồng bộ an toàn giao thông, hoặc quy chuẩn ổ cắm điện quốc gia).',
    category: 'tam_ly',
    severity: 'de_gap'
  },
  {
    id: 'circular_reasoning',
    name: 'Circular Reasoning (Begging the Question)',
    vietnameseName: 'Ngụy biện luẩn quẩn (Lập luận vòng quanh)',
    definition: 'Sử dụng chính kết luận cần chứng minh làm tiền đề để biện hộ cho luận điểm của mình mà không đưa ra cơ sở bằng chứng ngoại cảnh nào.',
    example: '"Quy định của câu lạc bộ chúng ta là hoàn toàn công bằng và hoàn hảo, bởi vì câu lạc bộ được xây dựng trên những nguyên tắc không thể sai sót."',
    counterStrategy: 'Chỉ ra sự rỗng tuếch của lập luận: "Bạn chỉ đang lặp lại kết luận bằng một cách diễn đạt khác. Bạn vẫn chưa chứng minh được tại sao những nguyên tắc đó lại không thể sai sót."',
    whenNotFallacy: 'Khi nêu một tiên đề toán học, một chân lý hiển nhiên hoặc một định nghĩa chuẩn mực đã được cả hai bên thống nhất từ đầu làm cơ sở suy luận (ví dụ: "Tam giác đều có 3 cạnh bằng nhau vì theo định nghĩa hình học...").',
    category: 'cau_truc',
    severity: 'tinh_vi'
  },
  {
    id: 'post_hoc',
    name: 'Post Hoc Ergo Propter Hoc',
    vietnameseName: 'Ngụy biện nhân quả sau đó (Sau cái này nên do cái này)',
    definition: 'Ngộ nhận rằng vì sự kiện B xảy ra sau sự kiện A theo thời gian, nên sự kiện A chắc chắn là nguyên nhân trực tiếp gây ra sự kiện B.',
    example: '"Sáng nay trước khi đi thi mình ăn một bát xôi gấc màu đỏ, kết quả là đạt 10 điểm Toán. Chắc chắn xôi gấc đỏ đã mang lại vận may giúp mình làm đúng bài."',
    counterStrategy: 'Phân biệt thứ tự thời gian và mối quan hệ nhân quả: "Việc A xảy ra trước B chỉ là sự trùng hợp về thời gian. Điểm 10 là kết quả của quá trình ôn luyện kiên trì, không phải do sắc tố trong bát xôi."',
    whenNotFallacy: 'Khi sự kiện A xảy ra trước B và người nói chứng minh được cơ chế tác động khoa học, vật lý hoặc sinh học rõ ràng giữa A và B, đồng thời loại trừ được các biến can thiệp khác (ví dụ: uống thuốc kháng sinh đúng liều dẫn đến khỏi viêm họng do vi khuẩn).',
    category: 'du_lieu',
    severity: 'de_gap'
  },
  {
    id: 'anecdotal',
    name: 'Anecdotal Fallacy',
    vietnameseName: 'Ngụy biện bằng chuyện kể cá nhân',
    definition: 'Dùng một trải nghiệm cá nhân hay câu chuyện truyền miệng duy nhất để phản bác lại một kết luận nghiên cứu khoa học hoặc thống kê tin cậy.',
    example: '"Bác sĩ bảo thức khuya xem màn hình điện thoại hại mắt, nhưng ông chú của tôi 60 tuổi tối nào cũng cày phim đến 3h sáng mà mắt vẫn tinh tường 10/10."',
    counterStrategy: 'Nhấn mạnh giá trị thống kê: "Câu chuyện cá biệt của chú bạn là một ngoại lệ sinh học may mắn. Khoa học y khoa kết luận dựa trên giải phẫu võng mạc và theo dõi hàng vạn bệnh nhân."',
    whenNotFallacy: 'Khi câu chuyện cá nhân chỉ được dùng làm ví dụ minh họa sinh động cho một nguyên lý khoa học hoặc xu hướng thống kê diện rộng đã được kiểm chứng, chứ không dùng để phủ định các số liệu thống kê tin cậy.',
    category: 'du_lieu',
    severity: 'tinh_vi'
  },
  {
    id: 'appeal_to_emotion',
    name: 'Appeal to Emotion',
    vietnameseName: 'Ngụy biện lợi dụng cảm xúc (Đánh tráo lý trí)',
    definition: 'Kích động lòng thương hại, sợ hãi, giận dữ hoặc tự hào dân tộc thái quá để ép người nghe đồng thuận mà không cần luận chứng logic.',
    example: '"Bạn nỡ lòng nào cho bài thuyết trình của nhóm mình điểm thấp? Bạn có biết các bạn trong nhóm đã phải thức trắng ba đêm liền và có bạn còn đang bị sốt xuất huyết không?"',
    counterStrategy: 'Tôn trọng cảm xúc nhưng giữ vững thước đo: "Tôi rất thấu hiểu và chia sẻ với sự vất vả của các bạn, nhưng điểm số của bài thi cần được đánh giá trung thực theo tiêu chí học thuật chứ không thể chấm bằng lòng thương hại."',
    whenNotFallacy: 'Khi cảm xúc chân thành đi kèm với lập luận logic, bằng chứng thực tế và giải pháp khả thi, chứ không dùng nước mắt hay sự kích động cảm xúc để ép người nghe đồng thuận vô điều kiện.',
    category: 'tam_ly',
    severity: 'de_gap'
  },
  {
    id: 'guilt_by_association',
    name: 'Guilt by Association',
    vietnameseName: 'Ngụy biện liên đới tội lỗi (Quy chụp bầy đàn)',
    definition: 'Bác bỏ một ý kiến chỉ vì ý kiến đó tình cờ trùng hợp hoặc được ủng hộ bởi một cá nhân/nhóm người mang tiếng xấu.',
    example: '"Ý tưởng xây dựng chế độ ăn chay vì môi trường này từng được một kẻ độc tài khét tiếng trong lịch sử tán thành. Cậu muốn trường học học theo kẻ độc tài đấy à?"',
    counterStrategy: 'Đánh giá giá trị thực chất của ý tưởng: "Một ý tưởng đúng đắn về dinh dưỡng hay bảo vệ môi trường không bị mất giá trị chỉ vì một nhân vật lịch sử tiêu cực cũng từng có quan điểm tương đồng."',
    whenNotFallacy: 'Khi mối liên hệ giữa cá nhân/tổ chức đó và đối tượng tiêu cực là mối quan hệ đồng lõa thực tế, cùng chia sẻ mục tiêu, tư tưởng hoặc hành vi sai trái cụ thể (chứ không phải chỉ là sự trùng hợp ngẫu nhiên về một sở thích hay thói quen).',
    category: 'tam_ly',
    severity: 'tinh_vi'
  }
];

// Ngân hàng 52 tình huống thực tế đời sống, học đường, mạng xã hội (tách từ scenarios.json)
export const CHALLENGE_SCENARIOS: ChallengeScenario[] = scenariosJson as ChallengeScenario[];

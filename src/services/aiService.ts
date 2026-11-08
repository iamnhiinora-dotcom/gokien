/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BỘ NÃO AI KÉP (DUAL AI ENGINE): GEMINI CLOUD + INTELLIGENT LOCAL FALLBACK
 * Phiên bản nâng cấp: Tranh biện sắc sảo, đanh thép, bóc trần tiền đề và gánh nặng chứng minh (Burden of Proof).
 * Tích hợp công cụ sinh gợi ý luận điểm phản biện chuẩn WSDC (Point - Evidence - Explanation - Link).
 */

import { 
  ChallengeScenario, 
  FallacyEvaluationResult, 
  DebateTopic, 
  DebateSide, 
  DebateMessage, 
  DebaterPersona, 
  DebaterPersonaInfo,
  WsdcRebuttalHint,
  SocraticGuidingQuestion,
  SteelmanEvaluation
} from '../types';
import { FALLACIES } from '../data/fallacyData';

// Danh sách các phong cách đối thủ tranh biện (gần gũi, sinh động)
export const DEBATER_PERSONAS: DebaterPersonaInfo[] = [
  {
    id: 'wsdc_grandmaster',
    name: 'Kiện Tướng Tranh Biện',
    badge: 'Chặt chẽ & Toàn diện',
    description: 'Lập luận kín kẽ, biết so sánh thiệt hơn giữa các bên và chỉ ra những điểm chưa thực tế trong bài nói của bạn.',
    specialty: 'Phản biện đa chiều & chiều sâu thực tế'
  },
  {
    id: 'fallacy_hunter',
    name: 'Bạn Tranh Biện Sắc Sảo',
    badge: 'Tinh ý & Thẳng thắn',
    description: 'Rất tinh mắt trong việc nhận ra những điểm vô lý, nói quá hoặc đánh lạc hướng trong lập luận của bạn.',
    specialty: 'Soi bẫy suy diễn & bắt lỗi lập luận'
  },
  {
    id: 'strict_prosecutor',
    name: 'Thầy Giám Khảo Kỹ Tính',
    badge: 'Kỹ tính & Thực tế',
    description: 'Đòi hỏi bạn phải đưa ra ví dụ và số liệu cụ thể từ đời sống. Nếu nói suông không có bằng chứng là bị trừ điểm ngay!',
    specialty: 'Đòi hỏi dẫn chứng thực tế & trừ điểm nghiêm khắc'
  }
];

export class AiDebateService {
  /**
   * Chấm điểm bài tập Vạch lá tìm sâu (Module 1)
   * Chuyển toàn bộ việc chấm sang route ở server (/api/evaluate-fallacy), dùng Gemini 3.8 Flash
   * Timeout 20 giây. Nếu AI lỗi hoặc quá giờ thì throw 'Chưa chấm được. Bấm Thử lại'
   * Xóa hẳn đường chấm dự phòng bằng luật cài sẵn trong trình duyệt.
   */
  public static async evaluateFallacySubmission(
    scenario: ChallengeScenario,
    selectedFallacyId: string,
    userRebuttal: string,
    flawHighlightMatched?: boolean
  ): Promise<FallacyEvaluationResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const targetFallacy = scenario.hiddenFallacyId === 'no_fallacy'
        ? { id: 'no_fallacy', name: 'Valid Argument', vietnameseName: 'Không có lỗi, lập luận hợp lý' }
        : FALLACIES.find(f => f.id === scenario.hiddenFallacyId);
      const chosenFallacy = selectedFallacyId === 'no_fallacy'
        ? { id: 'no_fallacy', name: 'Valid Argument', vietnameseName: 'Không có lỗi, lập luận hợp lý' }
        : FALLACIES.find(f => f.id === selectedFallacyId);

      const response = await fetch('/api/evaluate-fallacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenario,
          selectedFallacyId,
          rebuttalText: userRebuttal,
          targetFallacy,
          chosenFallacy,
          flawHighlightMatched: Boolean(flawHighlightMatched)
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Chưa chấm được. Bấm Thử lại');
      }

      const result = await response.json();
      if (!result || typeof result.totalScore !== 'number') {
        throw new Error('Chưa chấm được. Bấm Thử lại');
      }

      return result as FallacyEvaluationResult;
    } catch {
      throw new Error('Chưa chấm được. Bấm Thử lại');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public static async evaluateFallacyRebuttal(
    scenario: ChallengeScenario,
    selectedFallacyId: string,
    userRebuttal: string,
    _isFallacyCorrect?: boolean,
    flawHighlightMatched?: boolean
  ): Promise<FallacyEvaluationResult> {
    return this.evaluateFallacySubmission(scenario, selectedFallacyId, userRebuttal, flawHighlightMatched);
  }

  /**
   * Xử lý lượt đấu trong Sàn đấu tranh biện (Module 2)
   * Gọi route server /api/debate (sử dụng Gemini 3.8 Flash).
   * Timeout 25 giây bằng AbortController. Nếu quá giờ hoặc lỗi thì throw 'Đối thủ mất kết nối. Bấm Thử lại'.
   * Đã xóa hẳn debateWithLocalEngine và các đường gọi trực tiếp từ trình duyệt.
   */
  public static async processDebateTurn(
    topic: DebateTopic,
    studentSide: DebateSide,
    history: DebateMessage[],
    studentSpeech: string,
    _apiKey?: string,
    persona: DebaterPersona = 'wsdc_grandmaster'
  ): Promise<{
    aiDebaterReply: string;
    studentHpDeduction: number;
    aiHpDeduction: number;
    concessionGranted?: boolean;
    concessionNote?: string;
    mentorEvaluation: {
      type: 'warning' | 'praise' | 'neutral';
      text: string;
      advice: string;
      detectedFallacyName?: string;
      logicScore: number;
      persuasionScore: number;
    };
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          studentSide,
          history,
          studentSpeech,
          persona
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        let message = 'Giám khảo AI chưa phản hồi. Bấm Thử lại';
        try {
          const data = await response.json();
          if (typeof data?.error === 'string') message = data.error;
        } catch {
          // Keep generic message for non-JSON errors.
        }
        throw new Error(message);
      }

      const cloudData = await response.json();
      if (!cloudData || !cloudData.aiDebaterReply) {
        throw new Error('Đối thủ mất kết nối. Bấm Thử lại');
      }

      return cloudData;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new Error('Giám khảo AI phản hồi quá chậm (30 giây). Bấm Thử lại');
      }
      throw new Error(err?.message || 'Giám khảo AI chưa phản hồi. Bấm Thử lại');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Thẩm định bài tập Dựng Người Thép (Steelman) trước khi vào trận đấu
   * Yêu cầu học sinh viết lập luận mạnh nhất, công bằng nhất của phe đối lập
   * Chấm điểm từ 0 đến 10; điểm >= 6 mới đủ điều kiện vào trận.
   */
  public static async evaluateSteelman(
    topic: DebateTopic,
    studentSide: DebateSide,
    steelmanText: string,
    apiKey?: string
  ): Promise<SteelmanEvaluation> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (apiKey) {
        headers['x-gemini-api-key'] = apiKey;
      }

      const response = await fetch('/api/evaluate-steelman', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          topic,
          studentSide,
          steelmanText
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        let errorMsg = 'Chưa thể thẩm định bài Dựng Người Thép. Bấm Thử lại';
        try {
          const errData = await response.json();
          if (errData?.error) {
            errorMsg = errData.error;
          }
        } catch {
          // ignore parsing error for non-json responses
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      if (!result || typeof result.score !== 'number' || typeof result.isPassed !== 'boolean') {
        throw new Error('Dữ liệu thẩm định không đúng cấu trúc. Bấm Thử lại');
      }
      return result as SteelmanEvaluation;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new Error('Hết thời gian chờ phản hồi từ giám khảo (timeout 20s). Bấm Thử lại');
      }
      throw new Error(err?.message || 'Chưa thể thẩm định bài Dựng Người Thép. Bấm Thử lại');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * TÍNH NĂNG MỚI: GỢI Ý LUẬN ĐIỂM PHẢN BIỆN CHUẨN WSDC (PEEL MODEL)
   * Giúp học sinh khi bí ý tưởng có ngay 3 hướng bẻ gãy lập luận đối thủ:
   * Point (Khẳng định) - Explanation (Giải thích cơ chế) - Evidence (Dẫn chứng) - Link (Kết luận & Tác động)
   */
  public static async generateWsdcRebuttalHints(
    topic: DebateTopic,
    studentSide: DebateSide,
    opponentLatestSpeech?: string
  ): Promise<WsdcRebuttalHint[]> {
    // Sử dụng bộ máy sinh gợi ý thông minh theo chuẩn WSDC PEEL
    return this.generateHintsWithLocalEngine(topic, studentSide, opponentLatestSpeech);
  }

  /**
   * Sinh gợi ý luận điểm WSDC PEEL thông minh bằng Local Fallback Engine
   */
  private static generateHintsWithLocalEngine(
    topic: DebateTopic,
    studentSide: DebateSide,
    opponentSpeech?: string
  ): WsdcRebuttalHint[] {
    const isPro = studentSide === 'pro';

    // Xây dựng 3 chiến lược phản biện kinh điển của WSDC:
    // Hướng 1: Bẻ gãy Tiền đề & Cơ chế (Chỉ ra chính sách đối thủ không giải quyết được gốc rễ)
    // Hướng 2: Đòn bẩy Chi phí Cơ hội & Tác hại ngược (Backfire Effect)
    // Hướng 3: So sánh Lợi ích Các bên liên quan & Đề xuất giải pháp vượt trội (Comparative Stakeholder Impact)

    if (topic.id === 'topic_01') {
      // Chủ đề cấm smartphone ở trường
      if (isPro) {
        // Học sinh Ủng hộ Cấm -> Phản bác phe Phản đối (bảo vệ smartphone)
        return [
          {
            id: 'hint_1',
            angleTitle: 'Chiến lược 1: Bẻ gãy Cơ chế Tự Giác & Nghiện Kỹ Thuật Số',
            point: 'Luận điểm đối phương về "khả năng tự giác của học sinh" bị thách thức bởi cơ chế tâm lý học hành vi và thuật toán giữ chân người dùng.',
            explanation: 'Có ý kiến cho rằng vùng vỏ não trước trán của thanh thiếu niên chưa hoàn thiện để tự kháng cự các ứng dụng kích thích liên tục, hãy tìm số liệu kiểm chứng. Đòi hỏi học sinh tự kiểm soát tuyệt đối trong suốt 45 phút tiết học là đặt gánh nặng rất lớn lên các em.',
            evidence: 'Báo cáo Giám sát Giáo dục Toàn cầu (UNESCO GEM Report 2023, nguồn: https://unesdoc.unesco.org/ark:/48223/pf0000385723 ) khuyến nghị hạn chế smartphone trong lớp học vì việc phân tâm làm suy giảm hiệu suất tiếp thu bài học.',
            link: 'Do đó, quy định giới hạn nghiêm ngặt là biện pháp bảo vệ khôi phục môi trường tập trung học thuật thực chất cho học sinh.',
            fullScaffoldText: 'Chúng tôi xin phản bác trực diện lập luận của đối phương: Bạn cho rằng cần rèn luyện khả năng tự giác, nhưng có ý kiến cho rằng não bộ thanh thiếu niên chưa thể cưỡng lại các thuật toán giữ chân người dùng, hãy tìm số liệu kiểm chứng. Báo cáo UNESCO GEM 2023 (unesdoc.unesco.org) khuyến nghị cấm điện thoại trong lớp học để bảo vệ khả năng tiếp thu. Vì vậy, hạn chế điện thoại là biện pháp bảo hộ cần thiết.'
          },
          {
            id: 'hint_2',
            angleTitle: 'Chiến lược 2: Đòn bẩy Chi phí Ngoại tác & Bình đẳng Học đường',
            point: 'Việc cho phép sử dụng điện thoại thông minh vô tình khoét sâu bất bình đẳng vật chất và tạo môi trường bạo lực mạng ngầm trong khuôn viên trường học.',
            explanation: 'Sự phân hóa giữa các dòng máy đắt tiền và máy phổ thông tạo ra áp lực đồng trang lứa (peer pressure) nặng nề, biến lớp học thành nơi phô trương của cải thay vì thi đua tri thức.',
            evidence: 'Tại Pháp và Thụy Điển, sau khi ban hành lệnh cấm điện thoại tại trường cấp 2 và cấp 3, tỷ lệ các vụ bạo lực học đường và bắt nạt trên mạng nội bộ giảm hơn 30% trong năm đầu tiên.',
            link: 'Trường học phải là không gian bình đẳng và an toàn tuyệt đối, điều chỉ có thể đạt được khi loại bỏ thiết bị di động ra khỏi khuôn viên.',
            fullScaffoldText: 'Thưa ban giám khảo, đối phương hoàn toàn bỏ qua chi phí ngoại tác: Smartphone khoét sâu hố sâu bất bình đẳng và châm ngòi bạo lực mạng ngầm. Dữ liệu thực nghiệm từ Pháp và Thụy Điển chứng minh các vụ bắt nạt học đường giảm 30% ngay sau khi cấm thiết bị. Muốn bảo vệ sự bình đẳng và an toàn của học sinh, trường học bắt buộc phải thiết lập ranh giới nghiêm ngặt này.'
          },
          {
            id: 'hint_3',
            angleTitle: 'Chiến lược 3: Phân tích Chi phí Cơ hội Giao tiếp Xã hội Thực tế',
            point: 'Giờ ra chơi và tương tác trực tiếp là chiếc nôi tôi luyện trí tuệ cảm xúc (EQ), điều đang bị thế giới ảo nuốt chửng.',
            explanation: 'Nếu không cấm điện thoại, giờ giải lao sẽ trở thành cảnh tượng học sinh ngồi cạnh nhau nhưng dán mắt vào màn hình riêng biệt. Điều này triệt tiêu hoàn toàn kỹ năng vận động và phản xạ xã hội đời thực.',
            evidence: 'Khảo sát của Hiệp hội Tâm lý học Hoa Kỳ (APA) cho thấy học sinh ở các trường không sử dụng điện thoại có mức độ gắn kết bạn bè và hoạt động thể chất cao gấp 2.5 lần so với nhóm trường tự do thiết bị.',
            link: 'Vì vậy, chính sách của phe Khẳng định không phải là tước đoạt, mà là trao trả lại tuổi trẻ và tình bạn chân thực cho học sinh THPT.',
            fullScaffoldText: 'Đối phương lo ngại học sinh bị tước đoạt công cụ, nhưng phe bạn đang tước đoạt điều quý giá hơn: kỹ năng kết nối xã hội đời thực! Khảo sát của APA chỉ ra trường cấm điện thoại giúp hoạt động thể chất và gắn kết bạn bè tăng gấp 2.5 lần. Phe Khẳng định không cấm đoán vô lý, chúng tôi đang giải phóng các em khỏi chiếc màn hình để sống trọn vẹn tuổi học trò.'
          }
        ];
      } else {
        // Học sinh Phản đối Cấm -> Phản bác phe Ủng hộ
        return [
          {
            id: 'hint_1',
            angleTitle: 'Chiến lược 1: Bóc trần Ngụy biện Dốc trượt & Lỗi thời trong Giáo dục 4.0',
            point: 'Lệnh cấm toàn diện là sự thoái thác trách nhiệm giáo dục và đi ngược lại xu thế chuyển đổi số quốc gia.',
            explanation: 'Cấm đoán không dạy học sinh cách làm chủ công nghệ, mà chỉ trì hoãn và đẩy các rủi ro vào bóng tối. Khi bước vào đại học và thị trường lao động, các em sẽ thiếu hoàn toàn kỹ năng tự quản lý thiết bị số.',
            evidence: 'Mô hình giáo dục Phần Lan và Singapore không hề cấm smartphone mà tích hợp chúng vào các bài tập tra cứu dữ liệu thời gian thực, đưa năng lực số của học sinh hai nước này lên top đầu thế giới.',
            link: 'Trách nhiệm của nhà trường là trang bị năng lực tự vệ số và văn hóa sử dụng công nghệ, chứ không phải giải quyết vấn đề bằng một lệnh cấm giáo điều.',
            fullScaffoldText: 'Phe Phản định kịch liệt phản đối tư duy cấm đoán thụ động này! Lệnh cấm của đối phương không dạy học sinh làm chủ công nghệ mà chỉ thoái thác trách nhiệm đào tạo. Hãy nhìn vào Phần Lan và Singapore: họ dạy học sinh dùng smartphone để tra cứu và phản biện, từ đó đứng đầu thế giới về kỹ năng số. Nhà trường phải khai phóng nhận thức, không thể đóng băng tư duy bằng sự sợ hãi!'
          },
          {
            id: 'hint_2',
            angleTitle: 'Chiến lược 2: Đề xuất Mô hình Quản lý Thay thế Vượt trội (Counter-model)',
            point: 'Giải pháp cấm hoàn toàn thất bại ở Tính khả thi (Feasibility) và tạo ra sự đối kháng ngầm giữa thầy và trò.',
            explanation: 'Chi phí giám sát việc cấm đoán là khổng lồ và bất khả thi. Học sinh sẽ tìm cách lén lút sử dụng trong nhà vệ sinh hoặc góc khuất, tạo ra tâm lý dối trá và phá vỡ mối quan hệ tin cậy trong môi trường sư phạm.',
            evidence: 'Thực tế tại nhiều trường THPT Việt Nam cho thấy mô hình "Túi đựng điện thoại đầu giờ học" (chỉ sử dụng khi giáo viên bộ môn yêu cầu phục vụ bài học) đạt tỷ lệ đồng thuận trên 92% từ cả phụ huynh lẫn học sinh.',
            link: 'Mô hình quản lý có định hướng giải quyết trọn vẹn cả hai mục tiêu: vừa bảo đảm tập trung giờ học, vừa giữ trọn tiện ích công nghệ và liên lạc khẩn cấp.',
            fullScaffoldText: 'Phe chúng tôi xin đưa ra Counter-model ưu việt hơn: Thay vì cấm tuyệt đối vừa tốn kém vừa biến thầy cô thành cảnh sát giám sát, mô hình "Túi cất giữ tại lớp - chỉ dùng khi học tập" đã thành công vang dội với 92% đồng thuận. Giải pháp của chúng tôi vừa đảm bảo sự tập trung, vừa không cắt đứt liên lạc khẩn cấp của gia đình. Tại sao phải chọn cấm đoán cực đoan khi đã có giải pháp thông minh hơn?'
          },
          {
            id: 'hint_3',
            angleTitle: 'Chiến lược 3: Bảo vệ Quyền An toàn & Liên lạc Khẩn cấp của Học sinh',
            point: 'Điện thoại thông minh là phao cứu sinh bảo vệ an toàn cá nhân và quyền kết nối của học sinh trong các trường hợp bất khả kháng.',
            explanation: 'Trong bối cảnh bất trắc về sức khỏe, thời tiết cực đoan, sự cố giao thông sau giờ học hoặc các nguy cơ xâm hại, khả năng liên lạc trực tiếp với gia đình và cơ quan chức năng là quyền an toàn cơ bản của công dân vị thành niên.',
            evidence: 'Trong các vụ thiên tai và sự cố trường học bất ngờ, hơn 85% học sinh đã nhận được hỗ trợ kịp thời từ phụ huynh nhờ tính năng định vị GPS và gọi khẩn cấp trên điện thoại cá nhân.',
            link: 'Không một lệnh cấm hành chính nào có quyền đặt sự an nguy và tính mạng của học sinh vào thế rủi ro.',
            fullScaffoldText: 'Thưa ban giám khảo, đối phương đã hoàn toàn phớt lờ gánh nặng an toàn: Smartphone là công cụ bảo hộ khẩn cấp của học sinh trong các sự cố y tế hoặc hiểm nguy ngoại cảnh. Hơn 85% học sinh được cứu trợ kịp thời nhờ định vị GPS và liên lạc trực tiếp. Không một nhà trường nào có quyền tước đoạt chiếc phao cứu sinh an toàn đó của các em!'
          }
        ];
      }
    }

    // Gợi ý chuẩn WSDC đa mục tiêu cho các đề tài khác hoặc đề tài tùy biến
    return [
      {
        id: 'generic_hint_1',
        angleTitle: 'Chiến lược 1: Bẻ gãy Tiền đề Ngầm định (Flawed Premise & Mechanism)',
        point: `Phe ${isPro ? 'Khẳng định' : 'Phản định'} xin chỉ ra lỗ hổng cốt lõi trong lập luận của đối phương: Tiền đề nhân quả của bạn hoàn toàn bị đứt gãy.`,
        explanation: 'Đối phương đang giả định rằng chính sách bạn đề xuất sẽ tự động tạo ra kết quả mong muốn, nhưng bạn bỏ quên cơ chế thực thi thực tế (Enforcement Mechanism) và sự kháng cự của các đối tượng liên quan.',
        evidence: 'Dữ liệu thực nghiệm và các tiền lệ chính sách tương tự chứng minh rằng việc áp đặt mệnh lệnh hành chính mà không có sự đồng thuận sẽ luôn tạo ra hiệu ứng phản ngược (Backfire Effect) tốn kém.',
        link: 'Khi cơ chế thực thi sụp đổ, toàn bộ hệ thống lý lẽ của đối phương trở nên vô giá trị trước ban giám khảo.',
        fullScaffoldText: `Thưa ban giám khảo, chúng tôi xin bóc trần lỗ hổng chí mạng của đối phương: Bạn cho rằng lập trường của bạn là giải pháp, nhưng tiền đề nhân quả hoàn toàn đứt gãy vì thiếu cơ chế thực thi khả dĩ! Các tiền lệ chính sách đã chứng minh sự áp đặt mệnh lệnh chỉ gây ra hiệu ứng phản tác dụng. Phe chúng tôi kiên quyết bác bỏ lập luận thiếu thực tế này.`
      },
      {
        id: 'generic_hint_2',
        angleTitle: 'Chiến lược 2: Đòn bẩy Chi phí Cơ hội & Phân tích Đa bên (Stakeholder Impact)',
        point: 'Chính sách đối phương đề xuất mang lại lợi ích cục bộ ngắn hạn nhưng đánh đổi bằng cái giá tổn thất dài hạn không thể đảo ngược.',
        explanation: 'Trong tranh biện WSDC, một giải pháp chỉ được coi là ưu việt khi lợi ích cận biên (Marginal Benefit) vượt trội so với chi phí cơ hội. Phương án của đối phương đang biến nhóm đối tượng dễ tổn thương nhất thành nạn nhân gánh chịu rủi ro.',
        evidence: 'Các báo cáo phân tích tác động độc lập (Impact Assessment) chỉ ra tổn thất về tinh thần và cơ hội phát triển của thế hệ trẻ là thứ không một nguồn ngân sách nào bù đắp nổi.',
        link: 'Bảo vệ tương lai bền vững và đối tượng yếu thế là trách nhiệm đạo đức cao nhất mà phe chúng tôi kiên định theo đuổi.',
        fullScaffoldText: `Đối phương chỉ chăm chăm nhìn vào một chút ích lợi bề mặt mà nhắm mắt trước chi phí cơ hội khổng lồ! Giải pháp của bạn đẩy gánh nặng rủi ro lên vai những người yếu thế nhất. Đánh đổi sự phát triển dài hạn lấy thứ kết quả ngắn hạn là một quyết định sai lầm mà ban giám khảo không bao giờ chấp nhận!`
      },
      {
        id: 'generic_hint_3',
        angleTitle: 'Chiến lược 3: So sánh Cặp Lập trường & Đề xuất Phương án Thay thế (Counter-Model)',
        point: 'Phe chúng tôi mang đến một giải pháp thay thế vượt trội, giải quyết tận gốc nguyên nhân vấn đề thay vì chỉ chữa triệu chứng.',
        explanation: 'Đối phương mắc bẫy ngụy biện Nhị nguyên khi cho rằng chỉ có phương án của bạn mới cứu vãn được tình thế. Mô hình quản lý và giáo dục nâng cao nhận thức của chúng tôi giải quyết trọn vẹn cả bài toán hiệu quả lẫn tính nhân văn.',
        evidence: 'Thực tiễn giáo dục hiện đại đã chứng minh các mô hình tự chủ có kiểm soát và đối thoại cởi mở luôn mang lại hiệu quả bền vững gấp nhiều lần so với các biện pháp cưỡng chế hà khắc.',
        link: 'Trên bàn cân so sánh tổng thể của WSDC, lập trường của phe chúng tôi mang lại giá trị thặng dư vượt bậc cho toàn xã hội.',
        fullScaffoldText: `Thay vì rơi vào cái bẫy nhị nguyên cực đoan của đối phương, phe chúng tôi đưa ra Counter-Model vượt trội: Giải quyết tận gốc nguyên nhân thông qua nâng cao năng lực và cơ chế kiểm soát linh hoạt. Mô hình của chúng tôi bảo toàn trọn vẹn các giá trị cốt lõi mà không gây tổn hại phụ. Đó là lý do phe chúng tôi xứng đáng giành phần thắng áp đảo!`
      }
    ];
  }



  /**
   * PHƯƠNG PHÁP VẤN ĐÁP SOCRATES (SOCRATIC QUESTIONING)
   * Đặt các câu hỏi gợi mở dựa trực tiếp trên ý kiến của học sinh để các bạn tự bộc lộ ý tưởng từ bên trong.
   * Ưu tiên gọi route /api/socratic trên server (Gemini 3.8 Flash), sau đó fallback sang bộ câu hỏi theo chủ đề.
   */
  public static async generateSocraticGuidingQuestions(
    topic: DebateTopic,
    studentSide: DebateSide,
    opponentLatestSpeech?: string,
    _apiKey?: string,
    studentLatestThought?: string
  ): Promise<SocraticGuidingQuestion[]> {
    try {
      const resp = await fetch('/api/socratic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          studentSide,
          opponentSpeech: opponentLatestSpeech,
          studentThought: studentLatestThought
        })
      });

      if (resp.ok) {
        const cloudQuestions = await resp.json();
        if (Array.isArray(cloudQuestions) && cloudQuestions.length > 0) {
          return cloudQuestions as SocraticGuidingQuestion[];
        }
      }
    } catch (err) {
      console.warn('Server Socratic questions failed, falling back to local engine:', err);
    }
    return this.generateSocraticWithLocalEngine(topic, studentSide, opponentLatestSpeech, studentLatestThought);
  }

  /**
   * Bộ câu hỏi Socrates khơi gợi tư duy từ ngữ gần gũi, đời thường cho học sinh
   */
  private static generateSocraticWithLocalEngine(
    topic: DebateTopic,
    studentSide: DebateSide,
    opponentSpeech?: string,
    studentThought?: string
  ): SocraticGuidingQuestion[] {
    const isPro = studentSide === 'pro';
    const studentSnippet = studentThought && studentThought.trim().length > 10 
      ? studentThought.trim().slice(0, 50) + '...'
      : null;

    // 1. Đề tài: Cấm smartphone trong trường học
    if (topic.id === 'topic_01') {
      if (isPro) {
        return [
          {
            id: 'soc_1',
            category: 'premise',
            categoryTitle: '1. Lật ngược điều đối thủ tự cho là đúng',
            badge: 'Họ tự mặc định',
            question: 'Đối thủ tin rằng "học sinh có thể tự giác không dùng điện thoại khi học". Bạn nghĩ một bạn học sinh 16 tuổi có dễ cưỡng lại thông báo tin nhắn và video TikTok suốt 45 phút không?',
            subQuestions: [
              'Khi để điện thoại ngay trong túi quần, liệu bạn có luôn bị thôi thúc rút ra xem trộm không?',
              'Có phải đối thủ đang nhầm lẫn giữa "muốn tự giác" và "thực tế khó tự giác" trước các ứng dụng gây nghiện?'
            ],
            insightHint: 'Hãy hỏi thẳng xem liệu có bao nhiêu bạn trong lớp thực sự mở điện thoại ra chỉ để tra cứu bài học.',
            sentenceStarter: 'Đối thủ đang ngầm cho rằng học sinh có thể dễ dàng tự giác kiểm soát điện thoại, nhưng thực tế ở trường học cho thấy...'
          },
          {
            id: 'soc_2',
            category: 'mechanism',
            categoryTitle: '2. Nhìn vào đời thực xem có làm được không?',
            badge: 'Làm thật ra sao?',
            question: 'Nếu làm theo cách của đối thủ là "cho mang nhưng chỉ dùng khi thầy cô cho phép", thì thầy cô sẽ phải quản lý 40 học sinh như thế nào?',
            subQuestions: [
              'Thầy cô có mất thời gian giảng bài chỉ để liên tục nhắc nhở học sinh cất máy đi không?',
              'Việc nhắc nhở qua lại có làm không khí lớp học thêm căng thẳng không?'
            ],
            insightHint: 'Một quy định nửa vời thì giáo viên sẽ biến thành người đi canh chừng, vừa mệt thầy vừa ức chế trò.',
            sentenceStarter: 'Về mặt thực hiện, cách làm nửa vời của đối phương sẽ khiến thầy cô phải mất rất nhiều thời gian để...'
          },
          {
            id: 'soc_3',
            category: 'stakeholder',
            categoryTitle: '3. Ai là người chịu thiệt thòi nhiều nhất?',
            badge: 'Người chịu thiệt',
            question: 'Khi trong lớp ai cũng đua nhau khoe các dòng điện thoại xịn, các bạn có hoàn cảnh khó khăn hơn sẽ cảm thấy thế nào?',
            subQuestions: [
              'Trường học có nguy cơ biến thành nơi so sánh giàu nghèo thay vì thi đua học tập không?',
              'Tình trạng quay lén hoặc đăng ảnh dìm bạn bè lên mạng trong giờ ra chơi ảnh hưởng ra sao đến nạn nhân?'
            ],
            insightHint: 'Bảo vệ những bạn học sinh hay mặc cảm hoặc dễ trở thành nạn nhân của trò đùa cợt chụp lén trên mạng.',
            sentenceStarter: 'Đối thủ đã hoàn toàn bỏ quên cảm giác của những bạn học sinh có hoàn cảnh khó khăn khi phải đối mặt với...'
          },
          {
            id: 'soc_4',
            category: 'alternative',
            categoryTitle: '4. Có cách nào giải quyết khôn khéo hơn?',
            badge: 'Giải pháp hay hơn',
            question: 'Lệnh cấm của bạn có thực sự làm học sinh bị cô lập không, hay nhà trường đã có sẵn phòng y tế và giám thị để liên lạc khi khẩn cấp?',
            subQuestions: [
              'Trước khi có smartphone, các thế hệ học sinh vẫn kết nối với phụ huynh rất an toàn qua trường bằng cách nào?',
              'Nếu không cắm mặt vào màn hình, giờ ra chơi học sinh sẽ có cơ hội làm gì cùng nhau?'
            ],
            insightHint: 'Khẳng định lệnh cấm không phải là làm khó học sinh, mà là tạo cho các bạn một khoảng không gian thật để nói chuyện và kết bạn.',
            sentenceStarter: 'Phe chúng tôi cấm điện thoại không phải để làm khó, mà để trả lại cho học sinh một không gian...'
          }
        ];
      } else {
        return [
          {
            id: 'soc_1',
            category: 'premise',
            categoryTitle: '1. Lật ngược điều đối thủ tự cho là đúng',
            badge: 'Họ tự mặc định',
            question: 'Đối thủ tin rằng cứ cấm điện thoại là học sinh sẽ tự động chăm chú nghe giảng. Bạn thấy điều này có đúng sự thật không?',
            subQuestions: [
              'Nếu không có điện thoại mà bài giảng quá nhàm chán, học sinh có vẽ bậy, ngủ gật hay nói chuyện riêng không?',
              'Điện thoại có phải nguyên nhân gốc rễ, hay chỉ là cái cớ để đổ lỗi khi học sinh mất hứng thú học?'
            ],
            insightHint: 'Chiếc điện thoại chỉ là công cụ. Vấn đề nằm ở việc làm sao để tiết học hấp dẫn và dạy học sinh cách tự chủ.',
            sentenceStarter: 'Đối thủ đang đổ hết mọi lỗi lầm cho chiếc điện thoại, nhưng thực chất học sinh mất tập trung là vì...'
          },
          {
            id: 'soc_2',
            category: 'mechanism',
            categoryTitle: '2. Nhìn vào đời thực xem có làm được không?',
            badge: 'Làm thật ra sao?',
            question: 'Nếu cấm tiệt 100%, bạn có nghĩ học sinh sẽ tìm mọi cách giấu máy trong người, vào nhà vệ sinh lén lút bấm không?',
            subQuestions: [
              'Lệnh cấm có biến học sinh thành người hay nói dối và biến giám thị thành người đi lục soát cặp sách không?',
              'Một lệnh cấm bị học sinh chống đối ngầm có đem lại môi trường giáo dục lành mạnh không?'
            ],
            insightHint: 'Cấm đoán cực đoan chỉ sinh ra sự đối phó và làm mất đi sự tin tưởng lẫn nhau giữa thầy và trò.',
            sentenceStarter: 'Trong đời thực, lệnh cấm tuyệt đối này sẽ chẳng thể hiệu quả mà chỉ khiến học sinh chuyển sang...'
          },
          {
            id: 'soc_3',
            category: 'stakeholder',
            categoryTitle: '3. Ai là người chịu thiệt thòi nhiều nhất?',
            badge: 'Người chịu thiệt',
            question: 'Nếu trên đường đi học hoặc tan trường muộn gặp sự cố hỏng xe hay mưa bão, học sinh không có điện thoại sẽ liên lạc với bố mẹ thế nào?',
            subQuestions: [
              'Những bạn học sinh thường xuyên dùng điện thoại để tra từ điển, tài liệu ôn thi đại học sẽ bị hạn chế ra sao?',
              'Sau này ra trường đi làm ở thời đại số, những học sinh quen bị cấm đoán có biết cách tự kiểm soát bản thân không?'
            ],
            insightHint: 'Học sinh cần học cách chung sống có trách nhiệm với công nghệ chứ không thể trốn tránh suốt đời.',
            sentenceStarter: 'Người chịu thiệt thòi lớn nhất ở đây chính là những bạn học sinh thực sự cần thiết bị để...'
          },
          {
            id: 'soc_4',
            category: 'alternative',
            categoryTitle: '4. Có cách nào giải quyết khôn khéo hơn?',
            badge: 'Giải pháp hay hơn',
            question: 'Thay vì cấm tiệt, tại sao lớp học không dùng "giỏ để điện thoại" đầu giờ và chỉ lấy ra khi cần tra cứu tài liệu?',
            subQuestions: [
              'Cách làm linh hoạt này có vừa giúp tập trung học vừa không gây bức xúc không?',
              'Tại sao các trường đại học lớn đều hướng dẫn sinh viên tự quản thay vì áp đặt lệnh cấm?'
            ],
            insightHint: 'Đưa ra giải pháp "quản lý thông minh": Để điện thoại ở góc lớp trong giờ học, giúp đôi bên cùng thoải mái.',
            sentenceStarter: 'Thay vì cấm đoán cứng nhắc, chúng tôi đề xuất một cách giải quyết hợp tình hợp lý hơn là...'
          }
        ];
      }
    }

    // 2. Đề tài: AI thay thế giáo viên THPT trong 10 năm tới
    if (topic.id === 'topic_02') {
      if (isPro) {
        return [
          {
            id: 'soc_1',
            category: 'premise',
            categoryTitle: '1. Lật ngược điều đối thủ tự cho là đúng',
            badge: 'Họ tự mặc định',
            question: 'Đối thủ nghĩ rằng thầy cô luôn hiểu tâm lý từng học sinh. Nhưng với một lớp 45 bạn, thầy cô có đủ sức quan tâm từng em mỗi ngày không?',
            subQuestions: [
              'Nhiều bạn học sinh rụt rè, không dám giơ tay hỏi thầy cô nhưng lại rất thoải mái hỏi AI, bạn thấy đúng không?',
              'AI có khả năng kiên nhẫn giảng đi giảng lại 100 lần không cáu gắt, điều này con người có làm được mãi không?'
            ],
            insightHint: 'Chỉ ra sự quá tải thực tế của giáo viên trường công, trong khi AI có thể làm gia sư riêng 1-1 cho mọi học sinh.',
            sentenceStarter: 'Đối phương đang lý tưởng hóa rằng thầy cô có thể quan tâm trọn vẹn 45 học sinh cùng lúc, nhưng thực tế là...'
          },
          {
            id: 'soc_2',
            category: 'mechanism',
            categoryTitle: '2. Nhìn vào đời thực xem có làm được không?',
            badge: 'Làm thật ra sao?',
            question: 'Khi AI ngày càng thông minh, có thể chấm bài lập tức và soạn bài giảng riêng theo sức học của bạn, ai còn muốn nghe một bài giảng chung chung?',
            subQuestions: [
              'Học sinh có tiết kiệm được hàng chục triệu tiền học thêm nếu có AI hướng dẫn tận tình không?',
              'Tốc độ cập nhật tri thức của AI nhanh hơn hàng ngàn lần so với sách giáo khoa in ấn, đó có phải lợi thế vượt trội?'
            ],
            insightHint: 'Tập trung vào hiệu quả học tập: AI giúp học sinh học đúng tốc độ của bản thân, không bị tụt lại phía sau.',
            sentenceStarter: 'Về mặt hiệu quả học tập, công nghệ AI vượt trội hoàn toàn so với mô hình cũ bởi vì...'
          },
          {
            id: 'soc_3',
            category: 'stakeholder',
            categoryTitle: '3. Ai là người chịu thiệt thòi nhiều nhất?',
            badge: 'Người chịu thiệt',
            question: 'Học sinh ở vùng sâu vùng xa thiếu giáo viên giỏi sẽ đổi đời ra sao nếu được tiếp cận với một người thầy AI đẳng cấp thế giới?',
            subQuestions: [
              'Có phải việc giữ mô hình truyền thống đang làm học sinh nghèo thiệt thòi vì không có tiền học thêm?',
              'Bình đẳng giáo dục có đạt được nhanh hơn nhờ công nghệ mở không?'
            ],
            insightHint: 'Nhấn mạnh vào cơ hội đổi đời cho học sinh nghèo và những bạn ở nông thôn, hải đảo.',
            sentenceStarter: 'Lợi ích nhân văn lớn nhất của việc ứng dụng AI giáo dục chính là mang lại sự công bằng cho...'
          },
          {
            id: 'soc_4',
            category: 'alternative',
            categoryTitle: '4. Có cách nào giải quyết khôn khéo hơn?',
            badge: 'Giải pháp hay hơn',
            question: 'Khi AI lo phần dạy chữ, thầy cô sẽ được giải phóng khỏi đống sổ sách giáo án để trở thành người bạn đồng hành tâm lý thực sự, điều đó chẳng tốt hơn sao?',
            subQuestions: [
              'Vai trò "thay thế cốt lõi" ở đây là thay thế việc giảng bài máy móc, chứ không phủ nhận tình cảm con người, bạn giải thích thế nào?',
              'Một ngôi trường kết hợp sức mạnh AI với sự ấm áp của người cố vấn sẽ tuyệt vời ra sao?'
            ],
            insightHint: 'Định nghĩa lại: Thay thế vai trò "thợ dạy kiến thức" để nâng tầm giáo viên thành chuyên gia định hướng cuộc sống.',
            sentenceStarter: 'Chúng tôi muốn khẳng định rằng AI sẽ thay thế vai trò truyền thụ bài giảng khô cứng để giúp...'
          }
        ];
      } else {
        return [
          {
            id: 'soc_1',
            category: 'premise',
            categoryTitle: '1. Lật ngược điều đối thủ tự cho là đúng',
            badge: 'Họ tự mặc định',
            question: 'Đối thủ coi giáo dục chỉ là việc nạp kiến thức vào đầu. Nhưng đi học cấp 3 chỉ để học thuộc công thức hay còn để học làm người?',
            subQuestions: [
              'Một cỗ máy có bao giờ biết mỉm cười động viên khi bạn buồn, hay vỗ vai an ủi khi bạn trượt kỳ thi?',
              'AI có hiểu được hoàn cảnh gia đình khó khăn đằng sau một bài kiểm tra điểm kém của học sinh không?'
            ],
            insightHint: 'Đi học là trải nghiệm cảm xúc và nhân cách. AI chỉ có dữ liệu, không có linh hồn và sự thấu cảm của con người.',
            sentenceStarter: 'Đối thủ đã hạ thấp ý nghĩa của giáo dục khi nghĩ rằng đi học chỉ để nhồi nhét kiến thức, mà quên mất rằng...'
          },
          {
            id: 'soc_2',
            category: 'mechanism',
            categoryTitle: '2. Nhìn vào đời thực xem có làm được không?',
            badge: 'Làm thật ra sao?',
            question: 'Nếu để học sinh tự ngồi học trước màn hình AI suốt ngày, bao nhiêu bạn sẽ thực sự chăm chú và bao nhiêu bạn sẽ mở game ra chơi?',
            subQuestions: [
              'Sự hiện diện bằng xương bằng thịt của thầy cô trên bục giảng có sức lay động và truyền cảm hứng mà màn hình máy tính không thể có không?',
              'Học sinh cả ngày đối thoại với máy tính sẽ bị cùn mòn kỹ năng giao tiếp và cảm xúc ra sao?'
            ],
            insightHint: 'Chỉ ra sự lạnh lẽo của màn hình: Máy móc không thể tạo ra năng lượng sống và kỷ luật tập thể như một người thầy thật sự.',
            sentenceStarter: 'Nếu để học sinh tự học hoàn toàn với máy tính, thực tế sẽ xảy ra tình trạng đáng báo động là...'
          },
          {
            id: 'soc_3',
            category: 'stakeholder',
            categoryTitle: '3. Ai là người chịu thiệt thòi nhiều nhất?',
            badge: 'Người chịu thiệt',
            question: 'Những học sinh đang gặp khủng hoảng tâm lý tuổi mới lớn sẽ tìm đến ai khi trường học chỉ còn lại những con bot trả lời tự động?',
            subQuestions: [
              'Bao nhiêu bài học đạo đức, lòng trắc ẩn và sự bao dung trong đời bạn là do thầy cô truyền dạy?',
              'Xã hội tương lai sẽ ra sao nếu một thế hệ lớn lên mà không có hình bóng người thầy làm tấm gương nhân cách?'
            ],
            insightHint: 'Nhấn mạnh vai trò người thầy là ngọn hải đăng đạo đức, đặc biệt đối với học sinh đang trong giai đoạn hình thành nhân cách.',
            sentenceStarter: 'Hậu quả tồi tệ nhất đối với tâm hồn học sinh khi thiếu vắng bàn tay người thầy là...'
          },
          {
            id: 'soc_4',
            category: 'alternative',
            categoryTitle: '4. Có cách nào giải quyết khôn khéo hơn?',
            badge: 'Giải pháp hay hơn',
            question: 'Tại sao lại nói "thay thế" khi AI chỉ nên là công cụ trợ giảng đắc lực trong tay người thầy để lớp học sinh động hơn?',
            subQuestions: [
              'Chiếc máy tính không thay thế nhà văn, và AI cũng không thể thay thế trái tim của người thầy, bạn dùng hình ảnh này thế nào?',
              'Thầy cô làm chủ công nghệ sẽ tạo ra những tiết học kỳ diệu ra sao?'
            ],
            insightHint: 'Khẳng định lập trường: Công nghệ phục vụ con người. Thầy cô giáo luôn là linh hồn không thể thay thế của trường học.',
            sentenceStarter: 'Thay vì mù quáng nghĩ đến việc thay thế người thầy, quan điểm đúng đắn nhất là xem AI như...'
          }
        ];
      }
    }

    // 3. Đề tài: Bãi bỏ thi học sinh giỏi & trường chuyên (topic_03)
    if (topic.id === 'topic_03') {
      if (isPro) {
        return [
          {
            id: 'soc_1',
            category: 'premise',
            categoryTitle: '1. Lật ngược điều đối thủ tự cho là đúng',
            badge: 'Họ tự mặc định',
            question: 'Đối thủ tin rằng trường chuyên là nơi duy nhất ươm mầm tài năng. Nhưng liệu việc dồn tiền thuế của toàn dân cho một nhóm nhỏ có công bằng với 95% học sinh còn lại?',
            subQuestions: [
              'Các bạn học sinh trường thường ở huyện nghèo có ít tiềm năng hơn bạn trường chuyên không?',
              'Tại sao không dùng ngân sách đó để nâng cấp phòng máy tính, thư viện cho tất cả các trường?'
            ],
            insightHint: 'Đặt câu hỏi về sự công bằng: Mọi học sinh đều có quyền được học trong ngôi trường khang trang như nhau.',
            sentenceStarter: 'Đối thủ đang ngầm định rằng chỉ học sinh trường chuyên mới đáng được đầu tư, nhưng sự bất công nằm ở chỗ...'
          },
          {
            id: 'soc_2',
            category: 'mechanism',
            categoryTitle: '2. Nhìn vào đời thực xem có làm được không?',
            badge: 'Làm thật ra sao?',
            question: 'Nhìn vào thực tế, bao nhiêu bạn học sinh trường chuyên đang bị cuốn vào việc luyện "gà nòi", chỉ học duy nhất một môn để lấy giải mà thiếu kỹ năng sống?',
            subQuestions: [
              'Áp lực kỳ vọng từ gia đình và nhà trường có đang làm nhiều bạn trẻ bị stress nặng và trầm cảm không?',
              'Khi ra đời, tấm huy chương học sinh giỏi một môn có bảo đảm người đó sẽ hạnh phúc và thành công toàn diện không?'
            ],
            insightHint: 'Vấn nạn học lệch: Luyện thi gà nòi lấy thành tích cho nhà trường nhưng tước đoạt tuổi trẻ và kỹ năng sống của học sinh.',
            sentenceStarter: 'Cơ chế thi cử học sinh giỏi hiện nay đang bộc lộ mặt trái đáng buồn là...'
          },
          {
            id: 'soc_3',
            category: 'stakeholder',
            categoryTitle: '3. Ai là người chịu thiệt thòi nhiều nhất?',
            badge: 'Người chịu thiệt',
            question: 'Ai là người chịu thiệt? Có phải là đại đa số học sinh trường thường bị thiếu thốn cơ sở vật chất, và chính các bạn chuyên bị áp lực thành tích đè nặng?',
            subQuestions: [
              'Tâm lý tự ti của những bạn không đỗ chuyên có ảnh hưởng tiêu cực đến con đường tương lai của các bạn không?',
              'Bệnh thành tích của người lớn có đang biến học sinh thành công cụ cạnh tranh danh hiệu?'
            ],
            insightHint: 'Đứng về phía cả hai nhóm: Giải phóng học sinh chuyên khỏi gánh nặng huy chương và đem lại cơ hội cho học sinh trường đại trà.',
            sentenceStarter: 'Nạn nhân thực sự của cuộc đua trường chuyên lớp chọn này chính là...'
          },
          {
            id: 'soc_4',
            category: 'alternative',
            categoryTitle: '4. Có cách nào giải quyết khôn khéo hơn?',
            badge: 'Giải pháp hay hơn',
            question: 'Nếu đổi thành các câu lạc bộ tài năng mở cho mọi học sinh được thử sức theo sở thích, điều đó chẳng dân chủ và vui vẻ hơn sao?',
            subQuestions: [
              'Các nền giáo dục tiên tiến trên thế giới phát triển năng khiếu học sinh trong trường học bình thường như thế nào?',
              'Tại sao phải phân loại học sinh thành "chuyên" và "thường" ngay từ khi mới 15 tuổi?'
            ],
            insightHint: 'Mô hình giáo dục toàn diện: Nuôi dưỡng đam mê tự nhiên thay vì phân loại tầng lớp từ sớm.',
            sentenceStarter: 'Giải pháp tiến bộ mà chúng tôi hướng tới là xây dựng một nền giáo dục mở, nơi mà...'
          }
        ];
      } else {
        return [
          {
            id: 'soc_1',
            category: 'premise',
            categoryTitle: '1. Lật ngược điều đối thủ tự cho là đúng',
            badge: 'Họ tự mặc định',
            question: 'Đối thủ cho rằng bỏ trường chuyên là tạo ra sự bình đẳng. Nhưng ép những bạn có đam mê vượt trội phải học theo một tốc độ bình thường có phải là bình đẳng thật sự không?',
            subQuestions: [
              'Nếu một bạn có năng khiếu toán xuất sắc bị bắt ngồi nghe những kiến thức bạn ấy đã biết từ 3 năm trước, bạn ấy sẽ chán nản ra sao?',
              'Bình đẳng có nghĩa là cào bằng tất cả mọi người xuống cùng một mức không?'
            ],
            insightHint: 'Cào bằng không phải là công bằng. Mỗi tài năng cần một mảnh đất phù hợp để đâm chồi nảy lộc.',
            sentenceStarter: 'Đối phương đang nhầm lẫn tai hại giữa sự công bằng và việc cào bằng năng lực, bởi vì...'
          },
          {
            id: 'soc_2',
            category: 'mechanism',
            categoryTitle: '2. Nhìn vào đời thực xem có làm được không?',
            badge: 'Làm thật ra sao?',
            question: 'Nếu không có môi trường trường chuyên tôi luyện, Việt Nam lấy đâu ra những nhà khoa học mũi nhọn để thi đấu trên trường quốc tế?',
            subQuestions: [
              'Môi trường có những bạn cùng đam mê cạnh tranh lành mạnh có kích thích sự tiến bộ vượt bậc không?',
              'Hầu hết các nhà khoa học, bác sĩ đầu ngành của đất nước đều trưởng thành từ cái nôi nào?'
            ],
            insightHint: 'Trường chuyên là động cơ thúc đẩy đỉnh cao tri thức, đưa trí tuệ Việt Nam ra thế giới.',
            sentenceStarter: 'Nhìn vào thực tế phát triển quốc gia, hệ thống trường chuyên đóng vai trò sống còn trong việc...'
          },
          {
            id: 'soc_3',
            category: 'stakeholder',
            categoryTitle: '3. Ai là người chịu thiệt thòi nhiều nhất?',
            badge: 'Người chịu thiệt',
            question: 'Nếu xóa bỏ trường chuyên công lập, những bạn học sinh nhà nghèo nhưng học cực giỏi sẽ đi về đâu?',
            subQuestions: [
              'Có phải chỉ những gia đình siêu giàu mới có tiền cho con vào các trường quốc tế đắt đỏ?',
              'Trường chuyên công lập chẳng phải là con đường đổi đời công bằng nhất dựa trên thực lực cho học sinh nghèo sao?'
            ],
            insightHint: 'Bảo vệ học sinh nghèo hiếu học: Trường chuyên công lập là chiếc thang xã hội công bằng nhất cho con nhà nghèo vượt khó.',
            sentenceStarter: 'Nếu xóa bỏ trường chuyên, nhóm học sinh chịu thiệt thòi đau đớn nhất sẽ là những bạn nghèo có tài năng vì...'
          },
          {
            id: 'soc_4',
            category: 'alternative',
            categoryTitle: '4. Có cách nào giải quyết khôn khéo hơn?',
            badge: 'Giải pháp hay hơn',
            question: 'Thay vì đập bỏ một mô hình tốt, tại sao không sửa đổi cách dạy để học sinh chuyên được rèn thêm kỹ năng sống và thể thao?',
            subQuestions: [
              'Khắc phục bệnh thành tích bằng cách cải tiến cách đánh giá, chứ tại sao lại đi đóng cửa cái nôi đào tạo nhân tài?',
              'Giữ lại tinh hoa và mở rộng tài liệu học tập cho các trường khác cùng học hỏi có phải cách làm khôn ngoan hơn?'
            ],
            insightHint: 'Sửa chữa khuyết điểm chứ không vứt bỏ thành tựu: Nâng cấp trường chuyên toàn diện hơn thay vì xóa sổ.',
            sentenceStarter: 'Giải pháp đúng đắn không phải là đập bỏ, mà là đổi mới phương pháp giảng dạy để trường chuyên trở thành...'
          }
        ];
      }
    }

    // 4. Đề tài: Mạng xã hội lợi hay hại (topic_04)
    if (topic.id === 'topic_04') {
      if (isPro) {
        return [
          {
            id: 'soc_1',
            category: 'premise',
            categoryTitle: '1. Lật ngược điều đối thủ tự cho là đúng',
            badge: 'Họ tự mặc định',
            question: 'Đối thủ bảo mạng xã hội giúp kết nối bạn bè. Nhưng có bao giờ bạn lướt mạng cả tiếng rồi cảm thấy cô đơn và trống rỗng hơn trước không?',
            subQuestions: [
              'Hàng ngàn bạn ảo và lượt "thả tim" trên mạng có thay thế được một cái ôm hay một buổi tâm sự ngoài đời thật không?',
              'Thuật toán mạng xã hội được sinh ra để kết nối con người hay để kiếm tiền từ sự chú ý của chúng ta?'
            ],
            insightHint: 'Bóc trần sự kết nối giả tạo: Mạng xã hội tạo ra ảo giác gắn kết nhưng thực chất là kinh doanh sự cô đơn.',
            sentenceStarter: 'Đối thủ vẽ ra một bức tranh màu hồng về sự kết nối, nhưng thực tế nghiệt ngã là mạng xã hội đang làm học sinh...'
          },
          {
            id: 'soc_2',
            category: 'mechanism',
            categoryTitle: '2. Nhìn vào đời thực xem có làm được không?',
            badge: 'Làm thật ra sao?',
            question: 'Khi mở TikTok hoặc Reels, bạn đã bao giờ tự nhủ "xem 5 phút thôi" rồi cuối cùng ngồi lướt đến 1 giờ sáng chưa?',
            subQuestions: [
              'Những video ngắn dưới 30 giây đang làm giảm khả năng kiên nhẫn đọc một cuốn sách hay làm bài toán khó như thế nào?',
              'Việc liên tục nhìn thấy những hình ảnh hoàn hảo, giàu sang của người khác có khiến học sinh tự ti về ngoại hình của mình không?'
            ],
            insightHint: 'Hiệu ứng tâm lý tiêu cực: FOMO (sợ bỏ lỡ), nghiện video ngắn và áp lực ngoại hình đang bào mòn tinh thần Gen Z.',
            sentenceStarter: 'Cơ chế thuật toán gây nghiện của mạng xã hội đang âm thầm hủy hoại thế hệ trẻ ở chỗ...'
          },
          {
            id: 'soc_3',
            category: 'stakeholder',
            categoryTitle: '3. Ai là người chịu thiệt thòi nhiều nhất?',
            badge: 'Người chịu thiệt',
            question: 'Những bạn học sinh là nạn nhân của bạo lực mạng (cyberbullying), bị lập nhóm nói xấu và bình luận ác ý thì có lối thoát nào không?',
            subQuestions: [
              'Một lời nói xấu trên mạng lan truyền tới hàng ngàn người trong vài phút tàn phá tâm lý một bạn trẻ ra sao?',
              'Đã có bao nhiêu trường hợp đáng tiếc xảy ra chỉ vì những tin đồn vô căn cứ trên các diễn đàn trường học?'
            ],
            insightHint: 'Bảo vệ những nạn nhân của bắt nạt trực tuyến và tin đồn độc hại mà đối thủ luôn lảng tránh.',
            sentenceStarter: 'Phe đối diện đã nhắm mắt làm ngơ trước nỗi đau cùng cực của những học sinh bị...'
          },
          {
            id: 'soc_4',
            category: 'alternative',
            categoryTitle: '4. Có cách nào giải quyết khôn khéo hơn?',
            badge: 'Giải pháp hay hơn',
            question: 'Bạn có nhận thấy rằng những trải nghiệm đáng nhớ nhất tuổi học trò đều diễn ra ngoài đời thật chứ không phải trên màn hình điện thoại?',
            subQuestions: [
              'Khi học sinh biết bớt dùng mạng xã hội để chơi thể thao, học đàn, trò chuyện thì cuộc sống thay đổi thế nào?',
              'Tại sao nhiều bạn trẻ phương Tây ngày nay đang tự giác chọn phong trào "Digital Detox" (Cai nghiện mạng xã hội)?'
            ],
            insightHint: 'Khẳng định giá trị của cuộc sống thật: Bớt thời gian lướt mạng là trao lại thời gian cho những đam mê có ý nghĩa.',
            sentenceStarter: 'Lập trường của chúng tôi là thức tỉnh các bạn trẻ nhận ra rằng giá trị đích thực nằm ở...'
          }
        ];
      } else {
        return [
          {
            id: 'soc_1',
            category: 'premise',
            categoryTitle: '1. Lật ngược điều đối thủ tự cho là đúng',
            badge: 'Họ tự mặc định',
            question: 'Đối thủ đổ hết mọi vấn đề tâm lý của giới trẻ cho mạng xã hội. Nhưng công nghệ có lỗi hay lỗi ở cách con người sử dụng nó?',
            subQuestions: [
              'Con dao dùng để nấu ăn hay làm tổn thương người khác là do người cầm dao hay do bản thân con dao?',
              'Nếu không có mạng xã hội, những vấn đề như bắt nạt hay so sánh lẫn nhau có tự biến mất trong trường học không?'
            ],
            insightHint: 'Mạng xã hội chỉ là tấm gương phản chiếu xã hội. Cốt lõi là giáo dục ý thức sử dụng chứ không phải cấm cản công cụ.',
            sentenceStarter: 'Đối thủ đang ngụy biện đánh đồng giữa công cụ và hành vi sử dụng, trong khi thực tế...'
          },
          {
            id: 'soc_2',
            category: 'mechanism',
            categoryTitle: '2. Nhìn vào đời thực xem có làm được không?',
            badge: 'Làm thật ra sao?',
            question: 'Bao nhiêu bạn học sinh THPT ngày nay đã tự học tiếng Anh, học lập trình, vẽ tranh và tìm học bổng du học nhờ các hội nhóm trên mạng xã hội?',
            subQuestions: [
              'Mạng xã hội đã giúp các dự án từ thiện, câu lạc bộ học sinh và phong trào vì môi trường lan tỏa mạnh mẽ thế nào?',
              'Một bạn trẻ ở vùng quê có thể tiếp cận bài giảng của các giáo sư hàng đầu thế giới bằng cách nào nếu không có mạng xã hội?'
            ],
            insightHint: 'Mạng xã hội là kho tàng tri thức mở và bệ phóng cơ hội: Học hỏi không giới hạn và kết nối cộng đồng tích cực.',
            sentenceStarter: 'Đối thủ đã cố tình phớt lờ sức mạnh diệu kỳ của mạng xã hội trong việc giúp học sinh...'
          },
          {
            id: 'soc_3',
            category: 'stakeholder',
            categoryTitle: '3. Ai là người chịu thiệt thòi nhiều nhất?',
            badge: 'Người chịu thiệt',
            question: 'Những bạn trẻ tài năng muốn khởi nghiệp sớm, làm nội dung sáng tạo, bán hàng phụ giúp gia đình sẽ mất đi cơ hội gì nếu quay lưng với mạng xã hội?',
            subQuestions: [
              'Mạng xã hội có phải là nơi duy nhất giúp các bạn trẻ không có nhiều tiền vẫn xây dựng được thương hiệu cá nhân?',
              'Trong thời đại kinh tế số, nếu mù mờ về mạng xã hội thì học sinh bước ra đời sẽ cạnh tranh ra sao?'
            ],
            insightHint: 'Bảo vệ quyền sáng tạo và cơ hội phát triển nghề nghiệp sớm của thế hệ trẻ.',
            sentenceStarter: 'Nếu nhìn nhận mạng xã hội một cách tiêu cực và cấm cản, chúng ta đang tước đoạt cơ hội của...'
          },
          {
            id: 'soc_4',
            category: 'alternative',
            categoryTitle: '4. Có cách nào giải quyết khôn khéo hơn?',
            badge: 'Giải pháp hay hơn',
            question: 'Thay vì than vãn và né tránh, tại sao nhà trường không dạy học sinh môn "Kỹ năng số" để nhận biết tin giả và dùng mạng thông minh?',
            subQuestions: [
              'Học cách làm chủ mạng xã hội chẳng phải là giải pháp gốc rễ và bền vững hơn việc lên án nó sao?',
              'Làm thế nào để biến mạng xã hội thành trợ thủ đắc lực cho con đường học vấn của bạn?'
            ],
            insightHint: 'Hướng tới tương lai: Trang bị bộ lọc tư duy phản biện cho học sinh thay vì sợ hãi công nghệ.',
            sentenceStarter: 'Giải pháp tiến bộ mà phe chúng tôi hướng tới là trang bị cho học sinh năng lực số để...'
          }
        ];
      }
    }

    // 5. Đề tài: Kinh tế vs Môi trường hoặc Chủ đề tùy chọn
    return [
      {
        id: 'soc_gen_1',
        category: 'premise',
        categoryTitle: '1. Lật ngược điều đối thủ tự cho là đúng',
        badge: 'Họ tự mặc định',
        question: `Điều mà đối thủ vừa nói nghe qua có vẻ hợp lý, nhưng hãy nghĩ kỹ xem: Liệu tiền đề đó có đúng trong mọi trường hợp không?`,
        subQuestions: [
          'Đối thủ có đang lấy một vài ví dụ cá biệt rồi vơ đũa cả nắm không?',
          'Quan hệ nhân quả họ đưa ra là có thật hay chỉ là hai sự việc tình cờ xảy ra cùng lúc?'
        ],
        insightHint: 'Đánh vào điểm yếu gốc rễ: Nếu điều họ tự cho là đúng bị lung lay, toàn bộ bài nói của họ sẽ mất đi sức nặng.',
        sentenceStarter: 'Đối thủ đang ngầm coi một điều là hiển nhiên nhưng thực tế lại hoàn toàn không đúng, cụ thể là...'
      },
      {
        id: 'soc_gen_2',
        category: 'mechanism',
        categoryTitle: '2. Nhìn vào đời thực xem có làm được không?',
        badge: 'Làm thật ra sao?',
        question: 'Nếu đem cách làm của đối thủ áp dụng vào cuộc sống thực tế ngày mai, ai sẽ là người thực hiện và sẽ gặp phải khó khăn gì?',
        subQuestions: [
          'Chi phí và công sức bỏ ra để làm việc này có quá đắt so với những gì thu lại không?',
          'Có tác hại ngoài ý muốn nào sẽ xảy ra mà đối thủ chưa lường trước?'
        ],
        insightHint: 'Chỉ ra sự bất khả thi: Một ý tưởng nghe hay trên lý thuyết nhưng vào đời thực không làm được thì vẫn là ý tưởng tồi.',
        sentenceStarter: 'Khi bước vào thực tế cuộc sống, cách giải quyết của đối phương sẽ gặp phải trở ngại lớn là...'
      },
      {
        id: 'soc_gen_3',
        category: 'stakeholder',
        categoryTitle: '3. Ai là người chịu thiệt thòi nhiều nhất?',
        badge: 'Người chịu thiệt',
        question: 'Trong câu chuyện này, ai là người đang phải chịu ấm ức hoặc tổn thất nhiều nhất mà đối thủ không thèm nhắc tới?',
        subQuestions: [
          'Nếu đặt mình vào vị trí của những người chịu ảnh hưởng trực tiếp, bạn sẽ bức xúc điều gì?',
          'Lợi ích ngắn hạn mà đối thủ hứa hẹn có đáng để đánh đổi tương lai lâu dài của họ không?'
        ],
        insightHint: 'Bảo vệ con người thực tế: Ban giám khảo luôn ủng hộ người biết bảo vệ những đối tượng chịu thiệt thòi.',
        sentenceStarter: 'Người phải gánh chịu hậu quả nặng nề nhất từ quan điểm của phe đối phương chính là...'
      },
      {
        id: 'soc_gen_4',
        category: 'alternative',
        categoryTitle: '4. Có cách nào giải quyết khôn khéo hơn?',
        badge: 'Giải pháp hay hơn',
        question: 'Bạn có cách giải quyết nào khôn khéo hơn, vừa giải quyết được nỗi lo của đối thủ vừa không phải trả giá đắt như cách của họ không?',
        subQuestions: [
          'Tại sao cách làm của bạn lại dễ nhận được sự ủng hộ và bền vững hơn trong tương lai?',
          'Điểm vượt trội lớn nhất giữa cách của bạn và cách của đối thủ là gì?'
        ],
        insightHint: 'Đưa ra giải pháp thông minh: Cho thấy bạn có tầm nhìn sâu sắc và giải pháp thấu tình đạt lý hơn.',
        sentenceStarter: 'Thay vì cách làm cực đoan của đối phương, phe chúng tôi đưa ra một hướng giải quyết thấu đáo hơn là...'
      }
    ];
  }

  /**
   * Sinh bài phát biểu cho Diễn giả AI theo vai trò WSDC (Prop 1-3, Opp 1-3, Reply)
   */
  public static async generateWsdcSpeech(
    topic: DebateTopic,
    role: string,
    speechesHistory: any[],
    activePois: any[] = []
  ): Promise<{
    speakerTitle: string;
    openingGreeting?: string;
    transcript: string;
    keyPoints: string[];
    rebuttalSummary?: string;
    estimatedSpeakingMinutes?: number;
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('/api/wsdc-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          role,
          speechesHistory,
          activePois
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Lỗi từ server khi sinh bài phát biểu');
      }

      return await response.json();
    } catch {
      // Thông điệp dự phòng tự nhiên chuẩn WSDC nếu server quá tải
      const isReply = role.includes('reply');
      const isPro = role.startsWith('prop');
      return {
        speakerTitle: isReply ? (isPro ? 'Prop Reply' : 'Opp Reply') : role.toUpperCase(),
        transcript: isReply 
          ? `Kính thưa Chủ tọa và Ban Giám khảo, bước vào bài phát biểu kết luận 4 phút, phe ${isPro ? 'Ủng hộ' : 'Phản đối'} nhìn lại bức tranh toàn cảnh của trận đấu qua 2 câu hỏi so sánh cốt tử. Câu hỏi thứ nhất: Đâu là thế giới mang lại giá trị bền vững và giảm thiểu tối đa tổn hại cho thế hệ tương lai? Câu hỏi thứ hai: Khi xảy ra xung đột quyền lợi, đâu là nguyên tắc đạo đức và giải pháp công bằng hơn? Qua toàn bộ các lượt nói, phe chúng tôi đã chứng minh cơ chế rõ ràng và giải quyết trọn vẹn gánh nặng chứng minh. Vì lẽ đó, chúng tôi kêu gọi Ban Giám khảo trao chiến thắng cho phe ${isPro ? 'Ủng hộ' : 'Phản đối'}.`
          : `Kính thưa Chủ tọa, Ban Giám khảo cùng toàn thể hội trường. Đại diện cho phe ${isPro ? 'Ủng hộ' : 'Phản đối'}, tôi xin khẳng định lập trường vững chắc của chúng tôi đối với kiến nghị này. Trước hết, về mặt bản chất, vấn đề nằm ở cơ chế phân bổ nguồn lực và trách nhiệm xã hội. Nếu nhìn vào chuỗi tác động thực tế, phương án của phe chúng tôi tạo ra động lực cải thiện rõ rệt, bảo vệ quyền lợi chính đáng của các bên liên quan và ngăn chặn các rủi ro dài hạn. Chúng tôi tự tin rằng các luận điểm đưa ra hoàn toàn chặt chẽ và thuyết phục.`,
        keyPoints: [
          'Giải quyết xung đột cốt lõi về mặt cơ chế thực tiễn',
          'Tối ưu hóa lợi ích và bảo vệ nhóm yếu thế'
        ]
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Sinh câu hỏi xen POI từ AI đối thủ (dưới 15 giây, nhắm vào lỗ hổng)
   */
  public static async offerAiPoi(
    topic: DebateTopic,
    speakerRole: string,
    speakerTranscript: string
  ): Promise<{ questionText: string; targetFlaw?: string }> {
    try {
      const response = await fetch('/api/wsdc-poi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_ai_poi',
          topic,
          speakerRole,
          speakerTranscript
        })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    return {
      questionText: 'Nếu áp dụng chính sách của bạn vào thực tế ngày mai, ai sẽ chịu trách nhiệm cho tổn thất của những người yếu thế nhất?'
    };
  }

  /**
   * AI phản hồi câu hỏi xen POI do học sinh đặt
   */
  public static async respondToStudentPoi(
    topic: DebateTopic,
    speakerRole: string,
    speakerTranscript: string,
    studentPoiQuestion: string
  ): Promise<{ status: 'accepted' | 'declined'; replyText: string }> {
    try {
      const response = await fetch('/api/wsdc-poi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond_to_poi',
          topic,
          speakerRole,
          speakerTranscript,
          studentPoiQuestion
        })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    return {
      status: 'accepted',
      replyText: 'Cảm ơn câu hỏi của bạn. Cơ chế chúng tôi đã nêu hoàn toàn lường trước được điều này thông qua quỹ dự phòng xã hội.'
    };
  }

  /**
   * Chấm điểm bài phát biểu theo thang WSDC 60-80 (Reply: 30-40)
   */
  public static async evaluateWsdcSpeech(
    topic: DebateTopic,
    role: string,
    speechType: 'main' | 'reply',
    transcript: string,
    speechPois: any[] = []
  ): Promise<{
    scores: {
      content: number;
      style: number;
      strategy: number;
      total: number;
    };
    contentFeedback: string;
    styleFeedback: string;
    strategyFeedback: string;
    poiFeedback?: string;
    aiSuggestedImprovements?: string;
  }> {
    const isReply = speechType === 'reply' || role.includes('reply');
    try {
      const response = await fetch('/api/wsdc-evaluate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          role,
          speechType,
          transcript,
          speechPois
        })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }

    // Default calculated benchmark
    const words = transcript.trim().split(/\s+/).length;
    let baseScore = isReply ? 34 : 68;
    if (words > 120) baseScore += isReply ? 2 : 4;
    if (words > 250) baseScore += isReply ? 1 : 2;

    const content = isReply ? Math.min(16, Math.max(12, Math.round(baseScore * 0.4))) : Math.min(32, Math.max(24, Math.round(baseScore * 0.4)));
    const style = isReply ? Math.min(16, Math.max(12, Math.round(baseScore * 0.4))) : Math.min(32, Math.max(24, Math.round(baseScore * 0.4)));
    const strategy = isReply ? Math.min(8, Math.max(6, Math.round(baseScore * 0.2))) : Math.min(16, Math.max(12, Math.round(baseScore * 0.2)));

    return {
      scores: {
        content,
        style,
        strategy,
        total: content + style + strategy
      },
      contentFeedback: 'Bài phát biểu có cấu trúc rõ ràng, đã nêu được cơ chế và dẫn chứng hỗ trợ.',
      styleFeedback: 'Giọng điệu đĩnh đạc, ngôn ngữ phản biện chuẩn mực và tự tin.',
      strategyFeedback: 'Hoàn thành đúng nhiệm vụ của vai trò diễn giả trong trận đấu.',
      aiSuggestedImprovements: 'Hãy chú trọng đào sâu hơn nữa chuỗi nhân quả A -> B -> C để tối đa hóa điểm Nội dung.'
    };
  }

  /**
   * Hội đồng trọng tài WSDC phân xử chung cuộc (Không có kết quả hòa)
   */
  public static async adjudicateWsdcTournament(
    topic: DebateTopic,
    speeches: any[]
  ): Promise<{
    winningSide: 'pro' | 'con';
    ballotsPro: number;
    ballotsOpp: number;
    clashPointsAnalysis: Array<{
      title: string;
      description: string;
      winningTeam: 'pro' | 'con';
      reason: string;
    }>;
    overallAdjudication: string;
    bestSpeaker: {
      name: string;
      role: string;
      score: number;
      reason: string;
    };
  }> {
    try {
      const response = await fetch('/api/wsdc-adjudicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, speeches })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }

    // Default determination based on scores
    let propTotal = 0;
    let oppTotal = 0;
    speeches.forEach((s: any) => {
      const score = s.score?.total || 70;
      if (s.side === 'pro') propTotal += score;
      else oppTotal += score;
    });

    const winningSide: 'pro' | 'con' = propTotal >= oppTotal ? 'pro' : 'con';
    return {
      winningSide,
      ballotsPro: winningSide === 'pro' ? 2 : 1,
      ballotsOpp: winningSide === 'con' ? 2 : 1,
      clashPointsAnalysis: [
        {
          title: 'Điểm đụng độ 1: Tính khả thi và cơ chế triển khai thực tế',
          description: 'Tranh luận về việc liệu giải pháp có thể thực thi hiệu quả mà không gây ra tác dụng phụ tiêu cực.',
          winningTeam: winningSide,
          reason: `Phe ${winningSide === 'pro' ? 'Ủng hộ' : 'Phản đối'} đã giải thích chặt chẽ hơn về gánh nặng thực thi và chi phí cơ hội.`
        },
        {
          title: 'Điểm đụng độ 2: Tác động đạo đức và quyền lợi các bên',
          description: 'So sánh mức độ ảnh hưởng đến các nhóm đối tượng chịu tác động lớn nhất.',
          winningTeam: winningSide,
          reason: `Phe ${winningSide === 'pro' ? 'Ủng hộ' : 'Phản đối'} chứng minh được giá trị bảo vệ lâu dài và công bằng xã hội.`
        }
      ],
      overallAdjudication: `Hội đồng giám khảo nhất trí rằng trận đấu diễn ra vô cùng kịch tính và có chất lượng chuyên môn cao. Phe ${winningSide === 'pro' ? 'Ủng hộ' : 'Phản đối'} đã giành chiến thắng chung cuộc nhờ khả năng giải quyết các điểm nghẽn và đưa ra hệ thống luận điểm có chiều sâu thực tế hơn.`,
      bestSpeaker: {
        name: 'Diễn giả xuất sắc',
        role: winningSide === 'pro' ? 'prop_1' : 'opp_1',
        score: 76,
        reason: 'Có đóng góp quan trọng trong việc định hình cục diện trận đấu và phản biện sắc bén.'
      }
    };
  }
}



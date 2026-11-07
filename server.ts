import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Quy chuẩn môi trường AI Studio: Dev server bắt buộc lắng nghe cổng 3000
// Tránh biến PORT=8080 của Cloud Run gây xung đột EADDRINUSE với Nginx reverse proxy
const PORT = process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : 3000;

app.use(express.json());

// API Phản biện Tranh biện với Gemini 3.8 Flash (Server-Side)
app.post('/api/debate', async (req, res) => {
  try {
    const { topic, studentSide, history, studentSpeech, persona } = req.body;

    if (!studentSpeech || !topic) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-api-key'];
    if (!apiKey) {
      console.error('[Debate API Error]: GEMINI_API_KEY chưa được cấu hình trên server');
      return res.status(503).json({ error: 'Đối thủ mất kết nối. Bấm Thử lại' });
    }

    console.log(`[Debate API] Nhận phát biểu của học sinh: "${studentSpeech.slice(0, 80)}..."`);

    const aiSide = studentSide === 'pro' ? 'Phản định (Opposition - Phản đối kiến nghị)' : 'Khẳng định (Proposition - Ủng hộ kiến nghị)';
    const historyText = Array.isArray(history)
      ? history.slice(-4).map((m: any) => `${m.sender === 'student' ? 'Học sinh' : 'AI'}: ${m.content}`).join('\n')
      : '';

    const personaDescriptions: Record<string, string> = {
      wsdc_grandmaster: 'Đại kiện tướng WSDC: Lập luận chuẩn mực quốc tế, đánh thẳng vào cơ chế và tính khả thi, phân tích so sánh chi phí cơ hội, điềm tĩnh và sắc bén.',
      fallacy_hunter: 'Thợ săn ngụy biện: Chuyên bóc trần những tiền đề vô lý, suy diễn vội vàng, ngụy biện nhị nguyên hoặc đánh tráo khái niệm trong câu nói của đối thủ.',
      strict_prosecutor: 'Công tố viên nghiêm khắc: Giọng điệu đanh thép, đòi hỏi số liệu thực chứng, chất vấn trách nhiệm và hậu quả thực tế.'
    };

    const personaGuide = personaDescriptions[persona] || personaDescriptions.wsdc_grandmaster;

    const prompt = `
Bạn là 2 nhân vật trong trận tranh biện học đường THPT theo thể thức WSDC (World Schools Debating Championship).
ĐƯỢC HUẤN LUYỆN DỰA TRÊN 2 KHUNG CỐT LÕI:
1. Mô hình xây dựng luận điểm PEEL:
   + P – Point (Luận điểm cốt lõi): Nêu thông điệp và vị thế rõ ràng.
   + E – Explanation (Giải thích sâu với cơ chế nhân quả A -> B -> C): Mổ xẻ chuỗi tác động từng bước một (A dẫn đến B, B tác động ra sao để sinh ra C), không chấp nhận tuyên bố suông.
   + E – Evidence (Dẫn chứng thực tế / Số liệu kiểm chứng): Dẫn chứng cụ thể, có nguồn rõ ràng.
   + L – Link (Liên kết về kiến nghị): Khẳng định lại tác động và giải quyết vấn đề của kiến nghị.
2. Kỹ thuật phản biện 4 bước (Signal - State - Support - Summarize):
   + Bước 1: Trích dẫn luận điểm đối phương (Signal).
   + Bước 2: Nêu vị thế phản bác (State).
   + Bước 3: Đưa cơ chế hoặc dẫn chứng phản bác (Support: De-link / Mitigate / Turn).
   + Bước 4: Tóm lược và liên kết trở lại (Summarize).

THÔNG TIN TRẬN ĐẤU:
- Chủ đề kiến nghị: "${topic.motion}"
- Lĩnh vực: ${topic.category || 'Xã hội'} | Loại kiến nghị: ${topic.motionTypeLabel || 'Kiến nghị'}
- Bối cảnh chủ đề: "${topic.background || ''}"

VỊ THẾ:
- Học sinh thuộc phe: ${studentSide === 'pro' ? 'Khẳng định (Proposition - Ủng hộ kiến nghị)' : 'Phản định (Opposition - Phản đối kiến nghị)'}
- AI Opponent thuộc phe: ${aiSide}
- Phong cách của AI Opponent: ${personaGuide}

LỊCH SỬ CÁC LƯỢT NÓI GẦN NHẤT:
${historyText || '(Đây là lượt mở đầu trận đấu)'}

LƯỢT NÓI MỚI NHẤT CỦA HỌC SINH:
"${studentSpeech}"

==================================================
YÊU CẦU BẮT BUỘC TUÂN THỦ:
1. ĐỐI VỚI AI OPPONENT (ĐỐI THỦ PHẢN BIỆN):
   - BẮT BUỘC TRÍCH DẪN LẠI Ý CỦA HỌC SINH: Câu mở đầu của bạn BẮT BUỘC phải trích dẫn lại trực tiếp ít nhất một ý hoặc nguyên văn cụm từ mà học sinh vừa phát biểu (Ví dụ: "Bạn vừa cho rằng: '...' ", hoặc "Đối với luận điểm '...' mà bạn vừa đưa ra, tuy nhiên...").
   - Sau đó mới phản bác trực diện bằng cơ chế nhân quả (A -> B -> C) hoặc chiến thuật De-link / Turn.
   - Kết thúc bằng một câu chất vấn đanh thép đặt ngược lại cho học sinh ở lượt sau.
   - Độ dài: Khoảng 3-4 câu chặt chẽ, văn phong học sinh THPT thông minh, quyết liệt nhưng lịch thiệp.

2. ĐỐI VỚI AI MENTOR (GIÁM KHẢO ĐÁNH GIÁ DỰA TRÊN PEEL VÀ PHẢN BIỆN 4 BƯỚC):
   - Đánh giá thẳng vào câu nói của học sinh:
     * Nếu nói suông, thiếu cơ chế nhân quả A -> B -> C hoặc mắc lỗi ngụy biện: type = 'warning', studentHpDeduction = 20, aiHpDeduction = 0.
     * Nếu có cơ chế rõ ràng theo PEEL, lập luận sắc bén: type = 'praise', studentHpDeduction = 0, aiHpDeduction = 15 đến 25.
   - logicScore: 0 đến 100 điểm.
   - persuasionScore: 0 đến 100 điểm.
   - advice: Mẹo chiến thuật cho lượt sau.

3. ĐIỂM CÔNG TÂM (CONCESSION & FAIR-MINDEDNESS):
   - Nếu học sinh biết thừa nhận hoặc ghi nhận thiện chí đúng một ý hợp lý của đối thủ trước khi phản bác (ví dụ: "Tôi thừa nhận rằng phe bạn có lý ở điểm...", "Dù lập luận của phe bạn rất xác đáng về..., tuy nhiên..."):
     * concessionGranted = true
     * concessionNote = "Khen ngợi học sinh đã lắng nghe và ghi nhận công tâm ý kiến hợp lý của đối thủ."
     * Tăng thêm aiHpDeduction 5 điểm vì sự thấu cảm và lập luận thuyết phục.
   - Ngược lại: concessionGranted = false.
`;

    const ai = new GoogleGenAI({ apiKey: String(apiKey) });
    const debateSchema = {
      type: Type.OBJECT,
      properties: {
        aiDebaterReply: { 
          type: Type.STRING, 
          description: 'Lời phản biện của AI Opponent. BẮT BUỘC trích dẫn lại ít nhất một ý hoặc câu của học sinh rồi mới đưa ra phản bác sắc bén bằng cơ chế nhân quả và câu chất vấn chốt lại.' 
        },
        studentHpDeduction: { type: Type.INTEGER, description: '20 nếu học sinh mắc ngụy biện hoặc nói suông, 0 nếu lập luận tốt' },
        aiHpDeduction: { type: Type.INTEGER, description: '15 đến 25 nếu học sinh lập luận sắc bén, 0 nếu học sinh yếu' },
        concessionGranted: { type: Type.BOOLEAN, description: 'True nếu học sinh thừa nhận đúng một ý hợp lý của đối thủ trước khi phản bác' },
        concessionNote: { type: Type.STRING, description: 'Lời nhận xét ngắn về tinh thần công tâm nếu có' },
        mentorEvaluation: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['warning', 'praise', 'neutral'] },
            text: { type: Type.STRING, description: 'Nhận xét chuyên môn của Thầy Giám Khảo' },
            advice: { type: Type.STRING, description: 'Mẹo chiến thuật cho lượt sau' },
            detectedFallacyName: { type: Type.STRING, description: 'Tên lỗi ngụy biện nếu có' },
            logicScore: { type: Type.INTEGER, description: 'Điểm độ chặt chẽ của lý lẽ (0-100)' },
            persuasionScore: { type: Type.INTEGER, description: 'Điểm sức thuyết phục của lời nói (0-100)' }
          },
          required: ['type', 'text', 'advice', 'logicScore', 'persuasionScore']
        }
      },
      required: ['aiDebaterReply', 'studentHpDeduction', 'aiHpDeduction', 'mentorEvaluation']
    };

    const callDebateWithTimeout = (model: string, timeoutMs: number) => {
      const call = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: debateSchema,
          maxOutputTokens: 2048,
          temperature: 0.3
        }
      });
      const timer = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout ${timeoutMs}ms on ${model}`)), timeoutMs)
      );
      return Promise.race([call, timer]);
    };

    const candidateModels = [
      { name: 'gemini-3.8-flash', timeout: 6000 },
      { name: 'gemini-3.5-flash', timeout: 12000 },
      { name: 'gemini-3.1-flash-lite', timeout: 10000 }
    ];

    let response: any;
    let lastError: any;
    for (const { name: model, timeout } of candidateModels) {
      try {
        response = await callDebateWithTimeout(model, timeout);
        if (response?.text) {
          console.log(`[Debate API] Thành công với model ${model}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.error(`[Debate API Error on model ${model}]:`, err?.message || err);
      }
    }

    if (!response?.text) {
      console.error('[Debate API Final Error]: Tất cả candidate models đều thất bại.', lastError);
      return res.status(503).json({ error: 'Đối thủ mất kết nối. Bấm Thử lại' });
    }

    const responseText = response.text?.trim() || '';
    const cleaned = responseText.replace(/^```json\s*|\s*```$/g, '').trim();
    const result = JSON.parse(cleaned);

    // Đảm bảo câu trả lời của đối thủ trích lại ý học sinh
    let aiDebaterReply = String(result.aiDebaterReply || '').trim();
    const hasQuote = aiDebaterReply.includes('"') || 
                     aiDebaterReply.includes('“') || 
                     aiDebaterReply.toLowerCase().includes('bạn vừa') || 
                     aiDebaterReply.toLowerCase().includes('bạn cho rằng') || 
                     aiDebaterReply.toLowerCase().includes('bạn nói rằng');

    if (!hasQuote) {
      const quotePart = studentSpeech.length > 60 ? studentSpeech.slice(0, 57) + '...' : studentSpeech;
      aiDebaterReply = `Bạn vừa cho rằng: "${quotePart}", tuy nhiên quan điểm này chưa thực sự thuyết phục. ${aiDebaterReply}`;
    }

    const payload = {
      aiDebaterReply,
      studentHpDeduction: Number(result.studentHpDeduction) || 0,
      aiHpDeduction: Number(result.aiHpDeduction) || 0,
      concessionGranted: Boolean(result.concessionGranted),
      concessionNote: result.concessionNote || undefined,
      mentorEvaluation: {
        type: result.mentorEvaluation?.type || 'neutral',
        text: result.mentorEvaluation?.text || 'Hãy tiếp tục đào sâu cơ chế nhân quả cho luận điểm của bạn.',
        advice: result.mentorEvaluation?.advice || 'Tập trung vào mô hình PEEL và cơ chế nhân quả A -> B -> C để tăng tính thuyết phục.',
        detectedFallacyName: result.mentorEvaluation?.detectedFallacyName || undefined,
        logicScore: Math.max(0, Math.min(100, Number(result.mentorEvaluation?.logicScore) || 75)),
        persuasionScore: Math.max(0, Math.min(100, Number(result.mentorEvaluation?.persuasionScore) || 70))
      }
    };

    return res.json(payload);
  } catch (err: any) {
    console.error('[Debate API Final Catch Error]:', err);
    return res.status(503).json({ error: 'Đối thủ mất kết nối. Bấm Thử lại' });
  }
});

// API Thẩm định bài tập "Dựng Người Thép" (Steelman Argument) trước trận đấu
app.post('/api/evaluate-steelman', async (req, res) => {
  const startTime = Date.now();
  try {
    const { topic, studentSide, steelmanText } = req.body;
    if (!topic || !steelmanText || typeof steelmanText !== 'string' || !steelmanText.trim()) {
      return res.status(400).json({ error: 'Thiếu thông tin chủ đề hoặc bài viết người thép' });
    }

    const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-api-key'];
    if (!apiKey) {
      console.error('[Steelman API Error]: GEMINI_API_KEY chưa được cấu hình trên server');
      return res.status(503).json({ error: 'GEMINI_API_KEY chưa được cấu hình. Bấm Thử lại' });
    }

    const opposingSideLabel = studentSide === 'pro' 
      ? 'Phe Phản định (Opposition - Phản đối kiến nghị)' 
      : 'Phe Khẳng định (Proposition - Ủng hộ kiến nghị)';

    const prompt = `
Bạn là Trọng tài Tranh biện WSDC chuyên nghiệp và Chuyên gia về Tinh thần Công tâm (Steelman Principle).
Học sinh sắp bước vào trận tranh biện về kiến nghị: "${topic.motion}".
Bối cảnh kiến nghị: "${topic.background || ''}".
Vị thế học sinh sẽ thi đấu: ${studentSide === 'pro' ? 'Khẳng định (Ủng hộ kiến nghị)' : 'Phản định (Phản đối kiến nghị)'}.

BÀI TẬP BẮT BUỘC TRƯỚC TRẬN: "DỰNG NGƯỜI THÉP" (STEELMAN ARGUMENT).
Thay vì tạo ra "người rơm" dễ dãi để công kích, học sinh phải nhập vai ${opposingSideLabel} và viết ra LUẬN ĐIỂM MẠNH NHẤT, CÔNG BẰNG NHẤT, THUYẾT PHỤC NHẤT của phe đối lập trong 3–5 câu.

BÀI VIẾT CỦA HỌC SINH:
"""${steelmanText.trim()}"""

HÃY THẨM ĐỊNH VÀ CHẤM ĐIỂM TRÊN THANG 0 ĐẾN 10:
- Tiêu chí 1: Tính công bằng và thiện chí (Fairness): Liệu phe đối lập khi nghe xong có gật đầu thừa nhận: "Đúng, đây là cách diễn giải công tâm, tôn trọng những giá trị cốt lõi nhất mà chúng tôi bảo vệ"?
- Tiêu chí 2: Độ sâu của cơ chế (Depth & Mechanism): Có nêu được lý do xác đáng, cơ chế nhân quả hoặc nỗi lo ngại thực tế mà phe đối lập hướng tới hay không?

QUY TẮC ĐIỂM SỐ:
- 8-10 điểm: Xuất sắc! Thấu cảm sâu sắc, lý lẽ mạnh mẽ, hoàn toàn công bằng và khách quan.
- 6-7 điểm: Đạt yêu cầu. Nêu được lập trường hợp lý của phe kia, đủ điều kiện vào trận.
- 1-5 điểm: Chưa đạt. Còn sơ sài, hời hợt, hoặc vẫn có ý chế giễu/bóp méo (vẫn là người rơm).
- 0 điểm: Vô nghĩa, gõ phím ngẫu nhiên hoặc lạc đề.

ĐIỀU KIỆN VÀO TRẬN: isPassed = true NẾU VÀ CHỈ NẾU score >= 6.
`;

    const ai = new GoogleGenAI({
      apiKey: String(apiKey),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const callSteelmanWithTimeout = (model: string, timeoutMs: number) => {
      const call = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: 'Điểm số từ 0 đến 10' },
              isPassed: { type: Type.BOOLEAN, description: 'True nếu score >= 6' },
              fairnessAppraisal: { type: Type.STRING, description: 'Phe đối lập có thấy đây là cách nói công bằng và thiện chí không?' },
              feedback: { type: Type.STRING, description: '2-3 câu nhận xét đánh giá thiện chí và chiều sâu tư duy' },
              suggestedImprovement: { type: Type.STRING, description: 'Gợi ý nâng cấp nếu chưa đạt hoặc cần mài giũa thêm' }
            },
            required: ['score', 'isPassed', 'fairnessAppraisal', 'feedback']
          },
          maxOutputTokens: 1024
        }
      });

      const timer = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout on ${model} after ${timeoutMs}ms`)), timeoutMs)
      );

      return Promise.race([call, timer]);
    };

    const candidateModels = [
      { name: 'gemini-3.8-flash', timeout: 5000 },
      { name: 'gemini-3.5-flash', timeout: 6000 },
      { name: 'gemini-3.1-flash-lite', timeout: 6000 }
    ];

    let response: any;
    let lastError: any;
    let successfulModel = '';

    for (const { name: model, timeout } of candidateModels) {
      const modelStart = Date.now();
      try {
        response = await callSteelmanWithTimeout(model, timeout);
        if (response?.text) {
          successfulModel = model;
          console.log(`[Steelman API] Thành công với model ${model} trong ${Date.now() - modelStart}ms`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Steelman API] Model ${model} thất bại sau ${Date.now() - modelStart}ms:`, err?.message || err);
      }
    }

    if (!response?.text) {
      console.error(`[Steelman API Error]: Tất cả candidate models đều thất bại trong ${Date.now() - startTime}ms.`, lastError?.message || lastError);
      return res.status(503).json({ error: 'Chưa thể thẩm định bài Dựng Người Thép. Bấm Thử lại' });
    }

    const responseText = response.text?.trim() || '';
    const cleaned = responseText.replace(/^```json\s*|\s*```$/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const score = Math.max(0, Math.min(10, Math.round(Number(parsed.score) || 0)));

    console.log(`[Steelman API Result] Model: ${successfulModel}, Score: ${score}/10, Passed: ${score >= 6}, Total: ${Date.now() - startTime}ms`);

    return res.json({
      score,
      isPassed: score >= 6,
      fairnessAppraisal: parsed.fairnessAppraisal || 'Phe đối lập thấy bạn đã có thiện chí diễn giải góc nhìn của họ.',
      feedback: parsed.feedback || 'Nhận xét từ Ban Giám khảo.',
      suggestedImprovement: parsed.suggestedImprovement || undefined
    });
  } catch (err: any) {
    console.error(`[Steelman API Final Catch Error] sau ${Date.now() - startTime}ms:`, err?.message || err);
    return res.status(503).json({ error: 'Chưa thể thẩm định bài Dựng Người Thép. Bấm Thử lại' });
  }
});

// API Chấm điểm "Vạch Lá Tìm Sâu" với Gemini 3.8 Flash (Server-Side Structured Output)
app.post('/api/evaluate-fallacy', async (req, res) => {
  try {
    const { scenario, selectedFallacyId, rebuttalText, targetFallacy, chosenFallacy, flawHighlightMatched } = req.body;

    if (!scenario || !rebuttalText || !selectedFallacyId) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc để chấm điểm' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY chưa được cấu hình trên server' });
    }

    const isTargetValid = scenario.hiddenFallacyId === 'no_fallacy' || scenario.hiddenFallacyId === 'valid_argument';
    const isChosenValid = selectedFallacyId === 'no_fallacy' || selectedFallacyId === 'valid_argument';

    const targetFallacyName = isTargetValid 
      ? 'Không có lỗi, lập luận hợp lý' 
      : (targetFallacy?.vietnameseName || scenario.hiddenFallacyId);
    const targetFallacyEnglish = isTargetValid 
      ? 'Valid Argument (No Fallacy)' 
      : (targetFallacy?.name || scenario.hiddenFallacyId);

    const chosenFallacyName = isChosenValid 
      ? 'Không có lỗi, lập luận hợp lý' 
      : (chosenFallacy?.vietnameseName || selectedFallacyId);
    const chosenFallacyEnglish = isChosenValid 
      ? 'Valid Argument (No Fallacy)' 
      : (chosenFallacy?.name || selectedFallacyId);

    const prompt = `
Bạn là AI Mentor chuyên gia logic học và tư duy phản biện.
Nhiệm vụ của bạn là thẩm định và chấm điểm bài tập "Vạch Lá Tìm Sâu" của học sinh THPT dựa theo tiêu chí của web (Nhận diện lỗi 30đ, Cơ chế bẻ lại/Phân tích lập luận 40đ, Sức thuyết phục 30đ).

THÔNG TIN TÌNH HUỐNG:
- Tên chủ đề: "${scenario.topicTitle || ''}"
- Người phát biểu: ${scenario.speaker?.name || 'Nhân vật'} (${scenario.speaker?.role || 'Học đường'})
- Bối cảnh: "${scenario.context || ''}"
- Phát biểu: "${scenario.statement || ''}"
- Cụm từ chứa lỗi (flawText): "${scenario.flawText || '(Không có lỗi - lập luận hợp lý)'}"
- Phân loại chính xác: "${targetFallacyName}" (${targetFallacyEnglish}, ID: ${scenario.hiddenFallacyId})
${scenario.secondaryFallacyId ? `- Lỗi phụ hợp lệ được chấp nhận: ID "${scenario.secondaryFallacyId}"` : ''}
- Giải thích bản chất: "${scenario.explanation || ''}"
- Bài mẫu tham khảo: "${scenario.sampleRebuttal || ''}"

BÀI LÀM CỦA HỌC SINH:
- Phân loại học sinh đã chọn: "${chosenFallacyName}" (${chosenFallacyEnglish})
- Đoạn phân tích / bẻ lại học sinh tự viết:
"""${rebuttalText}"""

==================================================
QUY TẮC CHẤM ĐIỂM NGHIÊM NGẶT (THEO TIÊU CHÍ CỦA WEB):
1. KIỂM TRA TÍNH HỢP LỆ VÀ LIÊN QUAN (isRelevant):
   - isRelevant = false NẾU VÀ CHỈ NẾU:
     * Bài viết vô nghĩa, gõ phím ngẫu nhiên, spam từ ngữ không liên quan (ví dụ: "con mèo ăn cá trời hôm nay đẹp quá trà sữa xe buýt", "asdfghjkl", v.v.).
     * Hoặc bài viết hoàn toàn lạc đề, không hề nhắc đến hay bàn luận gì về phát biểu trong tình huống.
   - NẾU isRelevant = false:
     * BẮT BUỘC: scores.identification = 0
     * BẮT BUỘC: scores.reasoning <= 5 (tối đa 5 điểm)
     * BẮT BUỘC: scores.persuasion <= 5 (tối đa 5 điểm)
     * TỔNG ĐIỂM TỐI ĐA KHÔNG ĐƯỢC VƯỢT QUÁ 10 ĐIỂM.
     * TUYỆT ĐỐI KHÔNG KHEN NGỢI! Feedback phải nói thẳng câu viết vô nghĩa/lạc đề và nhắc nhở nghiêm túc.
     * weakestQuote: Trích nguyên văn đoạn vô nghĩa hoặc toàn bộ câu của học sinh.

2. KIỂM TRA NHẬN DIỆN LỖI (fallacyCorrect & scores.identification):
   - NẾU TÌNH HUỐNG CÓ LỖI:
     * fallacyCorrect = true nếu học sinh chọn đúng lỗi chính "${targetFallacyName}" (ID: ${scenario.hiddenFallacyId}) HOẶC chọn đúng lỗi phụ "${scenario.secondaryFallacyId || ''}". Nếu chọn sai hoặc chọn "Không có lỗi", bắt buộc false.
   - NẾU TÌNH HUỐNG LÀ LẬP LUẬN HỢP LÝ (hiddenFallacyId = 'no_fallacy'):
     * fallacyCorrect = true nếu học sinh chọn đúng "Không có lỗi, lập luận hợp lý". Nếu học sinh cố tình gán ghép một lỗi ngụy biện nào đó, bắt buộc false.
   - scores.identification (0 đến 30 điểm):
     * Nếu chọn sai loại lỗi (fallacyCorrect = false): BẮT BUỘC = 0 ĐIỂM.
     * Nếu chọn đúng loại lỗi VÀ isRelevant = true: Cho 25 đến 30 điểm.

3. ĐÁNH GIÁ TÍNH LOGIC VÀ CƠ CHẾ PHÂN TÍCH (scores.reasoning: 0 đến 40 điểm):
   - Nếu tình huống có lỗi: Học sinh chỉ ra chính xác mắt xích sai lầm hoặc đứt gãy nhân quả, trích dẫn đúng cụm từ chứa lỗi, giải thích cơ chế vì sao phát biểu đó sai (30-40đ).
   - Nếu tình huống là lập luận hợp lý: Học sinh giải thích rõ vì sao phát biểu này hợp lý, có căn cứ khoa học/thực tế hoặc không phạm các bẫy ngụy biện (30-40đ).
   - 15-29 điểm: Nhận ra được điểm chính nhưng lập luận còn sơ sài, thiếu ví dụ hoặc cơ chế chi tiết.
   - 1-14 điểm: Chỉ nêu khẳng định suông, lập luận yếu ớt.
   - 0 điểm: Hoàn toàn sai hoặc vô nghĩa.

4. ĐÁNH GIÁ SỨC THUYẾT PHỤC VÀ VĂN PHONG (scores.persuasion: 0 đến 30 điểm):
   - 25-30 điểm: Lời lẽ đanh thép, lịch thiệp, thuyết phục, văn phong phản biện sắc sảo.
   - 10-24 điểm: Diễn đạt hiểu được nhưng chưa sắc bén, câu từ hơi vụng về.
   - 0-9 điểm: Công kích cá nhân ngược lại, vô nghĩa, hoặc câu từ cẩu thả.

5. PHẢN HỒI (feedback) & PHIÊN BẢN HOÀN THIỆN (improvedVersion):
   - feedback: Viết 2-3 câu tiếng Việt tự nhiên, trực diện, nói thẳng điểm yếu trong tư duy của học sinh.
     * KHÔNG khen sáo rỗng.
     * CHỈ ĐƯỢC dùng từ "Xuất sắc" khi tổng điểm từ 85 điểm trở lên!
   - weakestQuote: Trích nguyên văn câu hoặc đoạn yếu nhất trong bài học sinh.
   - improvedVersion: Cung cấp phiên bản bẻ lại / bảo vệ lập luận tham khảo gãy gọn, sắc bén theo kỹ thuật phản biện 4 bước.
`;

    const ai = new GoogleGenAI({ apiKey: String(apiKey) });
    const contentConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isRelevant: { type: Type.BOOLEAN, description: 'True nếu bài bẻ lại có nghĩa và liên quan đến chủ đề; False nếu vô nghĩa, spam hoặc lạc đề' },
          fallacyCorrect: { type: Type.BOOLEAN, description: 'True nếu học sinh chọn đúng loại lỗi ngụy biện' },
          scores: {
            type: Type.OBJECT,
            properties: {
              identification: { type: Type.INTEGER, description: '0-30 điểm. Bắt buộc bằng 0 nếu fallacyCorrect = false hoặc isRelevant = false' },
              reasoning: { type: Type.INTEGER, description: '0-40 điểm. Bắt buộc <= 5 nếu isRelevant = false' },
              persuasion: { type: Type.INTEGER, description: '0-30 điểm. Bắt buộc <= 5 nếu isRelevant = false' }
            },
            required: ['identification', 'reasoning', 'persuasion']
          },
          weakestQuote: { type: Type.STRING, description: 'Trích nguyên văn câu hoặc đoạn yếu nhất trong bài học sinh' },
          feedback: { type: Type.STRING, description: '2-3 câu nhận xét tiếng Việt trung thực, nói thẳng điểm yếu. Chỉ khen Xuất sắc khi tổng điểm >= 85' },
          improvedVersion: { type: Type.STRING, description: 'Câu bẻ lại tham khảo gãy gọn, sắc bén theo kỹ thuật phản biện 4 bước' }
        },
        required: ['isRelevant', 'fallacyCorrect', 'scores', 'weakestQuote', 'feedback', 'improvedVersion']
      },
      maxOutputTokens: 2048,
      temperature: 0.1
    };

    const callWithTimeout = (model: string, timeoutMs: number) => {
      const call = ai.models.generateContent({
        model,
        contents: prompt,
        config: contentConfig
      });
      const timer = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout on ${model}`)), timeoutMs)
      );
      return Promise.race([call, timer]);
    };

    const candidateModels = [
      { name: 'gemini-3.8-flash', timeout: 3500 },
      { name: 'gemini-3.5-flash', timeout: 6000 },
      { name: 'gemini-3.1-flash-lite', timeout: 7000 }
    ];

    let response: any;
    let lastError: any;
    for (const { name: model, timeout } of candidateModels) {
      try {
        response = await callWithTimeout(model, timeout);
        if (response?.text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next:`, err?.message || err);
      }
    }
    if (!response?.text) {
      throw lastError || new Error('Không nhận được phản hồi từ AI');
    }

    const responseText = response.text?.trim() || '';
    const cleaned = responseText.replace(/^```json\s*|\s*```$/g, '').trim();
    const result = JSON.parse(cleaned);

    // Chuẩn hóa và áp dụng chặt chẽ quy tắc điểm số & XP ở phía Server
    const isRelevant = Boolean(result.isRelevant);
    const fallacyCorrect = Boolean(result.fallacyCorrect);

    let identification = Math.max(0, Math.min(30, Number(result.scores?.identification) || 0));
    let reasoning = Math.max(0, Math.min(40, Number(result.scores?.reasoning) || 0));
    let persuasion = Math.max(0, Math.min(30, Number(result.scores?.persuasion) || 0));

    if (!fallacyCorrect || !isRelevant) {
      identification = 0;
    }

    if (!isRelevant) {
      reasoning = Math.min(5, reasoning);
      persuasion = Math.min(5, persuasion);
    }

    let totalScore = identification + reasoning + persuasion;
    if (!isRelevant) {
      totalScore = Math.min(10, totalScore);
    }

    // Quy tắc XP: Bài vô nghĩa hoặc lạc đề thì không cộng XP (xpEarned = 0)
    let xpEarned = 0;
    const isFlawMatched = Boolean(flawHighlightMatched);
    const precisionBonus = isFlawMatched && isRelevant ? 20 : 0;

    if (isRelevant) {
      if (totalScore >= 85) {
        xpEarned = Math.round(110 + (totalScore - 85) * 2) + precisionBonus;
      } else if (totalScore >= 60) {
        xpEarned = Math.round(60 + (totalScore - 60) * 1.5) + precisionBonus;
      } else {
        xpEarned = Math.round(20 + totalScore * 0.5) + precisionBonus;
      }
    }

    // Bảo đảm feedback không chứa từ "Xuất sắc" nếu điểm < 85
    let feedback = String(result.feedback || '');
    if (!isRelevant) {
      feedback = 'Bài viết không hợp lệ hoặc chứa nội dung vô nghĩa, không liên quan đến tình huống. Bạn hãy đọc kỹ bối cảnh và trình bày lập luận nghiêm túc.';
    } else if (totalScore < 85 && (feedback.includes('Xuất sắc') || feedback.includes('xuất sắc'))) {
      feedback = feedback.replace(/xuất sắc/gi, 'khá tốt');
    }

    const payload = {
      isRelevant,
      fallacyCorrect,
      isFallacyCorrect: fallacyCorrect,
      precisionBonus,
      flawHighlightMatched: isFlawMatched,
      scores: {
        identification,
        reasoning,
        persuasion
      },
      fallacyAccuracyScore: identification,
      logicScore: reasoning,
      persuasionScore: persuasion,
      totalScore,
      xpEarned,
      weakestQuote: result.weakestQuote || '',
      feedback,
      mentorFeedback: feedback,
      improvedVersion: result.improvedVersion || scenario.sampleRebuttal,
      improvedRebuttalSuggestion: result.improvedVersion || scenario.sampleRebuttal,
      strengths: isRelevant && totalScore >= 60 ? ['Lập luận có cố gắng tiếp cận trọng tâm tình huống.'] : [],
      weaknesses: !isRelevant ? ['Nội dung vô nghĩa, ngẫu nhiên hoặc lạc đề hoàn toàn.'] : (totalScore < 85 ? ['Cần bổ sung cơ chế nhân quả chi tiết và bằng chứng thực tế.'] : [])
    };

    return res.json(payload);
  } catch (err: any) {
    console.warn('Evaluate Fallacy API Error:', err?.message || err);
    return res.status(503).json({ error: 'Chưa chấm được. Bấm Thử lại' });
  }
});

// API Câu hỏi gợi ý Socrates với Gemini 3.8 Flash (Server-Side)
app.post('/api/socratic', async (req, res) => {
  try {
    const { topic, studentSide, opponentSpeech, studentThought } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY chưa được cấu hình trên server' });
    }

    const prompt = `
Bạn là Nhà triết học Socrates - Người thầy dẫn dắt tư duy phản biện cho học sinh THPT.
Chủ đề tranh biện: "${topic?.motion || ''}"
Vị thế học sinh: ${studentSide === 'pro' ? 'Khẳng định (Ủng hộ)' : 'Phản định (Phản đối)'}
Lượt nói của đối thủ: "${opponentSpeech || ''}"
${studentThought ? `Ý nghĩ sơ khởi của học sinh: "${studentThought}"` : ''}

Nhiệm vụ: Hãy đặt đúng 4 câu hỏi Socrates sâu sắc theo 4 góc nhìn:
1. premise: Hỏi về ngầm định đối thủ tự cho là đúng
2. mechanism: Hỏi về cơ chế nhân quả thực tế diễn ra như thế nào
3. stakeholder: Hỏi xem ai là người chịu thiệt thòi nhiều nhất trong thực tế
4. alternative: Hỏi xem có cách giải quyết nào khôn khéo hơn cách của đối thủ

Mỗi câu hỏi gồm:
- id: "soc_1", "soc_2", "soc_3", "soc_4"
- category: "premise" | "mechanism" | "stakeholder" | "alternative"
- categoryTitle: Tiêu đề thuần Việt ngắn gọn (VD: "1. Lật ngược điều đối thủ tự cho là đúng")
- badge: Nhãn tóm tắt ngắn (VD: "Họ tự mặc định", "Làm thật ra sao?", "Người chịu thiệt", "Giải pháp hay hơn")
- question: Câu hỏi gợi mở kích thích học sinh tự suy nghĩ
- subQuestions: 2 câu hỏi nhỏ cụ thể gợi mở liên tưởng
- insightHint: Gợi ý suy nghĩ ngắn từ thầy
- sentenceStarter: Mẫu câu mở đầu tự nhiên để học sinh tự điền ý mình vào

Trả về định dạng JSON mảng gồm 4 phần tử.
`;

    const ai = new GoogleGenAI({ apiKey: String(apiKey) });
    const callSocraticWithTimeout = (model: string, timeoutMs: number) => {
      const call = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });
      const timer = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout on ${model}`)), timeoutMs)
      );
      return Promise.race([call, timer]);
    };

    const candidateModels = [
      { name: 'gemini-3.8-flash', timeout: 3500 },
      { name: 'gemini-3.5-flash', timeout: 6000 },
      { name: 'gemini-3.1-flash-lite', timeout: 7000 }
    ];

    let response: any;
    let lastError: any;
    for (const { name: model, timeout } of candidateModels) {
      try {
        response = await callSocraticWithTimeout(model, timeout);
        if (response?.text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Socratic model ${model} failed, trying next:`, err?.message || err);
      }
    }
    if (!response?.text) {
      throw lastError || new Error('Không nhận được phản hồi từ AI');
    }

    const responseText = response.text?.trim() || '';
    const cleaned = responseText.replace(/^```json\s*|\s*```$/g, '').trim();
    const result = JSON.parse(cleaned);

    return res.json(result);
  } catch (err: any) {
    console.error('Socratic API Error:', err);
    return res.status(500).json({ error: err.message || 'Lỗi sinh câu hỏi Socrates' });
  }
});

// ==========================================
// CÁC ENDPOINT THI ĐẤU WSDC CHUẨN QUỐC TẾ (SERVER-SIDE GEMINI)
// ==========================================

// 1. Sinh bài phát biểu cho diễn giả AI theo đúng thể thức và vai trò WSDC
app.post('/api/wsdc-speech', async (req, res) => {
  try {
    const { topic, role, speechesHistory, activePois } = req.body;
    if (!topic || !role) {
      return res.status(400).json({ error: 'Thiếu thông tin chủ đề hoặc vai trò diễn giả' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY chưa được cấu hình trên server' });
    }

    const roleGuides: Record<string, string> = {
      prop_1: 'Diễn giả 1 Phe Ủng hộ (Prop 1): Mở đầu trận đấu. Nêu bối cảnh, định nghĩa các khái niệm mấu chốt, lập trường của phe Ủng hộ, và trình bày 2 luận điểm nền tảng đầu tiên có cơ chế nhân quả PEEL sâu sắc.',
      opp_1: 'Diễn giả 1 Phe Phản đối (Opp 1): Bác bỏ trực diện định nghĩa hoặc cơ sở của Prop 1. Khẳng định lập trường phản đối, đưa ra 2 luận điểm phản bác cốt lõi kèm cơ chế tác hại hoặc chi phí cơ hội.',
      prop_2: 'Diễn giả 2 Phe Ủng hộ (Prop 2): Tái thiết luận điểm của Prop 1 trước đòn tấn công của Opp 1. Phản bác các luận điểm của Opp 1, và mở rộng thêm 1 luận điểm mới sâu sắc về mặt giá trị/thực tiễn.',
      opp_2: 'Diễn giả 2 Phe Phản đối (Opp 2): Bảo vệ luận điểm của Opp 1. Tấn công luận điểm mới của Prop 2, mở rộng luận điểm thứ 3 của phe Phản đối và chỉ ra mâu thuẫn trong lập luận của phe Ủng hộ.',
      prop_3: 'Diễn giả 3 Phe Ủng hộ (Prop 3): Bài phản biện tổng lực. KHÔNG ĐƯA LUẬN ĐIỂM HOÀN TOÀN MỚI. Gom toàn bộ trận đấu vào 2-3 điểm đụng độ then chốt (Clash points), bẻ gãy hệ thống của phe Phản đối và chứng minh vì sao phe Ủng hộ thắng thế.',
      opp_3: 'Diễn giả 3 Phe Phản đối (Opp 3): Bài phản biện tổng lực chốt hạ. KHÔNG ĐƯA LUẬN ĐIỂM MỚI. Gom các điểm nghẽn của trận đấu, đào sâu vào các rủi ro không thể đảo ngược của đề xuất phe Ủng hộ.',
      opp_reply: 'Bài kết luận Phe Phản đối (Opp Reply - 4 phút, nói TRƯỚC): Do Diễn giả 1 hoặc 2 nói. KHÔNG CÓ POI, KHÔNG ĐƯỢC ĐƯA DẪN CHỨNG HAY LUẬN ĐIỂM MỚI. Đóng vai trò như một vị giám khảo thiên vị, tổng kết lại trận đấu qua 2 câu hỏi so sánh lớn, chứng minh thế giới của phe Phản đối an toàn và hợp lý hơn.',
      prop_reply: 'Bài kết luận Phe Ủng hộ (Prop Reply - 4 phút, nói SAU CÙNG): Do Diễn giả 1 hoặc 2 nói. KHÔNG CÓ POI, KHÔNG CÓ LUẬN ĐIỂM MỚI. Đúc kết lại toàn bộ trận đấu, khắc sâu giá trị đạo đức hoặc tác động cốt lõi mà phe Ủng hộ bảo vệ, để lại ấn tượng mạnh mẽ sau cùng cho giám khảo.'
    };

    const historySummary = Array.isArray(speechesHistory) && speechesHistory.length > 0
      ? speechesHistory.map((s: any, idx: number) => `[Bài ${idx + 1} - ${s.speakerName} (${s.role})]:\n${s.transcript.slice(0, 350)}...`).join('\n\n')
      : '(Đây là bài phát biểu mở màn trận đấu)';

    const poisSummary = Array.isArray(activePois) && activePois.length > 0
      ? `CÂU HỎI XEN (POI) ĐÃ ĐƯỢC CHẤP NHẬN TRONG BÀI NÀY:\n` + activePois.map((p: any) => `- Câu hỏi của ${p.questionerName}: "${p.questionText}"`).join('\n')
      : '';

    const prompt = `
Bạn là Diễn giả Tranh biện WSDC Quốc tế (World Schools Debating Championship) chuyên nghiệp.
Hãy viết một bài phát biểu tranh biện hoàn chỉnh, chặt chẽ, đầy đủ cấu trúc bằng TIẾNG VIỆT tự nhiên, đanh thép, chuẩn mực học thuật.

THÔNG TIN TRẬN ĐẤU:
- Kiến nghị (Motion): "${topic.motion}"
- Bối cảnh: "${topic.background || ''}"
- Vai trò của bạn: ${roleGuides[role] || roleGuides.prop_1}

CÁC BÀI PHÁT BIỂU TRƯỚC ĐÓ TRONG TRẬN:
${historySummary}

${poisSummary}

QUY TẮC BẮT BUỘC THEO THỂ THỨC WSDC:
1. Độ dài: Khoảng 4-6 đoạn văn hoàn chỉnh (khoảng 350-500 từ), có câu chào chuẩn WSDC ("Kính thưa Chủ tọa, Ban Giám khảo cùng toàn thể hội trường..."), chia bố cục rõ ràng:
   - Phần 1: Tuyên bố lập trường & Cấu trúc bài nói (Signposting).
   - Phần 2: Phản bác lại các luận điểm của bài nói trước đó (Rebuttal) bằng cơ chế (De-link, Mitigate hoặc Turn).
   - Phần 3: Xây dựng hoặc bảo vệ luận điểm của phe mình theo mô hình PEEL (Point, Explanation nhân quả A->B->C, Evidence, Link).
   - Phần 4: Tóm lược tác động và khẳng định vị thế.
2. Nếu có POI được chấp nhận, hãy lồng ghép câu trả lời ngắn gọn, sắc bén vào giữa bài nói trước khi chuyển sang luận điểm kế tiếp.
3. Nếu là bài Reply (opp_reply hoặc prop_reply): Tuyệt đối không đưa luận điểm mới, tập trung vào phép so sánh thế giới (Comparative World analysis) và trả lời 2 câu hỏi xung đột cốt tử.
4. Trả về đúng định dạng JSON.
`;

    const ai = new GoogleGenAI({ apiKey: String(apiKey) });
    const content = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speakerTitle: { type: Type.STRING },
            openingGreeting: { type: Type.STRING },
            transcript: { type: Type.STRING, description: 'Toàn văn bài phát biểu chuẩn WSDC hoàn chỉnh' },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 luận điểm chính đã được trình bày'
            },
            rebuttalSummary: { type: Type.STRING, description: 'Tóm tắt các điểm đã phản bác đối thủ' },
            estimatedSpeakingMinutes: { type: Type.NUMBER }
          },
          required: ['speakerTitle', 'transcript', 'keyPoints']
        },
        maxOutputTokens: 2500,
        temperature: 0.3
      }
    });

    const parsed = JSON.parse(content.text?.trim() || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('WSDC Speech API Error:', err);
    return res.status(500).json({ error: 'Lỗi sinh bài phát biểu WSDC' });
  }
});

// 2. Xử lý Câu hỏi xen (Point of Information - POI)
app.post('/api/wsdc-poi', async (req, res) => {
  try {
    const { action, topic, speakerRole, speakerTranscript, studentPoiQuestion } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY chưa cấu hình' });
    }

    const ai = new GoogleGenAI({ apiKey: String(apiKey) });

    if (action === 'generate_ai_poi') {
      // AI đứng dậy xin POI khi học sinh đang nói
      const prompt = `
Bạn là Diễn giả WSDC đối lập trong trận tranh biện về: "${topic?.motion || ''}".
Học sinh đang phát biểu bài ${speakerRole}. Nội dung bài nói hiện tại của học sinh:
"${speakerTranscript || ''}"

Nhiệm vụ: Hãy đặt một câu hỏi xen (Point of Information - POI) ngắn gọn, đanh thép, chuẩn WSDC:
- Độ dài tối đa 20-25 từ (nói dưới 15 giây theo luật).
- Nhắm thẳng vào một mắt xích suy diễn hoặc hậu quả tiêu cực của phe học sinh.
`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING, description: 'Nội dung câu hỏi xen POI sắc bén dưới 25 từ' },
              targetFlaw: { type: Type.STRING, description: 'Lỗ hổng mà POI này nhắm tới' }
            },
            required: ['questionText']
          },
          temperature: 0.3
        }
      });
      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    } else {
      // Học sinh xin POI khi AI đang nói -> AI quyết định chấp nhận hoặc từ chối
      const prompt = `
Bạn là Diễn giả AI đang nói bài ${speakerRole} về: "${topic?.motion || ''}".
Nội dung bài nói của bạn: "${speakerTranscript || ''}"
Học sinh vừa đứng dậy đưa câu hỏi xen (POI): "${studentPoiQuestion}"

Nhiệm vụ: Quyết định phản hồi câu hỏi này:
- status: 'accepted' hoặc 'declined' (nếu câu hỏi có thiện chí và đúng luật thì nên accepted).
- replyText: Nếu accepted, đưa ra câu phản hồi bẻ ngược lại ngay trong 1-2 câu sắc bén. Nếu declined, lịch sự từ chối ("Xin cảm ơn bạn, nhưng tôi từ chối để tiếp tục luận điểm").
`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, enum: ['accepted', 'declined'] },
              replyText: { type: Type.STRING, description: 'Câu trả lời hoặc lời từ chối lịch thiệp' }
            },
            required: ['status', 'replyText']
          },
          temperature: 0.2
        }
      });
      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    }
  } catch (err: any) {
    console.error('WSDC POI Error:', err);
    return res.status(500).json({ error: 'Lỗi xử lý POI WSDC' });
  }
});

// 3. Chấm điểm bài phát biểu theo thang điểm WSDC 60-80 (Reply: 30-40)
app.post('/api/wsdc-evaluate-speech', async (req, res) => {
  try {
    const { topic, role, speechType, transcript, speechPois } = req.body;
    if (!transcript || !role) {
      return res.status(400).json({ error: 'Thiếu nội dung bài phát biểu' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY chưa cấu hình' });
    }

    const isReply = speechType === 'reply' || role.includes('reply');

    const prompt = `
Bạn là Giám khảo Quốc tế chấm thi giải Tranh biện WSDC (World Schools Debating Championship).
Hãy chấm điểm bài phát biểu của học sinh dựa trên thang điểm chuẩn mực WSDC:

THÔNG TIN:
- Kiến nghị: "${topic?.motion || ''}"
- Vai trò: ${role} (${isReply ? 'Bài kết luận Reply 4 phút' : 'Bài phát biểu chính Substantive 8 phút'})
- Các câu hỏi xen (POI) trong lượt này: ${JSON.stringify(speechPois || [])}

NỘI DUNG BÀI PHÁT BIỂU:
"""${transcript}"""

THANG ĐIỂM BẮT BUỘC CHẤP HÀNH THEO LUẬT WSDC:
${isReply ? `
BÀI REPLY (TÍNH NỬA ĐIỂM - THANG 30 ĐẾN 40 ĐIỂM, điểm trung bình chuẩn là 35):
- content: 12 đến 16 điểm (Lý lẽ so sánh hai thế giới, không đưa điểm mới)
- style: 12 đến 16 điểm (Văn phong tổng kết, sức thuyết phục, truyền cảm)
- strategy: 6 đến 8 điểm (Hiểu đúng chức năng bài Reply, cấu trúc so sánh)
- total = content + style + strategy (từ 30 đến 40 điểm)
` : `
BÀI PHÁT BIỂU CHÍNH (THANG 60 ĐẾN 80 ĐIỂM, điểm trung bình chuẩn là 70):
- content: 24 đến 32 điểm (Lập luận logic, cơ chế nhân quả A->B->C, dẫn chứng, phản bác)
- style: 24 đến 32 điểm (Giọng điệu, cấu trúc signposting, thuyết phục, văn phong học thuật)
- strategy: 12 đến 16 điểm (Đúng vai trò của diễn giả, phân bổ thời gian, giải quyết clash point, xử lý POI)
- total = content + style + strategy (từ 60 đến 80 điểm)
`}

YÊU CẦU ĐÁNH GIÁ:
- Nhận xét trung thực, xây dựng, chuẩn mực chuyên môn tranh biện.
- Chỉ rõ điểm mạnh và điểm cần cải thiện cho lượt nói sau.
`;

    const ai = new GoogleGenAI({ apiKey: String(apiKey) });
    const content = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.INTEGER, description: isReply ? '12-16' : '24-32' },
                style: { type: Type.INTEGER, description: isReply ? '12-16' : '24-32' },
                strategy: { type: Type.INTEGER, description: isReply ? '6-8' : '12-16' },
                total: { type: Type.INTEGER, description: isReply ? '30-40' : '60-80' }
              },
              required: ['content', 'style', 'strategy', 'total']
            },
            contentFeedback: { type: Type.STRING },
            styleFeedback: { type: Type.STRING },
            strategyFeedback: { type: Type.STRING },
            poiFeedback: { type: Type.STRING },
            aiSuggestedImprovements: { type: Type.STRING }
          },
          required: ['scores', 'contentFeedback', 'styleFeedback', 'strategyFeedback']
        },
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(content.text?.trim() || '{}');
    let contentScore = Number(parsed.scores?.content) || (isReply ? 14 : 28);
    let styleScore = Number(parsed.scores?.style) || (isReply ? 14 : 28);
    let strategyScore = Number(parsed.scores?.strategy) || (isReply ? 7 : 14);

    if (isReply) {
      contentScore = Math.max(12, Math.min(16, contentScore));
      styleScore = Math.max(12, Math.min(16, styleScore));
      strategyScore = Math.max(6, Math.min(8, strategyScore));
    } else {
      contentScore = Math.max(24, Math.min(32, contentScore));
      styleScore = Math.max(24, Math.min(32, styleScore));
      strategyScore = Math.max(12, Math.min(16, strategyScore));
    }

    const total = contentScore + styleScore + strategyScore;

    return res.json({
      scores: {
        content: contentScore,
        style: styleScore,
        strategy: strategyScore,
        total
      },
      contentFeedback: parsed.contentFeedback || 'Lập luận có cố gắng, cần làm sâu hơn cơ chế tác động.',
      styleFeedback: parsed.styleFeedback || 'Phong thái tự tin, diễn đạt rõ ràng.',
      strategyFeedback: parsed.strategyFeedback || 'Đã nắm được cấu trúc nhiệm vụ của diễn giả.',
      poiFeedback: parsed.poiFeedback || undefined,
      aiSuggestedImprovements: parsed.aiSuggestedImprovements || 'Tập trung vào cơ chế nhân quả A -> B -> C để nâng điểm Nội dung.'
    });
  } catch (err: any) {
    console.error('WSDC Evaluate Speech Error:', err);
    return res.status(500).json({ error: 'Lỗi chấm điểm bài phát biểu WSDC' });
  }
});

// 4. Hội đồng Giám khảo WSDC phân xử chung cuộc (Oral Adjudication - KHÔNG CÓ KẾT QUẢ HÒA)
app.post('/api/wsdc-adjudicate', async (req, res) => {
  try {
    const { topic, speeches } = req.body;
    if (!topic || !Array.isArray(speeches) || speeches.length < 2) {
      return res.status(400).json({ error: 'Thiếu dữ liệu các bài phát biểu trong trận' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY chưa cấu hình' });
    }

    const speechesBrief = speeches.map((s: any, idx: number) => {
      const score = s.score?.total ? `[Điểm: ${s.score.total}]` : '';
      return `${idx + 1}. ${s.speakerName} (${s.role}) - ${s.side === 'pro' ? 'Ủng hộ' : 'Phản đối'} ${score}:\n${s.transcript.slice(0, 200)}...`;
    }).join('\n\n');

    const prompt = `
Bạn là Hội đồng Trọng tài Tranh biện WSDC gồm 3 giám khảo độc lập.
Nhiệm vụ: Phân xử toàn diện trận tranh biện về kiến nghị: "${topic.motion}".

CÁC BÀI NÓI TRONG TRẬN:
${speechesBrief}

QUY TẮC PHÂN XỬ BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG CÓ KẾT QUẢ HÒA (No Tie). Bắt buộc phải xác định phe Thắng: 'pro' (Phe Ủng hộ) HOẶC 'con' (Phe Phản đối).
2. Số phiếu biểu quyết của hội đồng 3 người:
   - Nếu thắng áp đảo: 3 - 0 (ballotsPro = 3, ballotsOpp = 0 hoặc ngược lại)
   - Nếu trận đấu sát nút: 2 - 1 (ballotsPro = 2, ballotsOpp = 1 hoặc ngược lại)
3. Xác định 2-3 Điểm Đụng Độ Lớn (Clash Points) của trận đấu và phân tích phe nào đã chiến thắng ở từng điểm đụng độ đó.
4. Lời nhận xét phân xử chính thức (overallAdjudication) mang tính mô phạm, giải thích rõ gánh nặng chứng minh (Burden of Proof) nào đã được giải quyết tốt hơn.
5. Vinh danh Diễn giả xuất sắc nhất trận (Best Speaker).
`;

    const ai = new GoogleGenAI({ apiKey: String(apiKey) });
    const content = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            winningSide: { type: Type.STRING, enum: ['pro', 'con'], description: 'Bắt buộc pro hoặc con, tuyệt đối không hòa' },
            ballotsPro: { type: Type.INTEGER, description: 'Số phiếu cho phe Ủng hộ (0-3)' },
            ballotsOpp: { type: Type.INTEGER, description: 'Số phiếu cho phe Phản đối (0-3)' },
            clashPointsAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  winningTeam: { type: Type.STRING, enum: ['pro', 'con'] },
                  reason: { type: Type.STRING }
                },
                required: ['title', 'description', 'winningTeam', 'reason']
              }
            },
            overallAdjudication: { type: Type.STRING },
            bestSpeaker: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ['name', 'role', 'reason']
            }
          },
          required: ['winningSide', 'ballotsPro', 'ballotsOpp', 'clashPointsAnalysis', 'overallAdjudication', 'bestSpeaker']
        },
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(content.text?.trim() || '{}');
    const winningSide = parsed.winningSide === 'con' ? 'con' : 'pro';
    let ballotsPro = Number(parsed.ballotsPro) || (winningSide === 'pro' ? 2 : 1);
    let ballotsOpp = Number(parsed.ballotsOpp) || (winningSide === 'con' ? 2 : 1);

    if (winningSide === 'pro' && ballotsPro <= ballotsOpp) {
      ballotsPro = 2;
      ballotsOpp = 1;
    } else if (winningSide === 'con' && ballotsOpp <= ballotsPro) {
      ballotsOpp = 2;
      ballotsPro = 1;
    }

    return res.json({
      winningSide,
      ballotsPro,
      ballotsOpp,
      clashPointsAnalysis: parsed.clashPointsAnalysis || [],
      overallAdjudication: parsed.overallAdjudication || 'Hội đồng giám khảo đã thảo luận kỹ lưỡng và đưa ra quyết định dựa trên các điểm đụng độ then chốt.',
      bestSpeaker: parsed.bestSpeaker || {
        name: 'Diễn giả 1 Phe Ủng hộ',
        role: 'prop_1',
        score: 75,
        reason: 'Có đóng góp xuất sắc trong việc đặt nền móng và xây dựng cơ chế vững chắc cho trận đấu.'
      }
    });
  } catch (err: any) {
    console.error('WSDC Adjudicate Error:', err);
    return res.status(500).json({ error: 'Lỗi phân xử chung cuộc WSDC' });
  }
});

// Setup Vite middleware in dev or serve dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // 1-year immutable cache for hashed assets in /assets (JS, CSS)
    // fallthrough: false bảo đảm nếu file asset không tồn tại thì trả về 404 thay vì fallback về index.html
    app.use('/assets', express.static(path.resolve(__dirname, 'dist', 'assets'), {
      maxAge: '1y',
      immutable: true,
      fallthrough: false
    }));
    // Static files with 1h cache; index.html always validated
    app.use(express.static(path.resolve(__dirname, 'dist'), {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server startup error:', err);
  });
}

startServer();

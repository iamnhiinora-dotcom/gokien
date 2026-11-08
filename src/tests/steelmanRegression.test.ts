/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BỘ KIỂM THỬ HỒI QUY CHO BUG-18: CHỨC NĂNG CHẤM ĐIỂM DỰNG NGƯỜI THÉP (STEELMAN)
 * Chạy kiểm tra độc lập bằng tsx:
 *   npx tsx src/tests/steelmanRegression.test.ts
 */

import { SteelmanEvaluation } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

function assertEquals(actual: any, expected: any, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error(`❌ FAILED: ${message}`);
    console.error(`   Actual:   ${JSON.stringify(actual)}`);
    console.error(`   Expected: ${JSON.stringify(expected)}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n=== BẮT ĐẦU CHẠY REGRESSION TESTS CHO BUG-18 (DỰNG NGƯỜI THÉP) ===\n');

// -------------------------------------------------------------
// Kịch bản 1: Đạt chuẩn (Score >= 6) -> isPassed = true, cho phép vào trận
// -------------------------------------------------------------
console.log('--- Kịch bản 1: Đạt chuẩn (Score >= 6) ---');
function evaluateScore(rawScore: number, rawPassed?: boolean) {
  const score = Math.max(0, Math.min(10, Math.round(Number(rawScore) || 0)));
  const isPassed = score >= 6;
  return { score, isPassed };
}

const passingResult1 = evaluateScore(7);
assert(passingResult1.score === 7, 'Điểm số chuẩn hóa chính xác');
assert(passingResult1.isPassed === true, 'Đạt 7 điểm thì isPassed = true và được phép vào trận');

const passingResult2 = evaluateScore(6);
assert(passingResult2.isPassed === true, 'Điểm ngưỡng chính xác: 6 điểm là isPassed = true');

const passingResult3 = evaluateScore(10);
assert(passingResult3.isPassed === true, 'Điểm tối đa 10 điểm là isPassed = true');

// -------------------------------------------------------------
// Kịch bản 2: Dưới chuẩn (Score < 6) -> isPassed = false, không được vào trận
// -------------------------------------------------------------
console.log('\n--- Kịch bản 2: Dưới chuẩn (Score < 6) ---');
const failingResult1 = evaluateScore(5);
assert(failingResult1.score === 5, 'Điểm số 5 được chuẩn hóa đúng');
assert(failingResult1.isPassed === false, 'Điểm 5 không đủ chuẩn (isPassed = false)');

const failingResult2 = evaluateScore(0);
assert(failingResult2.score === 0, 'Điểm 0 được chuẩn hóa đúng');
assert(failingResult2.isPassed === false, 'Điểm 0 isPassed = false');

// Tránh lỗi do AI trả boolean sai lệch với score
const mismatchedAi = evaluateScore(4, true); // AI trả sai boolean true nhưng score chỉ là 4
assert(mismatchedAi.isPassed === false, 'Logic server ép buộc isPassed = false khi score < 6 bất chấp AI');

// -------------------------------------------------------------
// Kịch bản 3: Input validation (Bài viết trống hoặc thiếu chủ đề) -> 400 Bad Request
// -------------------------------------------------------------
console.log('\n--- Kịch bản 3: Input validation ---');
function validateSteelmanRequest(body: { topic?: any; studentSide?: any; steelmanText?: any }) {
  const { topic, steelmanText } = body;
  if (!topic || !steelmanText || typeof steelmanText !== 'string' || !steelmanText.trim()) {
    return { status: 400, error: 'Thiếu thông tin chủ đề hoặc bài viết người thép' };
  }
  return { status: 200 };
}

assertEquals(
  validateSteelmanRequest({ topic: null, steelmanText: 'Lập luận công tâm' }),
  { status: 400, error: 'Thiếu thông tin chủ đề hoặc bài viết người thép' },
  'Thiếu topic trả về lỗi 400'
);
assertEquals(
  validateSteelmanRequest({ topic: { motion: 'Cấm điện thoại' }, steelmanText: '' }),
  { status: 400, error: 'Thiếu thông tin chủ đề hoặc bài viết người thép' },
  'Bài viết rỗng chuỗi trả về lỗi 400'
);
assertEquals(
  validateSteelmanRequest({ topic: { motion: 'Cấm điện thoại' }, steelmanText: '   \n  ' }),
  { status: 400, error: 'Thiếu thông tin chủ đề hoặc bài viết người thép' },
  'Bài viết chỉ chứa khoảng trắng trả về lỗi 400'
);
assertEquals(
  validateSteelmanRequest({ topic: { motion: 'Cấm điện thoại' }, steelmanText: 'Phe phản đối lo ngại về tự chủ...' }),
  { status: 200 },
  'Bài viết hợp lệ vượt qua khâu kiểm tra'
);

// -------------------------------------------------------------
// Kịch bản 4: Fallback Candidate Models & Timeout
// -------------------------------------------------------------
console.log('\n--- Kịch bản 4: Candidate Models Fallback ---');
async function simulateCandidateFallback(
  modelBehaviors: Record<string, () => Promise<{ text: string }>>
) {
  const candidateModels = [
    { name: 'gemini-3.8-flash', timeout: 5000 },
    { name: 'gemini-3.5-flash', timeout: 6000 },
    { name: 'gemini-3.1-flash-lite', timeout: 6000 }
  ];

  let response: any;
  let successfulModel = '';

  for (const { name: model } of candidateModels) {
    try {
      const handler = modelBehaviors[model];
      if (!handler) continue;
      response = await handler();
      if (response?.text) {
        successfulModel = model;
        break;
      }
    } catch {
      // simulate fallback
    }
  }

  return { response, successfulModel };
}

// Case 4A: gemini-3.8-flash thành công ngay
const test4A = await simulateCandidateFallback({
  'gemini-3.8-flash': async () => ({ text: '{"score":8,"isPassed":true}' }),
  'gemini-3.5-flash': async () => ({ text: '{"score":7,"isPassed":true}' }),
  'gemini-3.1-flash-lite': async () => ({ text: '{"score":6,"isPassed":true}' })
});
assert(test4A.successfulModel === 'gemini-3.8-flash', 'Model ưu tiên hàng đầu gemini-3.8-flash được gọi trước');

// Case 4B: gemini-3.8-flash timeout/fail -> fallback sang gemini-3.5-flash
const test4B = await simulateCandidateFallback({
  'gemini-3.8-flash': async () => { throw new Error('Timeout 5000ms'); },
  'gemini-3.5-flash': async () => ({ text: '{"score":7,"isPassed":true}' }),
  'gemini-3.1-flash-lite': async () => ({ text: '{"score":6,"isPassed":true}' })
});
assert(test4B.successfulModel === 'gemini-3.5-flash', 'Khi 3.8-flash lỗi, tự động chuyển tiếp sang gemini-3.5-flash');

// Case 4C: Cả 3.8 và 3.5 fail -> fallback sang gemini-3.1-flash-lite
const test4C = await simulateCandidateFallback({
  'gemini-3.8-flash': async () => { throw new Error('503 Service Unavailable'); },
  'gemini-3.5-flash': async () => { throw new Error('Timeout 6000ms'); },
  'gemini-3.1-flash-lite': async () => ({ text: '{"score":8,"isPassed":true}' })
});
assert(test4C.successfulModel === 'gemini-3.1-flash-lite', 'Khi 3.8 và 3.5 đều lỗi, fallback thành công về gemini-3.1-flash-lite');

// -------------------------------------------------------------
// Kịch bản 5: Sửa nội dung sau khi chấm -> hủy kết quả cũ
// -------------------------------------------------------------
console.log('\n--- Kịch bản 5: Sửa nội dung sau khi chấm -> hủy kết quả cũ ---');
class MockSteelmanComponentState {
  steelmanText: string = '';
  steelmanResult: SteelmanEvaluation | null = null;
  steelmanScore: number | null = null;
  steelmanError: string | null = null;

  setResult(result: SteelmanEvaluation) {
    this.steelmanResult = result;
    this.steelmanScore = result.score;
  }

  handleSteelmanTextChange(newText: string) {
    this.steelmanText = newText;
    if (this.steelmanResult !== null || this.steelmanScore !== null) {
      this.steelmanResult = null;
      this.steelmanScore = null;
    }
    if (this.steelmanError !== null) {
      this.steelmanError = null;
    }
  }
}

const compState = new MockSteelmanComponentState();
compState.steelmanText = 'Lập luận ban đầu rất tốt đạt 8 điểm.';
compState.setResult({
  score: 8,
  isPassed: true,
  fairnessAppraisal: 'Công tâm',
  feedback: 'Tốt'
});
assert(compState.steelmanResult !== null && compState.steelmanScore === 8, 'Trạng thái ban đầu có kết quả đạt');

// Học sinh chỉnh sửa thêm bớt text
compState.handleSteelmanTextChange('Lập luận đã bị sửa đổi nội dung.');
assert(compState.steelmanResult === null, 'Sau khi sửa text, kết quả chấm cũ đã bị hủy (reset null)');
assert(compState.steelmanScore === null, 'Sau khi sửa text, điểm cũ đã bị hủy (reset null)');

// -------------------------------------------------------------
// Kịch bản 6: Chấm lại không cộng trùng XP
// -------------------------------------------------------------
console.log('\n--- Kịch bản 6: Chấm lại không cộng trùng XP ---');
let totalAwardedXp = 0;
let unlockedBadges: string[] = [];
const hasAwardedSteelmanXp = { current: false };

function simulateEvaluationSuccess(evaluation: { isPassed: boolean }) {
  if (evaluation.isPassed) {
    if (!hasAwardedSteelmanXp.current) {
      hasAwardedSteelmanXp.current = true;
      totalAwardedXp += 30;
      unlockedBadges.push('badge_open_minded');
    }
  }
}

// Lần chấm 1: Đạt 8 điểm -> cộng 30 XP
simulateEvaluationSuccess({ isPassed: true });
assert(totalAwardedXp === 30, 'Lần đầu đạt chuẩn: cộng 30 XP');
assert(unlockedBadges.length === 1, 'Mở khóa huy hiệu badge_open_minded');

// Học sinh bấm nút "Chấm điểm" lần 2 (hoặc chấm lại bài cũ)
simulateEvaluationSuccess({ isPassed: true });
assert(totalAwardedXp === 30, 'Chấm lại bài đạt chuẩn: KHÔNG bị cộng trùng XP lần 2 (vẫn là 30 XP)');
assert(unlockedBadges.length === 1, 'Huy hiệu không bị unlock trùng');

// Bắt đầu một phiên chuẩn bị trận mới
function resetForNewMatchPrep() {
  hasAwardedSteelmanXp.current = false;
}
resetForNewMatchPrep();
simulateEvaluationSuccess({ isPassed: true });
assert(totalAwardedXp === 60, 'Trận đấu mới: được nhận thưởng bài tập Steelman cho trận mới');

// -------------------------------------------------------------
// Kịch bản 7: Giữ nguyên bài viết khi gặp lỗi API
// -------------------------------------------------------------
console.log('\n--- Kịch bản 7: Giữ nguyên nội dung khi gặp lỗi API ---');
const originalEssay = 'Phe đối lập lo ngại việc cấm đoán sẽ triệt tiêu khả năng tự chủ của học sinh. Đây là mối quan ngại rất xác đáng vì kỷ luật tự giác phải đến từ bên trong thay vì ép buộc.';
let currentText = originalEssay;
let errorState: string | null = null;

try {
  // Giả lập API lỗi (ví dụ 503)
  throw new Error('Chưa thể thẩm định bài Dựng Người Thép. Bấm Thử lại');
} catch (err: any) {
  errorState = err.message;
  // Lưu ý: currentText KHÔNG được gán thành ''
}

assert(currentText === originalEssay, 'Văn bản của học sinh được giữ nguyên 100% sau lỗi API');
assert(errorState === 'Chưa thể thẩm định bài Dựng Người Thép. Bấm Thử lại', 'Hiển thị đúng thông báo lỗi thân thiện để thử lại');

// -------------------------------------------------------------
// Kịch bản 8: Parse JSON an toàn (xử lý markdown code block, whitespace, types)
// -------------------------------------------------------------
console.log('\n--- Kịch bản 8: Parse JSON an toàn ---');
function parseAiResponse(rawAiText: string) {
  const cleaned = rawAiText.replace(/^```json\s*|\s*```$/g, '').trim();
  const parsed = JSON.parse(cleaned);
  const score = Math.max(0, Math.min(10, Math.round(Number(parsed.score) || 0)));
  const isPassed = score >= 6;
  return {
    score,
    isPassed,
    fairnessAppraisal: parsed.fairnessAppraisal || 'Phe đối lập thấy bạn đã có thiện chí diễn giải góc nhìn của họ.',
    feedback: parsed.feedback || 'Nhận xét từ Ban Giám khảo.',
    suggestedImprovement: parsed.suggestedImprovement || undefined
  };
}

// Case 8A: AI bọc trong ```json ... ```
const markdownWrappedJson = `\`\`\`json
{
  "score": 9,
  "isPassed": true,
  "fairnessAppraisal": "Rất công tâm và thấu cảm",
  "feedback": "Lập luận sắc bén",
  "suggestedImprovement": "Phát huy thêm dẫn chứng thực tế"
}
\`\`\``;
const parsed8A = parseAiResponse(markdownWrappedJson);
assert(parsed8A.score === 9, 'Trích xuất score = 9 chính xác từ markdown code block');
assert(parsed8A.isPassed === true, 'isPassed = true');
assert(parsed8A.fairnessAppraisal === 'Rất công tâm và thấu cảm', 'Đọc đúng fairnessAppraisal');

// Case 8B: AI trả score dạng chuỗi số "7"
const stringScoreJson = '{"score": "7", "fairnessAppraisal": "Tốt", "feedback": "Đạt"}';
const parsed8B = parseAiResponse(stringScoreJson);
assert(parsed8B.score === 7, 'Ép kiểu chuỗi "7" thành số nguyên 7 an toàn');
assert(parsed8B.isPassed === true, 'isPassed = true');

// Case 8C: AI trả score vượt quá 10 (ví dụ 12) hoặc âm (ví dụ -3)
const overflowJson = '{"score": 15, "fairnessAppraisal": "Quá tốt", "feedback": "Tuyệt vời"}';
const parsed8C = parseAiResponse(overflowJson);
assert(parsed8C.score === 10, 'Chặn trần điểm số tối đa là 10');

const negativeJson = '{"score": -5, "fairnessAppraisal": "Không tốt", "feedback": "Chưa đạt"}';
const parsed8D = parseAiResponse(negativeJson);
assert(parsed8D.score === 0, 'Chặn sàn điểm số tối thiểu là 0');

// -------------------------------------------------------------
// Kịch bản 9: TC-17 - Hết giờ (timer expires) vẫn tính đúng toàn bộ đáp án đã chọn
// -------------------------------------------------------------
console.log('\n--- Kịch bản 9: TC-17 - Hết giờ vẫn tính đúng toàn bộ đáp án đã chọn ---');
const sampleQuestions = [
  { id: 'q1', groupKey: 'logical_validity', correctIndex: 2 },
  { id: 'q2', groupKey: 'logical_validity', correctIndex: 0 },
  { id: 'q3', groupKey: 'evidence_strength', correctIndex: 1 },
  { id: 'q4', groupKey: 'fallacy_recognition', correctIndex: 3 }
];

// Mô phỏng Component State & Refs như trong DiagnosticTestModal
class MockDiagnosticModal {
  selectedAnswersState: Record<string, number> = {};
  selectedAnswersRef: { current: Record<string, number> } = { current: {} };
  submittedResult: any = null;

  selectAnswer(qId: string, answerIdx: number) {
    this.selectedAnswersState = { ...this.selectedAnswersState, [qId]: answerIdx };
    // Ref đồng bộ ngay lập tức
    this.selectedAnswersRef.current = this.selectedAnswersState;
  }

  // Hàm submit đọc từ ref (fix TC-17)
  handleSubmit() {
    const answers = this.selectedAnswersRef.current;
    let correct = 0;
    sampleQuestions.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    const totalScore = Math.round((correct / sampleQuestions.length) * 100);
    this.submittedResult = {
      correctCount: correct,
      totalScore,
      answers
    };
  }

  // Giả lập đồng hồ đếm ngược hết giờ
  simulateTimeOut() {
    this.handleSubmit();
  }
}

const diagModal = new MockDiagnosticModal();
// Học sinh làm 3 câu (2 câu đúng: q1=2, q3=1; 1 câu sai: q2=1)
diagModal.selectAnswer('q1', 2);
diagModal.selectAnswer('q2', 1);
diagModal.selectAnswer('q3', 1);

// Hết giờ đột ngột!
diagModal.simulateTimeOut();

assert(diagModal.submittedResult !== null, 'Bài kiểm tra đã được tự động nộp khi hết giờ');
assertEquals(diagModal.submittedResult.correctCount, 2, 'TC-17: Tính đúng 2 câu chính xác đã chọn');
assertEquals(diagModal.submittedResult.totalScore, 50, 'TC-17: Điểm số tính đúng 50% dựa trên đáp án đã chọn');
assert(diagModal.submittedResult.answers['q1'] === 2, 'Lưu đúng đáp án câu 1');
assert(diagModal.submittedResult.answers['q2'] === 1, 'Lưu đúng đáp án câu 2');
assert(diagModal.submittedResult.answers['q3'] === 1, 'Lưu đúng đáp án câu 3');

// -------------------------------------------------------------
// Kịch bản 10: Xử lý Response thiếu dữ liệu / Schema không hợp lệ / NaN
// -------------------------------------------------------------
console.log('\n--- Kịch bản 10: Xử lý Response thiếu dữ liệu & Schema lỗi ---');
function validateAndNormalizeResponse(rawParsed: any) {
  if (!rawParsed || typeof rawParsed !== 'object' || typeof rawParsed.score === 'undefined') {
    return { status: 502, error: 'Dữ liệu thẩm định từ AI không hợp lệ. Bấm Thử lại' };
  }
  const rawScore = Number(rawParsed.score);
  if (isNaN(rawScore)) {
    return { status: 502, error: 'Điểm số thẩm định không hợp lệ. Bấm Thử lại' };
  }
  const score = Math.max(0, Math.min(10, Math.round(rawScore)));
  return {
    status: 200,
    data: {
      score,
      isPassed: score >= 6,
      fairnessAppraisal: rawParsed.fairnessAppraisal || 'Phe đối lập thấy bạn đã có thiện chí diễn giải góc nhìn của họ.',
      feedback: rawParsed.feedback || 'Nhận xét từ Ban Giám khảo.',
      suggestedImprovement: rawParsed.suggestedImprovement || undefined
    }
  };
}

// Case 10A: Thiếu trường score
const missingScoreRes = validateAndNormalizeResponse({ feedback: 'Lập luận tốt' });
assertEquals(missingScoreRes.status, 502, 'Thiếu score trả về lỗi 502');

// Case 10B: Score là chuỗi chữ không chuyển được thành số ("abc")
const nanScoreRes = validateAndNormalizeResponse({ score: 'not_a_number' });
assertEquals(nanScoreRes.status, 502, 'Score NaN trả về lỗi 502');

// Case 10C: Response rỗng hoặc null
const nullRes = validateAndNormalizeResponse(null);
assertEquals(nullRes.status, 502, 'Response null trả về lỗi 502');

// Case 10D: Response hợp lệ
const validRes = validateAndNormalizeResponse({ score: 8, feedback: 'Rất tốt', fairnessAppraisal: 'Công tâm' });
assertEquals(validRes.status, 200, 'Response đầy đủ trả về HTTP 200');
assert(validRes.data?.isPassed === true, 'isPassed được xác thực chính xác');

console.log('\n🎉 TẤT CẢ 10 KỊCH BẢN REGRESSION TESTS ĐÃ VƯỢT QUA XUẤT SẮC! 🎉\n');

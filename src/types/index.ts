/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BỘ ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPES) - NỀN TẢNG "TRÍ TUỆ PHẢN BIỆN"
 * Dành cho học sinh THPT rèn luyện tư duy phản biện & tranh biện WSDC
 */

// Phân loại lĩnh vực tình huống và chủ đề tranh biện
export type ScenarioCategory = 
  | 'hoc_duong' 
  | 'mang_xa_hoi' 
  | 'cong_nghe_ai' 
  | 'dao_duc_xa_hoi'
  | 'giao_duc'
  | 'moi_truong'
  | 'y_te_suc_khoe'
  | 'xa_hoi';

// Phân loại 3 hình thức Kiến nghị theo chuẩn tranh biện
export type MotionType = 'chinh_sach' | 'gia_tri' | 'thuc_te';

// Mô hình PEEL xây dựng luận điểm tranh biện (Point - Explanation A->B->C - Evidence - Link)
export interface PeelGuidance {
  point?: string;            // P - Luận điểm chính
  explanation?: string;      // E - Giải thích cơ chế nhân quả A -> B -> C
  evaluationMetric?: string; // Tiêu chí / Khung quy chiếu đánh giá
  evidence?: string;         // E - Dẫn chứng có nguồn hoặc giả thuyết kiểm chứng
  link?: string;             // L - Liên kết ngược lại kiến nghị
}


// Định nghĩa thông tin chi tiết của một Lỗi Ngụy Biện
export interface FallacyItem {
  id: string;
  name: string;             // Tên tiếng Anh (vd: Ad Hominem)
  vietnameseName: string;   // Tên tiếng Việt (vd: Ngụy biện công kích cá nhân)
  definition: string;       // Khái niệm dễ hiểu cho học sinh THPT
  example: string;          // Ví dụ thực tế đời sống
  counterStrategy: string;  // Chiến lược bẻ lại (Rebuttal Strategy)
  whenNotFallacy: string;   // Khi nào KHÔNG phải ngụy biện (Lập luận hợp lý)
  category: 'tam_ly' | 'cau_truc' | 'du_lieu' | 'danh_lac_huong';
  severity: 'de_gap' | 'tinh_vi' | 'nguy_hiem';
}

// Tình huống thử thách trong Module 1: Vạch lá tìm sâu
export type ScenarioMediumType = 
  | 'chat_bubble'       // Bong bóng chat nhóm lớp
  | 'social_post'       // Bài đăng mạng xã hội (có like, comment)
  | 'video_comment'     // Bình luận video ngắn (có tim, ghim)
  | 'meeting_minutes'   // Biên bản họp phụ huynh
  | 'news_headline';    // Tiêu đề báo & bài báo điện tử

export interface ChallengeScenario {
  id: string;
  category: ScenarioCategory;
  mediumType?: ScenarioMediumType; // Hình thức ngoài đời thực của tình huống
  topicTitle: string;
  speaker: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  context: string;             // Bối cảnh diễn ra cuộc trò chuyện
  statement: string;           // Phát biểu có chứa lỗi ngụy biện ẩn hoặc lập luận hợp lý
  flawText?: string;           // Cụm từ chứa lỗi, trích nguyên văn từ câu phát biểu (rỗng nếu là lập luận hợp lý)
  hiddenFallacyId: string;     // ID lỗi ngụy biện chính xác hoặc 'no_fallacy'
  secondaryFallacyId?: string; // Lỗi phụ nếu có (cho tình huống Nâng cao)
  difficulty: 'Co_ban' | 'Trung_binh' | 'Nang_cao';
  explanation: string;         // Giải thích tại sao phát biểu lại mắc lỗi này (hoặc tại sao hợp lý)
  sampleRebuttal: string;      // Luận điểm bẻ lại mẫu mực (hoặc cách giải thích bảo vệ)
}

// Kết quả chấm điểm của AI cho bài tập Vạch lá tìm sâu (Structured Output)
export interface FallacyEvaluationResult {
  isRelevant: boolean;          // True nếu bài bẻ lại có nghĩa và liên quan đến chủ đề; False nếu vô nghĩa, spam, lạc đề
  fallacyCorrect: boolean;      // True nếu học sinh chọn đúng loại lỗi ngụy biện
  isFallacyCorrect: boolean;    // Tương thích ngược: giống fallacyCorrect
  precisionBonus?: number;      // Điểm thưởng bôi đúng cụm từ có lỗi bằng bút dạ quang (10-20 XP)
  flawHighlightMatched?: boolean; // Học sinh đã bôi đúng cụm từ có lỗi
  scores: {
    identification: number;     // 0 - 30 điểm (bằng 0 nếu fallacyCorrect = false)
    reasoning: number;          // 0 - 40 điểm (tối đa 5 nếu isRelevant = false)
    persuasion: number;         // 0 - 30 điểm (tối đa 5 nếu isRelevant = false)
  };
  fallacyAccuracyScore: number; // 0 - 30 điểm (alias cho scores.identification)
  logicScore: number;           // 0 - 40 điểm (alias cho scores.reasoning)
  persuasionScore: number;      // 0 - 30 điểm (alias cho scores.persuasion)
  totalScore: number;           // 0 - 100 điểm (tối đa 10 điểm nếu isRelevant = false)
  xpEarned: number;             // XP nhận được (0 XP nếu isRelevant = false)
  weakestQuote: string;         // Trích nguyên văn câu hoặc đoạn yếu nhất trong bài của học sinh
  feedback: string;             // 2-3 câu tiếng Việt nhận xét trung thực, nói thẳng điểm yếu
  mentorFeedback: string;       // Alias cho feedback
  improvedVersion: string;      // Câu bẻ lại mẫu mực chuẩn WSDC
  improvedRebuttalSuggestion: string; // Alias cho improvedVersion
  strengths: string[];          // Điểm làm tốt
  weaknesses: string[];         // Điểm cần cải thiện
}

// Chủ đề tranh biện Module 2
export interface DebateTopic {
  id: string;
  motion: string;               // Đề tài chuẩn WSDC (vd: "Nhà này sẽ cấm học sinh dùng smartphone...")
  category: ScenarioCategory;
  categoryLabel?: string;       // Nhãn lĩnh vực tiếng Việt
  motionType?: MotionType;      // Loại kiến nghị: Chính sách, Giá trị, Thực tế
  motionTypeLabel?: string;     // Nhãn loại kiến nghị hiển thị
  background: string;           // Bối cảnh vấn đề
  proArgumentsSummary: string[];// Các luận cứ chính của phe Ủng hộ
  conArgumentsSummary: string[];// Các luận cứ chính của phe Phản đối
  difficulty: 'Tap_su' | 'Chien_binh' | 'Cao_thu';
  peelGuidance?: PeelGuidance;  // Gợi ý khung PEEL cho học sinh (cơ chế A->B->C trong Explanation)
}

// Phe trong tranh biện
export type DebateSide = 'pro' | 'con'; // pro = Phe Khẳng định (Ủng hộ), con = Phe Phản định (Phản đối)

// Tính cách & Phong cách phản biện của AI Opponent
export type DebaterPersona = 'wsdc_grandmaster' | 'fallacy_hunter' | 'strict_prosecutor';

export interface DebaterPersonaInfo {
  id: DebaterPersona;
  name: string;
  badge: string;
  description: string;
  specialty: string;
}

// Đánh giá cuối trận theo 3 tiêu chí WSDC chuẩn quốc tế
export interface WsdcFinalEvaluation {
  contentScore: number;    // 0 - 40 điểm (Nội dung 40%)
  styleScore: number;      // 0 - 40 điểm (Phong cách 40%)
  strategyScore: number;   // 0 - 20 điểm (Chiến lược 20%)
  totalScore: number;      // 0 - 100 điểm
  contentFeedback: string; // Nhận xét về lý lẽ, dẫn chứng và cơ chế nhân quả
  styleFeedback: string;   // Nhận xét về văn phong, tính thuyết phục và biểu đạt
  strategyFeedback: string;// Nhận xét về phân bổ thời gian và giải quyết clash point
  generalVerdict: string;  // Nhận định chung của hội đồng giám khảo
}

// Câu hỏi vấn đáp Socrates giúp khơi gợi ý tưởng phản biện từ bên trong học sinh
export interface SocraticGuidingQuestion {
  id: string;
  category: 'premise' | 'mechanism' | 'stakeholder' | 'alternative';
  categoryTitle: string;     // vd: "1. Vấn đáp về Tiền đề (Premise)"
  badge: string;             // vd: "Bóc trần ngầm định"
  question: string;          // Câu hỏi khơi gợi tư duy sâu sắc từ bên trong
  subQuestions: string[];    // Các câu hỏi gợi mở tiếp theo để học sinh tự đào sâu
  insightHint: string;       // Gợi ý tư duy: Điểm mấu chốt bạn nên chú ý
  sentenceStarter: string;   // Khung mở đầu câu để học sinh tự điền ý tưởng của mình
}

// Gợi ý luận điểm phản biện theo cấu trúc WSDC (PEEL Model)
export interface WsdcRebuttalHint {
  id: string;
  angleTitle: string;        // Tên hướng phản biện
  point: string;             // P - Point: Khẳng định luận điểm bác bỏ
  explanation: string;       // E - Explanation: Giải thích cơ chế và lỗ hổng
  evidence: string;          // E - Evidence: Dẫn chứng, số liệu hoặc tiền lệ
  link: string;              // L - Link: Liên kết khẳng định ưu thế phe mình
  fullScaffoldText: string;  // Đoạn tổng hợp mẫu sẵn sàng chèn vào ô nhập
}

// Đánh giá bài tập Dựng Người Thép (Steelman) trước trận đấu
export interface SteelmanEvaluation {
  score: number;             // 0 - 10 (từ 6 điểm trở lên mới được vào trận)
  isPassed: boolean;
  feedback: string;
  fairnessAppraisal: string; // Đánh giá: phe đối lập có thấy cách nói này công bằng không
  suggestedImprovement?: string;
}

// Phản tư tự nhìn lại bản thân sau trận đấu
export interface PostMatchReflection {
  opponentThoughtProvokingPoint: string; // "Ý nào của đối thủ làm bạn phải nghĩ lại?"
  oppositeSideOpeningIdea: string;       // "Nếu đổi phe, bạn sẽ mở đầu thế nào?"
}

// ==========================================
// ĐỊNH NGHĨA THỂ THỨC THI ĐẤU WSDC CHUẨN QUỐC TẾ (WORLD SCHOOLS DEBATING CHAMPIONSHIP)
// ==========================================

export type WsdcSpeakerRole = 
  | 'prop_1'     // Diễn giả 1 Phe Ủng hộ (Substantive 8m)
  | 'opp_1'      // Diễn giả 1 Phe Phản đối (Substantive 8m)
  | 'prop_2'     // Diễn giả 2 Phe Ủng hộ (Substantive 8m)
  | 'opp_2'      // Diễn giả 2 Phe Phản đối (Substantive 8m)
  | 'prop_3'     // Diễn giả 3 Phe Ủng hộ (Substantive 8m)
  | 'opp_3'      // Diễn giả 3 Phe Phản đối (Substantive 8m)
  | 'opp_reply'  // Bài kết luận Phe Phản đối (Reply 4m - do Diễn giả 1 hoặc 2 nói)
  | 'prop_reply'; // Bài kết luận Phe Ủng hộ (Reply 4m - do Diễn giả 1 hoặc 2 nói)

export interface WsdcRoleMeta {
  role: WsdcSpeakerRole;
  order: number;            // 1 -> 8
  side: DebateSide;
  speakerTitle: string;     // vd: "Diễn giả 1 Phe Ủng hộ (Prop 1)"
  shortTitle: string;       // vd: "P1", "O1", "P2", "O2", "P3", "O3", "OR", "PR"
  speechType: 'main' | 'reply';
  allocatedMinutes: number; // 8 phút (chính) hoặc 4 phút (reply)
  allowsPoi: boolean;       // true cho bài chính, false cho bài reply
  dutyDescription: string;  // Nhiệm vụ cốt lõi theo luật WSDC
}

// Câu hỏi xen (Point of Information - POI)
export interface WsdcPoiItem {
  id: string;
  speakerRole: WsdcSpeakerRole;
  questionerSide: DebateSide;
  questionerName: string;
  targetRole: WsdcSpeakerRole;
  timestampSeconds: number; // Thời điểm đưa ra POI trong bài nói
  questionText: string;
  status: 'offered' | 'accepted' | 'declined';
  replyText?: string;
}

// Bảng điểm từng bài phát biểu theo thang điểm chuẩn WSDC
export interface WsdcSpeechScore {
  content: number;   // 24 - 32 cho bài chính (12 - 16 cho bài reply)
  style: number;     // 24 - 32 cho bài chính (12 - 16 cho bài reply)
  strategy: number;  // 12 - 16 cho bài chính (6 - 8 cho bài reply)
  total: number;     // 60 - 80 cho bài chính (30 - 40 cho bài reply)
  contentFeedback?: string;
  styleFeedback?: string;
  strategyFeedback?: string;
  poiFeedback?: string;
}

// Bản ghi một bài phát biểu trong trận WSDC
export interface WsdcSpeechRecord {
  role: WsdcSpeakerRole;
  side: DebateSide;
  speakerName: string;
  isStudent: boolean;
  transcript: string;
  audioDurationSeconds?: number;
  pois: WsdcPoiItem[];
  score?: WsdcSpeechScore;
  aiSuggestedImprovements?: string;
}

// Bản kết quả hội đồng trọng tài WSDC (Không có kết quả hòa)
export interface WsdcMatchVerdict {
  winningSide: DebateSide;       // Bắt buộc 'pro' hoặc 'con', không có hòa
  ballotsPro: number;            // Số phiếu cho Ủng hộ (vd: 3-0 hoặc 2-1)
  ballotsOpp: number;            // Số phiếu cho Phản đối
  propTotalScore: number;        // Tổng điểm phe Ủng hộ (3 bài chính + 1 reply)
  oppTotalScore: number;         // Tổng điểm phe Phản đối
  clashPointsAnalysis: Array<{
    title: string;
    description: string;
    winningTeam: DebateSide;
    reason: string;
  }>;
  overallAdjudication: string;   // Lời nhận xét phân xử chính thức của Trưởng ban giám khảo
  bestSpeaker?: {
    name: string;
    role: WsdcSpeakerRole | string;
    score: number;
    reason: string;
  };
}

// Tin nhắn trong sàn đấu tranh biện
export interface DebateMessage {
  id: string;
  sender: 'student' | 'ai_opponent' | 'mentor';
  side?: DebateSide;
  content: string;
  timestamp: string;
  hpDamageDealt?: number;       // Điểm thuyết phục trừ HP đối thủ (nếu có)
  fallacyDetected?: string;     // Lỗi ngụy biện bị phát hiện (nếu có)
  concessionBonus?: boolean;    // Đạt điểm Công tâm khi thừa nhận ý hợp lý của đối thủ
  concessionNote?: string;      // Nhận xét về tinh thần công tâm
  logicScore?: number;          // Điểm logic của lượt nói này (0-100)
  persuasionScore?: number;     // Điểm thuyết phục (0-100)
}

// Trạng thái trận đấu tranh biện (WSDC không có kết quả hòa)
export interface DebateState {
  topic: DebateTopic;
  studentSide: DebateSide;
  studentHP: number;            // 0 - 100
  aiHP: number;                 // 0 - 100
  currentRound: number;         // Hiệp 1 -> 6
  maxRounds: number;
  messages: DebateMessage[];
  status: 'preparing' | 'in_progress' | 'ended_student_won' | 'ended_ai_won';
  isAiThinking: boolean;
  latestMentorAlert?: {
    type: 'warning' | 'praise' | 'neutral';
    text: string;
    advice: string;
  };
  wsdcEvaluation?: WsdcFinalEvaluation;
}

// Bản ghi lịch sử trận đấu tranh biện WSDC (Chỉ có Thắng hoặc Thua, không có Hòa)
export interface DebateMatchRecord {
  id: string;
  topicMotion: string;
  studentSide: DebateSide;
  outcome: 'victory' | 'defeat';
  studentHp: number;
  aiHp: number;
  xpEarned: number;
  roundsCompleted: number;
  personaName?: string;
  date: string;
  timestamp: string;
  wsdcScore?: number;
  steelmanScore?: number;
  concessionCount?: number;
  reflection?: PostMatchReflection; // 2 câu tự hỏi phản tư sau trận
  mode?: 'classic' | 'wsdc_tournament';
  wsdcRole?: WsdcSpeakerRole;
  wsdcVerdict?: WsdcMatchVerdict;
}

// Huy hiệu danh hiệu (Badges)
export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tier: 'dong' | 'bac' | 'vang' | 'kim_cuong';
  isUnlocked: boolean;
  unlockedAt?: string;
  conditionDescription: string;
}

// Nhiệm vụ hàng ngày (Daily Quests)
export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardXP: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

// Người chơi trên Bảng Xếp Hạng FPT High School
export interface LeaderboardUser {
  id: string;
  name: string;
  schoolClass: string;
  avatarSeed: string;
  level: number;
  xp: number;
  title: string;
  debatesWon: number;
  fallaciesFound: number;
  isCurrentUser?: boolean;
}

// Phân loại 5 nhóm kỹ năng trong bài kiểm tra chẩn đoán 20 câu
export type DiagnosticSkillGroupKey = 
  | 'implicit_assumptions'  // Nhận ra giả định ngầm
  | 'logical_validity'      // Suy luận có hợp lệ không
  | 'evidence_strength'     // Đánh giá độ mạnh của bằng chứng
  | 'fallacy_recognition'   // Nhận ra ngụy biện
  | 'fact_vs_opinion';      // Phân biệt sự thật với ý kiến

// Kết quả bài kiểm tra chẩn đoán 20 câu (Bộ A hoặc Bộ B)
export interface DiagnosticTestResult {
  testSet: 'A' | 'B';
  completedAt: string;          // ISO String thời điểm hoàn thành
  timeSpentSeconds: number;     // Thời gian làm bài (giây)
  totalScore: number;           // Điểm tổng 0 - 100
  correctCount: number;         // Số câu đúng 0 - 20
  totalQuestions: number;       // 20
  groupScores: Record<DiagnosticSkillGroupKey, number>; // Điểm 0 - 100 cho từng nhóm
  answers: Record<string, number>; // id câu hỏi -> chỉ số đáp án đã chọn
}

// Lịch sử bài vạch lá tìm sâu được AI chấm thật
export interface EvaluatedFallacyRecord {
  scenarioId: string;
  fallacyName: string;
  score: number;
  logicScore: number;
  identificationScore: number;
  timestamp: string;
}

// Hồ sơ người dùng
export interface UserProfile {
  id: string;                  // ID tài khoản (vd: 'user_nam', 'user_bao')
  username: string;            // Tên đăng nhập
  email?: string;              // Email học sinh (đăng nhập & lưu trữ)
  name: string;
  school: string;
  avatarSeed?: string;
  level: number;
  currentXP: number;
  xp?: number;                 // Đồng bộ hóa với currentXP trên Firestore
  nextLevelXP: number;
  title: string;
  totalDebates: number;
  debatesWon: number;
  fallaciesIdentified: number;
  unlockedBadgeIds: string[];
  soundEnabled: boolean;
  screenShakeEnabled: boolean;
  geminiApiKey: string;
  aiEngineMode: 'gemini_cloud' | 'intelligent_fallback';
  streakCount: number;         // Số ngày duy trì streak liên tục
  lastActiveDate: string;      // Ngày hoạt động gần nhất định dạng YYYY-MM-DD
  // Quản lý nhiệm vụ hàng ngày bền vững tránh nhận thưởng lặp lại
  claimedQuestIds?: string[];
  lastQuestDate?: string;
  // Dữ liệu kiểm tra thực tế & đánh giá AI
  diagnosticTestA?: DiagnosticTestResult;
  diagnosticTestB?: DiagnosticTestResult;
  evaluatedFallaciesHistory?: EvaluatedFallacyRecord[];
  totalEvaluatedSubmissions?: number;
}

// Dữ liệu tài khoản đầy đủ lưu trữ độc lập cho mỗi người dùng
export interface UserAccountData {
  id: string;
  username: string;
  email?: string;
  name: string;
  school: string;
  password?: string;
  avatarSeed?: string;
  profile: UserProfile;
  badges: Badge[];
  quests: DailyQuest[];
  debateHistory: DebateMatchRecord[];
  createdAt: string;
}

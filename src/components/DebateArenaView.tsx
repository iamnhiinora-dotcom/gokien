/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODULE 2: "ĐẤU TRƯỜNG TRANH BIỆN HỌC ĐƯỜNG"
 * Không gian rèn luyện tài đối đáp và tư duy phản biện cho học sinh THPT.
 * Giao diện ấm áp, font chữ Be Vietnam Pro thân thiện, từ ngữ gần gũi và mộc mạc.
 * Tính năng Cố vấn Socrates: Đặt câu hỏi gợi mở để học sinh tự tìm ra ý tưởng từ bên trong.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  DebateTopic, 
  DebateSide, 
  DebateMessage, 
  DebaterPersona, 
  SocraticGuidingQuestion,
  WsdcFinalEvaluation,
  SteelmanEvaluation,
  WsdcSpeakerRole
} from '../types';
import { DEBATE_TOPICS } from '../data/debateTopics';
import { AiDebateService, DEBATER_PERSONAS } from '../services/aiService';
import { useGamification } from '../context/GamificationContext';
import { soundFX } from '../services/soundEffects';
import { WsdcTournamentView } from './WsdcTournamentView';
import { 
  Swords, 
  ShieldCheck, 
  AlertTriangle, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Award, 
  Bot, 
  User, 
  Scale, 
  PlusCircle, 
  CheckCircle2,
  Flame,
  Target,
  Lightbulb,
  Check,
  RefreshCw,
  X,
  BookOpen,
  HelpCircle,
  PenTool,
  ThumbsUp,
  Heart,
  Search,
  ChevronRight,
  Loader2,
  Compass,
  MessageSquare,
  Users,
  Trophy,
  Clock
} from 'lucide-react';
import { DebateTrainingHandbookModal } from './DebateTrainingHandbookModal';

interface DebateArenaViewProps {
  initialSubmode?: '1v1' | 'wsdc';
  onNavigateToWsdc?: () => void;
}

export const DebateArenaView: React.FC<DebateArenaViewProps> = ({ 
  initialSubmode = '1v1',
  onNavigateToWsdc 
}) => {
  const { profile, addXP, recordDebateEnd, saveDebateReflection, unlockBadge } = useGamification();

  // CHẾ ĐỘ ĐẤU TRƯỜNG: 1v1 với AI (mặc định) hoặc WSDC 3v3
  const [arenaMode, setArenaMode] = useState<'1v1' | 'wsdc'>(initialSubmode || '1v1');

  useEffect(() => {
    if (initialSubmode) {
      setArenaMode(initialSubmode);
    }
  }, [initialSubmode]);

  // Cấu hình WSDC khi chọn chế độ WSDC 3v3
  const [wsdcRole, setWsdcRole] = useState<WsdcSpeakerRole>('prop_1');
  const [wsdcReplyChoice, setWsdcReplyChoice] = useState<'self' | 'teammate'>('self');
  const [isWsdcMatchActive, setIsWsdcMatchActive] = useState<boolean>(false);

  // BÀI TẬP TIỀN TRẬN: DỰNG NGƯỜI THÉP (STEELMAN)
  const [showSteelmanModal, setShowSteelmanModal] = useState<boolean>(false);
  const [steelmanText, setSteelmanText] = useState<string>('');
  const [isEvaluatingSteelman, setIsEvaluatingSteelman] = useState<boolean>(false);
  const [steelmanResult, setSteelmanResult] = useState<SteelmanEvaluation | null>(null);
  const [steelmanError, setSteelmanError] = useState<string | null>(null);
  const [steelmanScore, setSteelmanScore] = useState<number | null>(null);
  const hasAwardedSteelmanXp = useRef<boolean>(false);
  const steelmanRewardInFlightRef = useRef(false);
  const steelmanRequestSeqRef = useRef(0);

  // A reward belongs to the current debate attempt, not each modal opening.
  const steelmanRewardKey = () =>
    `gokien_steelman_reward_pending_${profile.id || 'guest'}`;


  // ĐIỂM CÔNG TÂM (CONCESSION BONUS) TRONG TRẬN
  const [concessionCount, setConcessionCount] = useState<number>(0);
  const [concessionToast, setConcessionToast] = useState<string | null>(null);

  // PHẢN TƯ SAU TRẬN ĐẤU (POST-MATCH REFLECTION - BUG-16)
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const currentMatchIdRef = useRef<string | null>(null);
  const [reflectionOpponentPoint, setReflectionOpponentPoint] = useState<string>('');
  const [reflectionOpeningIdea, setReflectionOpeningIdea] = useState<string>('');
  const [isReflectionSaved, setIsReflectionSaved] = useState<boolean>(false);
  const [isSavingReflection, setIsSavingReflection] = useState<boolean>(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const isSavingReflectionRef = useRef<boolean>(false);

  // Trạng thái chuẩn bị trận đấu hay đang thi đấu
  const [isMatchActive, setIsMatchActive] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<DebateTopic>(DEBATE_TOPICS[0]);
  const [customMotion, setCustomMotion] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [studentSide, setStudentSide] = useState<DebateSide>('pro');
  const [selectedPersona, setSelectedPersona] = useState<DebaterPersona>('wsdc_grandmaster');

  // Lọc và tìm kiếm chủ đề trong kho 27 chủ đề huấn luyện
  const [topicCategoryFilter, setTopicCategoryFilter] = useState<string>('all');
  const [topicSearchQuery, setTopicSearchQuery] = useState<string>('');
  const [isHandbookOpen, setIsHandbookOpen] = useState<boolean>(false);

  // Trạng thái trận đấu
  const [studentHp, setStudentHp] = useState<number>(100);
  const [aiHp, setAiHp] = useState<number>(100);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const maxRounds = 6;
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Hiệu ứng chớp đỏ và rung nhẹ
  const [isStudentDamaged, setIsStudentDamaged] = useState<boolean>(false);
  const [isAiDamaged, setIsAiDamaged] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Điểm số nhận xét từ Thầy Giám khảo (chỉ hiện sau lượt đầu tiên)
  const [logicScore, setLogicScore] = useState<number | null>(null);
  const [persuasionScore, setPersuasionScore] = useState<number | null>(null);
  const [debateError, setDebateError] = useState<string | null>(null);
  const [mentorAlert, setMentorAlert] = useState<{
    type: 'warning' | 'praise' | 'neutral';
    text: string;
    advice: string;
    detectedFallacyName?: string;
  }>({
    type: 'neutral',
    text: 'Sàn đấu đã sẵn sàng! Bạn hãy trình bày ý kiến mở đầu thật rõ ràng: có ý chính, giải thích vì sao và kèm theo ví dụ nhé.',
    advice: 'Lưu ý: Nếu lỡ dính bẫy ngụy biện hoặc nói suông thì sẽ bị trừ 20 Máu (HP) đấy!'
  });

  // Modal kết thúc trận đấu (WSDC không có kết quả hòa)
  const [matchResult, setMatchResult] = useState<'victory' | 'defeat' | null>(null);
  const [wsdcEvaluation, setWsdcEvaluation] = useState<WsdcFinalEvaluation | null>(null);

  // TÍNH NĂNG CỐ VẤN SOCRATES (ĐẶT CÂU HỎI ĐỂ HỌC SINH TỰ TÌM Ý TƯỞNG)
  const [showCoachModal, setShowCoachModal] = useState<boolean>(false);
  const [socraticQuestions, setSocraticQuestions] = useState<SocraticGuidingQuestion[]>([]);
  const [activeSocraticIndex, setActiveSocraticIndex] = useState<number>(0);
  const [isLoadingCoach, setIsLoadingCoach] = useState<boolean>(false);
  const [scratchpadAnswer, setScratchpadAnswer] = useState<string>('');
  const [appliedStarterId, setAppliedStarterId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự động giãn nở chiều cao của textarea theo nội dung gõ
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  // Xử lý chọn đề trực tiếp từ Sổ Tay Huấn Luyện
  const handleSelectTopicFromHandbook = (topicId: string) => {
    const found = DEBATE_TOPICS.find(t => t.id === topicId);
    if (found) {
      setSelectedTopic(found);
      setIsCustomMode(false);
      setIsHandbookOpen(false);
    }
  };

  // Bắt đầu trận tranh luận
  const handleStartMatch = () => {
    soundFX.playClick();
    const topicToUse = isCustomMode && customMotion.trim()
      ? {
          id: 'custom_topic',
          motion: customMotion.trim(),
          category: 'hoc_duong' as const,
          background: 'Chủ đề tự chọn do bạn đưa ra để cùng luyện tập.',
          proArgumentsSummary: ['Các lý do ủng hộ sự đổi mới và tiến bộ.'],
          conArgumentsSummary: ['Các lý do lo ngại về rủi ro và tác hại.'],
          difficulty: 'Chien_binh' as const
        }
      : selectedTopic;

    setStudentHp(100);
    setAiHp(100);
    setCurrentRound(1);
    setMatchResult(null);
    setSocraticQuestions([]);
    setScratchpadAnswer('');
    setLogicScore(null);
    setPersuasionScore(null);
    setDebateError(null);
    setConcessionCount(0);
    setConcessionToast(null);
    setReflectionOpponentPoint('');
    setReflectionOpeningIdea('');
    setIsReflectionSaved(false);
    setIsSavingReflection(false);
    setReflectionError(null);
    setCurrentMatchId(null);
    currentMatchIdRef.current = null;
    isSavingReflectionRef.current = false;

    const personaInfo = DEBATER_PERSONAS.find(p => p.id === selectedPersona) || DEBATER_PERSONAS[0];
    const welcomeMsg: DebateMessage = {
      id: 'msg_init',
      sender: 'mentor',
      content: `Trận tranh biện chính thức bắt đầu về chủ đề: "${topicToUse.motion}". Bạn chọn phe ${studentSide === 'pro' ? 'Ủng Hộ' : 'Phản Đối'}. Đối thủ tranh luận cùng bạn là: ${personaInfo.name} (${personaInfo.badge}). Hãy phát biểu tự tin, nếu bí ý tưởng hãy bấm nút "Cố vấn Socrates" để nhận câu hỏi gợi mở nhé. Chúc bạn thi đấu thật hay!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([welcomeMsg]);
    setIsMatchActive(true);
  };

  // Mở bài tập Dựng Người Thép trước khi vào trận
  const handlePrepareMatch = () => {
    soundFX.playClick();
    setSteelmanText('');
    setSteelmanResult(null);
    setSteelmanError(null);
    setSteelmanScore(null);
    steelmanRequestSeqRef.current++;
    steelmanRewardInFlightRef.current = false;
    hasAwardedSteelmanXp.current =
      localStorage.getItem(steelmanRewardKey()) === '1';
    setIsEvaluatingSteelman(false);
    setShowSteelmanModal(true);
  };

  // Thay đổi nội dung Người Thép - hủy kết quả cũ nếu học sinh sửa bài
  const handleSteelmanTextChange = (text: string) => {
    setSteelmanText(text);
    if (steelmanResult !== null || steelmanScore !== null) {
      setSteelmanResult(null);
      setSteelmanScore(null);
    }
    if (steelmanError !== null) {
      setSteelmanError(null);
    }
  };

  // Thẩm định bài Dựng Người Thép qua AI (thang điểm 0 - 10)
  const handleEvaluateSteelman = async () => {
    if (!steelmanText.trim() || isEvaluatingSteelman ||
        steelmanRewardInFlightRef.current) return;
    const requestSeq = ++steelmanRequestSeqRef.current;
    steelmanRewardInFlightRef.current = true;
    setIsEvaluatingSteelman(true);
    setSteelmanError(null);
    soundFX.playClick();

    const topicToUse = isCustomMode && customMotion.trim()
      ? {
          id: 'custom_topic',
          motion: customMotion.trim(),
          category: 'hoc_duong' as const,
          background: 'Chủ đề tự chọn do bạn đưa ra để cùng luyện tập.',
          proArgumentsSummary: ['Các lý do ủng hộ sự đổi mới và tiến bộ.'],
          conArgumentsSummary: ['Các lý do lo ngại về rủi ro và tác hại.'],
          difficulty: 'Chien_binh' as const
        }
      : selectedTopic;

    try {
      const evaluation = await AiDebateService.evaluateSteelman(
        topicToUse,
        studentSide,
        steelmanText.trim(),
        profile.geminiApiKey
      );
      if (requestSeq !== steelmanRequestSeqRef.current) return;

      setSteelmanResult(evaluation);
      setSteelmanScore(evaluation.score);

      if (evaluation.isPassed) {
        soundFX.playSuccess();
        if (!hasAwardedSteelmanXp.current) {
          // Reserve the reward before starting an asynchronous Firestore write.
          hasAwardedSteelmanXp.current = true;
          const awarded = await addXP(
            30, 'Đạt chuẩn bài tập Dựng Người Thép'
          );

          if (awarded === true) {
            localStorage.setItem(steelmanRewardKey(), '1');
            unlockBadge('badge_open_minded');
          } else {
            hasAwardedSteelmanXp.current = false;
            if (requestSeq === steelmanRequestSeqRef.current) {
              setSteelmanError(
                'Bài đã đạt nhưng chưa lưu được 30 XP. Hãy thử lại khi kết nối ổn định.'
              );
            }
          }
        }
      } else {
        soundFX.playHPDamage();
      }
    } catch (err: any) {
      if (requestSeq === steelmanRequestSeqRef.current) {
        setSteelmanError(
          err?.message || 'Chưa thể thẩm định bài Dựng Người Thép. Bấm Thử lại'
        );
      }
    } finally {
      if (requestSeq === steelmanRequestSeqRef.current) {
        steelmanRewardInFlightRef.current = false;
        setIsEvaluatingSteelman(false);
      }
    }
  };

  // Vào trận sau khi hoàn thành Dựng Người Thép
  const handleProceedToDebate = () => {
    setShowSteelmanModal(false);
    handleStartMatch();
  };

  // Lưu phản tư sau trận đấu vào nhật ký (BUG-16: Không tạo trận mới, không cộng trùng XP trận đấu)
  const handleSaveReflection = async () => {
    if (!reflectionOpponentPoint.trim() && !reflectionOpeningIdea.trim()) return;
    if (isSavingReflectionRef.current || isReflectionSaved) return;

    const matchId = currentMatchIdRef.current || currentMatchId;
    if (!matchId) {
      setReflectionError('Không tìm thấy thông tin trận đấu để lưu phản tư.');
      return;
    }

    isSavingReflectionRef.current = true;
    setIsSavingReflection(true);
    setReflectionError(null);

    const reflectionData = {
      opponentThoughtProvokingPoint: reflectionOpponentPoint.trim() || 'Đã ghi nhận góc nhìn đa chiều từ đối thủ.',
      oppositeSideOpeningIdea: reflectionOpeningIdea.trim() || 'Mở đầu bằng việc đặt câu hỏi về gánh nặng thực tế.'
    };

    try {
      const success = await saveDebateReflection(matchId, reflectionData);
      if (success) {
        setIsReflectionSaved(true);
      } else {
        setReflectionError('Chưa thể lưu phản tư lên máy chủ. Bạn hãy bấm Thử lại nhé.');
      }
    } catch (err: any) {
      setReflectionError(err?.message || 'Có lỗi khi lưu phản tư. Hãy bấm Thử lại.');
    } finally {
      isSavingReflectionRef.current = false;
      setIsSavingReflection(false);
    }
  };

  // Gửi lượt nói của học sinh
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isAiThinking || matchResult) return;

    const speech = inputText.trim();
    soundFX.playClick();
    setDebateError(null);

    const studentMsg: DebateMessage = {
      id: `msg_${Date.now()}`,
      sender: 'student',
      side: studentSide,
      content: speech,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, studentMsg];
    setMessages(newHistory);
    setIsAiThinking(true);

    try {
      const activeTopic = isCustomMode && customMotion.trim() 
        ? {
            id: 'custom_topic',
            motion: customMotion.trim(),
            category: 'hoc_duong' as const,
            background: 'Chủ đề tự chọn',
            proArgumentsSummary: ['Lý do ủng hộ'],
            conArgumentsSummary: ['Lý do phản đối'],
            difficulty: 'Chien_binh' as const
          }
        : selectedTopic;

      const result = await AiDebateService.processDebateTurn(
        activeTopic,
        studentSide,
        newHistory,
        speech,
        undefined,
        selectedPersona
      );

      // Điểm Công tâm (Concession Bonus) khi học sinh ghi nhận ý hợp lý của đối thủ trước khi phản bác
      if (result.concessionGranted) {
        setConcessionCount(prev => prev + 1);
        addXP(15, 'Điểm Công tâm: Thừa nhận ý hợp lý của đối thủ');
        unlockBadge('badge_open_minded');
        setConcessionToast(result.concessionNote || '🌟 +15 XP Điểm Công tâm: Bạn đã thừa nhận điểm hợp lý của đối thủ trước khi phản biện!');
        setTimeout(() => setConcessionToast(null), 5000);

        // Cập nhật tin nhắn học sinh có huy hiệu Công tâm
        setMessages(prev => prev.map(m => m.id === studentMsg.id ? {
          ...m,
          concessionBonus: true,
          concessionNote: result.concessionNote
        } : m));
      }

      // Khi lượt nói thành công thì xóa ô nhập để học sinh chuẩn bị lượt tiếp theo
      setInputText('');

      setLogicScore(result.mentorEvaluation.logicScore);
      setPersuasionScore(result.mentorEvaluation.persuasionScore);
      setMentorAlert({
        type: result.mentorEvaluation.type,
        text: result.mentorEvaluation.text,
        advice: result.mentorEvaluation.advice,
        detectedFallacyName: result.mentorEvaluation.detectedFallacyName
      });

      let newStudentHp = studentHp;
      let newAiHp = aiHp;

      if (result.studentHpDeduction > 0) {
        newStudentHp = Math.max(0, studentHp - result.studentHpDeduction);
        setStudentHp(newStudentHp);
        setIsStudentDamaged(true);
        soundFX.playHPDamage();

        if (profile.screenShakeEnabled) {
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 350);
        }
        setTimeout(() => setIsStudentDamaged(false), 800);
      }

      if (result.aiHpDeduction > 0) {
        newAiHp = Math.max(0, aiHp - result.aiHpDeduction);
        setAiHp(newAiHp);
        setIsAiDamaged(true);
        soundFX.playOpponentHit();
        setTimeout(() => setIsAiDamaged(false), 800);
      }

      const aiMsg: DebateMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai_opponent',
        side: studentSide === 'pro' ? 'con' : 'pro',
        content: result.aiDebaterReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hpDamageDealt: result.studentHpDeduction,
        fallacyDetected: result.mentorEvaluation.detectedFallacyName
      };

      setMessages(prev => [...prev, aiMsg]);

      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);

      setSocraticQuestions([]);
      setScratchpadAnswer('');

      if (newAiHp <= 0) {
        triggerEndMatch('victory', newStudentHp, 0);
      } else if (newStudentHp <= 0) {
        triggerEndMatch('defeat', 0, newAiHp);
      } else if (nextRound > maxRounds) {
        // WSDC không có kết quả hòa, phân định thắng thua theo điểm và lượng máu
        if (newStudentHp >= newAiHp) {
          triggerEndMatch('victory', newStudentHp, newAiHp);
        } else {
          triggerEndMatch('defeat', newStudentHp, newAiHp);
        }
      }
    } catch {
      // Giữ nguyên câu học sinh vừa gõ và hiển thị thông báo lỗi kèm nút Thử lại
      setInputText(speech);
      setDebateError('Đối thủ mất kết nối. Bấm Thử lại');
      setMessages(prev => prev.filter(m => m.id !== studentMsg.id));
    } finally {
      setIsAiThinking(false);
    }
  };

  const triggerEndMatch = (outcome: 'victory' | 'defeat', remainingHp: number, opponentHp: number) => {
    setMatchResult(outcome);
    localStorage.removeItem(steelmanRewardKey());
    hasAwardedSteelmanXp.current = false;
    const won = outcome === 'victory';
    const xp = won ? 180 : 60;

    // Tính điểm theo 3 tiêu chí chính thức của WSDC:
    // 1. Nội dung (Content): 40% (40 điểm)
    // 2. Phong cách (Style): 40% (40 điểm)
    // 3. Chiến lược (Strategy): 20% (20 điểm)
    const currentLogic = logicScore ?? 75;
    const currentPersuasion = persuasionScore ?? 75;
    const content = Math.min(40, Math.max(16, Math.round((currentLogic / 100) * 40)));
    const style = Math.min(40, Math.max(16, Math.round((currentPersuasion / 100) * 40)));
    const strategy = Math.min(20, Math.max(8, Math.round((remainingHp / 100) * 12 + 8)));
    const totalWsdc = content + style + strategy;

    const evaluation: WsdcFinalEvaluation = {
      contentScore: content,
      styleScore: style,
      strategyScore: strategy,
      totalScore: totalWsdc,
      contentFeedback: content >= 30
        ? 'Phân tích cơ chế nhân quả (A → B → C) rõ ràng, giải thích logic mạch lạc và dẫn chứng có sức nặng.'
        : 'Cần bổ sung thêm các mắt xích nhân quả trung gian và số liệu kiểm chứng để củng cố chiều sâu luận điểm.',
      styleFeedback: style >= 30
        ? 'Văn phong biểu đạt đĩnh đạc, ngôn từ phản biện sắc bén, tự tin và giàu tính thuyết phục học đường.'
        : 'Cần diễn đạt gãy gọn hơn, tránh lặp lại ý kiến cũ và tăng cường sự truyền cảm trong lời nói.',
      strategyFeedback: strategy >= 15
        ? 'Định vị chuẩn xác điểm tranh chấp cốt lõi (clash points), phân bổ thời gian hợp lý và giữ vững vị thế.'
        : 'Cần ưu tiên phản bác trực diện vào luận cứ then chốt nhất của đối phương trước khi mở rộng luận điểm.',
      generalVerdict: won
        ? 'Hội đồng Giám khảo WSDC phân xử phần thắng thuộc về bạn nhờ sự vượt trội về tính logic và cơ chế chứng minh.'
        : 'Hội đồng Giám khảo WSDC ghi nhận nỗ lực của bạn; đối thủ có ưu thế hơn về cơ sở dữ liệu và chiến lược phòng thủ.'
    };
    setWsdcEvaluation(evaluation);

    const personaNames: Record<DebaterPersona, string> = {
      wsdc_grandmaster: 'Đại kiện tướng WSDC',
      fallacy_hunter: 'Thợ săn ngụy biện',
      strict_prosecutor: 'Công tố viên nghiêm khắc'
    };

    const recordedId = recordDebateEnd({
      topicMotion: isCustomMode && customMotion.trim() ? customMotion.trim() : selectedTopic.motion,
      studentSide,
      outcome,
      studentHp: remainingHp,
      aiHp: opponentHp,
      xpEarned: xp,
      roundsCompleted: Math.min(maxRounds, currentRound),
      personaName: personaNames[selectedPersona] || 'AI Opponent',
      wsdcScore: totalWsdc,
      steelmanScore: steelmanScore ?? undefined,
      concessionCount
    });

    currentMatchIdRef.current = recordedId;
    setCurrentMatchId(recordedId);

    if (won) {
      soundFX.playSuccess();
    } else {
      soundFX.playHPDamage();
    }
  };

  // Mẫu câu gần gũi, tự nhiên cho học sinh
  const insertTemplate = (prefix: string) => {
    soundFX.playClick();
    setInputText(prev => prev ? `${prev} ${prefix} ` : `${prefix} `);
  };

  // Mở modal cố vấn Socrates
  const handleOpenCoachModal = async () => {
    soundFX.playClick();
    setShowCoachModal(true);
    if (socraticQuestions.length === 0) {
      await fetchCoachGuidance();
    }
  };

  const fetchCoachGuidance = async () => {
    setIsLoadingCoach(true);
    try {
      const activeTopic = isCustomMode && customMotion.trim()
        ? {
            id: 'custom_topic',
            motion: customMotion.trim(),
            category: 'hoc_duong' as const,
            background: 'Chủ đề tự chọn',
            proArgumentsSummary: ['Lý do ủng hộ'],
            conArgumentsSummary: ['Lý do phản đối'],
            difficulty: 'Chien_binh' as const
          }
        : selectedTopic;

      const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai_opponent');
      const lastStudentMessage = [...messages].reverse().find(m => m.sender === 'student');
      const studentCurrentThought = inputText.trim() || lastStudentMessage?.content;
      
      const questions = await AiDebateService.generateSocraticGuidingQuestions(
        activeTopic,
        studentSide,
        lastAiMessage?.content,
        profile.geminiApiKey,
        studentCurrentThought
      );

      setSocraticQuestions(questions);
      setActiveSocraticIndex(0);
    } catch (err) {
      console.error('Lỗi khi tải câu hỏi Socrates:', err);
    } finally {
      setIsLoadingCoach(false);
    }
  };

  const handleInsertSentenceStarter = (starterText: string, id: string) => {
    soundFX.playClick();
    setInputText(prev => prev ? `${prev} ${starterText}` : starterText);
    setAppliedStarterId(id);
    setTimeout(() => {
      setAppliedStarterId(null);
    }, 1200);
  };

  const handleApplyScratchpad = () => {
    if (!scratchpadAnswer.trim()) return;
    soundFX.playSuccess();
    const currentQ = socraticQuestions[activeSocraticIndex];
    const starter = currentQ ? `${currentQ.sentenceStarter} ` : '';
    const assembledSpeech = `${starter}${scratchpadAnswer.trim()}`;
    
    setInputText(prev => prev ? `${prev} ${assembledSpeech}` : assembledSpeech);
    setScratchpadAnswer('');
    setShowCoachModal(false);
  };

  if (isWsdcMatchActive) {
    return (
      <WsdcTournamentView
        initialTopic={selectedTopic}
        initialCustomMotion={customMotion}
        initialIsCustomMotion={isCustomMode}
        initialStudentRole={wsdcRole}
        initialStudentReplyChoice={wsdcReplyChoice}
        startImmediately={true}
        onExitTournament={() => setIsWsdcMatchActive(false)}
      />
    );
  }

  return (
    <div className={`max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 ${screenShake ? 'animate-screen-shake' : ''}`}>
      {/* Màn hình 1: Lựa chọn Chủ đề & Bạn tranh luận (Trước trận) */}
      {!isMatchActive ? (
        <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-150">
          {/* Header Đấu trường phản biện + Segmented Control Chuyển Chế Độ */}
          <div className="p-5 sm:p-6 rounded-md bg-[#FFFFFF] border border-[#E5E1D8] shadow-xs text-[#1E2433] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1E2433] leading-snug">
                  Đấu trường phản biện
                </h1>
                <p className="text-[#4A5263] text-xs sm:text-sm mt-0.5 leading-relaxed">
                  Không gian tôi luyện bản lĩnh tranh biện và tư duy logic cho học sinh THPT.
                </p>
              </div>

              {/* Segmented Control: "1v1 với AI" vs "WSDC 3v3" */}
              <div className="flex items-center bg-[#F2EFE8] p-1 rounded border border-[#E5E1D8] self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setArenaMode('1v1');
                  }}
                  className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                    arenaMode === '1v1'
                      ? 'bg-[#FACC15] text-[#1E2433] shadow-xs'
                      : 'text-[#4A5263] hover:text-[#1E2433]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5" />
                    <span>1v1 với AI</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setArenaMode('wsdc');
                  }}
                  className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                    arenaMode === 'wsdc'
                      ? 'bg-[#FACC15] text-[#1E2433] shadow-xs'
                      : 'text-[#4A5263] hover:text-[#1E2433]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-[#A16207]" />
                    <span>WSDC 3v3</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Ô Tóm Tắt Luật - Nội dung đổi theo chế độ đang chọn */}
            <div className="p-3 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-xs text-[#1E2433]">
              {arenaMode === '1v1' ? (
                <div className="flex items-start gap-2">
                  <Swords className="w-4 h-4 text-[#A16207] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="text-[#1E2433]">Luật 1v1: </strong>
                    <span className="text-[#4A5263]">
                      Thanh máu 100 HP, Dựng Người Thép đạt từ 6/10 mới vào trận, điểm Công tâm.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-[#A16207] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="text-[#1E2433]">Luật WSDC: </strong>
                    <span className="text-[#4A5263]">
                      Bài chính 8 phút, Reply 4 phút, POI từ phút 1 đến phút 7, thang 60–80, không có kết quả hòa.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E1D8] shadow-xs rounded-md p-5 sm:p-6 space-y-5">
            {/* 1. Chọn chủ đề */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <label className="font-semibold text-[#1E2433] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#A16207]" />
                  <span>1. Chọn chủ đề tranh luận ({DEBATE_TOPICS.length} chủ đề)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setIsHandbookOpen(true);
                    }}
                    className="px-2.5 py-1 rounded border border-[#D6D1C4] hover:bg-[#F2EFE8] text-[#1E2433] bg-white text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#4A5263]" />
                    <span>Sổ tay PEEL & 4 bước</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCustomMode(!isCustomMode)}
                    className="text-xs text-[#B45309] hover:underline cursor-pointer font-medium"
                  >
                    {isCustomMode ? 'Xem 27 chủ đề có sẵn' : 'Tự nhập chủ đề →'}
                  </button>
                </div>
              </div>

              {!isCustomMode ? (
                <div className="space-y-3">
                  {/* Thanh tìm kiếm & Bộ lọc danh mục */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                      <input
                        type="text"
                        value={topicSearchQuery}
                        onChange={(e) => setTopicSearchQuery(e.target.value)}
                        placeholder="Tìm chủ đề (bài tập, điện thoại, AI, hạt nhân, gen CRISPR, túi nilon...)"
                        className="w-full pl-9 pr-4 py-2 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-xs text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#A16207] transition-colors"
                      />
                      {topicSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setTopicSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1E2433] text-xs cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {[
                        { id: 'all', label: 'Tất cả (27)' },
                        { id: 'giao_duc', label: 'Giáo dục (10)' },
                        { id: 'moi_truong', label: 'Môi trường (6)' },
                        { id: 'y_te_suc_khoe', label: 'Y tế & Sức khỏe (7)' },
                        { id: 'xa_hoi', label: 'Xã hội (4)' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setTopicCategoryFilter(cat.id);
                          }}
                          className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors cursor-pointer ${
                            topicCategoryFilter === cat.id
                              ? 'bg-[#FACC15] text-[#1E2433] font-bold shadow-xs'
                              : 'bg-[#F2EFE8] text-[#4A5263] hover:text-[#1E2433] hover:bg-[#E5E1D8]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Danh sách chủ đề cuộn */}
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {DEBATE_TOPICS
                      .filter(t => {
                        const matchesCat = topicCategoryFilter === 'all' || t.category === topicCategoryFilter;
                        const matchesSearch = !topicSearchQuery.trim() || 
                          t.motion.toLowerCase().includes(topicSearchQuery.toLowerCase()) ||
                          t.background.toLowerCase().includes(topicSearchQuery.toLowerCase());
                        return matchesCat && matchesSearch;
                      })
                      .map(topic => (
                        <div
                          key={topic.id}
                          onClick={() => {
                            soundFX.playClick();
                            setSelectedTopic(topic);
                          }}
                          className={`p-3 rounded border cursor-pointer transition-colors ${
                            selectedTopic.id === topic.id
                              ? 'bg-[#FEF3C7] border-2 border-[#FACC15]'
                              : 'bg-[#FFFFFF] border-[#E5E1D8] hover:border-[#D6D1C4]'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1 text-[11px] text-[#6B7280]">
                            <div className="flex items-center gap-1.5">
                              <span>{topic.categoryLabel || 'Chủ đề'}</span>
                              {topic.motionTypeLabel && (
                                <>
                                  <span>·</span>
                                  <span>{topic.motionTypeLabel}</span>
                                </>
                              )}
                            </div>
                            <span>
                              {topic.difficulty === 'Tap_su' ? 'Dễ nắm bắt' : topic.difficulty === 'Chien_binh' ? 'Cân não' : 'Chuyên sâu WSDC'}
                            </span>
                          </div>

                          <h4 className="font-serif font-bold text-sm text-[#1E2433] leading-snug">
                            {topic.motion}
                          </h4>

                          <p className="text-xs text-[#4A5263] mt-1 line-clamp-2 leading-relaxed">
                            {topic.background}
                          </p>

                          {topic.peelGuidance?.explanation && (
                            <div className="mt-2 pt-1.5 border-t border-[#E5E1D8] text-xs text-[#4A5263] flex items-center gap-1.5">
                              <span className="font-semibold text-[#1E2433] shrink-0">Cơ chế PEEL:</span>
                              <span className="truncate">{topic.peelGuidance.explanation}</span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={customMotion}
                    onChange={(e) => setCustomMotion(e.target.value)}
                    rows={3}
                    placeholder="Nhập chủ đề tranh luận của bạn (Ví dụ: Nhà này sẽ..., Học sinh nên...)"
                    className="w-full p-3 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-sm text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#A16207]"
                  />
                  <span className="text-xs text-[#6B7280]">
                    Gợi ý: Đặt câu chuẩn theo thể thức bắt đầu bằng "Nhà này sẽ..." (chính sách) hoặc "Nhà này tin rằng..." (giá trị).
                  </span>
                </div>
              )}
            </div>

            {/* CÁC BƯỚC TIẾP THEO THAY ĐỔI THEO CHẾ ĐỘ: 1v1 VS WSDC */}
            {arenaMode === '1v1' ? (
              <>
                {/* 2. Chọn phe */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#1E2433] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#A16207]" />
                    <span>2. Chọn phe bạn muốn bảo vệ</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setStudentSide('pro');
                      }}
                      className={`p-3.5 rounded border text-left transition-colors cursor-pointer ${
                        studentSide === 'pro'
                          ? 'bg-[#DBEAFE] border-2 border-[#2563EB]'
                          : 'bg-[#FFFFFF] border-[#E5E1D8] hover:border-[#D6D1C4]'
                      }`}
                    >
                      <div className="font-semibold text-xs sm:text-sm text-[#1E2433] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                        <span>Phe Ủng Hộ (Đồng tình)</span>
                      </div>
                      <div className="text-xs text-[#4A5263] mt-1 leading-relaxed">
                        Đồng ý với chủ đề, đề xuất giải pháp tích cực và phân tích lợi ích.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setStudentSide('con');
                      }}
                      className={`p-3.5 rounded border text-left transition-colors cursor-pointer ${
                        studentSide === 'con'
                          ? 'bg-[#FEE2E2] border-2 border-[#DC2626]'
                          : 'bg-[#FFFFFF] border-[#E5E1D8] hover:border-[#D6D1C4]'
                      }`}
                    >
                      <div className="font-semibold text-xs sm:text-sm text-[#1E2433] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#DC2626]" />
                        <span>Phe Phản Đối (Không đồng tình)</span>
                      </div>
                      <div className="text-xs text-[#4A5263] mt-1 leading-relaxed">
                        Không đồng ý với chủ đề, chỉ ra rủi ro, mặt trái và phương án thay thế.
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Chọn bạn tranh luận cùng */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#1E2433] flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#A16207]" />
                    <span>3. Chọn bạn tranh luận cùng</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {DEBATER_PERSONAS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setSelectedPersona(p.id);
                        }}
                        className={`p-3 rounded border text-left transition-colors cursor-pointer ${
                          selectedPersona === p.id
                            ? 'bg-[#FEF3C7] border-2 border-[#FACC15]'
                            : 'bg-[#FFFFFF] border-[#E5E1D8] hover:border-[#D6D1C4] text-[#4A5263]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-semibold text-xs text-[#1E2433] truncate">{p.name}</span>
                          <span className="text-[10px] text-[#6B7280] font-mono">
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[11px] leading-snug text-[#4A5263]">
                          {p.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nút Bắt đầu 1v1 */}
                <button
                  type="button"
                  onClick={handlePrepareMatch}
                  className="w-full py-2.5 rounded font-bold text-xs sm:text-sm text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] border border-[#D6D1C4] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Target className="w-4 h-4" />
                  <span>Dựng Người Thép & Vào Trận Đấu</span>
                </button>
              </>
            ) : (
              <>
                {/* 2. Chọn 1 trong 6 vai WSDC */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#1E2433] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#A16207]" />
                    <span>2. Chọn 1 vai của bạn (AI sẽ đóng các vai còn lại)</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Phe Ủng hộ */}
                    <div className="p-3 bg-[#DBEAFE]/30 border border-[#93C5FD] rounded space-y-2">
                      <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wide">
                        Phe Ủng Hộ (Proposition)
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { role: 'prop_1' as const, title: 'Diễn giả 1 (Prop 1)', desc: 'Mở màn, định nghĩa và nêu 2 luận điểm chính.' },
                          { role: 'prop_2' as const, title: 'Diễn giả 2 (Prop 2)', desc: 'Tái thiết, phản bác và mở rộng luận điểm thứ 3.' },
                          { role: 'prop_3' as const, title: 'Diễn giả 3 (Prop 3)', desc: 'Tổng kết xung đột then chốt, bảo vệ lập trường.' }
                        ].map(item => (
                          <button
                            key={item.role}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setWsdcRole(item.role);
                            }}
                            className={`w-full text-left p-2.5 rounded border text-xs transition-all cursor-pointer ${
                              wsdcRole === item.role
                                ? 'border-2 border-[#2563EB] bg-[#DBEAFE] text-[#1E2433] font-semibold'
                                : 'border-[#E5E1D8] bg-[#FFFFFF] hover:border-[#D6D1C4] text-[#4A5263]'
                            }`}
                          >
                            <div className="font-bold text-xs text-[#1E2433]">{item.title}</div>
                            <div className="text-[#4A5263] text-[11px] mt-0.5">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Phe Phản đối */}
                    <div className="p-3 bg-[#FEE2E2]/30 border border-[#FCA5A5] rounded space-y-2">
                      <div className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wide">
                        Phe Phản Đối (Opposition)
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { role: 'opp_1' as const, title: 'Diễn giả 1 (Opp 1)', desc: 'Bác bỏ Prop 1 và xây dựng hệ thống ca phản đối.' },
                          { role: 'opp_2' as const, title: 'Diễn giả 2 (Opp 2)', desc: 'Bảo vệ Opp 1, phản bác Prop 2 và mở rộng luận cứ.' },
                          { role: 'opp_3' as const, title: 'Diễn giả 3 (Opp 3)', desc: 'Chốt hạ các điểm nghẽn, làm rõ rủi ro then chốt.' }
                        ].map(item => (
                          <button
                            key={item.role}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setWsdcRole(item.role);
                            }}
                            className={`w-full text-left p-2.5 rounded border text-xs transition-all cursor-pointer ${
                              wsdcRole === item.role
                                ? 'border-2 border-[#DC2626] bg-[#FEE2E2] text-[#1E2433] font-semibold'
                                : 'border-[#E5E1D8] bg-[#FFFFFF] hover:border-[#D6D1C4] text-[#4A5263]'
                            }`}
                          >
                            <div className="font-bold text-xs text-[#1E2433]">{item.title}</div>
                            <div className="text-[#4A5263] text-[11px] mt-0.5">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tùy chọn nói bài Reply nếu là Speaker 1 hoặc 2 */}
                  {(wsdcRole === 'prop_1' || wsdcRole === 'prop_2' || wsdcRole === 'opp_1' || wsdcRole === 'opp_2') && (
                    <div className="p-3 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-xs text-[#1E2433] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <span className="text-[#A16207] font-bold">Bài Kết Luận (Reply 4 phút): </span>
                        <span className="text-[#4A5263]">Bạn là Diễn giả {wsdcRole.includes('1') ? '1' : '2'}, bạn có muốn nói bài Reply không?</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setWsdcReplyChoice('self');
                          }}
                          className={`px-3 py-1 rounded border text-xs font-bold cursor-pointer transition-colors ${
                            wsdcReplyChoice === 'self'
                              ? 'border-[#FACC15] bg-[#FACC15] text-[#1E2433] shadow-xs'
                              : 'border-[#D6D1C4] bg-[#FFFFFF] text-[#4A5263]'
                          }`}
                        >
                          Tôi sẽ nói Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setWsdcReplyChoice('teammate');
                          }}
                          className={`px-3 py-1 rounded border text-xs font-bold cursor-pointer transition-colors ${
                            wsdcReplyChoice === 'teammate'
                              ? 'border-[#FACC15] bg-[#FACC15] text-[#1E2433] shadow-xs'
                              : 'border-[#D6D1C4] bg-[#FFFFFF] text-[#4A5263]'
                          }`}
                        >
                          Để đồng đội AI nói
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nút Bắt đầu WSDC */}
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playGavel();
                    setIsWsdcMatchActive(true);
                  }}
                  className="w-full py-2.5 rounded font-bold text-xs sm:text-sm text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] border border-[#D6D1C4] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Trophy className="w-4 h-4 text-[#A16207]" />
                  <span>Vào phòng thi đấu WSDC</span>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Màn hình 2: Phòng Tranh Luận Đang Diễn Ra */
        <div className="space-y-4">
          {/* Thanh Máu Song Song (HP Header) */}
          <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xs p-3.5 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Bên Học Sinh */}
              <div className={`md:col-span-5 space-y-1 ${isStudentDamaged ? 'animate-hp-damage' : ''}`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#1E2433]">{profile.name}</span>
                    <span className="text-[11px] text-[#6B7280]">
                      ({studentSide === 'pro' ? 'Phe Ủng Hộ' : 'Phe Phản Đối'})
                    </span>
                  </div>
                  <div className="font-mono text-xs font-semibold text-[#1E2433]">
                    {studentHp}/100 HP
                  </div>
                </div>

                <div className="w-full h-2 bg-[#F2EFE8] border border-[#E5E1D8] rounded overflow-hidden relative">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      studentHp > 50 
                        ? 'bg-[#15803D]' 
                        : studentHp > 20 
                        ? 'bg-[#FACC15]' 
                        : 'bg-[#DC2626]'
                    }`}
                    style={{ width: `${studentHp}%` }}
                  />
                  {isStudentDamaged && (
                    <span className="absolute right-1 top-0 text-[10px] font-mono text-[#DC2626] font-bold">
                      -20 HP
                    </span>
                  )}
                </div>
              </div>

              {/* Trung Tâm: Lượt Đấu */}
              <div className="md:col-span-2 text-center text-xs">
                <span className="font-bold text-[#1E2433]">
                  Lượt {currentRound} / {maxRounds}
                </span>
              </div>

              {/* Bên Đối Thủ */}
              <div className={`md:col-span-5 space-y-1 ${isAiDamaged ? 'animate-hp-damage' : ''}`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="font-mono text-xs font-semibold text-[#1E2433]">
                    {aiHp}/100 HP
                  </div>
                  <div className="flex items-center gap-1.5 text-right">
                    <span className="text-[11px] text-[#6B7280]">
                      ({studentSide === 'pro' ? 'Phe Phản Đối' : 'Phe Ủng Hộ'})
                    </span>
                    <span className="font-semibold text-[#1E2433]">
                      {DEBATER_PERSONAS.find(p => p.id === selectedPersona)?.name}
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#F2EFE8] border border-[#E5E1D8] rounded overflow-hidden relative">
                  <div 
                    className={`h-full transition-all duration-300 float-right ${
                      aiHp > 50 
                        ? 'bg-[#15803D]' 
                        : aiHp > 20 
                        ? 'bg-[#FACC15]' 
                        : 'bg-[#DC2626]'
                    }`}
                    style={{ width: `${aiHp}%` }}
                  />
                  {isAiDamaged && (
                    <span className="absolute left-1 top-0 text-[10px] font-mono text-[#15803D] font-bold">
                      -HP
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chủ đề đang tranh luận */}
            <div className="mt-2.5 pt-2 border-t border-[#E5E1D8] flex items-center justify-between text-xs">
              <div className="text-[#4A5263] truncate pr-3">
                <span className="font-semibold text-[#1E2433] mr-1">Chủ đề:</span>
                &ldquo;{isCustomMode && customMotion.trim() ? customMotion : selectedTopic.motion}&rdquo;
              </div>
              <button
                type="button"
                onClick={() => setIsMatchActive(false)}
                className="text-[#6B7280] hover:text-[#1E2433] shrink-0 flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rời phòng</span>
              </button>
            </div>
          </div>

          {/* VÙNG ĐỐI THOẠI & GÓC GÓP Ý */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Cột Trái (8 Cột): Khung Đối Thoại */}
            <div className="lg:col-span-8 flex flex-col h-[520px] bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xs overflow-hidden">
              {/* Lịch sử tin nhắn */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Thông báo điểm công tâm nổi bật */}
                {concessionToast && (
                  <div className="p-2.5 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#A16207] shrink-0" />
                      <span className="font-medium">{concessionToast}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-[#A16207]">+15 XP</span>
                  </div>
                )}

                {messages.map(msg => {
                  if (msg.sender === 'mentor') {
                    return (
                      <div key={msg.id} className="p-3 rounded bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#1E2433] text-center space-y-1">
                        <div className="font-semibold text-[#92400E]">
                          Thầy Giám khảo đồng hành
                        </div>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    );
                  }

                  const isStudent = msg.sender === 'student';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280] px-1">
                        <span className="font-medium text-[#1E2433]">
                          {isStudent ? profile.name : DEBATER_PERSONAS.find(p => p.id === selectedPersona)?.name || 'Đối thủ'}
                        </span>
                        <span>·</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div className={`p-3.5 rounded max-w-[88%] text-sm leading-relaxed ${
                        isStudent 
                          ? 'bg-[#DBEAFE] border border-[#BFDBFE] text-[#1E2433]' 
                          : 'bg-[#FFFFFF] border border-[#E5E1D8] text-[#1E2433]'
                      }`}>
                        {msg.content}

                        {/* Điểm công tâm khi thừa nhận đúng một ý hợp lý của đối thủ */}
                        {msg.concessionBonus && (
                          <div className="mt-2 pt-2 border-t border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-1.5">
                            <span className="bg-[#FEF3C7] px-1.5 py-0.5 rounded font-medium text-[#A16207]">Điểm Công tâm (+15 XP)</span>
                            <span>{msg.concessionNote || 'Đã công tâm thừa nhận một ý hợp lý trước khi phản biện.'}</span>
                          </div>
                        )}

                        {/* Thông báo lỗi ngụy biện nhẹ nhàng */}
                        {msg.fallacyDetected && (
                          <div className="mt-2 pt-1.5 border-t border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Bị trừ 20 HP do lỗi: {msg.fallacyDetected}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isAiThinking && (
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] p-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A16207]" />
                    <span>Đối thủ đang sắp xếp luận điểm...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Thanh Công Cụ Mẫu Câu & Cẩm nang */}
              <div className="px-3 py-2 bg-[#F2EFE8] border-t border-[#E5E1D8] flex items-center justify-between gap-2 overflow-x-auto text-xs">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <span className="text-[#4A5263] shrink-0 mr-1 font-medium">
                    Gợi ý:
                  </span>
                  {[
                    { label: 'Phe bạn cho rằng', text: 'Phe bạn vừa lập luận rằng: "' },
                    { label: 'Điều này sai vì', text: 'Tuy nhiên, quan điểm này chưa thỏa đáng vì:' },
                    { label: 'Cơ chế nhân quả', text: 'Bởi vì xét theo chuỗi tác động nhân quả:' },
                    { label: 'Tóm lại', text: 'Vì vậy, lập luận của phe bạn không đứng vững.' }
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertTemplate(tpl.text)}
                      className="px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#D6D1C4] text-[#1E2433] hover:bg-[#F2EFE8] text-[11px] whitespace-nowrap cursor-pointer transition-colors"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setIsHandbookOpen(true);
                    }}
                    className="px-2 py-0.5 rounded border border-[#D6D1C4] hover:bg-[#F2EFE8] text-[#1E2433] bg-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Sổ tay</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenCoachModal}
                    className="px-2.5 py-0.5 rounded bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Hỏi Socrates</span>
                  </button>
                </div>
              </div>

              {/* Thông báo lỗi khi mất kết nối */}
              {debateError && (
                <div className="px-3 py-2 bg-[#FEE2E2] border-t border-[#FECACA] text-xs text-[#DC2626] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                    <span>{debateError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={isAiThinking}
                    className="px-2 py-0.5 rounded bg-[#DC2626] text-white text-[11px] font-medium cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Ô Nhập Lời Nói & Nút Gửi */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#FFFFFF] border-t border-[#E5E1D8] space-y-1.5">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      rows={2}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isAiThinking || Boolean(matchResult)}
                      placeholder={
                        matchResult 
                          ? 'Trận tranh luận đã kết thúc.' 
                          : 'Nhập ý kiến của bạn (Enter để gửi, Shift+Enter để xuống dòng)...'
                      }
                      className="w-full px-3 py-2 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-sm text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#A16207] disabled:opacity-50 resize-none min-h-[48px] max-h-[160px] leading-relaxed transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isAiThinking || Boolean(matchResult)}
                    className="h-[48px] px-4 rounded bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Phát biểu</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span>Shift + Enter để xuống dòng</span>
                  <span className="font-mono">
                    {wordCount} từ
                  </span>
                </div>
              </form>
            </div>

            {/* Cột Phải (4 Cột): Góc Thầy Giám Khảo */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xs p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D8]">
                  <h3 className="font-serif font-bold text-sm text-[#1E2433]">
                    Thầy Giám khảo đồng hành
                  </h3>
                  <span className="text-[11px] text-[#6B7280]">
                    Lượt {currentRound}/{maxRounds}
                  </span>
                </div>

                {/* Thước Đo: Độ Chặt Chẽ & Sức Thuyết Phục */}
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#4A5263] flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#A16207]" />
                        Độ Chặt Chẽ Của Lý Lẽ
                      </span>
                      <span className="font-mono text-[#1E2433] font-semibold">
                        {logicScore !== null ? `${logicScore}/100` : '--/100'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F2EFE8] border border-[#E5E1D8] rounded overflow-hidden">
                      <div 
                        className="h-full bg-[#FACC15] rounded transition-all duration-300" 
                        style={{ width: `${logicScore !== null ? logicScore : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#4A5263] flex items-center gap-1 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-[#A16207]" />
                        Sức Thuyết Phục Của Lời Nói
                      </span>
                      <span className="font-mono text-[#1E2433] font-semibold">
                        {persuasionScore !== null ? `${persuasionScore}/100` : '--/100'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F2EFE8] border border-[#E5E1D8] rounded overflow-hidden">
                      <div 
                        className="h-full bg-[#FACC15] rounded transition-all duration-300" 
                        style={{ width: `${persuasionScore !== null ? persuasionScore : 0}%` }}
                      />
                    </div>
                  </div>

                  {logicScore === null && (
                    <div className="text-[11px] text-[#6B7280] italic text-center pt-1 border-t border-[#E5E1D8]">
                      Điểm số sẽ được chấm sau lượt phát biểu đầu tiên.
                    </div>
                  )}
                </div>

                {/* Nhận xét của Giám khảo */}
                <div className={`p-3 rounded border space-y-1 ${
                  mentorAlert.type === 'warning'
                    ? 'bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]'
                    : mentorAlert.type === 'praise'
                    ? 'bg-[#DCFCE7] border-[#BBF7D0] text-[#15803D]'
                    : 'bg-[#F2EFE8] border-[#E5E1D8] text-[#1E2433]'
                }`}>
                  <div className="font-semibold flex items-center gap-1.5 text-xs">
                    {mentorAlert.type === 'warning' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                    ) : mentorAlert.type === 'praise' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    ) : (
                      <Scale className="w-3.5 h-3.5 text-[#4A5263] shrink-0" />
                    )}
                    <span>{mentorAlert.type === 'warning' ? 'Lưu ý cần tránh' : 'Nhận xét từ thầy'}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{mentorAlert.text}</p>
                </div>

                {/* Lời khuyên hiệp sau */}
                <div className="p-3 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-[#1E2433] space-y-1">
                  <span className="text-[#1E2433] font-semibold text-xs block">
                    Mẹo cho lượt nói tiếp theo:
                  </span>
                  <p className="text-xs leading-relaxed text-[#4A5263]">{mentorAlert.advice}</p>
                </div>

                {/* Hộp gọi Socrates nhanh */}
                <div className="p-3 rounded bg-[#FEF3C7] border border-[#FDE68A] space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#A16207]" />
                    <span className="font-semibold text-xs text-[#92400E]">Đang bí ý tưởng phản biện?</span>
                  </div>
                  <p className="text-[11px] text-[#4A5263] leading-snug">
                    Không mớm sẵn đáp án đâu nhé! Hãy để thầy Socrates gợi ý 4 câu hỏi giúp bạn tự tìm ra câu trả lời từ chính mình.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCoachModal}
                    className="w-full py-1.5 rounded font-bold text-xs text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] border border-[#D6D1C4] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Mở câu hỏi gợi ý ngay</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CỐ VẤN SOCRATES (TỰ TÌM RA Ý TƯỞNG TỪ BÊN TRONG) */}
      {showCoachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[rgba(15,23,42,0.4)] animate-in fade-in duration-150">
          <div className="bg-[#FFFFFF] w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden rounded-md shadow-xl border border-[#E5E1D8]">
            {/* Header Modal */}
            <div className="p-4 border-b border-[#E5E1D8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#A16207]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1E2433]">
                    Cố Vấn Socrates · Tự Tìm Ra Ý Tưởng Từ Bên Trong
                  </h3>
                  <p className="text-xs text-[#4A5263]">
                    Thầy không đưa sẵn đáp án, mà đặt các câu hỏi giúp bạn tự nhìn ra lỗ hổng của đối phương.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={fetchCoachGuidance}
                  disabled={isLoadingCoach}
                  className="p-1.5 rounded text-[#4A5263] hover:text-[#1E2433] border border-[#E5E1D8] transition-colors cursor-pointer"
                  title="Tải câu hỏi mới"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCoach ? 'animate-spin text-[#A16207]' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowCoachModal(false)}
                  className="p-1.5 rounded text-[#4A5263] hover:text-[#1E2433] border border-[#E5E1D8] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thân Modal */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {isLoadingCoach ? (
                <div className="py-14 text-center space-y-2">
                  <Bot className="w-8 h-8 text-[#A16207] animate-spin mx-auto" />
                  <div className="text-sm font-semibold text-[#1E2433]">Thầy đang đọc lại lời của đối phương để đặt câu hỏi cho bạn...</div>
                  <p className="text-xs text-[#4A5263] max-w-sm mx-auto">
                    Đợi một chút nhé, những câu hỏi hay sẽ giúp bạn khai mở ý tưởng phản biện rất tự nhiên.
                  </p>
                </div>
              ) : socraticQuestions.length > 0 ? (
                <div className="space-y-3.5">
                  {/* 4 Tabs Câu hỏi gợi mở */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { title: '1. Soi mặc định ngầm', badge: 'Họ tự mặc định' },
                      { title: '2. Nhìn vào đời thực', badge: 'Làm thật ra sao?' },
                      { title: '3. Ai chịu thiệt nhất?', badge: 'Người yếu thế' },
                      { title: '4. Giải pháp khôn hơn', badge: 'Phương án khác' }
                    ].map((tab, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveSocraticIndex(idx);
                        }}
                        className={`p-2 rounded border text-left transition-colors cursor-pointer ${
                          activeSocraticIndex === idx
                            ? 'bg-[#FEF3C7] border-2 border-[#FACC15] text-[#1E2433] font-bold'
                            : 'bg-[#F2EFE8] border-[#E5E1D8] text-[#4A5263] hover:bg-[#E5E1D8]'
                        }`}
                      >
                        <div className="text-[10px] text-[#6B7280] font-mono">
                          {tab.badge}
                        </div>
                        <div className="text-xs font-semibold truncate mt-0.5">
                          {tab.title}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Chi tiết câu hỏi đang chọn */}
                  {(() => {
                    const currentQ = socraticQuestions[activeSocraticIndex] || socraticQuestions[0];
                    return (
                      <div className="space-y-3">
                        {/* Hộp câu hỏi lớn */}
                        <div className="p-3.5 sm:p-4 rounded bg-[#F8F6F1] border border-[#E5E1D8] space-y-2.5">
                          <span className="text-[11px] font-semibold text-[#6B7280] flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-[#A16207]" />
                            <span>Câu hỏi gợi mở cho bạn:</span>
                          </span>

                          <h4 className="font-serif text-sm sm:text-base font-bold text-[#1E2433] leading-snug">
                            &ldquo;{currentQ.question}&rdquo;
                          </h4>

                          {/* Câu hỏi phụ để học sinh tự đào sâu */}
                          <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#E5E1D8] space-y-1.5">
                            <span className="text-[11px] text-[#6B7280] font-medium block">
                              Hãy thử tự trả lời 2 câu hỏi nhỏ này:
                            </span>
                            <ul className="space-y-1 text-xs text-[#1E2433]">
                              {currentQ.subQuestions.map((sub, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-[#A16207] font-bold shrink-0">•</span>
                                  <span>{sub}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Điểm mấu chốt */}
                          <div className="text-xs text-[#4A5263] flex items-start gap-2 pt-1 border-t border-[#E5E1D8]">
                            <Lightbulb className="w-3.5 h-3.5 text-[#A16207] shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-[#1E2433]">Gợi ý từ thầy:</strong> {currentQ.insightHint}
                            </span>
                          </div>
                        </div>

                        {/* Mẫu mở đầu câu */}
                        <div className="p-3 rounded bg-[#FFFFFF] border border-[#E5E1D8] space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#4A5263] font-medium flex items-center gap-1.5">
                              <PenTool className="w-3.5 h-3.5 text-[#A16207]" />
                              Mẫu câu mở đầu tự nhiên:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleInsertSentenceStarter(currentQ.sentenceStarter, currentQ.id)}
                              className="text-[#1E2433] hover:text-[#B45309] text-xs flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              {appliedStarterId === currentQ.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#15803D]" />
                                  <span className="text-[#15803D]">Đã chèn vào bài nói!</span>
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>Chèn vào ô phát biểu</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="p-2 rounded bg-[#F8F6F1] border border-[#E5E1D8] text-xs text-[#1E2433] italic font-medium">
                            &ldquo;{currentQ.sentenceStarter} ...&rdquo;
                          </div>
                        </div>

                        {/* Khung nháp câu trả lời */}
                        <div className="p-3.5 rounded bg-[#F8F6F1] border border-[#E5E1D8] space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-[#1E2433] flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-[#A16207]" />
                              <span>Sổ tay nháp câu trả lời của chính bạn:</span>
                            </label>
                            <span className="text-[10px] text-[#6B7280]">
                              Viết tự do bằng lời văn của bạn
                            </span>
                          </div>

                          <textarea
                            rows={3}
                            value={scratchpadAnswer}
                            onChange={(e) => setScratchpadAnswer(e.target.value)}
                            placeholder="Gõ suy nghĩ của bạn sau khi trả lời câu hỏi ở trên (Ví dụ: Thực ra học sinh dùng vì... nên giải pháp cấm sẽ làm...)"
                            className="w-full p-2.5 bg-[#FFFFFF] border border-[#E5E1D8] rounded text-xs sm:text-sm text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#A16207]"
                          />

                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span className="text-[11px] text-[#6B7280]">
                              Bấm nút bên cạnh để đưa suy nghĩ vào ô phản hồi.
                            </span>
                            <button
                              type="button"
                              onClick={handleApplyScratchpad}
                              disabled={!scratchpadAnswer.trim()}
                              className="px-3.5 py-1.5 rounded font-bold text-xs text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] border border-[#D6D1C4] flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Đưa ý kiến này vào phòng đấu</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-10 text-[#6B7280] text-xs">
                  Không thể tải câu hỏi. Hãy thử bấm nút làm mới ở góc phải.
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-3 border-t border-[#E5E1D8] bg-[#F2EFE8] flex items-center justify-between text-xs text-[#4A5263]">
              <span className="text-[11px]">
                Tranh luận vững chắc nhất là khi bạn nói ra điều mình suy nghĩ chân thật và có cơ chế thuyết phục.
              </span>
              <button
                type="button"
                onClick={() => setShowCoachModal(false)}
                className="px-3 py-1 rounded bg-[#FFFFFF] border border-[#D6D1C4] hover:bg-[#F2EFE8] text-[#1E2433] transition-colors cursor-pointer font-medium text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KẾT THÚC TRẬN ĐẤU (WSDC 3 TIÊU CHÍ: NỘI DUNG 40%, PHONG CÁCH 40%, CHIẾN LƯỢC 20%) */}
      {matchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[rgba(15,23,42,0.4)] animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-[#FFFFFF] w-full max-w-lg p-5 sm:p-6 rounded-md shadow-xl border border-[#E5E1D8] space-y-4 my-auto">
            {/* Header Kết Quả */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded border border-[#E5E1D8] bg-[#F2EFE8] flex items-center justify-center">
                {matchResult === 'victory' ? (
                  <Award className="w-6 h-6 text-[#A16207]" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-[#6B7280] font-mono">
                  Đánh giá theo chuẩn tranh biện WSDC
                </span>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1E2433] mt-0.5">
                  {matchResult === 'victory' ? 'Lập luận của bạn vững vàng hơn' : 'Đối thủ có cơ sở dữ liệu thuyết phục hơn'}
                </h2>
                <p className="text-xs text-[#4A5263] mt-1 leading-relaxed">
                  {wsdcEvaluation?.generalVerdict || (
                    matchResult === 'victory'
                      ? 'Lập trường của bạn vững vàng với cơ chế nhân quả thuyết phục hơn.'
                      : 'Đối thủ có ưu thế hơn về cơ sở dữ liệu và chiến lược phòng thủ.'
                  )}
                </p>
              </div>
            </div>

            {/* Bảng Đánh Giá 3 Tiêu Chí WSDC */}
            <div className="p-3.5 rounded bg-[#F8F6F1] border border-[#E5E1D8] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-1.5">
                <span className="text-xs font-semibold text-[#1E2433]">
                  Điểm số 3 tiêu chí WSDC
                </span>
                <span className="text-xs font-mono font-bold text-[#A16207]">
                  Tổng: {wsdcEvaluation?.totalScore ?? 80}/100 Điểm
                </span>
              </div>

              {/* 1. Nội dung (Content 40%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4A5263] font-medium">
                    1. Nội dung (Content - 40%)
                  </span>
                  <span className="font-mono font-semibold text-[#1E2433]">
                    {wsdcEvaluation?.contentScore ?? 32}/40
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#F2EFE8] border border-[#E5E1D8] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#FACC15] rounded transition-all duration-300"
                    style={{ width: `${((wsdcEvaluation?.contentScore ?? 32) / 40) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#4A5263] italic">
                  &ldquo;{wsdcEvaluation?.contentFeedback}&rdquo;
                </p>
              </div>

              {/* 2. Phong cách (Style 40%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4A5263] font-medium">
                    2. Phong cách (Style - 40%)
                  </span>
                  <span className="font-mono font-semibold text-[#1E2433]">
                    {wsdcEvaluation?.styleScore ?? 32}/40
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#F2EFE8] border border-[#E5E1D8] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#FACC15] rounded transition-all duration-300"
                    style={{ width: `${((wsdcEvaluation?.styleScore ?? 32) / 40) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#4A5263] italic">
                  &ldquo;{wsdcEvaluation?.styleFeedback}&rdquo;
                </p>
              </div>

              {/* 3. Chiến lược (Strategy 20%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4A5263] font-medium">
                    3. Chiến lược (Strategy - 20%)
                  </span>
                  <span className="font-mono font-semibold text-[#1E2433]">
                    {wsdcEvaluation?.strategyScore ?? 16}/20
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#F2EFE8] border border-[#E5E1D8] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#FACC15] rounded transition-all duration-300"
                    style={{ width: `${((wsdcEvaluation?.strategyScore ?? 16) / 20) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#4A5263] italic">
                  &ldquo;{wsdcEvaluation?.strategyFeedback}&rdquo;
                </p>
              </div>
            </div>

            {/* Thống kê tài nguyên & Phần thưởng XP */}
            <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#E5E1D8] flex justify-around text-xs">
              <div className="text-center">
                <span className="text-[#6B7280] block text-[11px]">HP của bạn</span>
                <span className="font-mono font-semibold text-[#1E2433]">{studentHp}/100</span>
              </div>
              <div className="border-r border-[#E5E1D8]" />
              <div className="text-center">
                <span className="text-[#6B7280] block text-[11px]">HP đối thủ</span>
                <span className="font-mono font-semibold text-[#1E2433]">{aiHp}/100</span>
              </div>
              <div className="border-r border-[#E5E1D8]" />
              <div className="text-center">
                <span className="text-[#6B7280] block text-[11px]">Kinh nghiệm</span>
                <span className="font-mono font-bold text-[#A16207]">+{matchResult === 'victory' ? 180 : 60} XP</span>
              </div>
            </div>

            {/* Ghi nhận công tâm & Dựng người thép */}
            {(concessionCount > 0 || steelmanScore !== null) && (
              <div className="p-2.5 bg-[#FEF3C7] rounded border border-[#FDE68A] flex flex-wrap items-center justify-between gap-2 text-xs">
                {steelmanScore !== null && (
                  <div className="flex items-center gap-1.5 text-[#1E2433]">
                    <Scale className="w-3.5 h-3.5 text-[#A16207]" />
                    <span>Dựng Người Thép: <strong>{steelmanScore}/10đ</strong></span>
                  </div>
                )}
                {concessionCount > 0 && (
                  <div className="flex items-center gap-1.5 text-[#92400E]">
                    <Sparkles className="w-3.5 h-3.5 text-[#A16207]" />
                    <span>Công tâm: <strong>{concessionCount} lần (+{concessionCount * 15} XP)</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* PHẦN TỰ NHÌN LẠI MÌNH: 2 CÂU HỎI PHẢN TƯ SAU TRẬN ĐẤU */}
            <div className="p-3.5 rounded bg-[#F8F6F1] border border-[#E5E1D8] space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#A16207]" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#1E2433]">Tự Nhìn Lại Mình Sau Trận Đấu</h4>
                    <p className="text-[11px] text-[#6B7280]">2 câu tự hỏi lưu vào Nhật ký thi đấu giúp mở rộng góc nhìn</p>
                  </div>
                </div>
                {isReflectionSaved && (
                  <span className="text-[11px] font-semibold text-[#15803D] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Đã lưu vào Nhật ký (+25 XP)
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-[#1E2433] block mb-1">
                    1. Ý nào của đối thủ làm bạn phải nghĩ lại?
                  </label>
                  <textarea
                    rows={2}
                    value={reflectionOpponentPoint}
                    onChange={(e) => setReflectionOpponentPoint(e.target.value)}
                    placeholder="Ví dụ: Đối thủ chỉ ra rằng chi phí vận hành quá cao và gây áp lực lên học sinh có hoàn cảnh khó khăn..."
                    disabled={isReflectionSaved || isSavingReflection}
                    className="w-full p-2 rounded bg-[#FFFFFF] border border-[#E5E1D8] text-xs text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#A16207] disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#1E2433] block mb-1">
                    2. Nếu đổi phe, bạn sẽ mở đầu thế nào?
                  </label>
                  <textarea
                    rows={2}
                    value={reflectionOpeningIdea}
                    onChange={(e) => setReflectionOpeningIdea(e.target.value)}
                    placeholder="Ví dụ: Nếu ở phe đối lập, tôi sẽ tập trung vào sự bất bình đẳng cơ hội và gánh nặng tài chính..."
                    disabled={isReflectionSaved || isSavingReflection}
                    className="w-full p-2 rounded bg-[#FFFFFF] border border-[#E5E1D8] text-xs text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#A16207] disabled:opacity-60"
                  />
                </div>

                {!isReflectionSaved && (
                  <div className="flex flex-col items-end gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={handleSaveReflection}
                      disabled={isSavingReflection || (!reflectionOpponentPoint.trim() && !reflectionOpeningIdea.trim())}
                      className="px-3.5 py-1.5 rounded text-xs font-bold bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] border border-[#D6D1C4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {isSavingReflection ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang lưu phản tư...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Lưu phản tư vào Nhật ký (+25 XP)</span>
                        </>
                      )}
                    </button>
                    {reflectionError && (
                      <p className="text-[11px] text-[#DC2626] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{reflectionError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Nút hành động */}
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setIsMatchActive(false);
                setMatchResult(null);
                setWsdcEvaluation(null);
              }}
              className="w-full py-2.5 rounded font-bold text-xs sm:text-sm text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] border border-[#D6D1C4] transition-colors cursor-pointer shadow-xs"
            >
              Về Danh Sách Chủ Đề
            </button>
          </div>
        </div>
      )}

      {/* MODAL THỬ THÁCH TIỀN TRẬN: DỰNG NGƯỜI THÉP (STEELMAN ARGUMENT) */}
      {showSteelmanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[rgba(15,23,42,0.4)]">
          <div 
            className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="px-5 py-3.5 border-b border-[#E5E1D8] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-[#A16207]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1E2433]">
                    Dựng Người Thép (Steelman)
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Viết lập luận mạnh nhất của phe đối lập trong 3–5 câu (cần ≥ 6 điểm để vào trận).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  steelmanRequestSeqRef.current++;
                  steelmanRewardInFlightRef.current = false;
                  setIsEvaluatingSteelman(false);
                  setShowSteelmanModal(false);
                }}
                className="p-1 rounded text-[#6B7280] hover:text-[#1E2433] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung Modal */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Tóm tắt chủ đề & Vị thế */}
              <div className="p-3 rounded bg-[#F8F6F1] border border-[#E5E1D8] space-y-1">
                <div className="text-[#1E2433]">
                  <span className="font-semibold text-[#1E2433]">Kiến nghị: </span>
                  &ldquo;{isCustomMode && customMotion.trim() ? customMotion : selectedTopic.motion}&rdquo;
                </div>
                <div className="text-[#4A5263]">
                  Bạn thi đấu phe: <strong className="text-[#1E2433]">{studentSide === 'pro' ? 'Ủng hộ' : 'Phản đối'}</strong> → Cần dựng Người Thép cho phe: <strong className="bg-[#FEF3C7] text-[#92400E] px-1 py-0.5 rounded">{studentSide === 'pro' ? 'Phản đối' : 'Ủng hộ'}</strong>
                </div>
              </div>

              {/* Hướng dẫn nguyên tắc Steelman */}
              <div className="p-3 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#4A5263] leading-relaxed">
                <strong className="text-[#92400E] block mb-0.5">Quy tắc "Dựng Người Thép":</strong>
                Khác với ngụy biện "Người rơm" (bóp méo lời đối thủ để dễ bắt bẻ), người tranh luận công tâm luôn biết cách trình bày quan điểm của đối phương ở trạng thái <em>mạnh mẽ và hợp lý nhất</em>. Hãy viết 3–5 câu công tâm nhất.
              </div>

              {/* Ô soạn thảo */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-[#1E2433]">
                  <span>Lập luận Người Thép của phe đối lập (3–5 câu):</span>
                  <span className="font-mono text-[#6B7280] font-normal">
                    {steelmanText.trim().split(/[.!?]+/).filter(Boolean).length} câu
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={steelmanText}
                  onChange={(e) => handleSteelmanTextChange(e.target.value)}
                  placeholder={`Ví dụ: "Chúng tôi hiểu rằng ${studentSide === 'pro' ? 'phe phản đối' : 'phe ủng hộ'} bảo vệ một giá trị rất chính đáng. Nỗi lo lớn nhất của họ là... Cơ chế thực tế chỉ ra rằng... Do đó, việc thận trọng là có căn cứ."`}
                  className="w-full p-3 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-sm text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#A16207] leading-relaxed"
                />
              </div>

              {/* Nút gửi chấm điểm */}
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">
                  Cần đạt tối thiểu <strong className="text-[#1E2433]">6/10 điểm</strong> để vào trận.
                </span>
                <button
                  type="button"
                  onClick={handleEvaluateSteelman}
                  disabled={!steelmanText.trim() || isEvaluatingSteelman}
                  className="px-4 py-2 rounded font-bold text-xs text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] border border-[#D6D1C4] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {isEvaluatingSteelman ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang chấm độ công tâm...</span>
                    </>
                  ) : (
                    <>
                      <Scale className="w-3.5 h-3.5" />
                      <span>Chấm điểm (0 - 10)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Lỗi nếu có */}
              {steelmanError && (
                <div className="p-2.5 rounded bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                  <span>{steelmanError}</span>
                </div>
              )}

              {/* Kết quả thẩm định Steelman */}
              {steelmanResult && (
                <div className="p-3.5 rounded border border-[#E5E1D8] bg-[#F8F6F1] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="font-mono font-bold text-sm text-[#1E2433]">
                        {steelmanResult.score}/10 điểm
                      </div>
                      <span className="font-semibold text-xs text-[#1E2433]">
                        {steelmanResult.isPassed 
                          ? '✓ Đạt yêu cầu công tâm' 
                          : 'Chưa đạt (Cần ≥ 6 điểm)'}
                      </span>
                    </div>
                    {steelmanResult.isPassed && steelmanResult.score >= 6 && (
                      <span className="text-[11px] text-[#15803D] font-bold">
                        {hasAwardedSteelmanXp.current
                          ? 'Đã xử lý thưởng Steelman cho lượt này'
                          : 'Đã đạt yêu cầu Steelman'}
                      </span>
                    )}
                  </div>

                  {/* Nhận định về tính công tâm theo phe đối lập */}
                  <div className="text-xs space-y-1">
                    <span className="text-[#6B7280] font-medium">Góc nhìn phe đối lập:</span>
                    <p className="italic text-[#1E2433] pl-2 border-l-2 border-[#D6D1C4]">
                      &ldquo;{steelmanResult.fairnessAppraisal}&rdquo;
                    </p>
                  </div>

                  {/* Lời nhận xét chuyên môn */}
                  <div className="text-xs text-[#4A5263]">
                    <strong className="text-[#1E2433]">Nhận xét: </strong>
                    <span>{steelmanResult.feedback}</span>
                  </div>

                  {/* Nút vào trận khi đã đạt */}
                  {steelmanResult.isPassed && steelmanResult.score >= 6 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleProceedToDebate}
                        className="w-full py-2.5 rounded font-bold text-xs sm:text-sm text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] border border-[#D6D1C4] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Swords className="w-4 h-4" />
                        <span>Vào phòng tranh luận</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sổ Tay Huấn Luyện Tranh Biện WSDC & M-A-C-R-E */}
      <DebateTrainingHandbookModal
        isOpen={isHandbookOpen}
        onClose={() => setIsHandbookOpen(false)}
        onSelectTopicToDebate={handleSelectTopicFromHandbook}
      />
    </div>
  );
};

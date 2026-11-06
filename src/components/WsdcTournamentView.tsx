/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODULE THI ĐẤU WSDC NÂNG CAO (WORLD SCHOOLS DEBATING CHAMPIONSHIP)
 * Thể thức chuẩn quốc tế:
 * 1. Mỗi phe 3 diễn giả, 6 bài chính 8 phút xen kẽ (bắt đầu từ Ủng hộ), 2 bài kết luận (reply) 4 phút (Phản đối nói trước).
 * 2. Học sinh chọn 1 vai, AI đóng các vai còn lại. Hỗ trợ cả gõ chữ lẫn giọng nói (STT & TTS).
 * 3. POI chỉ được đưa từ phút 1:00 đến 7:00; phút đầu và phút cuối là thời gian bảo vệ; bài reply không có POI; người đang nói được từ chối POI.
 * 4. Chấm mỗi bài thang 60-80 (Nội dung 24-32, Phong cách 24-32, Chiến lược 12-16); bài reply tính nửa điểm (30-40); không có kết quả hòa.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  DebateTopic, 
  DebateSide, 
  WsdcSpeakerRole, 
  WsdcRoleMeta,
  WsdcPoiItem, 
  WsdcSpeechRecord, 
  WsdcSpeechScore,
  WsdcMatchVerdict 
} from '../types';
import { DEBATE_TOPICS } from '../data/debateTopics';
import { AiDebateService } from '../services/aiService';
import { useGamification } from '../context/GamificationContext';
import { soundFX } from '../services/soundEffects';
import { 
  Trophy, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Users, 
  ChevronRight, 
  Sparkles, 
  Award, 
  ShieldAlert, 
  Hand, 
  X, 
  Check, 
  FileText, 
  BarChart3, 
  HelpCircle,
  Radio,
  BookOpen,
  ArrowRight
} from 'lucide-react';

// Bảng cấu hình 8 bài phát biểu theo chuẩn WSDC
export const WSDC_SPEECH_ORDER: WsdcRoleMeta[] = [
  {
    role: 'prop_1',
    order: 1,
    side: 'pro',
    speakerTitle: 'Diễn giả 1 Phe Ủng hộ (Prop 1)',
    shortTitle: 'P1 · Mở màn',
    speechType: 'main',
    allocatedMinutes: 8,
    allowsPoi: true,
    dutyDescription: 'Định nghĩa kiến nghị, đưa mô hình/chính sách và trình bày 2 luận điểm cốt lõi đầu tiên.'
  },
  {
    role: 'opp_1',
    order: 2,
    side: 'con',
    speakerTitle: 'Diễn giả 1 Phe Phản đối (Opp 1)',
    shortTitle: 'O1 · Khởi động',
    speechType: 'main',
    allocatedMinutes: 8,
    allowsPoi: true,
    dutyDescription: 'Phản hồi định nghĩa, bác bỏ Prop 1 và thiết lập hệ thống luận điểm của phe Phản đối.'
  },
  {
    role: 'prop_2',
    order: 3,
    side: 'pro',
    speakerTitle: 'Diễn giả 2 Phe Ủng hộ (Prop 2)',
    shortTitle: 'P2 · Tái thiết',
    speechType: 'main',
    allocatedMinutes: 8,
    allowsPoi: true,
    dutyDescription: 'Bảo vệ Prop 1, bẻ gãy đòn tấn công của Opp 1 và mở rộng luận điểm thứ 3.'
  },
  {
    role: 'opp_2',
    order: 4,
    side: 'con',
    speakerTitle: 'Diễn giả 2 Phe Phản đối (Opp 2)',
    shortTitle: 'O2 · Phản công',
    speechType: 'main',
    allocatedMinutes: 8,
    allowsPoi: true,
    dutyDescription: 'Bảo vệ Opp 1, phản bác Prop 2 và mở rộng luận điểm thứ 3 của phe Phản đối.'
  },
  {
    role: 'prop_3',
    order: 5,
    side: 'pro',
    speakerTitle: 'Diễn giả 3 Phe Ủng hộ (Prop 3)',
    shortTitle: 'P3 · Đụng độ',
    speechType: 'main',
    allocatedMinutes: 8,
    allowsPoi: true,
    dutyDescription: 'Bài phản biện tổng lực. Giải quyết các điểm nghẽn (clash points), KHÔNG đưa luận điểm mới.'
  },
  {
    role: 'opp_3',
    order: 6,
    side: 'con',
    speakerTitle: 'Diễn giả 3 Phe Phản đối (Opp 3)',
    shortTitle: 'O3 · Chốt hạ',
    speechType: 'main',
    allocatedMinutes: 8,
    allowsPoi: true,
    dutyDescription: 'Bài phản biện chốt hạ của phe Phản đối. Phá vỡ thế giới của phe Ủng hộ, KHÔNG đưa luận điểm mới.'
  },
  {
    role: 'opp_reply',
    order: 7,
    side: 'con',
    speakerTitle: 'Bài kết luận Phe Phản đối (Opp Reply)',
    shortTitle: 'OR · Kết luận',
    speechType: 'reply',
    allocatedMinutes: 4,
    allowsPoi: false,
    dutyDescription: 'Do Opp 1 hoặc 2 nói. KHÔNG POI, KHÔNG LUẬN ĐIỂM MỚI. So sánh 2 thế giới và chứng minh vì sao Opp thắng.'
  },
  {
    role: 'prop_reply',
    order: 8,
    side: 'pro',
    speakerTitle: 'Bài kết luận Phe Ủng hộ (Prop Reply)',
    shortTitle: 'PR · Tổng kết',
    speechType: 'reply',
    allocatedMinutes: 4,
    allowsPoi: false,
    dutyDescription: 'Do Prop 1 hoặc 2 nói. KHÔNG POI, KHÔNG LUẬN ĐIỂM MỚI. Đúc kết trận đấu và khẳng định giá trị phe Ủng hộ bảo vệ.'
  }
];

export interface WsdcTournamentViewProps {
  initialTopic?: DebateTopic;
  initialCustomMotion?: string;
  initialIsCustomMotion?: boolean;
  initialStudentRole?: WsdcSpeakerRole;
  initialStudentReplyChoice?: 'self' | 'teammate';
  startImmediately?: boolean;
  onExitTournament?: () => void;
}

export const WsdcTournamentView: React.FC<WsdcTournamentViewProps> = ({
  initialTopic,
  initialCustomMotion,
  initialIsCustomMotion,
  initialStudentRole,
  initialStudentReplyChoice,
  startImmediately = false,
  onExitTournament
}) => {
  const { profile, addXP, recordDebateEnd } = useGamification();

  // TRẠNG THÁI CHUNG
  const [matchState, setMatchState] = useState<'setup' | 'in_progress' | 'ended'>(
    startImmediately ? 'in_progress' : 'setup'
  );
  const [selectedTopic, setSelectedTopic] = useState<DebateTopic>(initialTopic || DEBATE_TOPICS[0]);
  const [customMotion, setCustomMotion] = useState<string>(initialCustomMotion || '');
  const [isCustomMotion, setIsCustomMotion] = useState<boolean>(initialIsCustomMotion || false);
  
  // VAI TRÒ HỌC SINH CHỌN (Prop 1, 2, 3 hoặc Opp 1, 2, 3)
  const [studentRole, setStudentRole] = useState<WsdcSpeakerRole>(initialStudentRole || 'prop_1');
  const [studentReplyChoice, setStudentReplyChoice] = useState<'self' | 'teammate'>(initialStudentReplyChoice || 'self');

  // TIẾN TRÌNH TRẬN ĐẤU (8 BÀI PHÁT BIỂU)
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState<number>(0);
  const currentMeta = WSDC_SPEECH_ORDER[currentSpeechIndex] || WSDC_SPEECH_ORDER[0];

  // DANH SÁCH BÀI PHÁT BIỂU ĐÃ HOÀN THÀNH
  const [completedSpeeches, setCompletedSpeeches] = useState<WsdcSpeechRecord[]>([]);

  // ĐỒNG HỒ & BẢO VỆ POI
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSpeed, setTimerSpeed] = useState<number>(1); // 1x bình thường, có thể tua 2x / 4x khi luyện tập nhanh

  // NHẬP LIỆU BÀI NÓI
  const [inputText, setInputText] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [isEvaluatingSpeech, setIsEvaluatingSpeech] = useState<boolean>(false);

  // GIỌNG NÓI (SPEECH-TO-TEXT VÀ TEXT-TO-SPEECH)
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [isTtsSpeaking, setIsTtsSpeaking] = useState<boolean>(false);
  const [autoTtsEnabled, setAutoTtsEnabled] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // CÂU HỎI XEN (POI)
  const [incomingAiPoi, setIncomingAiPoi] = useState<WsdcPoiItem | null>(null);
  const [isOfferingPoiToAi, setIsOfferingPoiToAi] = useState<boolean>(false);
  const [studentPoiInput, setStudentPoiInput] = useState<string>('');
  const [activeSpeechPois, setActiveSpeechPois] = useState<WsdcPoiItem[]>([]);
  const [hasPromptedAiPoiThisTurn, setHasPromptedAiPoiThisTurn] = useState<boolean>(false);

  // KẾT QUẢ VÀ BẢNG ĐIỂM
  const [currentScoreModal, setCurrentScoreModal] = useState<WsdcSpeechRecord | null>(null);
  const [matchVerdict, setMatchVerdict] = useState<WsdcMatchVerdict | null>(null);
  const [showScoresheetTab, setShowScoresheetTab] = useState<boolean>(false);

  // Xác định bài phát biểu hiện tại là do Học sinh hay AI nói
  const isCurrentSpeakerStudent = useCallback((): boolean => {
    if (currentMeta.speechType === 'main') {
      return currentMeta.role === studentRole;
    }
    // Bài Reply (opp_reply hoặc prop_reply):
    if (currentMeta.role === 'prop_reply') {
      return (studentRole === 'prop_1' || studentRole === 'prop_2') && studentReplyChoice === 'self';
    }
    if (currentMeta.role === 'opp_reply') {
      return (studentRole === 'opp_1' || studentRole === 'opp_2') && studentReplyChoice === 'self';
    }
    return false;
  }, [currentMeta, studentRole, studentReplyChoice]);

  // Kiểm tra thời gian bảo vệ POI theo luật WSDC
  const isPoiAllowedNow = useCallback((): boolean => {
    if (!currentMeta.allowsPoi) return false; // Bài Reply không có POI
    // Trong bài chính 8 phút (480s):
    // 0s - 60s: Được bảo vệ (phút thứ 1)
    // 60s - 420s: MỞ NHẬN POI (phút 1 đến phút 7)
    // 420s - 480s: Được bảo vệ (phút cuối cùng)
    return elapsedSeconds >= 60 && elapsedSeconds < 420;
  }, [currentMeta, elapsedSeconds]);

  // Đồng hồ đếm thời gian và chuông tín hiệu WSDC
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          const maxSec = currentMeta.allocatedMinutes * 60;

          // Chuông báo 1:00 (mở POI)
          if (currentMeta.allowsPoi && next === 60) {
            soundFX.playBellOnce();
          }

          // Chuông báo 7:00 (đóng POI)
          if (currentMeta.allowsPoi && next === 420) {
            soundFX.playBellOnce();
          }

          // Chuông báo hết giờ (8:00 hoặc 4:00 reply)
          if (next === maxSec) {
            soundFX.playBellTwice();
          }

          return next;
        });
      }, 1000 / timerSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSpeed, currentMeta]);

  // Tự động kích hoạt POI từ AI khi học sinh đang nói ở khoảng phút 2 đến phút 5
  useEffect(() => {
    if (
      matchState === 'in_progress' &&
      isCurrentSpeakerStudent() &&
      isPoiAllowedNow() &&
      !hasPromptedAiPoiThisTurn &&
      elapsedSeconds >= 120 && 
      inputText.length > 80
    ) {
      // 50% cơ hội AI xin POI khi học sinh đã trình bày được một đoạn
      setHasPromptedAiPoiThisTurn(true);
      AiDebateService.offerAiPoi(
        selectedTopic,
        currentMeta.role,
        inputText
      ).then(res => {
        if (res && res.questionText) {
          soundFX.playBellOnce();
          const opposingSide: DebateSide = currentMeta.side === 'pro' ? 'con' : 'pro';
          setIncomingAiPoi({
            id: `poi_${Date.now()}`,
            speakerRole: currentMeta.role,
            questionerSide: opposingSide,
            questionerName: opposingSide === 'pro' ? 'Diễn giả Phe Ủng hộ' : 'Diễn giả Phe Phản đối',
            targetRole: currentMeta.role,
            timestampSeconds: elapsedSeconds,
            questionText: res.questionText,
            status: 'offered'
          });
        }
      }).catch(() => {});
    }
  }, [matchState, isCurrentSpeakerStudent, isPoiAllowedNow, hasPromptedAiPoiThisTurn, elapsedSeconds, inputText, selectedTopic, currentMeta]);

  // Khởi tạo Web Speech Recognition (Giọng nói tiếng Việt)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            setInputText(prev => prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim());
          }
        };

        recognition.onerror = () => {
          setIsListeningMic(false);
        };

        recognition.onend = () => {
          setIsListeningMic(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Bật/tắt micro thu âm
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ thu âm Web Speech tiếng Việt. Vui lòng sử dụng gõ bàn phím.');
      return;
    }
    if (isListeningMic) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningMic(true);
        if (!isTimerRunning) setIsTimerRunning(true);
      } catch {
        setIsListeningMic(false);
      }
    }
  };

  // Đọc to bài phát biểu (Text-to-Speech)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (isTtsSpeaking) {
      setIsTtsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VIE'));
    if (viVoice) utterance.voice = viVoice;
    utterance.rate = 1.05;

    utterance.onstart = () => setIsTtsSpeaking(true);
    utterance.onend = () => setIsTtsSpeaking(false);
    utterance.onerror = () => setIsTtsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopTts = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTtsSpeaking(false);
    }
  };

  // Bắt đầu trận đấu WSDC
  const handleStartTournament = () => {
    soundFX.playGavel();
    const topicToUse = isCustomMotion && customMotion.trim()
      ? {
          id: 'custom_wsdc',
          motion: customMotion.trim(),
          category: 'xa_hoi' as const,
          background: 'Kiến nghị mở rộng do học sinh thiết lập theo thể thức WSDC.',
          proArgumentsSummary: ['Hệ thống luận điểm ủng hộ.'],
          conArgumentsSummary: ['Hệ thống luận điểm phản đối.'],
          difficulty: 'Cao_thu' as const
        }
      : selectedTopic;

    setSelectedTopic(topicToUse);
    setCompletedSpeeches([]);
    setCurrentSpeechIndex(0);
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setInputText('');
    setActiveSpeechPois([]);
    setIncomingAiPoi(null);
    setHasPromptedAiPoiThisTurn(false);
    setMatchVerdict(null);
    setMatchState('in_progress');
  };

  // Diễn giả AI tự động phát biểu lượt của mình
  const handleGenerateAiSpeech = async () => {
    setIsAiGenerating(true);
    stopTts();
    try {
      const result = await AiDebateService.generateWsdcSpeech(
        selectedTopic,
        currentMeta.role,
        completedSpeeches,
        activeSpeechPois
      );

      // Điểm chuẩn WSDC cho bài AI
      const isReply = currentMeta.speechType === 'reply';
      const baseTotal = isReply ? 35 : 71;
      const score: WsdcSpeechScore = {
        content: isReply ? 14 : 29,
        style: isReply ? 14 : 28,
        strategy: isReply ? 7 : 14,
        total: baseTotal,
        contentFeedback: 'Lập luận sắc bén, cơ chế nhân quả rõ ràng và dẫn chứng bám sát bối cảnh.',
        styleFeedback: 'Văn phong đĩnh đạc, bố cục mạch lạc chuẩn mực WSDC.',
        strategyFeedback: 'Thực hiện đúng trách nhiệm vai trò của diễn giả.'
      };

      const record: WsdcSpeechRecord = {
        role: currentMeta.role,
        side: currentMeta.side,
        speakerName: currentMeta.speakerTitle,
        isStudent: false,
        transcript: result.transcript,
        audioDurationSeconds: currentMeta.allocatedMinutes * 60,
        pois: [...activeSpeechPois],
        score
      };

      setCompletedSpeeches(prev => [...prev, record]);
      soundFX.playSuccess();

      // Đọc to nếu auto TTS bật
      if (autoTtsEnabled) {
        speakText(result.transcript.slice(0, 400));
      }

      // Chuyển sang bài tiếp theo hoặc phân xử nếu là bài cuối cùng
      advanceToNextSpeech([...completedSpeeches, record]);
    } catch {
      alert('Có lỗi khi tạo bài nói của AI. Vui lòng bấm Thử lại.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Học sinh nộp bài phát biểu
  const handleSubmitStudentSpeech = async () => {
    if (!inputText.trim() || inputText.trim().split(/\s+/).length < 20) {
      alert('Bài phát biểu của bạn còn quá ngắn (cần ít nhất 20 từ). Hãy trình bày ý tưởng hoàn chỉnh hơn nhé!');
      return;
    }

    setIsEvaluatingSpeech(true);
    setIsTimerRunning(false);
    stopTts();
    if (isListeningMic && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    }

    try {
      const evaluation = await AiDebateService.evaluateWsdcSpeech(
        selectedTopic,
        currentMeta.role,
        currentMeta.speechType,
        inputText,
        activeSpeechPois
      );

      const record: WsdcSpeechRecord = {
        role: currentMeta.role,
        side: currentMeta.side,
        speakerName: `Bạn (${profile.name || 'Học sinh'})`,
        isStudent: true,
        transcript: inputText,
        audioDurationSeconds: elapsedSeconds,
        pois: [...activeSpeechPois],
        score: evaluation.scores,
        aiSuggestedImprovements: evaluation.aiSuggestedImprovements
      };

      const updated = [...completedSpeeches, record];
      setCompletedSpeeches(updated);
      setCurrentScoreModal(record);
      soundFX.playSuccess();

      // Thưởng XP dựa trên điểm số WSDC
      const xpGained = currentMeta.speechType === 'reply'
        ? Math.round((evaluation.scores.total - 30) * 10 + 50)
        : Math.round((evaluation.scores.total - 60) * 5 + 80);
      addXP(Math.max(30, xpGained), `Hoàn thành bài nói ${currentMeta.shortTitle}`);

      advanceToNextSpeech(updated);
    } catch {
      alert('Không thể kết nối đến ban giám khảo AI. Vui lòng bấm nộp lại.');
    } finally {
      setIsEvaluatingSpeech(false);
    }
  };

  // Chuyển sang bài phát biểu kế tiếp trong thứ tự WSDC
  const advanceToNextSpeech = (allSpeeches: WsdcSpeechRecord[]) => {
    if (currentSpeechIndex < 7) {
      setCurrentSpeechIndex(prev => prev + 1);
      setElapsedSeconds(0);
      setIsTimerRunning(false);
      setInputText('');
      setActiveSpeechPois([]);
      setIncomingAiPoi(null);
      setHasPromptedAiPoiThisTurn(false);
    } else {
      // Đã nói xong cả 8 bài -> Chuyển sang Phán xử Hội đồng Trọng tài
      handleConcludeTournament(allSpeeches);
    }
  };

  // Hội đồng trọng tài phân xử chung cuộc
  const handleConcludeTournament = async (allSpeeches: WsdcSpeechRecord[]) => {
    soundFX.playGavel();
    setMatchState('ended');
    try {
      const verdict = await AiDebateService.adjudicateWsdcTournament(selectedTopic, allSpeeches);
      
      // Tính tổng điểm từng phe
      let propTotal = 0;
      let oppTotal = 0;
      allSpeeches.forEach(s => {
        const score = s.score?.total || (s.role.includes('reply') ? 35 : 70);
        if (s.side === 'pro') propTotal += score;
        else oppTotal += score;
      });

      const fullVerdict: WsdcMatchVerdict = {
        ...verdict,
        propTotalScore: propTotal,
        oppTotalScore: oppTotal
      };

      setMatchVerdict(fullVerdict);

      // Lưu kết quả vào Gamification Context
      const studentSide: DebateSide = studentRole.startsWith('prop') ? 'pro' : 'con';
      const isWon = fullVerdict.winningSide === studentSide;
      recordDebateEnd(isWon ? 'victory' : 'defeat');
      addXP(isWon ? 200 : 100, `Hoàn thành giải đấu WSDC (${isWon ? 'Chiến thắng' : 'Á quân'})`);
    } catch {
      // Fallback
    }
  };

  // Học sinh chấp nhận POI của AI
  const handleAcceptAiPoi = () => {
    if (!incomingAiPoi) return;
    soundFX.playClick();
    const accepted: WsdcPoiItem = {
      ...incomingAiPoi,
      status: 'accepted'
    };
    setActiveSpeechPois(prev => [...prev, accepted]);
    setInputText(prev => `${prev}\n\n[Trả lời POI của đối thủ]: `);
    setIncomingAiPoi(null);
  };

  // Học sinh từ chối POI của AI
  const handleDeclineAiPoi = () => {
    if (!incomingAiPoi) return;
    soundFX.playClick();
    const declined: WsdcPoiItem = {
      ...incomingAiPoi,
      status: 'declined'
    };
    setActiveSpeechPois(prev => [...prev, declined]);
    setIncomingAiPoi(null);
  };

  // Học sinh đưa câu hỏi xen POI khi AI đang nói
  const handleStudentSubmitPoi = async () => {
    if (!studentPoiInput.trim()) return;
    soundFX.playClick();
    setIsOfferingPoiToAi(false);

    try {
      const res = await AiDebateService.respondToStudentPoi(
        selectedTopic,
        currentMeta.role,
        'Nội dung đang trình bày',
        studentPoiInput.trim()
      );

      const poiItem: WsdcPoiItem = {
        id: `poi_student_${Date.now()}`,
        speakerRole: currentMeta.role,
        questionerSide: studentRole.startsWith('prop') ? 'pro' : 'con',
        questionerName: `Bạn (${profile.name})`,
        targetRole: currentMeta.role,
        timestampSeconds: elapsedSeconds,
        questionText: studentPoiInput.trim(),
        status: res.status as any,
        replyText: res.replyText
      };

      setActiveSpeechPois(prev => [...prev, poiItem]);
      setStudentPoiInput('');

      if (res.status === 'accepted') {
        soundFX.playSuccess();
        alert(`Diễn giả AI chấp nhận POI!\nAI phản hồi: "${res.replyText}"`);
      } else {
        soundFX.playClick();
        alert(`Diễn giả AI từ chối POI: "${res.replyText}"`);
      }
    } catch {
      alert('Không thể gửi POI lúc này.');
    }
  };

  // Định dạng thời gian mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const maxSpeechSeconds = currentMeta.allocatedMinutes * 60;
  const timeProgressPercent = Math.min(100, (elapsedSeconds / maxSpeechSeconds) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* 1. MÀN HÌNH CHUẨN BỊ (SETUP STAGE) */}
      {matchState === 'setup' && (
        <div className="space-y-6">
          {/* Header Giới Thiệu Chế Độ Thi Đấu WSDC */}
          <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xs p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E1D8] pb-4 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] mb-2">
                  <Trophy className="w-3.5 h-3.5 text-[#A16207]" />
                  Chuẩn Tranh Biện Quốc Tế WSDC
                </div>
                <h1 className="text-2xl font-serif font-bold text-[#1E2433] tracking-tight">
                  Thi Đấu WSDC Nâng Cao (3 vs 3)
                </h1>
                <p className="text-sm text-[#4A5263] mt-1">
                  Đúng thể thức World Schools: 3 diễn giả mỗi phe, 8 phút mỗi bài chính, 4 phút bài Reply (phe Phản đối nói trước).
                </p>
              </div>

              {/* Tóm Tắt Quy Tắc WSDC Cốt Lõi */}
              <div className="bg-[#F2EFE8] border border-[#E5E1D8] p-3 rounded text-xs text-[#4A5263] space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#A16207]" />
                  <span>Bài chính: <strong className="text-[#1E2433]">8 phút</strong> | Reply: <strong className="text-[#1E2433]">4 phút</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Hand className="w-3.5 h-3.5 text-[#A16207]" />
                  <span>POI: <strong className="text-[#1E2433]">Chỉ từ phút 1 đến phút 7</strong> (phút đầu/cuối bảo vệ)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>Thang điểm: <strong className="text-[#1E2433]">60–80</strong> (Nội dung 24–32, Phong cách 24–32, Chiến lược 12–16)</span>
                </div>
              </div>
            </div>

            {/* Bước 1: Chọn Kiến Nghị (Motion) */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-semibold text-[#1E2433] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#A16207]" />
                Bước 1: Chọn Kiến Nghị Tranh Biện (Motion)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEBATE_TOPICS.slice(0, 4).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTopic(t);
                      setIsCustomMotion(false);
                    }}
                    className={`text-left p-3.5 rounded border transition-all cursor-pointer ${
                      !isCustomMotion && selectedTopic.id === t.id
                        ? 'border-2 border-[#FACC15] bg-[#FEF3C7]'
                        : 'border-[#E5E1D8] bg-[#FFFFFF] hover:border-[#D6D1C4]'
                    }`}
                  >
                    <div className="text-xs text-[#A16207] font-semibold mb-1">
                      {t.categoryLabel || 'Kiến nghị THPT'}
                    </div>
                    <div className="text-sm font-serif font-bold text-[#1E2433] line-clamp-2">
                      {t.motion}
                    </div>
                  </button>
                ))}
              </div>

              {/* Tùy chọn nhập kiến nghị riêng */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMotion(!isCustomMotion)}
                  className="text-xs text-[#B45309] hover:underline cursor-pointer font-medium"
                >
                  {isCustomMotion ? 'Chọn lại chủ đề có sẵn' : 'Hoặc tự nhập một kiến nghị khác...'}
                </button>
                {isCustomMotion && (
                  <input
                    type="text"
                    value={customMotion}
                    onChange={(e) => setCustomMotion(e.target.value)}
                    placeholder="Nhà này sẽ... (Ví dụ: Nhà này sẽ ưu tiên phát triển trí tuệ nhân tạo có đạo đức)"
                    className="mt-2 w-full px-3 py-2 text-sm bg-[#F2EFE8] border border-[#E5E1D8] rounded text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#A16207]"
                  />
                )}
              </div>
            </div>

            {/* Bước 2: Chọn Vai Trò Diễn Giả (Student Role) */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-semibold text-[#1E2433] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#A16207]" />
                Bước 2: Chọn 1 Vai Trò Của Bạn (AI sẽ đóng tất cả các vai còn lại)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phe Ủng hộ (Proposition) */}
                <div className="p-3.5 bg-[#DBEAFE]/30 border border-[#93C5FD] rounded space-y-2">
                  <div className="text-xs font-bold text-[#2563EB] uppercase tracking-wide">
                    Phe Ủng Hộ (Proposition)
                  </div>
                  <div className="space-y-2">
                    {[
                      { role: 'prop_1' as const, title: 'Diễn giả 1 (Prop 1)', desc: 'Mở đầu, định nghĩa và xây dựng hệ thống luận điểm chính.' },
                      { role: 'prop_2' as const, title: 'Diễn giả 2 (Prop 2)', desc: 'Tái thiết, phản bác và mở rộng luận điểm thứ 3.' },
                      { role: 'prop_3' as const, title: 'Diễn giả 3 (Prop 3)', desc: 'Tổng hợp xung đột then chốt, bảo vệ toàn diện lập trường.' }
                    ].map(item => (
                      <button
                        key={item.role}
                        onClick={() => setStudentRole(item.role)}
                        className={`w-full text-left p-2.5 rounded border text-xs transition-all cursor-pointer ${
                          studentRole === item.role
                            ? 'border-2 border-[#2563EB] bg-[#DBEAFE] text-[#1E2433] font-semibold'
                            : 'border-[#E5E1D8] bg-[#FFFFFF] hover:border-[#D6D1C4] text-[#4A5263]'
                        }`}
                      >
                        <div className="font-bold text-sm text-[#1E2433]">{item.title}</div>
                        <div className="text-[#4A5263] text-xs mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phe Phản đối (Opposition) */}
                <div className="p-3.5 bg-[#FEE2E2]/30 border border-[#FCA5A5] rounded space-y-2">
                  <div className="text-xs font-bold text-[#DC2626] uppercase tracking-wide">
                    Phe Phản Đối (Opposition)
                  </div>
                  <div className="space-y-2">
                    {[
                      { role: 'opp_1' as const, title: 'Diễn giả 1 (Opp 1)', desc: 'Bác bỏ Prop 1 và xây dựng hệ thống ca phản đối.' },
                      { role: 'opp_2' as const, title: 'Diễn giả 2 (Opp 2)', desc: 'Bảo vệ Opp 1, phản bác Prop 2 và mở rộng luận cứ.' },
                      { role: 'opp_3' as const, title: 'Diễn giả 3 (Opp 3)', desc: 'Chốt hạ các điểm nghẽn, làm rõ rủi ro không thể đảo ngược.' }
                    ].map(item => (
                      <button
                        key={item.role}
                        onClick={() => setStudentRole(item.role)}
                        className={`w-full text-left p-2.5 rounded border text-xs transition-all cursor-pointer ${
                          studentRole === item.role
                            ? 'border-2 border-[#DC2626] bg-[#FEE2E2] text-[#1E2433] font-semibold'
                            : 'border-[#E5E1D8] bg-[#FFFFFF] hover:border-[#D6D1C4] text-[#4A5263]'
                        }`}
                      >
                        <div className="font-bold text-sm text-[#1E2433]">{item.title}</div>
                        <div className="text-[#4A5263] text-xs mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tùy chọn nói bài Reply nếu là Speaker 1 hoặc 2 */}
              {(studentRole === 'prop_1' || studentRole === 'prop_2' || studentRole === 'opp_1' || studentRole === 'opp_2') && (
                <div className="p-3 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-xs text-[#1E2433] flex items-center justify-between">
                  <div>
                    <span className="text-[#A16207] font-bold">Bài Kết Luận (Reply 4 phút): </span>
                    <span className="text-[#4A5263]">Bạn là Diễn giả {studentRole.includes('1') ? '1' : '2'}, bạn có muốn trực tiếp phát biểu bài Reply cho đội không?</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setStudentReplyChoice('self')}
                      className={`px-2.5 py-1 rounded border text-xs font-bold cursor-pointer transition-colors ${
                        studentReplyChoice === 'self'
                          ? 'border-[#FACC15] bg-[#FACC15] text-[#1E2433] shadow-xs'
                          : 'border-[#D6D1C4] bg-[#FFFFFF] text-[#4A5263]'
                      }`}
                    >
                      Tôi sẽ nói Reply
                    </button>
                    <button
                      onClick={() => setStudentReplyChoice('teammate')}
                      className={`px-2.5 py-1 rounded border text-xs font-bold cursor-pointer transition-colors ${
                        studentReplyChoice === 'teammate'
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

            {/* Nút Bắt Đầu Trận Đấu */}
            <div className="flex justify-end pt-3 border-t border-[#E5E1D8]">
              <button
                onClick={handleStartTournament}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-sm rounded shadow-xs transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Vào Phòng Thi Đấu WSDC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SÀN ĐẤU TRỰC TIẾP (LIVE STAGE) */}
      {matchState === 'in_progress' && (
        <div className="space-y-5">
          {/* Thanh Tiến Trình 8 Bài Phát Biểu Theo Thể Thức Chuẩn */}
          <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xs p-3">
            <div className="flex items-center justify-between text-xs text-[#4A5263] mb-2">
              <span className="font-semibold text-[#1E2433]">
                Thứ Tự Phát Biểu WSDC (Lượt {currentSpeechIndex + 1}/8):
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowScoresheetTab(!showScoresheetTab)}
                  className="inline-flex items-center gap-1 text-[#B45309] font-medium hover:underline cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  {showScoresheetTab ? 'Ẩn Bảng Điểm' : 'Xem Bảng Điểm WSDC'}
                </button>
                {onExitTournament && (
                  <button
                    onClick={onExitTournament}
                    className="inline-flex items-center gap-1 text-[#6B7280] hover:text-[#DC2626] font-medium cursor-pointer"
                  >
                    <span>← Rời phòng đấu</span>
                  </button>
                )}
              </div>
            </div>

            {/* 8 Nút Trạng Thái Các Lượt Nói */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {WSDC_SPEECH_ORDER.map((item, idx) => {
                const isCurrent = idx === currentSpeechIndex;
                const isDone = idx < currentSpeechIndex;
                const isStudent = (item.speechType === 'main' && item.role === studentRole) ||
                  (item.speechType === 'reply' && ((item.role === 'prop_reply' && studentRole.startsWith('prop')) || (item.role === 'opp_reply' && studentRole.startsWith('con'))) && studentReplyChoice === 'self');

                return (
                  <div
                    key={item.role}
                    className={`p-2 rounded text-center border text-xs transition-all ${
                      isCurrent
                        ? 'border-2 border-[#FACC15] bg-[#FEF3C7] text-[#1E2433] font-bold shadow-xs'
                        : isDone
                        ? 'border-[#86EFAC] bg-[#DCFCE7] text-[#15803D]'
                        : 'border-[#E5E1D8] bg-[#F2EFE8] text-[#6B7280]'
                    }`}
                  >
                    <div className="text-[10px] text-[#6B7280]">
                      {item.speechType === 'reply' ? '4m' : '8m'}
                    </div>
                    <div className="font-semibold truncate">{item.shortTitle}</div>
                    <div className="text-[9px] mt-0.5">
                      {isStudent ? '👤 Bạn' : '🤖 AI'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bảng Điểm WSDC Hiện Tại (Nếu người dùng bấm xem) */}
          {showScoresheetTab && (
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xs p-4 text-xs">
              <h3 className="font-serif font-bold text-sm text-[#1E2433] mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#A16207]" />
                Bảng Điểm WSDC Hiện Tại (Thang 60–80 bài chính, 30–40 bài reply)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E1D8] text-[#6B7280]">
                      <th className="py-2 pr-2">Bài nói</th>
                      <th className="py-2 px-2">Diễn giả</th>
                      <th className="py-2 px-2">Nội dung</th>
                      <th className="py-2 px-2">Phong cách</th>
                      <th className="py-2 px-2">Chiến lược</th>
                      <th className="py-2 pl-2">Tổng điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E1D8]">
                    {completedSpeeches.map((s, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#F2EFE8]'}>
                        <td className="py-2 pr-2 font-medium text-[#1E2433]">{s.role.toUpperCase()}</td>
                        <td className="py-2 px-2 text-[#4A5263]">{s.speakerName}</td>
                        <td className="py-2 px-2 text-[#1E2433]">{s.score?.content ?? '-'}</td>
                        <td className="py-2 px-2 text-[#1E2433]">{s.score?.style ?? '-'}</td>
                        <td className="py-2 px-2 text-[#1E2433]">{s.score?.strategy ?? '-'}</td>
                        <td className="py-2 pl-2 font-bold text-[#A16207]">{s.score?.total ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Khung Trận Đấu Chính: Kiến Nghị & Bục Phát Biểu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Cột Trái & Giữa: Bục Phát Biểu & Đồng Hồ & POI */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Thẻ Bục Phát Biểu Hiện Tại */}
              <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xs p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E5E1D8] pb-4 mb-4">
                  <div>
                    <div className="text-xs font-bold text-[#A16207] uppercase tracking-wide">
                      {currentMeta.side === 'pro' ? 'Phe Ủng Hộ' : 'Phe Phản Đối'} · Lượt {currentSpeechIndex + 1}/8
                    </div>
                    <h2 className="text-xl font-serif font-bold text-[#1E2433] mt-0.5">
                      {currentMeta.speakerTitle}
                    </h2>
                    <p className="text-xs text-[#4A5263] mt-1">
                      {currentMeta.dutyDescription}
                    </p>
                  </div>

                  {/* Đồng Hồ Bấm Giờ Trực Tuyến */}
                  <div className="flex items-center gap-3 bg-[#F2EFE8] border border-[#E5E1D8] px-4 py-2 rounded shrink-0">
                    <Clock className={`w-5 h-5 ${isTimerRunning ? 'text-[#A16207] animate-pulse' : 'text-[#6B7280]'}`} />
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-[#1E2433]">
                        {formatTime(elapsedSeconds)}
                        <span className="text-xs text-[#6B7280] font-normal"> / {formatTime(maxSpeechSeconds)}</span>
                      </div>
                      <div className="text-[10px] text-[#6B7280]">
                        {isPoiAllowedNow() ? (
                          <span className="text-[#15803D] font-bold">Mở nhận POI (1:00 - 7:00)</span>
                        ) : (
                          <span className="text-[#A16207] font-medium">Thời gian bảo vệ (Không POI)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thanh Đo Thời Gian POI (0:00 - 1:00 Bảo vệ, 1:00 - 7:00 Mở POI, 7:00 - 8:00 Bảo vệ) */}
                <div className="space-y-1 mb-5">
                  <div className="w-full bg-[#F2EFE8] h-2.5 rounded-full overflow-hidden relative border border-[#E5E1D8]">
                    {/* Vùng mở POI (Phút 1 đến Phút 7) */}
                    {currentMeta.allowsPoi && (
                      <div 
                        className="absolute top-0 bottom-0 bg-[#DCFCE7] border-x border-[#86EFAC]"
                        style={{ left: '12.5%', width: '75%' }}
                        title="Vùng Mở POI (1:00 đến 7:00)"
                      />
                    )}
                    {/* Tiến độ thời gian hiện tại */}
                    <div 
                      className="h-full bg-[#FACC15] transition-all"
                      style={{ width: `${timeProgressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#6B7280]">
                    <span>0:00 (Bảo vệ)</span>
                    {currentMeta.allowsPoi && <span>1:00 (Chuông mở POI)</span>}
                    {currentMeta.allowsPoi && <span>7:00 (Chuông đóng POI)</span>}
                    <span>{currentMeta.allocatedMinutes}:00 (Hết giờ)</span>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* TRƯỜNG HỢP 1: LƯỢT NÓI CỦA HỌC SINH */}
                {/* ============================================================== */}
                {isCurrentSpeakerStudent() ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#4A5263]">
                      <span className="font-semibold text-[#1E2433] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                        Đang Đến Lượt Bạn Phát Biểu (Gõ phím hoặc Bấm Mic để nói)
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Nút Thu Âm Bằng Giọng Nói */}
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded border text-xs font-medium transition-all cursor-pointer ${
                            isListeningMic
                              ? 'border-[#DC2626] bg-[#FEE2E2] text-[#DC2626] animate-pulse'
                              : 'border-[#D6D1C4] bg-[#FFFFFF] hover:bg-[#F2EFE8] text-[#1E2433]'
                          }`}
                        >
                          {isListeningMic ? <Mic className="w-3.5 h-3.5 text-[#DC2626]" /> : <MicOff className="w-3.5 h-3.5" />}
                          {isListeningMic ? 'Đang thu âm...' : 'Bật Micro nói'}
                        </button>

                        {/* Nút Bắt Đầu / Tạm Dừng Đồng Hồ */}
                        <button
                          type="button"
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#D6D1C4] bg-[#FFFFFF] text-xs text-[#1E2433] hover:bg-[#F2EFE8] cursor-pointer"
                        >
                          {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {isTimerRunning ? 'Dừng giờ' : 'Chạy giờ'}
                        </button>
                      </div>
                    </div>

                    {/* Hộp Thông Báo AI Đang Xin POI Khi Học Sinh Nói */}
                    {incomingAiPoi && (
                      <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-bounce">
                        <div className="text-xs">
                          <div className="font-bold text-[#92400E] flex items-center gap-1.5">
                            <Hand className="w-4 h-4 text-[#A16207]" />
                            Phe Đối Lập Đứng Lên Xin POI (Point of Information)!
                          </div>
                          <div className="text-[#1E2433] mt-1 italic">
                            "{incomingAiPoi.questionText}"
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={handleAcceptAiPoi}
                            className="px-3 py-1 bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs rounded cursor-pointer"
                          >
                            Mời Bạn (Nhận POI)
                          </button>
                          <button
                            onClick={handleDeclineAiPoi}
                            className="px-3 py-1 bg-[#FFFFFF] hover:bg-[#F2EFE8] text-[#1E2433] text-xs rounded border border-[#D6D1C4] cursor-pointer font-medium"
                          >
                            Xin Từ Chối
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Vùng Nhập Nội Dung Bài Nói */}
                    <div className="relative">
                      <textarea
                        value={inputText}
                        onChange={(e) => {
                          setInputText(e.target.value);
                          if (!isTimerRunning && e.target.value.length > 5) {
                            setIsTimerRunning(true);
                          }
                        }}
                        placeholder={`Kính thưa Chủ tọa, Ban Giám khảo cùng toàn thể hội trường...\n\n(Trình bày theo cấu trúc WSDC: Định vị lập trường, phản bác đối thủ nếu có, phát triển 2-3 luận điểm với cơ chế nhân quả A -> B -> C theo mô hình PEEL)`}
                        rows={10}
                        className="w-full p-3.5 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-sm text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#A16207] font-sans leading-relaxed"
                      />
                      <div className="text-[11px] text-[#6B7280] text-right mt-1">
                        Số từ: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} từ
                      </div>
                    </div>

                    {/* Nút Nộp Bài Cho Ban Giám Khảo Chấm */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-[#6B7280]">
                        {currentMeta.speechType === 'reply' ? 'Bài Reply (4 phút, tối đa 40 điểm)' : 'Bài chính (8 phút, tối đa 80 điểm)'}
                      </div>

                      <button
                        onClick={handleSubmitStudentSpeech}
                        disabled={isEvaluatingSpeech || !inputText.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-xs rounded transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {isEvaluatingSpeech ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-[#1E2433] border-t-transparent rounded-full animate-spin" />
                            Hội Đồng Đang Chấm Thang WSDC...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Hoàn Thành Bài Nói & Gửi Chấm Điểm
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ============================================================== */
                  /* TRƯỜNG HỢP 2: LƯỢT NÓI CỦA DIỄN GIẢ AI */
                  /* ============================================================== */
                  <div className="space-y-4">
                    <div className="p-4 bg-[#F8F6F1] border border-[#E5E1D8] rounded text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1E2433] flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#2563EB]" />
                          Diễn Giả AI Đang Phụ Trách Lượt Này
                        </span>
                        
                        {/* Tùy chọn âm thanh đọc bài của AI */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setAutoTtsEnabled(!autoTtsEnabled)}
                            className="text-xs text-[#4A5263] hover:text-[#1E2433] flex items-center gap-1 cursor-pointer"
                          >
                            {autoTtsEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#A16207]" /> : <VolumeX className="w-3.5 h-3.5 text-[#6B7280]" />}
                            {autoTtsEnabled ? 'Giọng đọc: Bật' : 'Giọng đọc: Tắt'}
                          </button>
                        </div>
                      </div>

                      <p className="text-[#4A5263]">
                        AI sẽ xây dựng bài phát biểu chuẩn mực WSDC dựa trên toàn bộ các bài trước đó trong trận đấu, tuân thủ vai trò {currentMeta.shortTitle}.
                      </p>

                      {/* Nút Đứng Lên Xin POI Khi AI Đang Nói (Phút 1 đến Phút 7) */}
                      {currentMeta.allowsPoi && (
                        <div className="p-3 bg-[#FFFFFF] border border-[#E5E1D8] rounded flex items-center justify-between">
                          <div className="text-xs">
                            <span className="font-semibold text-[#1E2433]">Bạn muốn chất vấn AI? </span>
                            <span className="text-[#6B7280]">POI mở từ phút 1:00 đến 7:00 (dưới 15 giây).</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsOfferingPoiToAi(true)}
                            disabled={!isPoiAllowedNow()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-40 text-[#1E2433] font-bold text-xs rounded transition-all cursor-pointer shadow-xs"
                          >
                            <Hand className="w-3.5 h-3.5" />
                            Đứng Lên Xin POI
                          </button>
                        </div>
                      )}

                      {/* Modal Hoặc Form Nhập POI Học Sinh Muốn Đưa Ra */}
                      {isOfferingPoiToAi && (
                        <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded space-y-2">
                          <label className="text-xs font-semibold text-[#92400E]">
                            Nhập câu hỏi xen POI ngắn gọn của bạn (dưới 25 từ):
                          </label>
                          <input
                            type="text"
                            value={studentPoiInput}
                            onChange={(e) => setStudentPoiInput(e.target.value)}
                            placeholder="Ví dụ: Bạn có thừa nhận chính sách này sẽ làm tăng gánh nặng tài chính cho gia đình nghèo không?"
                            className="w-full px-3 py-1.5 text-xs bg-[#FFFFFF] border border-[#D6D1C4] rounded text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#A16207]"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setIsOfferingPoiToAi(false)}
                              className="px-2.5 py-1 text-xs text-[#4A5263] hover:text-[#1E2433] cursor-pointer"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={handleStudentSubmitPoi}
                              className="px-3 py-1 text-xs bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold rounded cursor-pointer shadow-xs"
                            >
                              Đưa POI Ngay
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Nút Kích Hoạt AI Phát Biểu */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleGenerateAiSpeech}
                        disabled={isAiGenerating}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-xs rounded transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {isAiGenerating ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-[#1E2433] border-t-transparent rounded-full animate-spin" />
                            AI Đang Phát Biểu Chuẩn WSDC...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Lắng Nghe Diễn Giả AI Phát Biểu Lượt Này
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Lịch Sử Các Bài Phát Biểu Đã Nói Trong Trận Này */}
              {completedSpeeches.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-serif font-bold text-[#1E2433] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#A16207]" />
                    Lịch Sử Các Bài Nói Đã Phát Biểu ({completedSpeeches.length}/8)
                  </h3>

                  <div className="space-y-2">
                    {completedSpeeches.map((sp, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#FFFFFF] border border-[#E5E1D8] rounded text-xs space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-[#1E2433] flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              sp.side === 'pro' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[#FEE2E2] text-[#DC2626]'
                            }`}>
                              {sp.role.toUpperCase()}
                            </span>
                            <span>{sp.speakerName}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {sp.score && (
                              <span className="text-[#A16207] font-bold">
                                Điểm: {sp.score.total}đ
                              </span>
                            )}
                            <button
                              onClick={() => speakText(sp.transcript)}
                              className="text-[#6B7280] hover:text-[#1E2433] cursor-pointer"
                              title="Nghe lại bài này"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[#4A5263] line-clamp-3 leading-relaxed">
                          {sp.transcript}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cột Phải: Bảng Ghế Ngồi 2 Phe (Chamber View) & Kiến Nghị */}
            <div className="space-y-4">
              
              {/* Thẻ Kiến Nghị Hiện Tại */}
              <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xs p-4 space-y-2">
                <div className="text-[11px] font-bold text-[#A16207] uppercase tracking-wide">
                  Kiến Nghị Đang Tranh Biện (Motion)
                </div>
                <h3 className="text-sm font-serif font-bold text-[#1E2433] leading-snug">
                  {selectedTopic.motion}
                </h3>
                {selectedTopic.background && (
                  <p className="text-xs text-[#4A5263] line-clamp-3">
                    {selectedTopic.background}
                  </p>
                )}
              </div>

              {/* Sơ Đồ Phòng Tranh Biện: Phe Ủng Hộ (3 Người) vs Phe Phản Đối (3 Người) */}
              <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xs p-4 space-y-4">
                <div className="text-xs font-semibold text-[#1E2433] border-b border-[#E5E1D8] pb-2">
                  Sơ Đồ Ghế Ngồi Tranh Biện (Chamber Bench)
                </div>

                {/* Băng Ghế Phe Ủng Hộ */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-[#2563EB]">
                    BĂNG GHẾ ỦNG HỘ (PROPOSITION)
                  </div>
                  {[
                    { role: 'prop_1' as const, label: 'Diễn giả 1 (P1)' },
                    { role: 'prop_2' as const, label: 'Diễn giả 2 (P2)' },
                    { role: 'prop_3' as const, label: 'Diễn giả 3 (P3)' }
                  ].map(b => {
                    const isStudent = studentRole === b.role;
                    const isSpeakingNow = currentMeta.role === b.role;
                    return (
                      <div
                        key={b.role}
                        className={`p-2 rounded border text-xs flex items-center justify-between ${
                          isSpeakingNow
                            ? 'border-2 border-[#FACC15] bg-[#FEF3C7] text-[#1E2433] font-bold'
                            : 'border-[#E5E1D8] bg-[#F2EFE8] text-[#4A5263]'
                        }`}
                      >
                        <span>{b.label}</span>
                        <span className="text-[10px] text-[#6B7280]">
                          {isStudent ? '👤 Bạn' : '🤖 AI Đồng đội'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Băng Ghế Phe Phản Đối */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-bold text-[#DC2626]">
                    BĂNG GHẾ PHẢN ĐỐI (OPPOSITION)
                  </div>
                  {[
                    { role: 'opp_1' as const, label: 'Diễn giả 1 (O1)' },
                    { role: 'opp_2' as const, label: 'Diễn giả 2 (O2)' },
                    { role: 'opp_3' as const, label: 'Diễn giả 3 (O3)' }
                  ].map(b => {
                    const isStudent = studentRole === b.role;
                    const isSpeakingNow = currentMeta.role === b.role;
                    return (
                      <div
                        key={b.role}
                        className={`p-2 rounded border text-xs flex items-center justify-between ${
                          isSpeakingNow
                            ? 'border-2 border-[#FACC15] bg-[#FEF3C7] text-[#1E2433] font-bold'
                            : 'border-[#E5E1D8] bg-[#F2EFE8] text-[#4A5263]'
                        }`}
                      >
                        <span>{b.label}</span>
                        <span className="text-[10px] text-[#6B7280]">
                          {isStudent ? '👤 Bạn' : '🤖 AI Đối thủ'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hướng Dẫn Kỹ Thuật WSDC Thang 60-80 */}
              <div className="bg-[#F2EFE8] border border-[#E5E1D8] rounded p-3 text-xs text-[#4A5263] space-y-1.5">
                <div className="font-semibold text-[#1E2433]">
                  Thang Điểm Bài Phát Biểu Chính (60–80):
                </div>
                <div>• <strong className="text-[#1E2433]">Nội dung (24–32)</strong>: Cơ chế nhân quả A→B→C, dẫn chứng cụ thể.</div>
                <div>• <strong className="text-[#1E2433]">Phong cách (24–32)</strong>: Biểu đạt tự tin, cấu trúc rõ ràng.</div>
                <div>• <strong className="text-[#1E2433]">Chiến lược (12–16)</strong>: Đúng nhiệm vụ diễn giả, phân bổ thời gian.</div>
                <div className="text-[11px] text-[#6B7280] pt-1">
                  * Bài Reply tính nửa điểm: Thang 30–40 điểm (Nội dung 12–16, Phong cách 12–16, Chiến lược 6–8).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. KẾT THÚC TRẬN ĐẤU: PHÁN QUYẾT HỘI ĐỒNG TRỌNG TÀI (NO TIE) */}
      {matchState === 'ended' && matchVerdict && (
        <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xs p-6 space-y-6">
          {/* Header Kết Quả */}
          <div className="text-center space-y-2 border-b border-[#E5E1D8] pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-bold uppercase tracking-wide">
              <Trophy className="w-4 h-4 text-[#A16207]" />
              Phán Quyết Chính Thức Hội Đồng Trọng Tài WSDC
            </div>

            <h2 className="text-3xl font-serif font-bold text-[#1E2433] mt-2">
              Phe {matchVerdict.winningSide === 'pro' ? 'Ủng Hộ (Proposition)' : 'Phản Đối (Opposition)'} Giành Chiến Thắng!
            </h2>

            <div className="text-sm text-[#4A5263]">
              Tỷ số biểu quyết trọng tài: <strong className="text-[#1E2433]">{matchVerdict.winningSide === 'pro' ? matchVerdict.ballotsPro : matchVerdict.ballotsOpp} - {matchVerdict.winningSide === 'pro' ? matchVerdict.ballotsOpp : matchVerdict.ballotsPro}</strong>
              {' '}(Tuyệt đối không có kết quả hòa)
            </div>

            {/* So Sánh Điểm Số Toàn Đội */}
            <div className="inline-flex items-center gap-8 bg-[#F8F6F1] border border-[#E5E1D8] px-6 py-3 rounded mt-3">
              <div className="text-center">
                <div className="text-xs text-[#2563EB] font-bold">TỔNG ĐIỂM ỦNG HỘ</div>
                <div className="text-2xl font-mono font-bold text-[#1E2433]">{matchVerdict.propTotalScore}đ</div>
              </div>
              <div className="text-[#6B7280] font-bold text-lg">VS</div>
              <div className="text-center">
                <div className="text-xs text-[#DC2626] font-bold">TỔNG ĐIỂM PHẢN ĐỐI</div>
                <div className="text-2xl font-mono font-bold text-[#1E2433]">{matchVerdict.oppTotalScore}đ</div>
              </div>
            </div>
          </div>

          {/* Diễn Giả Xuất Sắc Nhất Trận (Best Speaker) */}
          {matchVerdict.bestSpeaker && (
            <div className="p-4 bg-[#FEF3C7] border border-[#FDE68A] rounded flex items-center gap-4">
              <Award className="w-8 h-8 text-[#A16207] shrink-0" />
              <div>
                <div className="text-xs text-[#92400E] font-bold uppercase">
                  Vinh Danh Diễn Giả Xuất Sắc Nhất Trận (Best Speaker)
                </div>
                <div className="font-serif font-bold text-[#1E2433] text-sm mt-0.5">
                  {matchVerdict.bestSpeaker.name} ({matchVerdict.bestSpeaker.role.toUpperCase()})
                </div>
                <div className="text-xs text-[#4A5263] mt-1">
                  {matchVerdict.bestSpeaker.reason}
                </div>
              </div>
            </div>
          )}

          {/* Phân Tích Các Điểm Đụng Độ Lớn (Clash Points) */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-base text-[#1E2433]">
              Phân Tích Các Điểm Đụng Độ Then Chốt (Clash Points)
            </h3>

            <div className="space-y-3">
              {matchVerdict.clashPointsAnalysis.map((clash, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#F8F6F1] border border-[#E5E1D8] rounded space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1E2433]">{clash.title}</span>
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      clash.winningTeam === 'pro' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[#FEE2E2] text-[#DC2626]'
                    }`}>
                      Phe {clash.winningTeam === 'pro' ? 'Ủng hộ' : 'Phản đối'} thắng điểm này
                    </span>
                  </div>
                  <p className="text-xs text-[#4A5263] leading-relaxed">
                    {clash.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Lời Nhận Xét Chung Cuộc Của Trưởng Ban Giám Khảo (Oral Adjudication) */}
          <div className="p-4 bg-[#F2EFE8] border border-[#E5E1D8] rounded space-y-2">
            <div className="text-xs font-semibold text-[#6B7280] uppercase">
              Lời Nhận Xét Chung Cuộc (Oral Adjudication)
            </div>
            <p className="text-xs text-[#1E2433] leading-relaxed italic">
              "{matchVerdict.overallAdjudication}"
            </p>
          </div>

          {/* Nút Đấu Lại Trận Mới */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => {
                  if (onExitTournament) {
                    onExitTournament();
                  } else {
                    setMatchState('setup');
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-sm rounded shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Thi Đấu Trận WSDC Mới
              </button>
            </div>
        </div>
      )}

      {/* MODAL CHI TIẾT ĐIỂM BÀI PHÁT BIỂU VỪA NỘP */}
      {currentScoreModal && currentScoreModal.score && (
        <div className="fixed inset-0 z-50 bg-[rgba(15,23,42,0.4)] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-md shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3">
              <div>
                <div className="text-xs text-[#A16207] font-bold">Kết Quả Chấm Điểm WSDC</div>
                <h3 className="font-serif font-bold text-lg text-[#1E2433]">
                  {currentScoreModal.role.toUpperCase()} · {currentScoreModal.speakerName}
                </h3>
              </div>
              <button
                onClick={() => setCurrentScoreModal(null)}
                className="text-[#6B7280] hover:text-[#1E2433] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chi Tiết 3 Tiêu Chí Thang Điểm WSDC */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#F8F6F1] border border-[#E5E1D8] rounded">
                <div className="text-[11px] text-[#6B7280]">Nội Dung</div>
                <div className="text-xl font-bold text-[#1E2433] mt-1">
                  {currentScoreModal.score.content}
                  <span className="text-xs text-[#6B7280] font-normal">/{currentScoreModal.role.includes('reply') ? '16' : '32'}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F8F6F1] border border-[#E5E1D8] rounded">
                <div className="text-[11px] text-[#6B7280]">Phong Cách</div>
                <div className="text-xl font-bold text-[#1E2433] mt-1">
                  {currentScoreModal.score.style}
                  <span className="text-xs text-[#6B7280] font-normal">/{currentScoreModal.role.includes('reply') ? '16' : '32'}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F8F6F1] border border-[#E5E1D8] rounded">
                <div className="text-[11px] text-[#6B7280]">Chiến Lược</div>
                <div className="text-xl font-bold text-[#1E2433] mt-1">
                  {currentScoreModal.score.strategy}
                  <span className="text-xs text-[#6B7280] font-normal">/{currentScoreModal.role.includes('reply') ? '8' : '16'}</span>
                </div>
              </div>
            </div>

            {/* Tổng Điểm */}
            <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded text-center">
              <div className="text-xs text-[#92400E]">Tổng Điểm Bài Nói</div>
              <div className="text-2xl font-mono font-bold text-[#A16207]">
                {currentScoreModal.score.total}
                <span className="text-xs text-[#92400E] font-normal"> / {currentScoreModal.role.includes('reply') ? '40' : '80'} điểm</span>
              </div>
            </div>

            {/* Nhận xét chuyên môn */}
            {currentScoreModal.score.contentFeedback && (
              <div className="text-xs text-[#4A5263] space-y-1">
                <span className="font-semibold text-[#1E2433]">Nhận xét từ Giám khảo: </span>
                <p className="italic text-[#4A5263]">{currentScoreModal.score.contentFeedback}</p>
              </div>
            )}

            {currentScoreModal.aiSuggestedImprovements && (
              <div className="p-3 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-xs text-[#4A5263]">
                <span className="font-semibold text-[#A16207]">Gợi ý nâng tầm bài nói: </span>
                <span className="text-[#1E2433]">{currentScoreModal.aiSuggestedImprovements}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentScoreModal(null)}
                className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-xs rounded shadow-xs cursor-pointer"
              >
                Tiếp Tục Trận Đấu
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

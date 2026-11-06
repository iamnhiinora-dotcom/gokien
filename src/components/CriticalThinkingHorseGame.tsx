/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CỜ CÁ NGỰA PHẢN BIỆN (CRITICAL THINKING HORSE BOARD GAME)
 * Bản cập nhật giao diện 2026:
 * - Bàn cờ lưới 8x8 với 28 ô viền ngoài chạy theo chiều kim đồng hồ, 4 ô Cổng ở 4 góc, 4 Chuồng sát góc Cổng, Đích ở chính giữa.
 * - Mũi tên chỉ chiều đi, số thứ tự ô, nhãn CỔNG, icon 💡 và 🐛.
 * - Khung câu hỏi nổi bật dạng tin nhắn/bình luận, 4 nút đáp án to, nút Tiếp tục sau giải thích.
 * - Hiệu ứng chỉ sáng ngựa đi được sau khi đúng, rê chuột soi trước ô sẽ đến, lăn xúc xắc và di chuyển mượt mà.
 * - Thẻ "Luật nhanh" thu gọn, bảng người chơi 1 dòng không vỡ chữ, nhật ký dòng mới nhất ở trên cùng.
 * - Co giãn tối ưu trên thiết bị di động (khoảng 375px+).
 */

import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../services/soundEffects';
import { useGamification } from '../context/GamificationContext';
import { HORSE_GAME_QUESTIONS, HorseGameQuestion } from '../data/horseGameQuestions';
import {
  Dices,
  Trophy,
  Users,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  Bot,
  User,
  Play,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';

export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

export interface BoardHorse {
  id: number;              // 1 hoặc 2
  color: PlayerColor;
  inStable: boolean;       // còn trong chuồng
  stepsWalked: number;     // 0 đến 28; >= 28 là vào Đích
  inGoal: boolean;         // đã về Đích
  hasShield: boolean;      // đang có Khiên bảo vệ
}

export interface PlayerConfig {
  color: PlayerColor;
  name: string;
  isBot: boolean;
  colorName: string;
  gateIndex: number;       // Đỏ: 0, Xanh dương: 7, Vàng: 14, Xanh lá: 21
  colorHex: string;
  borderHex: string;
  badgeBg: string;
  badgeText: string;
}

export interface QuestionHistoryItem {
  question: HorseGameQuestion;
  playerName: string;
  playerColor: PlayerColor;
  selectedOptionIndex: number;
  isCorrect: boolean;
  turnNumber: number;
}

export interface GameLogEntry {
  id: string;
  text: string;
  type: 'roll' | 'correct' | 'wrong' | 'move' | 'kick' | 'shield' | 'goal' | 'worm' | 'skip' | 'special';
  timestamp: string;
}

const COLOR_CONFIGS: Record<PlayerColor, PlayerConfig> = {
  red: {
    color: 'red',
    name: 'Đỏ',
    isBot: false,
    colorName: 'Đỏ',
    gateIndex: 0,
    colorHex: '#EF4444',
    borderHex: '#DC2626',
    badgeBg: '#FEE2E2',
    badgeText: '#991B1B'
  },
  blue: {
    color: 'blue',
    name: 'Xanh dương',
    isBot: false,
    colorName: 'Xanh dương',
    gateIndex: 7,
    colorHex: '#2563EB',
    borderHex: '#1D4ED8',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF'
  },
  yellow: {
    color: 'yellow',
    name: 'Vàng',
    isBot: true,
    colorName: 'Vàng',
    gateIndex: 14,
    colorHex: '#EAB308',
    borderHex: '#CA8A04',
    badgeBg: '#FEF9C3',
    badgeText: '#854D0E'
  },
  green: {
    color: 'green',
    name: 'Xanh lá',
    isBot: true,
    colorName: 'Xanh lá',
    gateIndex: 21,
    colorHex: '#16A34A',
    borderHex: '#15803D',
    badgeBg: '#DCFCE7',
    badgeText: '#166534'
  }
};

const GATE_INDICES: Record<PlayerColor, number> = {
  red: 0,
  blue: 7,
  yellow: 14,
  green: 21
};

const HIGHLIGHTER_TILES = [5, 12, 19, 26]; // 💡 Bút dạ quang
const FALLACY_WORM_TILES = [2, 9, 16, 23]; // 🐛 Sâu ngụy biện

export const getActiveColorsForCount = (count: 2 | 3 | 4): PlayerColor[] => {
  if (count === 2) return ['red', 'yellow']; // 2 phe đối diện nhau trên bàn cờ
  if (count === 3) return ['red', 'blue', 'yellow'];
  return ['red', 'blue', 'yellow', 'green'];
};

export const CriticalThinkingHorseGame: React.FC = () => {
  const { addXP } = useGamification();

  // ==========================================
  // 1. STATE THIẾT LẬP (SETUP)
  // ==========================================
  const [gameStage, setGameStage] = useState<'setup' | 'playing' | 'ended'>('setup');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [playerConfigs, setPlayerConfigs] = useState<Record<PlayerColor, PlayerConfig>>({ ...COLOR_CONFIGS });
  const [horsesPerPlayer, setHorsesPerPlayer] = useState<1 | 2>(2);
  const [questionTimeLimit, setQuestionTimeLimit] = useState<number>(30); // 20, 30, 45 giây
  const [matchTimeLimitMinutes, setMatchTimeLimitMinutes] = useState<number>(15); // 0 (unlimited), 10, 15, 20 phút

  // Modals
  const [showFullRulesModal, setShowFullRulesModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [isQuickRulesExpanded, setIsQuickRulesExpanded] = useState<boolean>(true);

  // ==========================================
  // 2. STATE VÁN ĐẤU (PLAYING)
  // ==========================================
  const [activeColors, setActiveColors] = useState<PlayerColor[]>(['red', 'blue', 'yellow', 'green']);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [horses, setHorses] = useState<BoardHorse[]>([]);
  const [skipNextTurn, setSkipNextTurn] = useState<Record<PlayerColor, boolean>>({
    red: false,
    blue: false,
    yellow: false,
    green: false
  });

  // Xúc xắc & Lượt
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [turnPhase, setTurnPhase] = useState<'awaiting_roll' | 'question_modal' | 'awaiting_move' | 'worm_modal'>('awaiting_roll');
  const [hasBonusRoll, setHasBonusRoll] = useState<boolean>(false);
  const [hasReceivedHighlighterBonus, setHasReceivedHighlighterBonus] = useState<boolean>(false);
  const [hasReceivedSixBonus, setHasReceivedSixBonus] = useState<boolean>(false);

  // Hover preview ô sẽ đến
  const [hoveredHorseId, setHoveredHorseId] = useState<string | null>(null);

  // Câu hỏi
  const [currentQuestion, setCurrentQuestion] = useState<HorseGameQuestion | null>(null);
  const [questionCountdown, setQuestionCountdown] = useState<number>(30);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [aiThinking, setAiThinking] = useState<boolean>(false);

  // Ô Sâu ngụy biện (Worm Modal)
  const [wormQuestion, setWormQuestion] = useState<HorseGameQuestion | null>(null);
  const [wormTargetHorse, setWormTargetHorse] = useState<BoardHorse | null>(null);
  const [wormAnswerResult, setWormAnswerResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  // Thống kê & Nhật ký
  const [gameLogs, setGameLogs] = useState<GameLogEntry[]>([]);
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [playerStats, setPlayerStats] = useState<Record<PlayerColor, { correct: number; total: number }>>({
    red: { correct: 0, total: 0 },
    blue: { correct: 0, total: 0 },
    yellow: { correct: 0, total: 0 },
    green: { correct: 0, total: 0 }
  });

  // Đồng hồ ván đấu
  const [matchSecondsRemaining, setMatchSecondsRemaining] = useState<number>(900);
  const [winnerColor, setWinnerColor] = useState<PlayerColor | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const aiDiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiThinkingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiProceedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiMoveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiHoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wormTimerRef = useRef<NodeJS.Timeout | null>(null);
  const diceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllAiTimers = () => {
    if (aiDiceTimerRef.current) { clearTimeout(aiDiceTimerRef.current); aiDiceTimerRef.current = null; }
    if (aiThinkingTimerRef.current) { clearTimeout(aiThinkingTimerRef.current); aiThinkingTimerRef.current = null; }
    if (aiProceedTimerRef.current) { clearTimeout(aiProceedTimerRef.current); aiProceedTimerRef.current = null; }
    if (aiMoveTimerRef.current) { clearTimeout(aiMoveTimerRef.current); aiMoveTimerRef.current = null; }
    if (aiHoverTimerRef.current) { clearTimeout(aiHoverTimerRef.current); aiHoverTimerRef.current = null; }
    if (wormTimerRef.current) { clearTimeout(wormTimerRef.current); wormTimerRef.current = null; }
    if (diceIntervalRef.current) { clearInterval(diceIntervalRef.current); diceIntervalRef.current = null; }
    if (skipTimerRef.current) { clearTimeout(skipTimerRef.current); skipTimerRef.current = null; }
  };

  useEffect(() => {
    return () => {
      clearAllAiTimers();
    };
  }, []);

  // Thêm log theo format quy định (dòng mới nhất ở đầu)
  const addFormattedLog = (text: string, type: GameLogEntry['type']) => {
    const newEntry: GameLogEntry = {
      id: `${Date.now()}_${Math.random()}`,
      text,
      type,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setGameLogs(prev => [newEntry, ...prev.slice(0, 99)]);
  };

  // Cuộn log lên đầu khi có sự kiện mới
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = 0;
    }
  }, [gameLogs]);

  // Khởi động ván cờ mới
  const handleStartGame = () => {
    clearAllAiTimers();
    soundFX.playClick();

    const selectedColors = getActiveColorsForCount(playerCount);
    setActiveColors(selectedColors);

    const initialHorses: BoardHorse[] = [];
    selectedColors.forEach(color => {
      for (let i = 1; i <= horsesPerPlayer; i++) {
        initialHorses.push({
          id: i,
          color,
          inStable: true,
          stepsWalked: 0,
          inGoal: false,
          hasShield: false
        });
      }
    });

    setHorses(initialHorses);
    setCurrentTurnIndex(0);
    setTurnPhase('awaiting_roll');
    setDiceValue(1);
    setWinnerColor(null);
    setHasBonusRoll(false);
    setHasReceivedHighlighterBonus(false);
    setHasReceivedSixBonus(false);
    setHoveredHorseId(null);
    setSkipNextTurn({ red: false, blue: false, yellow: false, green: false });
    setPlayerStats({
      red: { correct: 0, total: 0 },
      blue: { correct: 0, total: 0 },
      yellow: { correct: 0, total: 0 },
      green: { correct: 0, total: 0 }
    });
    setQuestionHistory([]);

    const matchSecs = matchTimeLimitMinutes > 0 ? matchTimeLimitMinutes * 60 : 0;
    setMatchSecondsRemaining(matchSecs);

    setGameLogs([
      {
        id: 'start',
        text: `🏁 Ván cờ bắt đầu! ${selectedColors.length} người chơi, kiểu ${horsesPerPlayer === 1 ? 'Ván nhanh (1 ngựa)' : 'Ván thường (2 ngựa)'}. Lượt đầu tiên: ${playerConfigs[selectedColors[0]].name}.`,
        type: 'roll',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]);

    setGameStage('playing');
  };

  const currentPlayerColor = activeColors[currentTurnIndex] || activeColors[0];
  const currentPlayer = playerConfigs[currentPlayerColor];

  // Đếm ngược thời gian toàn ván
  useEffect(() => {
    if (gameStage !== 'playing' || matchTimeLimitMinutes === 0) return;

    const timer = setInterval(() => {
      setMatchSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleMatchTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStage, matchTimeLimitMinutes]);

  const handleMatchTimeOut = () => {
    soundFX.playFanfare();
    addFormattedLog(`⏰ Hết giờ toàn ván! Trọng tài tiến hành tính điểm xếp hạng...`, 'skip');

    const scores = activeColors.map(color => {
      const playerHorses = horses.filter(h => h.color === color);
      const goalCount = playerHorses.filter(h => h.inGoal).length;
      const totalSteps = playerHorses.reduce((acc, h) => acc + (h.inGoal ? 28 : h.stepsWalked), 0);
      return { color, goalCount, totalSteps };
    });

    scores.sort((a, b) => {
      if (b.goalCount !== a.goalCount) return b.goalCount - a.goalCount;
      return b.totalSteps - a.totalSteps;
    });

    setWinnerColor(scores[0].color);
    setGameStage('ended');
    addXP(100, `Hoàn thành ván Cờ Cá Ngựa Phản Biện`);
  };

  // Tự động kiểm tra mất lượt hoặc AI lắc xúc xắc
  useEffect(() => {
    if (gameStage !== 'playing') return;

    if (turnPhase === 'awaiting_roll') {
      const curColor = activeColors[currentTurnIndex];
      const curPlayer = playerConfigs[curColor];

      if (skipNextTurn[curColor]) {
        addFormattedLog(`⚠️ ${curPlayer.name} bị mất lượt này do dính bẫy Sâu Ngụy Biện!`, 'skip');
        soundFX.playDamage();
        setSkipNextTurn(prev => ({ ...prev, [curColor]: false }));
        if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
        skipTimerRef.current = setTimeout(() => {
          advanceToNextTurn();
        }, 1000);
        return () => {
          if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
        };
      }

      if (curPlayer.isBot) {
        if (aiDiceTimerRef.current) clearTimeout(aiDiceTimerRef.current);
        aiDiceTimerRef.current = setTimeout(() => {
          executeDiceRoll();
        }, 500);
        return () => {
          if (aiDiceTimerRef.current) clearTimeout(aiDiceTimerRef.current);
        };
      }
    }
  }, [gameStage, currentTurnIndex, turnPhase, skipNextTurn]);

  // Lắc Xúc Xắc với animation mượt mà
  const executeDiceRoll = () => {
    if (turnPhase !== 'awaiting_roll' || isRolling) return;

    soundFX.playClick();
    setIsRolling(true);
    setHasBonusRoll(false);

    if (diceIntervalRef.current) clearInterval(diceIntervalRef.current);

    let rollCount = 0;
    diceIntervalRef.current = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 6) {
        if (diceIntervalRef.current) clearInterval(diceIntervalRef.current);
        diceIntervalRef.current = null;
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);

        // Mở câu hỏi tương ứng độ khó
        openQuestionForRoll(finalRoll);
      }
    }, 45);
  };

  // Mở câu hỏi
  const openQuestionForRoll = (roll: number) => {
    let targetDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (roll === 1 || roll === 2) targetDifficulty = 'easy';
    else if (roll === 3 || roll === 4) targetDifficulty = 'medium';
    else targetDifficulty = 'hard';

    const candidateQuestions = HORSE_GAME_QUESTIONS.filter(q => q.difficulty === targetDifficulty);
    const chosen = candidateQuestions[Math.floor(Math.random() * candidateQuestions.length)] || HORSE_GAME_QUESTIONS[0];

    setCurrentQuestion(chosen);
    setSelectedAnswerIndex(null);
    setIsAnswerSubmitted(false);
    setAnswerResult(null);
    setQuestionCountdown(questionTimeLimit);
    setTurnPhase('question_modal');

    if (currentPlayer.isBot) {
      setAiThinking(true);
      if (aiThinkingTimerRef.current) clearTimeout(aiThinkingTimerRef.current);
      aiThinkingTimerRef.current = setTimeout(() => {
        handleAiAnswer(chosen, targetDifficulty);
      }, 600);
    }
  };

  // AI trả lời theo tỉ lệ (Dễ 80%, Vừa 60%, Khó 40%)
  const handleAiAnswer = (q: HorseGameQuestion, diff: 'easy' | 'medium' | 'hard') => {
    setAiThinking(false);
    let successRate = 0.6;
    if (diff === 'easy') successRate = 0.8;
    else if (diff === 'hard') successRate = 0.4;

    const isLucky = Math.random() < successRate;
    let chosenIndex = q.correctIndex;
    if (!isLucky) {
      const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== q.correctIndex);
      chosenIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
    }

    processAnswerSubmission(q, chosenIndex);
  };

  // Đếm ngược thời gian suy nghĩ
  useEffect(() => {
    if (turnPhase !== 'question_modal' || isAnswerSubmitted || currentPlayer.isBot || !currentQuestion) return;

    const timer = setInterval(() => {
      setQuestionCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOutAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [turnPhase, isAnswerSubmitted, currentPlayer.isBot, currentQuestion]);

  const handleTimeOutAnswer = () => {
    if (!currentQuestion) return;
    setIsAnswerSubmitted(true);
    soundFX.playDamage();
    setAnswerResult({
      isCorrect: false,
      explanation: `Hết thời gian! Đáp án đúng là: ${currentQuestion.options[currentQuestion.correctIndex]}. ${currentQuestion.explanation}`
    });

    addFormattedLog(`🎲 ${currentPlayer.name} đổ ${diceValue} · ⏳ Hết giờ · Đứng yên`, 'wrong');

    setPlayerStats(prev => ({
      ...prev,
      [currentPlayerColor]: {
        correct: prev[currentPlayerColor].correct,
        total: prev[currentPlayerColor].total + 1
      }
    }));

    setQuestionHistory(prev => [
      {
        question: currentQuestion,
        playerName: currentPlayer.name,
        playerColor: currentPlayerColor,
        selectedOptionIndex: -1,
        isCorrect: false,
        turnNumber: currentTurnIndex + 1
      },
      ...prev
    ]);
  };

  const handleUserSelectAnswer = (index: number) => {
    if (isAnswerSubmitted || currentPlayer.isBot || !currentQuestion) return;
    processAnswerSubmission(currentQuestion, index);
  };

  const processAnswerSubmission = (q: HorseGameQuestion, chosenIndex: number) => {
    setSelectedAnswerIndex(chosenIndex);
    setIsAnswerSubmitted(true);

    const isCorrect = chosenIndex === q.correctIndex;

    setPlayerStats(prev => ({
      ...prev,
      [currentPlayerColor]: {
        correct: prev[currentPlayerColor].correct + (isCorrect ? 1 : 0),
        total: prev[currentPlayerColor].total + 1
      }
    }));

    setQuestionHistory(prev => [
      {
        question: q,
        playerName: currentPlayer.name,
        playerColor: currentPlayerColor,
        selectedOptionIndex: chosenIndex,
        isCorrect,
        turnNumber: currentTurnIndex + 1
      },
      ...prev
    ]);

    if (isCorrect) {
      soundFX.playSuccess();
      setAnswerResult({
        isCorrect: true,
        explanation: `Chính xác! ${q.explanation}`
      });
      addFormattedLog(`🎲 ${currentPlayer.name} đổ ${diceValue} · ✅ Đúng (${q.category}) · Được đi ${diceValue} ô`, 'correct');
    } else {
      soundFX.playDamage();
      setAnswerResult({
        isCorrect: false,
        explanation: `Chưa chính xác! Đáp án đúng là: ${q.options[q.correctIndex]}. ${q.explanation}`
      });
      addFormattedLog(`🎲 ${currentPlayer.name} đổ ${diceValue} · ❌ Sai · Đứng yên`, 'wrong');
    }

    // Nếu người chơi hiện tại là AI: tự động chuyển bước sau 1.2 giây để cả phòng kịp theo dõi giải thích
    if (currentPlayer.isBot) {
      if (aiProceedTimerRef.current) clearTimeout(aiProceedTimerRef.current);
      aiProceedTimerRef.current = setTimeout(() => {
        handleProceedAfterQuestion();
      }, 1200);
    }
  };

  // Nút "Tiếp tục" trong Khung câu hỏi
  const handleProceedAfterQuestion = () => {
    if (aiProceedTimerRef.current) {
      clearTimeout(aiProceedTimerRef.current);
      aiProceedTimerRef.current = null;
    }
    if (!answerResult) return;

    if (answerResult.isCorrect) {
      handleProceedToMove();
    } else {
      setTurnPhase('awaiting_roll');
      advanceToNextTurn();
    }
  };

  // Tính toán nước đi hợp lệ
  const getValidMovesForPlayer = (playerColor: PlayerColor, roll: number): BoardHorse[] => {
    const playerHorses = horses.filter(h => h.color === playerColor && !h.inGoal);
    const horsesOnTrack = playerHorses.filter(h => !h.inStable);
    const horsesInStable = playerHorses.filter(h => h.inStable);

    // Không có ngựa trên đường: được ra quân với BẤT KỲ SỐ NÀO (1–6)
    if (horsesOnTrack.length === 0 && horsesInStable.length > 0) {
      return horsesInStable;
    }

    const validMoves: BoardHorse[] = [];
    horsesOnTrack.forEach(h => validMoves.push(h));

    // Nếu đổ 1 hoặc 6 và còn ngựa trong chuồng: có thể ra quân
    if ((roll === 1 || roll === 6) && horsesInStable.length > 0) {
      horsesInStable.forEach(h => validMoves.push(h));
    }

    return validMoves;
  };

  const validMovesThisTurn = turnPhase === 'awaiting_move' ? getValidMovesForPlayer(currentPlayerColor, diceValue) : [];

  const handleProceedToMove = () => {
    setTurnPhase('awaiting_move');
    const validMoves = getValidMovesForPlayer(currentPlayerColor, diceValue);

    if (validMoves.length === 0) {
      addFormattedLog(`⚠️ ${currentPlayer.name} không có nước đi hợp lệ. Tự động qua lượt.`, 'skip');
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      skipTimerRef.current = setTimeout(() => {
        advanceToNextTurn();
      }, 1000);
      return;
    }

    // Nếu là AI: tự động chọn nước đi sau 350ms delay
    if (currentPlayer.isBot) {
      if (aiMoveTimerRef.current) clearTimeout(aiMoveTimerRef.current);
      aiMoveTimerRef.current = setTimeout(() => {
        handleAiChooseMove(validMoves, diceValue);
      }, 350);
    } else {
      // Người chơi (Human): TUYỆT ĐỐI KHÔNG tự động đi!
      // Người chơi tự nhìn các ngựa đang phát sáng viền và tự bấm vào quân cờ để đi
    }
  };

  // AI chọn nước đi thông minh
  const handleAiChooseMove = (validMoves: BoardHorse[], roll: number) => {
    let bestHorse = validMoves[0];
    let highestScore = -999;

    validMoves.forEach(h => {
      let score = 0;
      if (h.inStable) {
        score = 50;
      } else {
        const nextSteps = h.stepsWalked + roll;
        if (nextSteps >= 28) {
          score = 100; // Về đích
        } else {
          const targetPos = (currentPlayer.gateIndex + nextSteps) % 28;
          const opponentsOnTile = horses.filter(
            other => !other.inStable && !other.inGoal && other.color !== currentPlayerColor &&
            ((GATE_INDICES[other.color] + other.stepsWalked) % 28 === targetPos)
          );
          if (opponentsOnTile.length > 0 && !Object.values(GATE_INDICES).includes(targetPos)) {
            score = 90; // Đá đối phương
          } else if (HIGHLIGHTER_TILES.includes(targetPos)) {
            score = 65; // Bút dạ quang
          } else if (FALLACY_WORM_TILES.includes(targetPos)) {
            score = 25; // Sâu ngụy biện
          } else {
            score = 30 + nextSteps;
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestHorse = h;
      }
    });

    // Soi trước con ngựa AI chọn và ô đích đến trong 350ms để người chơi nhìn rõ
    setHoveredHorseId(`${bestHorse.color}_${bestHorse.id}`);
    if (aiHoverTimerRef.current) clearTimeout(aiHoverTimerRef.current);
    aiHoverTimerRef.current = setTimeout(() => {
      setHoveredHorseId(null);
      executeHorseMove(bestHorse, roll);
    }, 350);
  };

  // Tính vị trí ô sẽ đến khi rê chuột/chạm vào ngựa đang sáng
  const calculatePreviewTile = (horse: BoardHorse): number | 'goal' => {
    if (horse.inStable) {
      return currentPlayer.gateIndex;
    }
    const nextSteps = horse.stepsWalked + diceValue;
    if (nextSteps >= 28) {
      return 'goal';
    }
    return (currentPlayer.gateIndex + nextSteps) % 28;
  };

  // Di chuyển quân cờ
  const executeHorseMove = (horse: BoardHorse, roll: number) => {
    if (turnPhase !== 'awaiting_move') return;

    soundFX.playClick();
    setHoveredHorseId(null);

    // 1. Ra quân từ chuồng
    if (horse.inStable) {
      const gatePos = currentPlayer.gateIndex;
      addFormattedLog(`🐎 Ngựa ${horse.id} của ${currentPlayer.name} xuất quân ra ô Cổng #${gatePos}`, 'move');

      let updatedHorses = horses.map(h => {
        if (h.id === horse.id && h.color === horse.color) {
          return { ...h, inStable: false, stepsWalked: 0 };
        }
        return h;
      });

      setHorses(updatedHorses);
      finalizeMoveOutcome(horse, gatePos, updatedHorses);
      return;
    }

    // 2. Di chuyển trên đường đua
    const currentPos = (currentPlayer.gateIndex + horse.stepsWalked) % 28;
    const nextSteps = horse.stepsWalked + roll;

    // Về Đích
    if (nextSteps >= 28) {
      soundFX.playFanfare();
      const updatedHorses = horses.map(h => {
        if (h.id === horse.id && h.color === horse.color) {
          return { ...h, inGoal: true, stepsWalked: 28 };
        }
        return h;
      });

      const currentGoals = updatedHorses.filter(h => h.color === currentPlayerColor && h.inGoal).length;
      addFormattedLog(`🏁 Ngựa ${horse.id} của ${currentPlayer.name} về Đích (${currentGoals}/${horsesPerPlayer})`, 'goal');

      setHorses(updatedHorses);

      const playerRemaining = updatedHorses.filter(h => h.color === currentPlayerColor && !h.inGoal);
      if (playerRemaining.length === 0) {
        setWinnerColor(currentPlayerColor);
        setGameStage('ended');
        addXP(150, `Vô địch Cờ Cá Ngựa Phản Biện!`);
        addFormattedLog(`🏆 ${currentPlayer.name} đã đưa toàn bộ ngựa về Đích và giành chiến thắng chung cuộc!`, 'goal');
        return;
      }

      checkSixRollBonus();
      return;
    }

    // Tiến ô bình thường
    const targetPos = (currentPlayer.gateIndex + nextSteps) % 28;
    addFormattedLog(`🐎 Ngựa ${horse.id} của ${currentPlayer.name} đi ô #${currentPos} → #${targetPos}`, 'move');

    let updatedHorses = horses.map(h => {
      if (h.id === horse.id && h.color === horse.color) {
        return { ...h, stepsWalked: nextSteps };
      }
      return h;
    });

    // Kiểm tra đá ngựa đối thủ (ngoại trừ ô Cổng an toàn)
    const isGateTile = Object.values(GATE_INDICES).includes(targetPos);
    if (!isGateTile) {
      const opponentsOnTile = updatedHorses.filter(
        other => !other.inStable && !other.inGoal && other.color !== currentPlayerColor &&
        ((GATE_INDICES[other.color] + other.stepsWalked) % 28 === targetPos)
      );

      opponentsOnTile.forEach(oppHorse => {
        const oppPlayer = playerConfigs[oppHorse.color];
        if (oppHorse.hasShield) {
          soundFX.playClick();
          addFormattedLog(`🛡️ Khiên của ${oppPlayer.name} đã đỡ đòn ở ô #${targetPos}, không bị đá về Chuồng`, 'shield');
          updatedHorses = updatedHorses.map(h => {
            if (h.id === oppHorse.id && h.color === oppHorse.color) {
              return { ...h, hasShield: false };
            }
            return h;
          });
        } else {
          soundFX.playDamage();
          addFormattedLog(`💥 Ngựa ${horse.id} của ${currentPlayer.name} đá ngựa ${oppHorse.id} của ${oppPlayer.name} ở ô #${targetPos} về Chuồng`, 'kick');
          updatedHorses = updatedHorses.map(h => {
            if (h.id === oppHorse.id && h.color === oppHorse.color) {
              return { ...h, inStable: true, stepsWalked: 0 };
            }
            return h;
          });
        }
      });
    }

    setHorses(updatedHorses);
    finalizeMoveOutcome(horse, targetPos, updatedHorses);
  };

  const finalizeMoveOutcome = (movedHorse: BoardHorse, landingPos: number, currentHorseList: BoardHorse[]) => {
    // 💡 Ô Bút dạ quang: Thưởng lắc thêm
    if (HIGHLIGHTER_TILES.includes(landingPos) && !hasReceivedHighlighterBonus) {
      soundFX.playSuccess();
      setHasReceivedHighlighterBonus(true);
      setHasBonusRoll(true);
      addFormattedLog(`💡 ${currentPlayer.name} đáp trúng ô Bút Dạ Quang (#${landingPos}) · Nhận thêm 1 lượt lắc!`, 'special');
      setTimeout(() => {
        resetForNextRollInSameTurn();
      }, 1500);
      return;
    }

    // 🐛 Ô Sâu ngụy biện: Bắt sâu
    if (FALLACY_WORM_TILES.includes(landingPos)) {
      soundFX.playClick();
      openWormChallengeModal(movedHorse);
      return;
    }

    checkSixRollBonus();
  };

  const openWormChallengeModal = (horse: BoardHorse) => {
    const hardQuestions = HORSE_GAME_QUESTIONS.filter(q => q.difficulty === 'hard');
    const chosen = hardQuestions[Math.floor(Math.random() * hardQuestions.length)] || HORSE_GAME_QUESTIONS[0];

    setWormQuestion(chosen);
    setWormTargetHorse(horse);
    setWormAnswerResult(null);
    setTurnPhase('worm_modal');

    if (currentPlayer.isBot) {
      if (wormTimerRef.current) clearTimeout(wormTimerRef.current);
      wormTimerRef.current = setTimeout(() => {
        const isLucky = Math.random() < 0.5;
        const chosenIdx = isLucky ? chosen.correctIndex : (chosen.correctIndex + 1) % 4;
        handleWormAnswer(chosen, horse, chosenIdx);
      }, 600);
    }
  };

  const handleProceedWorm = () => {
    if (wormTimerRef.current) {
      clearTimeout(wormTimerRef.current);
      wormTimerRef.current = null;
    }
    const wasCorrect = wormAnswerResult?.isCorrect;
    setWormAnswerResult(null);
    if (wasCorrect) {
      checkSixRollBonus();
    } else {
      advanceToNextTurn();
    }
  };

  const handleWormAnswer = (q: HorseGameQuestion, horse: BoardHorse, chosenIndex: number) => {
    const isCorrect = chosenIndex === q.correctIndex;

    if (isCorrect) {
      soundFX.playSuccess();
      setWormAnswerResult({
        isCorrect: true,
        explanation: `Bắt sâu thành công! Ngựa ${horse.id} nhận được 1 Khiên 🛡️ bảo vệ!`
      });
      addFormattedLog(`🐛 ${currentPlayer.name} bắt sâu thành công · Nhận Khiên 🛡️`, 'worm');

      setHorses(prev => prev.map(h => {
        if (h.id === horse.id && h.color === horse.color) {
          return { ...h, hasShield: true };
        }
        return h;
      }));

      if (wormTimerRef.current) clearTimeout(wormTimerRef.current);
      wormTimerRef.current = setTimeout(() => {
        handleProceedWorm();
      }, 1000);
    } else {
      soundFX.playDamage();
      setWormAnswerResult({
        isCorrect: false,
        explanation: `Bị sâu cắn! Bạn trả lời sai. ${currentPlayer.name} bị phạt nghỉ 1 lượt ở vòng kế tiếp.`
      });
      addFormattedLog(`🐛 ${currentPlayer.name} bị sâu cắn · Nghỉ 1 lượt kế tiếp`, 'worm');

      setSkipNextTurn(prev => ({ ...prev, [currentPlayerColor]: true }));

      if (wormTimerRef.current) clearTimeout(wormTimerRef.current);
      wormTimerRef.current = setTimeout(() => {
        handleProceedWorm();
      }, 1200);
    }
  };

  const checkSixRollBonus = () => {
    if (diceValue === 6 && !hasReceivedSixBonus) {
      soundFX.playSuccess();
      setHasReceivedSixBonus(true);
      setHasBonusRoll(true);
      addFormattedLog(`🎲 Đổ được 6 · ${currentPlayer.name} được thưởng thêm 1 lượt lắc!`, 'roll');
      setTimeout(() => {
        resetForNextRollInSameTurn();
      }, 500);
    } else {
      advanceToNextTurn();
    }
  };

  const resetForNextRollInSameTurn = () => {
    setTurnPhase('awaiting_roll');
  };

  const advanceToNextTurn = () => {
    clearAllAiTimers();
    setHasBonusRoll(false);
    setHasReceivedHighlighterBonus(false);
    setHasReceivedSixBonus(false);
    setHoveredHorseId(null);
    setTurnPhase('awaiting_roll');
    setCurrentTurnIndex(prev => (prev + 1) % activeColors.length);
  };

  // Tọa độ 28 ô viền ngoài lưới 8x8 (theo chiều kim đồng hồ)
  // #0..#7: Cạnh trên (Row 1, Col 1..8)
  // #8..#13: Cạnh phải (Row 2..7, Col 8)
  // #14..#21: Cạnh dưới (Row 8, Col 8..1)
  // #22..#27: Cạnh trái (Row 7..2, Col 1)
  const getTileGridCoords = (index: number) => {
    if (index >= 0 && index <= 7) {
      return { col: index + 1, row: 1 };
    } else if (index >= 8 && index <= 13) {
      return { col: 8, row: index - 7 + 1 };
    } else if (index >= 14 && index <= 21) {
      return { col: 8 - (index - 14), row: 8 };
    } else if (index >= 22 && index <= 27) {
      return { col: 1, row: 8 - (index - 21) };
    }
    return { col: 1, row: 1 };
  };

  const getHorsesOnTrackTile = (tileIndex: number) => {
    return horses.filter(h => {
      if (h.inStable || h.inGoal) return false;
      const pos = (GATE_INDICES[h.color] + h.stepsWalked) % 28;
      return pos === tileIndex;
    });
  };

  // Xác định ô đích đến đang được preview khi rê chuột lên ngựa
  const previewTileIndex = hoveredHorseId ? (() => {
    const [c, hId] = hoveredHorseId.split('_');
    const targetH = horses.find(h => h.color === c && h.id === Number(hId));
    if (!targetH) return null;
    return calculatePreviewTile(targetH);
  })() : null;

  // Thanh trạng thái 1 dòng
  const getStatusBarText = () => {
    if (turnPhase === 'awaiting_roll') {
      if (hasBonusRoll) {
        return currentPlayer.isBot
          ? `🎉 Lượt lắc thưởng của ${currentPlayer.name} (AI)...`
          : `🎉 Lượt lắc thưởng của ${currentPlayer.name} – Bấm "Lắc xúc xắc" để tiếp tục!`;
      }
      return currentPlayer.isBot
        ? `Lượt của ${currentPlayer.name} – AI đang suy nghĩ lắc xúc xắc...`
        : `Lượt của ${currentPlayer.name} – Bấm "Lắc xúc xắc" để bắt đầu`;
    }
    if (turnPhase === 'question_modal') {
      if (!isAnswerSubmitted) {
        return `${currentPlayer.name} đổ được ${diceValue} – Trả lời câu hỏi để được đi`;
      }
      return answerResult?.isCorrect
        ? `Đúng rồi! Chuẩn bị di chuyển ${diceValue} ô...`
        : `Chưa đúng – ${currentPlayer.name} đứng yên, chuyển lượt`;
    }
    if (turnPhase === 'awaiting_move') {
      return `Đúng rồi! Chọn 1 ngựa đang sáng để đi ${diceValue} ô`;
    }
    if (turnPhase === 'worm_modal') {
      return `🐛 Đang giải câu đố Bắt Sâu Ngụy Biện để nhận Khiên!`;
    }
    return '';
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">

      {/* ========================================================================= */}
      {/* 1. MÀN THIẾT LẬP TRƯỚC VÁN (SETUP VIEW)                                   */}
      {/* ========================================================================= */}
      {gameStage === 'setup' && (
        <div className="rounded-2xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E5E1D8] gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-bold mb-2">
                <Dices className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Cờ Cá Ngựa Phản Biện</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1E2433]">
                Thiết Lập Ván Cờ
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5263] mt-0.5">
                Mỗi lần lắc xúc xắc đều phải trả lời câu hỏi phản biện. Trả lời đúng mới được xuất quân và di chuyển!
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setShowFullRulesModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E1D8] bg-[#F8F6F1] hover:bg-[#F2EFE8] text-[#1E2433] text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <HelpCircle className="w-4 h-4 text-[#D97706]" />
              <span>Xem luật đầy đủ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Người chơi */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#1E2433] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D97706]" />
                <span>Chọn số người chơi & Thiết lập</span>
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#4A5263]">Số người:</span>
                <div className="flex gap-2">
                  {([2, 3, 4] as const).map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setPlayerCount(count);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        playerCount === count
                          ? 'bg-[#FACC15] text-[#1E2433] border-[#EAB308]'
                          : 'bg-[#F8F6F1] text-[#4A5263] border-[#E5E1D8] hover:bg-[#F2EFE8]'
                      }`}
                    >
                      {count} người
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {getActiveColorsForCount(playerCount).map((colorKey) => {
                  const cfg = playerConfigs[colorKey];
                  return (
                    <div 
                      key={colorKey}
                      className="p-3 rounded-xl border border-[#E5E1D8] bg-[#F8F6F1] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span 
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                          style={{ backgroundColor: cfg.colorHex }}
                        >
                          {cfg.colorName[0]}
                        </span>
                        <input
                          type="text"
                          value={cfg.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setPlayerConfigs(prev => ({
                              ...prev,
                              [colorKey]: { ...prev[colorKey], name: newName }
                            }));
                          }}
                          className="w-full text-xs font-bold text-[#1E2433] bg-white border border-[#E5E1D8] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#FACC15]"
                          placeholder={`Tên ${cfg.colorName}`}
                        />
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setPlayerConfigs(prev => ({
                              ...prev,
                              [colorKey]: { ...prev[colorKey], isBot: false }
                            }));
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                            !cfg.isBot ? 'bg-[#FACC15] text-[#1E2433] border-[#EAB308]' : 'bg-white text-[#4A5263] border-[#E5E1D8]'
                          }`}
                        >
                          <User className="w-3 h-3" />
                          <span>Người</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setPlayerConfigs(prev => ({
                              ...prev,
                              [colorKey]: { ...prev[colorKey], isBot: true }
                            }));
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                            cfg.isBot ? 'bg-[#1E2433] text-white border-[#1E2433]' : 'bg-white text-[#4A5263] border-[#E5E1D8]'
                          }`}
                        >
                          <Bot className="w-3 h-3" />
                          <span>AI</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kiểu ván & Thời gian */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1E2433] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D97706]" />
                  <span>Kiểu ván đấu</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setHorsesPerPlayer(1);
                    }}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      horsesPerPlayer === 1
                        ? 'bg-[#FEF3C7] border-[#FACC15]'
                        : 'bg-[#F8F6F1] border-[#E5E1D8] hover:bg-[#F2EFE8]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#1E2433]">⚡ Ván nhanh – 1 ngựa</div>
                    <div className="text-[11px] text-[#4A5263] mt-0.5">1 ngựa về Đích là thắng ngay.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setHorsesPerPlayer(2);
                    }}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      horsesPerPlayer === 2
                        ? 'bg-[#FEF3C7] border-[#FACC15]'
                        : 'bg-[#F8F6F1] border-[#E5E1D8] hover:bg-[#F2EFE8]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#1E2433]">🏆 Ván thường – 2 ngựa</div>
                    <div className="text-[11px] text-[#4A5263] mt-0.5">Đưa cả 2 ngựa về Đích.</div>
                  </button>
                </div>
              </div>

              {/* Thời gian câu hỏi */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1E2433] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                  <span>Thời gian trả lời mỗi câu:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[20, 30, 45].map(secs => (
                    <button
                      key={secs}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setQuestionTimeLimit(secs);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center ${
                        questionTimeLimit === secs
                          ? 'bg-[#FACC15] text-[#1E2433] border-[#EAB308]'
                          : 'bg-[#F8F6F1] text-[#4A5263] border-[#E5E1D8]'
                      }`}
                    >
                      {secs} giây
                    </button>
                  ))}
                </div>
              </div>

              {/* Giới hạn thời gian ván */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1E2433] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                  <span>Giới hạn thời gian ván:</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 0, label: 'Vô hạn' },
                    { value: 10, label: '10 phút' },
                    { value: 15, label: '15 phút' },
                    { value: 20, label: '20 phút' }
                  ].map(item => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setMatchTimeLimitMinutes(item.value);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center ${
                        matchTimeLimitMinutes === item.value
                          ? 'bg-[#FACC15] text-[#1E2433] border-[#EAB308]'
                          : 'bg-[#F8F6F1] text-[#4A5263] border-[#E5E1D8]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#EAB308]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>BẮT ĐẦU VÁN CỜ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MÀN HÌNH CHƠI (PLAYING VIEW)                                           */}
      {/* ========================================================================= */}
      {gameStage === 'playing' && (
        <div className="space-y-4">

          {/* THANH TRẠNG THÁI 1 DÒNG DUY NHẤT & ĐỒNG HỒ */}
          <div className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] px-4 py-3 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span 
                className="w-3.5 h-3.5 rounded-full shrink-0 animate-pulse"
                style={{ backgroundColor: currentPlayer.colorHex }}
              />
              <span className="font-bold text-xs sm:text-sm text-[#1E2433] truncate">
                {getStatusBarText()}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {matchTimeLimitMinutes > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F6F1] border border-[#E5E1D8]">
                  <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                  <span className="font-mono text-xs font-bold text-[#1E2433]">
                    {formatTimer(matchSecondsRemaining)}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  if (confirm('Bạn có chắc muốn làm mới và thiết lập lại ván đấu?')) {
                    setGameStage('setup');
                  }
                }}
                className="p-1.5 rounded-lg border border-[#E5E1D8] hover:bg-[#F2EFE8] text-[#4A5263] transition-colors cursor-pointer"
                title="Làm mới ván"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* KHU VỰC BÀN CỜ 8x8 & CỘT BÊN CẠNH */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* CỘT TRÁI: BÀN CỜ 8x8 (8 Cột) */}
            <div className="lg:col-span-8 flex flex-col items-center">
              <div className="w-full max-w-[560px] mx-auto rounded-2xl border border-[#E5E1D8] bg-[#FFFFFF] p-2.5 sm:p-4 shadow-sm">
                
                {/* Lưới 8x8 với 28 ô viền ngoài */}
                <div className="w-full aspect-square relative bg-[#F8F6F1] rounded-2xl p-2 sm:p-2.5 border border-[#E5E1D8] shadow-inner grid grid-cols-8 grid-rows-8 gap-1 sm:gap-1.5">
                  
                  {/* 28 Ô VIỀN NGOÀI CHẠY THEO CHIỀU KIM ĐỒNG HỒ */}
                  {Array.from({ length: 28 }).map((_, tileIndex) => {
                    const coords = getTileGridCoords(tileIndex);
                    const isHighlighter = HIGHLIGHTER_TILES.includes(tileIndex);
                    const isWorm = FALLACY_WORM_TILES.includes(tileIndex);
                    
                    const gateColor = Object.entries(GATE_INDICES).find(([, gIdx]) => gIdx === tileIndex)?.[0] as PlayerColor | undefined;
                    const isGate = !!gateColor;

                    const horsesHere = getHorsesOnTrackTile(tileIndex);
                    const isPreviewedLanding = previewTileIndex === tileIndex;

                    return (
                      <div
                        key={tileIndex}
                        className={`relative rounded-lg border flex flex-col items-center justify-between p-0.5 sm:p-1 transition-all select-none ${
                          isPreviewedLanding
                            ? 'ring-3 ring-[#FACC15] bg-[#FEF08A] z-20 shadow-md animate-pulse'
                            : isGate
                            ? 'border-2 shadow-xs'
                            : isHighlighter
                            ? 'bg-[#FEF9C3] border-[#FACC15]'
                            : isWorm
                            ? 'bg-[#FEE2E2] border-[#F87171]'
                            : 'bg-[#FFFFFF] border-[#E5E1D8]'
                        }`}
                        style={{
                          gridColumn: coords.col,
                          gridRow: coords.row,
                          borderColor: isGate ? COLOR_CONFIGS[gateColor].colorHex : undefined,
                          backgroundColor: isGate ? `${COLOR_CONFIGS[gateColor].colorHex}18` : undefined
                        }}
                      >
                        {/* Số thứ tự ô & icon đặc biệt */}
                        <div className="w-full flex items-center justify-between text-[8px] sm:text-[9px] font-mono font-bold leading-none px-0.5">
                          <span className={isGate ? 'font-extrabold' : 'text-[#6B7280]'}>
                            #{tileIndex}
                          </span>
                          {isHighlighter && <span title="Ô Bút dạ quang">💡</span>}
                          {isWorm && <span title="Ô Sâu ngụy biện">🐛</span>}
                          {isGate && (
                            <span 
                              className="text-[7px] sm:text-[8px] font-black uppercase px-0.5 rounded text-white"
                              style={{ backgroundColor: COLOR_CONFIGS[gateColor].colorHex }}
                            >
                              CỔNG
                            </span>
                          )}
                        </div>

                        {/* Mũi tên chỉ chiều đi ở 4 cạnh */}
                        {tileIndex === 3 && <div className="text-[10px] text-[#A16207] font-bold">➔</div>}
                        {tileIndex === 10 && <div className="text-[10px] text-[#A16207] font-bold">🠗</div>}
                        {tileIndex === 17 && <div className="text-[10px] text-[#A16207] font-bold">🠔</div>}
                        {tileIndex === 24 && <div className="text-[10px] text-[#A16207] font-bold">🠕</div>}

                        {/* Hiển thị các ngựa đang đứng trên ô này */}
                        <div className="flex items-center justify-center gap-0.5 flex-wrap">
                          {horsesHere.map(h => {
                            const isCurrentTurnPawn = h.color === currentPlayerColor;
                            const isMovable = turnPhase === 'awaiting_move' && isCurrentTurnPawn && validMovesThisTurn.some(v => v.id === h.id && !v.inStable);

                            return (
                              <button
                                key={`${h.color}_${h.id}`}
                                type="button"
                                disabled={!isMovable || currentPlayer.isBot}
                                onMouseEnter={() => isMovable && setHoveredHorseId(`${h.color}_${h.id}`)}
                                onMouseLeave={() => setHoveredHorseId(null)}
                                onClick={() => {
                                  if (isMovable && !currentPlayer.isBot) {
                                    executeHorseMove(h, diceValue);
                                  }
                                }}
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs text-white shadow-xs transition-all relative ${
                                  isMovable && !currentPlayer.isBot
                                    ? 'cursor-pointer hover:scale-125 ring-2 ring-[#FACC15] animate-pulse z-10'
                                    : turnPhase === 'awaiting_move'
                                    ? 'opacity-40 cursor-not-allowed'
                                    : 'cursor-default'
                                }`}
                                style={{ backgroundColor: COLOR_CONFIGS[h.color].colorHex }}
                                title={`Ngựa #${h.id} của ${playerConfigs[h.color].name}`}
                              >
                                <span>{h.id}</span>
                                {h.hasShield && (
                                  <span className="absolute -top-1 -right-1 text-[9px]">
                                    🛡️
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* 4 CHUỒNG SÁT GÓC CỔNG TƯƠNG ỨNG */}
                  
                  {/* 1. Chuồng Đỏ (Sát Cổng #0: Col 2..3, Row 2..3) */}
                  <div 
                    className="rounded-xl border-2 border-[#EF4444] bg-[#EF4444]/10 p-1.5 flex flex-col justify-between"
                    style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}
                  >
                    <div className="flex items-center justify-between text-[9px] font-bold text-[#DC2626]">
                      <span>Chuồng Đỏ</span>
                      <span className="text-[8px] font-mono">Cổng #0</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      {horses.filter(h => h.color === 'red' && h.inStable).map(h => {
                        const isMovable = turnPhase === 'awaiting_move' && currentPlayerColor === 'red' && validMovesThisTurn.some(v => v.id === h.id && v.inStable);

                        return (
                          <button
                            key={h.id}
                            type="button"
                            disabled={!isMovable || currentPlayer.isBot}
                            onMouseEnter={() => isMovable && setHoveredHorseId(`red_${h.id}`)}
                            onMouseLeave={() => setHoveredHorseId(null)}
                            onClick={() => {
                              if (isMovable && !currentPlayer.isBot) {
                                executeHorseMove(h, diceValue);
                              }
                            }}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EF4444] text-white font-bold text-[11px] flex items-center justify-center shadow-xs transition-all ${
                              isMovable && !currentPlayer.isBot
                                ? 'cursor-pointer hover:scale-125 ring-2 ring-[#FACC15] animate-pulse'
                                : turnPhase === 'awaiting_move'
                                ? 'opacity-40 cursor-not-allowed'
                                : 'cursor-default'
                            }`}
                            title="Ngựa Đỏ trong chuồng"
                          >
                            🐎{h.id}
                          </button>
                        );
                      })}
                      {horses.filter(h => h.color === 'red' && h.inStable).length === 0 && (
                        <span className="text-[9px] text-[#6B7280] italic">Trống</span>
                      )}
                    </div>
                  </div>

                  {/* 2. Chuồng Xanh Dương (Sát Cổng #7: Col 6..7, Row 2..3) */}
                  <div 
                    className="rounded-xl border-2 border-[#2563EB] bg-[#2563EB]/10 p-1.5 flex flex-col justify-between"
                    style={{ gridColumn: '6 / 8', gridRow: '2 / 4' }}
                  >
                    <div className="flex items-center justify-between text-[9px] font-bold text-[#2563EB]">
                      <span>Chuồng Xanh</span>
                      <span className="text-[8px] font-mono">Cổng #7</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      {horses.filter(h => h.color === 'blue' && h.inStable).map(h => {
                        const isMovable = turnPhase === 'awaiting_move' && currentPlayerColor === 'blue' && validMovesThisTurn.some(v => v.id === h.id && v.inStable);

                        return (
                          <button
                            key={h.id}
                            type="button"
                            disabled={!isMovable || currentPlayer.isBot}
                            onMouseEnter={() => isMovable && setHoveredHorseId(`blue_${h.id}`)}
                            onMouseLeave={() => setHoveredHorseId(null)}
                            onClick={() => {
                              if (isMovable && !currentPlayer.isBot) {
                                executeHorseMove(h, diceValue);
                              }
                            }}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2563EB] text-white font-bold text-[11px] flex items-center justify-center shadow-xs transition-all ${
                              isMovable && !currentPlayer.isBot
                                ? 'cursor-pointer hover:scale-125 ring-2 ring-[#FACC15] animate-pulse'
                                : turnPhase === 'awaiting_move'
                                ? 'opacity-40 cursor-not-allowed'
                                : 'cursor-default'
                            }`}
                            title="Ngựa Xanh trong chuồng"
                          >
                            🐎{h.id}
                          </button>
                        );
                      })}
                      {horses.filter(h => h.color === 'blue' && h.inStable).length === 0 && (
                        <span className="text-[9px] text-[#6B7280] italic">Trống</span>
                      )}
                    </div>
                  </div>

                  {/* 3. Chuồng Vàng (Sát Cổng #14: Col 6..7, Row 6..7) */}
                  <div 
                    className="rounded-xl border-2 border-[#EAB308] bg-[#EAB308]/15 p-1.5 flex flex-col justify-between"
                    style={{ gridColumn: '6 / 8', gridRow: '6 / 8' }}
                  >
                    <div className="flex items-center justify-between text-[9px] font-bold text-[#854D0E]">
                      <span>Chuồng Vàng</span>
                      <span className="text-[8px] font-mono">Cổng #14</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      {horses.filter(h => h.color === 'yellow' && h.inStable).map(h => {
                        const isMovable = turnPhase === 'awaiting_move' && currentPlayerColor === 'yellow' && validMovesThisTurn.some(v => v.id === h.id && v.inStable);

                        return (
                          <button
                            key={h.id}
                            type="button"
                            disabled={!isMovable || currentPlayer.isBot}
                            onMouseEnter={() => isMovable && setHoveredHorseId(`yellow_${h.id}`)}
                            onMouseLeave={() => setHoveredHorseId(null)}
                            onClick={() => {
                              if (isMovable && !currentPlayer.isBot) {
                                executeHorseMove(h, diceValue);
                              }
                            }}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EAB308] text-[#1E2433] font-bold text-[11px] flex items-center justify-center shadow-xs transition-all ${
                              isMovable && !currentPlayer.isBot
                                ? 'cursor-pointer hover:scale-125 ring-2 ring-[#FACC15] animate-pulse'
                                : turnPhase === 'awaiting_move'
                                ? 'opacity-40 cursor-not-allowed'
                                : 'cursor-default'
                            }`}
                            title="Ngựa Vàng trong chuồng"
                          >
                            🐎{h.id}
                          </button>
                        );
                      })}
                      {horses.filter(h => h.color === 'yellow' && h.inStable).length === 0 && (
                        <span className="text-[9px] text-[#6B7280] italic">Trống</span>
                      )}
                    </div>
                  </div>

                  {/* 4. Chuồng Xanh Lá (Sát Cổng #21: Col 2..3, Row 6..7) */}
                  <div 
                    className="rounded-xl border-2 border-[#16A34A] bg-[#16A34A]/10 p-1.5 flex flex-col justify-between"
                    style={{ gridColumn: '2 / 4', gridRow: '6 / 8' }}
                  >
                    <div className="flex items-center justify-between text-[9px] font-bold text-[#16A34A]">
                      <span>Chuồng Lá</span>
                      <span className="text-[8px] font-mono">Cổng #21</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      {horses.filter(h => h.color === 'green' && h.inStable).map(h => {
                        const isMovable = turnPhase === 'awaiting_move' && currentPlayerColor === 'green' && validMovesThisTurn.some(v => v.id === h.id && v.inStable);

                        return (
                          <button
                            key={h.id}
                            type="button"
                            disabled={!isMovable || currentPlayer.isBot}
                            onMouseEnter={() => isMovable && setHoveredHorseId(`green_${h.id}`)}
                            onMouseLeave={() => setHoveredHorseId(null)}
                            onClick={() => {
                              if (isMovable && !currentPlayer.isBot) {
                                executeHorseMove(h, diceValue);
                              }
                            }}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#16A34A] text-white font-bold text-[11px] flex items-center justify-center shadow-xs transition-all ${
                              isMovable && !currentPlayer.isBot
                                ? 'cursor-pointer hover:scale-125 ring-2 ring-[#FACC15] animate-pulse'
                                : turnPhase === 'awaiting_move'
                                ? 'opacity-40 cursor-not-allowed'
                                : 'cursor-default'
                            }`}
                            title="Ngựa Xanh Lá trong chuồng"
                          >
                            🐎{h.id}
                          </button>
                        );
                      })}
                      {horses.filter(h => h.color === 'green' && h.inStable).length === 0 && (
                        <span className="text-[9px] text-[#6B7280] italic">Trống</span>
                      )}
                    </div>
                  </div>

                  {/* KHU VỰC CHÍNH GIỮA: ĐÍCH ĐẾN & NÚT LẮC XÚC XẮC */}
                  <div 
                    className={`rounded-2xl bg-[#FFFFFF] border-2 shadow-sm p-1.5 sm:p-2.5 flex flex-col items-center justify-between text-center z-10 transition-all ${
                      previewTileIndex === 'goal' ? 'border-[#FACC15] ring-4 ring-[#FACC15]/40 bg-[#FEF9C3]/50' : 'border-[#E5E1D8]'
                    }`}
                    style={{ gridColumn: '4 / 6', gridRow: '3 / 7' }}
                  >
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[#A16207] uppercase">
                      <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>ĐÍCH ĐẾN</span>
                    </div>

                    {/* Tiến độ Đích các phe */}
                    <div className="grid grid-cols-2 gap-1 w-full text-[9px] font-bold">
                      {activeColors.map(color => {
                        const goalCount = horses.filter(h => h.color === color && h.inGoal).length;
                        return (
                          <div
                            key={color}
                            className="px-1 py-1 rounded border flex items-center justify-between"
                            style={{
                              borderColor: COLOR_CONFIGS[color].colorHex,
                              backgroundColor: `${COLOR_CONFIGS[color].colorHex}12`,
                              color: COLOR_CONFIGS[color].colorHex
                            }}
                          >
                            <span>{playerConfigs[color].name[0]}</span>
                            <span>🏁{goalCount}/{horsesPerPlayer}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Hiển thị ngựa đã về đích an toàn */}
                    {horses.some(h => h.inGoal) && (
                      <div className="flex items-center justify-center gap-1 flex-wrap my-0.5">
                        {horses.filter(h => h.inGoal).map(h => (
                          <span
                            key={`goal_${h.color}_${h.id}`}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: COLOR_CONFIGS[h.color].colorHex }}
                            title={`Ngựa #${h.id} của ${playerConfigs[h.color].name} đã về đích`}
                          >
                            {h.id}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Nút Lắc Xúc Xắc / Hiển thị nút xúc xắc */}
                    <div className="w-full pt-1">
                      {turnPhase === 'awaiting_roll' ? (
                        <button
                          type="button"
                          disabled={isRolling || currentPlayer.isBot}
                          onClick={executeDiceRoll}
                          className={`w-full py-1.5 px-2 rounded-lg font-bold text-[10px] sm:text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all ${
                            currentPlayer.isBot
                              ? 'bg-[#F2EFE8] text-[#6B7280] cursor-not-allowed'
                              : hasBonusRoll
                              ? 'bg-[#FACC15] text-[#1E2433] hover:bg-[#EAB308] cursor-pointer ring-2 ring-[#EAB308] animate-bounce'
                              : 'bg-[#FACC15] text-[#1E2433] hover:bg-[#EAB308] cursor-pointer'
                          }`}
                        >
                          <Dices className={`w-3.5 h-3.5 ${isRolling ? 'animate-spin' : ''}`} />
                          <span>
                            {currentPlayer.isBot
                              ? (hasBonusRoll ? 'AI LẮC THƯỞNG...' : 'AI LẮC...')
                              : (hasBonusRoll ? '🎉 LẮC THƯỞNG' : 'LẮC XÚC XẮC')}
                          </span>
                        </button>
                      ) : (
                        <div className="py-1 px-1.5 rounded-lg bg-[#F8F6F1] border border-[#E5E1D8] text-[10px] font-mono font-bold text-[#1E2433]">
                          🎲 Đổ được {diceValue} nút
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* CỘT PHẢI: BẢNG NGƯỜI CHƠI, LUẬT NHANH & NHẬT KÝ (4 Cột) */}
            <div className="lg:col-span-4 space-y-3">
              
              {/* 1. DANH SÁCH NGƯỜI CHƠI (GỌN 1 DÒNG, KHÔNG VỠ CHỮ) */}
              <div className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-3 space-y-2 shadow-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#E5E1D8]">
                  <span className="text-xs font-bold text-[#1E2433] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Đấu thủ</span>
                  </span>
                  <span className="text-[10px] text-[#6B7280] font-mono">Ván {horsesPerPlayer} ngựa</span>
                </div>

                <div className="space-y-1.5">
                  {activeColors.map((color, idx) => {
                    const cfg = playerConfigs[color];
                    const isTurn = idx === currentTurnIndex;
                    const stats = playerStats[color];
                    const inStableCount = horses.filter(h => h.color === color && h.inStable).length;
                    const onTrackCount = horses.filter(h => h.color === color && !h.inStable && !h.inGoal).length;
                    const goalCount = horses.filter(h => h.color === color && h.inGoal).length;
                    const hasShield = horses.some(h => h.color === color && h.hasShield);
                    const isSkipped = skipNextTurn[color];

                    return (
                      <div
                        key={color}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                          isTurn
                            ? 'border-[#FACC15] bg-[#FEF3C7] shadow-xs'
                            : 'border-[#E5E1D8] bg-[#F8F6F1]'
                        }`}
                      >
                        {/* Tên & Chấm màu */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cfg.colorHex }}
                          />
                          <span className="font-bold text-[#1E2433] truncate max-w-[75px] sm:max-w-[90px]">
                            {cfg.name}
                          </span>
                          {cfg.isBot && (
                            <span className="text-[9px] px-1 rounded bg-[#E5E1D8] text-[#4A5263] font-bold">
                              AI
                            </span>
                          )}
                        </div>

                        {/* Chuồng X · Trên đường Y · Đích Z */}
                        <div className="text-[10px] font-mono text-[#4A5263] whitespace-nowrap">
                          Chuồng {inStableCount} · Đường {onTrackCount} · Đích {goalCount}/{horsesPerPlayer}
                        </div>

                        {/* Tỉ lệ câu & Badge Khiên/Nghỉ */}
                        <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono">
                          <span className="text-[#1E2433] font-semibold">
                            {stats.correct}/{stats.total}
                          </span>
                          {hasShield && <span title="Có khiên bảo vệ">🛡️</span>}
                          {isSkipped && (
                            <span className="px-1 py-0.2 rounded bg-[#FEE2E2] text-[#DC2626] font-bold text-[9px]">
                              Nghỉ
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. THẺ LUẬT NHANH (THU GỌN ĐƯỢC) */}
              <div className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsQuickRulesExpanded(!isQuickRulesExpanded)}
                  className="w-full p-2.5 bg-[#FEF3C7]/40 hover:bg-[#FEF3C7] text-left flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="font-bold text-xs text-[#92400E] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Luật Nhanh Bàn Cờ</span>
                  </span>
                  {isQuickRulesExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#92400E]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#92400E]" />}
                </button>

                {isQuickRulesExpanded && (
                  <div className="p-3 text-[11px] text-[#4A5263] space-y-2 border-t border-[#E5E1D8] leading-relaxed">
                    <p>
                      • Lắc xong <strong>phải trả lời câu hỏi</strong>: 1–2 Dễ, 3–4 Vừa, 5–6 Khó.
                      <br />
                      • <strong>Đúng mới được đi</strong>. Chưa có ngựa trên đường thì đúng là được ra quân.
                      <br />
                      • Đổ 6 được lắc thêm · Dừng trúng đối thủ là <strong>đá về Chuồng</strong>.
                      <br />
                      • <strong>Ô Cổng an toàn</strong> (không bị đá) · 💡 lắc thêm · 🐛 đúng nhận Khiên 🛡️, sai nghỉ 1 lượt.
                      <br />
                      • Đi đủ <strong>28 bước</strong> là vào Đích an toàn!
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowFullRulesModal(true)}
                      className="text-xs text-[#B45309] hover:underline font-bold flex items-center gap-1 cursor-pointer pt-0.5"
                    >
                      <span>Xem hướng dẫn luật đầy đủ & ví dụ</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* 3. NHẬT KÝ VÁN CỜ (DÒNG MỚI NHẤT Ở TRÊN CÙNG) */}
              <div className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-3 space-y-2 shadow-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#E5E1D8]">
                  <span className="text-xs font-bold text-[#1E2433] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Nhật ký ván cờ</span>
                  </span>
                  <span className="text-[10px] text-[#6B7280] font-mono">Mới nhất trên cùng</span>
                </div>

                <div 
                  ref={logsEndRef}
                  className="h-44 sm:h-52 overflow-y-auto space-y-1.5 pr-1 text-[11px]"
                >
                  {gameLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-1.5 rounded-lg border ${
                        log.type === 'kick' ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B] font-semibold' :
                        log.type === 'goal' ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534] font-bold' :
                        log.type === 'correct' ? 'bg-[#FEF9C3]/50 border-[#FDE68A] text-[#1E2433]' :
                        log.type === 'wrong' ? 'bg-[#F8F6F1] border-[#E5E1D8] text-[#6B7280]' :
                        log.type === 'shield' ? 'bg-[#DBEAFE] border-[#BFDBFE] text-[#1E40AF]' :
                        'bg-[#F8F6F1] border-[#E5E1D8] text-[#1E2433]'
                      }`}
                    >
                      <div className="leading-snug">{log.text}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MÀN HÌNH KẾT THÚC (ENDED VIEW)                                        */}
      {/* ========================================================================= */}
      {gameStage === 'ended' && (
        <div className="rounded-2xl border border-[#E5E1D8] bg-[#FFFFFF] p-6 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mx-auto shadow-xs">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433]">
              Ván Cờ Đã Kết Thúc!
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5263]">
              {winnerColor ? (
                <span>
                  Chúc mừng <strong>{playerConfigs[winnerColor].name}</strong> đã xuất sắc đưa ngựa về Đích chiến thắng!
                </span>
              ) : (
                'Ván cờ kết thúc theo thời gian thi đấu.'
              )}
            </p>
          </div>

          {/* Bảng Xếp Hạng */}
          <div className="max-w-md mx-auto rounded-xl border border-[#E5E1D8] overflow-hidden bg-[#F8F6F1] text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F2EFE8] border-b border-[#E5E1D8] font-bold text-[#1E2433]">
                <tr>
                  <th className="py-2.5 px-3">Hạng</th>
                  <th className="py-2.5 px-3">Đấu thủ</th>
                  <th className="py-2.5 px-3 text-center">Về Đích</th>
                  <th className="py-2.5 px-3 text-center">Đúng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D8]">
                {activeColors
                  .map(color => {
                    const cfg = playerConfigs[color];
                    const goalCount = horses.filter(h => h.color === color && h.inGoal).length;
                    const totalSteps = horses.filter(h => h.color === color).reduce((acc, h) => acc + (h.inGoal ? 28 : h.stepsWalked), 0);
                    const stats = playerStats[color];
                    return { color, cfg, goalCount, totalSteps, stats };
                  })
                  .sort((a, b) => b.goalCount !== a.goalCount ? b.goalCount - a.goalCount : b.totalSteps - a.totalSteps)
                  .map((item, idx) => (
                    <tr key={item.color} className={idx === 0 ? 'bg-[#FEF3C7]/40 font-bold' : ''}>
                      <td className="py-2 px-3 font-mono">{idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : '4'}</td>
                      <td className="py-2 px-3 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.cfg.colorHex }} />
                        <span>{item.cfg.name}</span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{item.goalCount}/{horsesPerPlayer}</td>
                      <td className="py-2 px-3 text-center font-mono">{item.stats.correct}/{item.stats.total}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setShowReviewModal(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] hover:bg-[#F8F6F1] text-[#1E2433] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-[#D97706]" />
              <span>Xem lại các câu hỏi đã trả lời</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setGameStage('setup');
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[#EAB308] shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi ván mới</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. KHUNG CÂU HỎI (QUESTION MODAL NỔI BẬT GIỮA MÀN HÌNH)                  */}
      {/* ========================================================================= */}
      {turnPhase === 'question_modal' && currentQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            
            {/* DÒNG ĐẦU: Chấm màu + Tên + Đổ được N + Câu hỏi mức X + Đếm ngược */}
            <div className="space-y-2 pb-3 border-b border-[#E5E1D8]">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: currentPlayer.colorHex }}
                  />
                  <span className="font-bold text-xs sm:text-sm text-[#1E2433]">
                    Lượt của {currentPlayer.name} · Đổ được {diceValue} · Câu hỏi mức {
                      currentQuestion.difficulty === 'easy' ? 'Dễ' : currentQuestion.difficulty === 'medium' ? 'Vừa' : 'Khó'
                    }
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  currentQuestion.difficulty === 'easy'
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                    : currentQuestion.difficulty === 'medium'
                    ? 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]'
                    : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
                }`}>
                  {currentQuestion.difficulty === 'easy' ? 'Dễ' : currentQuestion.difficulty === 'medium' ? 'Vừa' : 'Khó'}
                </span>
              </div>

              {/* DÒNG NHỎ NÓI RÕ PHẦN THƯỞNG */}
              <div className="text-[11px] font-semibold text-[#B45309]">
                🎁 Trả lời đúng để được đi {diceValue} ô
              </div>

              {/* Thanh đếm ngược thời gian */}
              {!isAnswerSubmitted && (
                <div className="w-full h-1.5 bg-[#F2EFE8] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FACC15] transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${(questionCountdown / questionTimeLimit) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* TÌNH HUỐNG HIỂN THỊ DẠNG BÌNH LUẬN / TIN NHẮN (KHUNG TRÍCH DẪN, CHỮ NGHIÊNG) */}
            <div className="p-3.5 rounded-xl bg-[#F8F6F1] border-l-4 border-l-[#FACC15] border-y border-r border-[#E5E1D8] space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#A16207]">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Bình luận tình huống ({currentQuestion.category}):</span>
              </div>
              <p className="text-xs text-[#1E2433] italic leading-relaxed">
                "{currentQuestion.situation}"
              </p>
            </div>

            {/* CÂU HỎI */}
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#1E2433] leading-snug">
                {currentQuestion.question}
              </h3>
            </div>

            {/* AI đang suy nghĩ */}
            {currentPlayer.isBot && aiThinking && (
              <div className="py-4 text-center space-y-1.5">
                <Bot className="w-6 h-6 text-[#D97706] animate-bounce mx-auto" />
                <div className="text-xs font-bold text-[#1E2433]">AI đang suy nghĩ và chọn đáp án...</div>
              </div>
            )}

            {/* 4 NÚT ĐÁP ÁN A/B/C/D TO, DỄ BẤM TRÊN ĐIỆN THOẠI */}
            {(!currentPlayer.isBot || !aiThinking) && (
              <div className="space-y-2">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswerIndex === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let btnStyle = 'bg-[#FFFFFF] border-[#E5E1D8] text-[#1E2433] hover:border-[#FACC15] hover:bg-[#FEF3C7]/30';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-[#DCFCE7] border-[#22C55E] text-[#166534] font-bold ring-2 ring-[#22C55E]/20';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-[#FEE2E2] border-[#EF4444] text-[#991B1B]';
                    } else {
                      btnStyle = 'bg-[#F8F6F1] border-[#E5E1D8] opacity-50 text-[#6B7280]';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerSubmitted || currentPlayer.isBot}
                      onClick={() => handleUserSelectAnswer(idx)}
                      className={`w-full min-h-[46px] p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${btnStyle} ${
                        !isAnswerSubmitted && !currentPlayer.isBot ? 'cursor-pointer active:scale-98' : 'cursor-default'
                      }`}
                    >
                      <span className="font-bold font-mono text-xs w-5 h-5 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug flex-1">{option}</span>
                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* PHẦN GIẢI THÍCH & NÚT TIẾP TỤC */}
            {answerResult && (
              <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                  answerResult.isCorrect ? 'bg-[#DCFCE7]/70 border-[#86EFAC]' : 'bg-[#FEE2E2]/70 border-[#FCA5A5]'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {answerResult.isCorrect ? (
                      <span className="text-[#166534]">🎉 ĐÚNG RỒI! ĐƯỢC DI CHUYỂN!</span>
                    ) : (
                      <span className="text-[#991B1B]">❌ CHƯA CHÍNH XÁC! ĐỨNG YÊN LƯỢT NÀY.</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#1E2433] leading-relaxed">
                    {answerResult.explanation}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                  {currentPlayer.isBot ? (
                    <span className="text-[11px] text-[#A16207] italic font-medium">
                      ⏳ Đang hiển thị kết quả của AI (tự động đi sau 3.5s)...
                    </span>
                  ) : <div />}
                  <button
                    type="button"
                    onClick={handleProceedAfterQuestion}
                    className="w-full sm:w-auto ml-auto px-6 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>
                      {currentPlayer.isBot 
                        ? (answerResult.isCorrect ? 'Tiếp tục ngay (AI đi quân)' : 'Tiếp tục ngay') 
                        : (answerResult.isCorrect ? 'Tiếp tục chọn ngựa đi' : 'Tiếp tục ván cờ')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL BẪY SÂU NGỤY BIỆN (WORM MODAL)                                   */}
      {/* ========================================================================= */}
      {turnPhase === 'worm_modal' && wormQuestion && wormTargetHorse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border-2 border-[#EF4444] bg-[#FFFFFF] p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E5E1D8]">
              <span className="text-2xl">🐛</span>
              <div>
                <h3 className="font-bold text-sm text-[#DC2626]">BẪY SÂU NGỤY BIỆN (MỨC ĐỘ KHÓ)</h3>
                <p className="text-[11px] text-[#4A5263]">
                  Ngựa {wormTargetHorse.id} của {currentPlayer.name} vừa đáp trúng ô Sâu!
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-[11px] text-[#991B1B]">
              Quy tắc bắt sâu: Trả lời <strong>ĐÚNG</strong> để nhận 1 Khiên 🛡️; trả lời <strong>SAI</strong> bị phạt <strong>nghỉ 1 lượt</strong> kế tiếp!
            </div>

            <div className="p-3 rounded-xl bg-[#F8F6F1] border border-[#E5E1D8] text-xs italic text-[#1E2433]">
              "{wormQuestion.situation}"
            </div>

            <h4 className="font-bold text-xs sm:text-sm text-[#1E2433]">{wormQuestion.question}</h4>

            <div className="space-y-2">
              {wormQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!!wormAnswerResult || currentPlayer.isBot}
                  onClick={() => handleWormAnswer(wormQuestion, wormTargetHorse, idx)}
                  className={`w-full min-h-[44px] p-2.5 rounded-xl border text-left text-xs transition-colors flex items-start gap-2 ${
                    wormAnswerResult
                      ? idx === wormQuestion.correctIndex
                        ? 'bg-[#DCFCE7] border-[#22C55E] text-[#166534] font-bold'
                        : 'bg-[#F8F6F1] border-[#E5E1D8] text-[#6B7280]'
                      : 'bg-white border-[#E5E1D8] text-[#1E2433] hover:bg-[#F2EFE8] cursor-pointer'
                  }`}
                >
                  <span className="font-mono font-bold w-4 h-4 rounded bg-[#F2EFE8] flex items-center justify-center shrink-0 text-[10px]">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            {wormAnswerResult && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  wormAnswerResult.isCorrect ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534]' : 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]'
                }`}>
                  {wormAnswerResult.explanation}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleProceedWorm}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Tiếp tục ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL XEM LẠI CÂU HỎI TRONG VÁN                                        */}
      {/* ========================================================================= */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[85vh] rounded-2xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 shadow-2xl flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E1D8]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D97706]" />
                <h3 className="font-bold text-sm text-[#1E2433]">Các câu hỏi đã giải quyết trong ván</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg border border-[#E5E1D8] text-[#4A5263] hover:bg-[#F8F6F1] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {questionHistory.length === 0 ? (
                <div className="text-center py-8 text-[#6B7280]">Chưa có câu hỏi nào.</div>
              ) : (
                questionHistory.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-[#E5E1D8] bg-[#F8F6F1] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#1E2433]">
                        {item.playerName} (Lượt {item.turnNumber})
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.isCorrect ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}>
                        {item.isCorrect ? 'ĐÚNG' : 'SAI'}
                      </span>
                    </div>
                    <p className="italic text-[#4A5263]">"{item.question.situation}"</p>
                    <p className="font-bold text-[#1E2433]">{item.question.question}</p>
                    <div className="text-[11px] text-[#166534]">
                      <strong>Đáp án:</strong> {item.question.options[item.question.correctIndex]}
                    </div>
                    <div className="text-[10px] text-[#4A5263]">{item.question.explanation}</div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#E5E1D8] text-right">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl bg-[#FACC15] text-[#1E2433] font-bold text-xs hover:bg-[#EAB308] cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL HƯỚNG DẪN LUẬT ĐẦY ĐỦ                                            */}
      {/* ========================================================================= */}
      {showFullRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg max-h-[85vh] rounded-2xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 shadow-2xl flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E1D8]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#D97706]" />
                <h3 className="font-bold text-sm text-[#1E2433]">Luật Chơi Chi Tiết & Ví Dụ</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullRulesModal(false)}
                className="p-1 rounded-lg border border-[#E5E1D8] text-[#4A5263] hover:bg-[#F8F6F1] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-[#1E2433] leading-relaxed">
              <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] space-y-1">
                <div className="font-bold text-[#92400E]">1. Lắc xúc xắc & Trả lời câu hỏi bắt buộc</div>
                <p className="text-[11px] text-[#92400E]">
                  Mỗi lần lắc xúc xắc đều phải trả lời 1 câu hỏi tương ứng độ khó: 1–2 Dễ, 3–4 Vừa, 5–6 Khó. <strong>Chỉ khi trả lời đúng mới được di chuyển ngựa</strong>.
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-xs text-[#B45309]">2. Xuất quân & Di chuyển</div>
                <p className="text-[11px] text-[#4A5263]">
                  • Khi <strong>chưa có ngựa trên đường</strong>: Trả lời đúng với <strong>bất kỳ số nào (1–6)</strong> là được xuất quân ra ô Cổng.
                  <br />
                  • Khi đã có ngựa trên đường: Xuất quân khi đổ 1 hoặc 6.
                  <br />
                  • Đổ 6 nút: Sau khi di chuyển xong được thưởng thêm 1 lượt lắc!
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-xs text-[#B45309]">3. Đá ngựa & Ô Cổng an toàn</div>
                <p className="text-[11px] text-[#4A5263]">
                  • Điểm rơi trùng ô đối phương: <strong>Đá ngựa đối phương về Chuồng</strong>.
                  <br />
                  • <strong>Ô Cổng (#0, #7, #14, #21) là an toàn</strong>: Không ai bị đá ở ô Cổng.
                  <br />
                  • Khi có <strong>Khiên 🛡️</strong>: Bị đá sẽ vỡ khiên, giữ nguyên vị trí, không về chuồng.
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-xs text-[#B45309]">4. Ô đặc biệt & Về Đích</div>
                <p className="text-[11px] text-[#4A5263]">
                  • 💡 <strong>Ô Bút Dạ Quang (#5, #12, #19, #26):</strong> Thưởng thêm 1 lượt lắc.
                  <br />
                  • 🐛 <strong>Ô Sâu Ngụy Biện (#2, #9, #16, #23):</strong> Thử thách bắt sâu! Đúng nhận Khiên 🛡️, sai nghỉ 1 lượt.
                  <br />
                  • Đi đủ <strong>28 bước là vào Đích</strong> an toàn. Ai đưa đủ số ngựa về Đích trước là thắng!
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E1D8] text-right">
              <button
                type="button"
                onClick={() => setShowFullRulesModal(false)}
                className="px-4 py-2 rounded-xl bg-[#FACC15] text-[#1E2433] font-bold text-xs hover:bg-[#EAB308] cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

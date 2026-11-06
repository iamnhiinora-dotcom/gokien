/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TRANG CHƠI GAME GIỮA CÁC NGƯỜI DÙNG VỚI NHAU (MULTIPLAYER PVP ARENA)
 * Phong cách "Giấy và Bút dạ quang" trong Dark Mode.
 * Gồm 2 phần chính:
 * - PHẦN 1: "Cờ cá ngựa" (Multiplayer Board Game 2-4 người tích hợp câu hỏi phản biện & bẫy ngụy biện).
 * - PHẦN 2: "Đấu 2 người" (Đối kháng trực tiếp 1v1 kèm thanh máu HP, 4 phương án phản biện/ngụy biện mỗi lượt).
 */

import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../services/soundEffects';
import { useGamification } from '../context/GamificationContext';
import { CriticalThinkingHorseGame } from './CriticalThinkingHorseGame';
import { 
  Dices, 
  Swords, 
  ShieldAlert, 
  Trophy, 
  Users, 
  UserPlus, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Heart, 
  Sparkles, 
  ArrowRight,
  Shield,
  Zap,
  Bot,
  Play,
  Award
} from 'lucide-react';

// ==========================================
// DỮ LIỆU CÂU HỎI TƯ DUY CHO CỜ CÁ NGỰA
// ==========================================
interface BoardQuizItem {
  id: string;
  type: 'fallacy' | 'logic' | 'assumption';
  title: string;
  situation: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  rewardText: string;
}

const BOARD_QUIZ_BANK: BoardQuizItem[] = [
  {
    id: 'bq_1',
    type: 'fallacy',
    title: 'Ô Sâu Lập Luận: Nhặt hạt sạn ngụy biện',
    situation: '"Bạn An bảo nên giảm bớt bài tập về nhà. Thầy trả lời: Nếu học sinh không làm bài tập thì các em sẽ lười biếng, suốt ngày cắm mặt chơi game, rồi sau này ra đời thất nghiệp hết à?"',
    question: 'Lập luận của người nói trong tình huống trên mắc lỗi ngụy biện gì?',
    options: [
      'Ngụy biện dốc trượt (Slippery Slope) - suy diễn liên hoàn quá đà',
      'Ngụy biện công kích cá nhân (Ad Hominem)',
      'Ngụy biện người rơm (Strawman)',
      'Lập luận hoàn toàn logic và chặt chẽ'
    ],
    correctIndex: 0,
    explanation: 'Người nói đã suy diễn từ việc "giảm bớt bài tập" sang một chuỗi hậu quả thảm họa không có bằng chứng (lười biếng -> chơi game -> thất nghiệp).',
    rewardText: 'Bắt sâu thành công! Ngựa phi thêm 2 bước và nhận 1 lượt lắc xúc xắc nữa!'
  },
  {
    id: 'bq_2',
    type: 'assumption',
    title: 'Ô Bút Dạ Quang: Soi giả định ngầm',
    situation: '"Học trường chuyên lớp chọn chắc chắn sẽ thành đạt trong tương lai hơn học trường thường."',
    question: 'Giả định ngầm (Unstated Assumption) thiếu căn cứ trong câu này là gì?',
    options: [
      'Cho rằng thành đạt chỉ phụ thuộc vào danh tiếng trường cấp 3, bỏ qua nỗ lực, kỹ năng và cơ hội',
      'Cho rằng trường thường không có giáo viên giỏi',
      'Cho rằng học sinh chuyên đều chăm học',
      'Không có giả định ngầm nào'
    ],
    correctIndex: 0,
    explanation: 'Câu nói ngầm giả định môi trường trường chuyên là yếu tố duy nhất quyết định sự thành đạt, bỏ qua năng lực tự học, kỹ năng xã hội và biến số cuộc sống.',
    rewardText: 'Soi sáng tiền đề! Nhận "Khiên Bút Dạ Quang" miễn bị đối phương đá trong 1 vòng!'
  },
  {
    id: 'bq_3',
    type: 'fallacy',
    title: 'Ô Sâu Lập Luận: Bẫy đánh tráo khái niệm',
    situation: '"Triết học dạy ta nghi ngờ mọi thứ. Nhưng một người luôn nghi ngờ thì không đáng tin cậy. Vậy nên triết học dạy ta trở thành người không đáng tin!"',
    question: 'Lỗi lập luận nghiêm trọng nhất ở đây là gì?',
    options: [
      'Đánh tráo khái niệm (Equivocation) giữa "nghi ngờ khoa học" và "tính đa nghi, gian dối"',
      'Ngụy biện khái quát hóa vội vã',
      'Ngụy biện thẩm quyền giả mạo',
      'Ngụy biện viện dẫn cảm xúc'
    ],
    correctIndex: 0,
    explanation: 'Từ "nghi ngờ" mang nghĩa hoài nghi khoa học ở tiền đề 1 đã bị đánh tráo thành đức tính xấu ở tiền đề 2.',
    rewardText: 'Bóc trần đánh tráo! Ngựa tiến thẳng đến ô an toàn!'
  },
  {
    id: 'bq_4',
    type: 'logic',
    title: 'Ô Trạm Tăng Tốc: Cơ chế nhân quả A -> B -> C',
    situation: '"Muốn chứng minh việc cấm đồ nhựa dùng một lần trong căng tin trường học là hiệu quả, bạn cần chỉ ra điều gì?"',
    question: 'Đâu là mắt xích nhân quả logic chặt chẽ nhất?',
    options: [
      'Chỉ ra cơ chế: Cung cấp bình nước tái sử dụng + phân loại rác -> giảm lượng rác thải thực tế',
      'Chỉ trích những ai vẫn còn thói quen dùng ống hút nhựa',
      'Nói rằng các nước châu Âu đều làm như vậy nên ta phải theo',
      'Khẳng định ai không ủng hộ là người không yêu môi trường'
    ],
    correctIndex: 0,
    explanation: 'Cơ chế giải pháp phải giải quyết được nguyên nhân gốc rễ và có giải pháp thay thế khả thi (A -> B -> C).',
    rewardText: 'Lập luận vững chắc! Nhận +3 bước tăng tốc vượt mặt đối thủ!'
  },
  {
    id: 'bq_5',
    type: 'fallacy',
    title: 'Ô Sâu Lập Luận: Vơ đũa cả nắm',
    situation: '"Hôm qua mình gặp 2 bạn trường X lướt TikTok trong giờ học. Đúng là học sinh trường X bây giờ toàn nghiện điện thoại, chẳng chịu học hành gì cả!"',
    question: 'Phát biểu trên mắc lỗi ngụy biện phổ biến nào?',
    options: [
      'Ngụy biện khái quát hóa vội vã (Hasty Generalization)',
      'Ngụy biện hai sai thành một đúng',
      'Ngụy biện viện dẫn truyền thống',
      'Ngụy biện đòn bẩy chi phí chìm'
    ],
    correctIndex: 0,
    explanation: 'Lấy mẫu quan sát quá nhỏ (chỉ 2 học sinh) để quy chụp cho toàn thể học sinh trường X là lỗi khái quát hóa vội vã điển hình.',
    rewardText: 'Tóm gọn hạt sạn! Thưởng ngay 15 XP và thêm 1 bước tiến!'
  }
];

// ==========================================
// DỮ LIỆU ĐỐI KHÁNG 1V1 CHO "ĐẤU 2 NGƯỜI"
// ==========================================
interface PvPScenarioMove {
  id: string;
  type: 'critical' | 'normal' | 'probe' | 'fallacy_backfire';
  label: string;
  tag: string;
  damage: number;       // Sát thương lên đối thủ (dương) hoặc tự mất máu nếu backfire (âm)
  description: string;  // Nội dung lời phản biện / câu hỏi
  tacticalAnalysis: string; // Giải thích chiến thuật tại sao mạnh/yếu
}

interface PvPClashScenario {
  id: string;
  topicMotion: string;
  contextDialogue: string;
  speakerRole: string;
  opponentClaim: string;
  moves: PvPScenarioMove[];
}

const PVP_SCENARIOS: PvPClashScenario[] = [
  {
    id: 'pvp_1',
    topicMotion: 'Trí tuệ nhân tạo (AI) trong học đường',
    contextDialogue: 'Cuộc tranh luận gay gắt giữa 2 học sinh trong giờ Hoạt động trải nghiệm:',
    speakerRole: 'Đối thủ tuyên bố:',
    opponentClaim: '"Sử dụng AI như ChatGPT hay Claude để làm bài tập là gian lận 100%, hủy hoại hoàn toàn khả năng tư duy độc lập của học sinh!"',
    moves: [
      {
        id: 'm_crit',
        type: 'critical',
        label: '🎯 Bóc tách tiền đề & Đặt câu hỏi Socratic (Đòn chí mạng)',
        tag: 'Bóc trần ngụy biện Nhị nguyên (False Dilemma)',
        damage: 28,
        description: '"Bạn đang đánh đồng việc dùng AI để \'chép bài thụ động\' với việc \'dùng AI như người phản biện để đối thoại ý tưởng\'. Nếu học sinh dùng AI để tìm lỗ hổng trong bài viết của mình, liệu đó là hủy hoại tư duy hay nâng cao tư duy?"',
        tacticalAnalysis: 'Đòn chí mạng! Tách rời ranh giới hành vi, chỉ ra bẫy nhị nguyên cực đoan, buộc đối thủ phải lùi bước.'
      },
      {
        id: 'm_norm',
        type: 'normal',
        label: '⚔️ Đưa dữ liệu thực tế phản đối (Tấn công thường)',
        tag: 'Dẫn chứng có kiểm chứng',
        damage: 15,
        description: '"Nhiều trường đại học hàng đầu thế giới đã tích hợp AI vào giảng dạy và hướng dẫn sinh viên viết câu lệnh phản biện hiệu quả thay vì cấm đoán."',
        tacticalAnalysis: 'Đòn đánh hợp lý với dẫn chứng quốc tế, nhưng chưa bẻ gãy trực diện cơ chế tư duy của học sinh.'
      },
      {
        id: 'm_probe',
        type: 'probe',
        label: '🛡️ Thăm dò định nghĩa (Hỏi nhẹ)',
        tag: 'Làm rõ khái niệm',
        damage: 7,
        description: '"Vậy theo bạn định nghĩa \'gian lận\' cụ thể bắt đầu từ lúc nào: khi tìm ý tưởng hay khi copy nguyên văn?"',
        tacticalAnalysis: 'Gây sức ép nhỏ buộc đối phương xác định lại ranh giới, sát thương nhẹ.'
      },
      {
        id: 'm_backfire',
        type: 'fallacy_backfire',
        label: '💥 Tự sập bẫy ngụy biện (Công kích cá nhân - Bị phản đòn)',
        tag: 'Ad Hominem (Ngụy biện)',
        damage: -10,
        description: '"Chắc tại bạn cổ hủ, không biết dùng AI nên mới ghen tị với những bạn dùng AI làm bài nhanh chứ gì!"',
        tacticalAnalysis: 'Phạm lỗi công kích cá nhân! Trọng tài trừ điểm, bạn tự mất 10 HP vì lập luận thiếu văn minh.'
      }
    ]
  },
  {
    id: 'pvp_2',
    topicMotion: 'Bỏ việc chấm điểm số truyền thống ở trường THPT',
    contextDialogue: 'Thảo luận trong buổi tọa đàm học sinh về phương pháp đánh giá giáo dục:',
    speakerRole: 'Đối thủ lập luận:',
    opponentClaim: '"Điểm số chỉ tạo ra áp lực độc hại và bệnh thành tích. Bỏ hoàn toàn điểm số thì học sinh mới có thể học vì đam mê thật sự!"',
    moves: [
      {
        id: 'm_crit',
        type: 'critical',
        label: '🎯 Chỉ ra lỗ hổng cơ chế đánh giá thay thế (Đòn chí mạng)',
        tag: 'Bẻ gãy tiền đề Ngụy biện Người Rơm',
        damage: 30,
        description: '"Bạn quy kết toàn bộ áp lực học đường cho điểm số mà quên mất: điểm số cũng là thước đo chuẩn hóa giúp phát hiện học sinh bị hổng kiến thức để hỗ trợ kịp thời. Nếu bỏ hoàn toàn mà không có công cụ đo lường khách quan, làm sao các trường đại học tuyển sinh công bằng cho học sinh vùng sâu vùng xa?"',
        tacticalAnalysis: 'Đòn chí mạng! Tấn công trực diện vào tính khả thi và cơ chế thay thế, vạch rõ hệ lụy bất bình đẳng.'
      },
      {
        id: 'm_norm',
        type: 'normal',
        label: '⚔️ Luận điểm cải cách dung hòa (Tấn công thường)',
        tag: 'Đề xuất giải pháp cải tiến',
        damage: 14,
        description: '"Thay vì bỏ điểm số hoàn toàn, ta nên kết hợp đánh giá quá trình và nhận xét định tính để giảm bớt áp lực con số."',
        tacticalAnalysis: 'Quan điểm xây dựng hợp lý, giải tỏa thế đối đầu nhưng tính sát thương tranh luận chỉ ở mức trung bình.'
      },
      {
        id: 'm_probe',
        type: 'probe',
        label: '🛡️ Đặt câu hỏi về động lực học sinh (Thăm dò)',
        tag: 'Thăm dò tâm lý học tập',
        damage: 8,
        description: '"Bạn có chắc chắn rằng khi bỏ điểm số thì học sinh sẽ tự giác học vì đam mê, hay sẽ buông thả vì không có mục tiêu ngắn hạn?"',
        tacticalAnalysis: 'Khai thác hoài nghi thực tế nhưng chưa cung cấp dẫn chứng cụ thể.'
      },
      {
        id: 'm_backfire',
        type: 'fallacy_backfire',
        label: '💥 Tự sập bẫy ngụy biện (Khái quát hóa quá đà - Bị phản đòn)',
        tag: 'Vơ đũa cả nắm (Hasty Generalization)',
        damage: -10,
        description: '"Nói như bạn thì học sinh THPT toàn lười biếng vô kỷ luật hết à? Bỏ điểm số là trường học thành cái chợ ngay!"',
        tacticalAnalysis: 'Tự sập bẫy ngụy biện! Cường điệu hóa thái quá và xúc phạm học sinh, bạn tự bị trừ 10 HP.'
      }
    ]
  },
  {
    id: 'pvp_3',
    topicMotion: 'Điện thoại thông minh trong giờ học',
    contextDialogue: 'Diễn đàn đối thoại về nội quy học đường thời kỳ số:',
    speakerRole: 'Đối thủ phát biểu:',
    opponentClaim: '"Cấm 100% điện thoại trong khuôn viên trường học là cách duy nhất để cứu học sinh khỏi sự xao nhãng và suy giảm trí nhớ!"',
    moves: [
      {
        id: 'm_crit',
        type: 'critical',
        label: '🎯 Bẻ gãy tiền đề tuyệt đối hóa (Đòn chí mạng)',
        tag: 'Bóc trần Ngụy biện Tuyệt đối hóa & Dốc trượt',
        damage: 28,
        description: '"Tuyên bố \'cấm 100% là cách duy nhất\' đã bỏ qua năng lực giáo dục tự chủ: Nếu ở trường bị cấm tiệt, khi bước ra xã hội các em sẽ quản lý thời gian trên màn hình thế nào? Trách nhiệm của nhà trường là dạy cách sử dụng công nghệ văn minh có kiểm soát, chứ không phải giấu diếm công nghệ."',
        tacticalAnalysis: 'Đòn chí mạng! Tấn công vào mục tiêu cốt lõi của giáo dục dài hạn (dạy cách tự chủ thay vì cấm đoán ngắn hạn).'
      },
      {
        id: 'm_norm',
        type: 'normal',
        label: '⚔️ Đưa ra mô hình hộp giữ điện thoại (Tấn công thường)',
        tag: 'Giải pháp quản lý thực tế',
        damage: 15,
        description: '"Nhiều trường áp dụng hộp cất điện thoại đầu giờ và chỉ cho phép lấy ra khi giáo viên yêu cầu tra cứu tài liệu, hiệu quả hơn là cấm triệt để."',
        tacticalAnalysis: 'Luận cứ thực tiễn tốt, chứng minh phương án dung hòa khả thi.'
      },
      {
        id: 'm_probe',
        type: 'probe',
        label: '🛡️ Hỏi về trường hợp khẩn cấp (Hỏi nhẹ)',
        tag: 'Trường hợp ngoại lệ',
        damage: 6,
        description: '"Nếu cấm 100% trong toàn bộ khuôn viên, phụ huynh muốn liên lạc khẩn cấp với con thì xử lý thế nào?"',
        tacticalAnalysis: 'Nêu ra một điểm bất tiện cụ thể, sát thương khiêm tốn.'
      },
      {
        id: 'm_backfire',
        type: 'fallacy_backfire',
        label: '💥 Tự sập bẫy ngụy biện (Viện dẫn thẩm quyền rởm - Bị phản đòn)',
        tag: 'Appeal to False Authority',
        damage: -10,
        description: '"Bác hàng xóm nhà mình bảo bên Mỹ cấm hết điện thoại rồi, nên trường mình không cấm là lạc hậu!"',
        tacticalAnalysis: 'Dẫn lời bác hàng xóm vô căn cứ! Bị trọng tài trừ điểm và đối thủ phản pháo ngay tức thì.'
      }
    ]
  }
];

export const MultiplayerPvPArenaView: React.FC = () => {
  const { profile, addXP } = useGamification();

  // Tab chuyển đổi: 'horse_racing' (Cờ cá ngựa) hoặc 'pvp_duel' (Đấu 2 người)
  const [activeTab, setActiveTab] = useState<'horse_racing' | 'pvp_duel'>('horse_racing');

  // ==========================================
  // STATE CỦA PHẦN 2: ĐẤU 2 NGƯỜI KHÁNG TRỰC TIẾP
  // ==========================================
  const [pvpPlayer1Name, setPvpPlayer1Name] = useState<string>('Minh Anh (Người 1)');
  const [pvpPlayer2Name, setPvpPlayer2Name] = useState<string>('Hoàng Nam (Người 2)');
  const [p1Hp, setP1Hp] = useState<number>(100);
  const [p2Hp, setP2Hp] = useState<number>(100);
  const [pvpRound, setPvpRound] = useState<number>(1);
  const [pvpCurrentTurn, setPvpCurrentTurn] = useState<1 | 2>(1); // 1 = P1 tấn công, 2 = P2 tấn công
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [pvpBattleLogs, setPvpBattleLogs] = useState<Array<{
    turnNumber: number;
    attacker: string;
    moveLabel: string;
    damageDealt: number;
    explanation: string;
  }>>([]);
  const [lastMoveResult, setLastMoveResult] = useState<{
    attackerName: string;
    move: PvPScenarioMove;
    damage: number;
  } | null>(null);
  const [pvpWinner, setPvpWinner] = useState<string | null>(null);

  const activePvPScenario = PVP_SCENARIOS[currentScenarioIndex % PVP_SCENARIOS.length];

  // Xử lý khi người chơi chọn đòn tấn công trong PvP
  const handlePvPMove = (move: PvPScenarioMove) => {
    if (pvpWinner) return;

    const isP1 = pvpCurrentTurn === 1;
    const attackerName = isP1 ? pvpPlayer1Name : pvpPlayer2Name;
    const defenderName = isP1 ? pvpPlayer2Name : pvpPlayer1Name;

    soundFX.playSwordClash();

    let actualDamage = move.damage;

    if (move.type === 'fallacy_backfire') {
      // Tự mất máu vì phạm ngụy biện
      soundFX.playDamage();
      if (isP1) {
        setP1Hp(prev => Math.max(0, prev - 10));
      } else {
        setP2Hp(prev => Math.max(0, prev - 10));
      }
    } else {
      // Gây sát thương lên đối phương
      if (move.type === 'critical') {
        soundFX.playSuccess();
      } else {
        soundFX.playDamage();
      }

      if (isP1) {
        setP2Hp(prev => {
          const nextVal = Math.max(0, prev - actualDamage);
          if (nextVal === 0) {
            setPvpWinner(pvpPlayer1Name);
            soundFX.playFanfare();
            addXP(120, `Hạ gục đối thủ K.O trong Đấu 2 Người!`);
          }
          return nextVal;
        });
      } else {
        setP1Hp(prev => {
          const nextVal = Math.max(0, prev - actualDamage);
          if (nextVal === 0) {
            setPvpWinner(pvpPlayer2Name);
            soundFX.playFanfare();
            addXP(120, `Hạ gục đối thủ K.O trong Đấu 2 Người!`);
          }
          return nextVal;
        });
      }
    }

    setLastMoveResult({
      attackerName,
      move,
      damage: actualDamage
    });

    setPvpBattleLogs(prev => [
      {
        turnNumber: pvpRound,
        attacker: attackerName,
        moveLabel: move.label,
        damageDealt: actualDamage,
        explanation: move.tacticalAnalysis
      },
      ...prev
    ]);

    // Chuyển lượt hoặc chuyển hiệp
    if (isP1) {
      setPvpCurrentTurn(2);
    } else {
      setPvpCurrentTurn(1);
      setPvpRound(r => r + 1);
      setCurrentScenarioIndex(s => s + 1); // Đổi tình huống cho hiệp mới
    }
  };

  // Làm mới trận đấu PvP
  const handleResetPvP = () => {
    soundFX.playClick();
    setP1Hp(100);
    setP2Hp(100);
    setPvpRound(1);
    setPvpCurrentTurn(1);
    setCurrentScenarioIndex(0);
    setPvpBattleLogs([]);
    setLastMoveResult(null);
    setPvpWinner(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-[#1E2433] animate-in fade-in duration-200">
      
      {/* 1. THANH CHUYỂN ĐỔI TAB 2 TRÒ CHƠI */}
      <div className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] border border-[#FACC15]/40 flex items-center justify-center text-[#A16207]">
            {activeTab === 'horse_racing' ? <Dices className="w-5 h-5" /> : <Swords className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-[#1E2433] flex items-center gap-2">
              <span>Đấu Trí Nhiều Người Chơi</span>
              <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[11px] font-bold font-mono border border-[#E5E1D8]">
                PvP Thực Chiến
              </span>
            </h1>
            <p className="text-xs text-[#4A5263]">
              Tranh tài phản biện cùng bạn bè trực tiếp trên cùng một màn hình
            </p>
          </div>
        </div>

        {/* 2 Nút Tab Lớn */}
        <div className="flex items-center gap-2 bg-[#F2EFE8] p-1 rounded-lg border border-[#E5E1D8] w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('horse_racing');
            }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'horse_racing'
                ? 'bg-[#FACC15] text-[#1E2433] shadow-sm font-bold'
                : 'text-[#4A5263] hover:text-[#1E2433] hover:bg-[#FFFFFF]'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>Phần 1: Cờ Cá Ngựa Phản Biện</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('pvp_duel');
            }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pvp_duel'
                ? 'bg-[#FACC15] text-[#1E2433] shadow-sm font-bold'
                : 'text-[#4A5263] hover:text-[#1E2433] hover:bg-[#FFFFFF]'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Phần 2: Đấu 2 Người Kháng Trực Tiếp</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NỘI DUNG PHẦN 1: CỜ CÁ NGỰA PHẢN BIỆN (BOARD GAME MULTIPLAYER)           */}
      {/* ========================================================================= */}
      {activeTab === 'horse_racing' && (
        <div className="animate-in fade-in duration-150">
          <CriticalThinkingHorseGame />
        </div>
      )}

      

      {/* ========================================================================= */}
      {/* NỘI DUNG PHẦN 2: ĐẤU 2 NGƯỜI KHÁNG TRỰC TIẾP (1V1 PVP SHOWDOWN WITH HP)     */}
      {/* ========================================================================= */}
      {activeTab === 'pvp_duel' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* 1. SÀN ĐẤU ĐỐI KHÁNG VỚI 2 THANH MÁU HP */}
          <div className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 sm:p-6 space-y-6 shadow-sm">
            
            {/* Top HUD: 2 Đấu Thủ & 2 Thanh Máu HP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              
              {/* Người chơi 1 */}
              <div className={`p-4 rounded-xl border transition-all ${
                pvpCurrentTurn === 1 && !pvpWinner
                  ? 'border-[#FACC15] bg-[#FEF3C7]/40 shadow-sm'
                  : 'border-[#E5E1D8] bg-[#FFFFFF]'
              }`}>
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-[#FACC15] text-[#1E2433] font-bold text-xs flex items-center justify-center">
                      P1
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#1E2433]">{pvpPlayer1Name}</h3>
                      <span className="text-[11px] text-[#A16207] font-mono font-medium">
                        {pvpCurrentTurn === 1 ? '🔥 Đang tấn công' : 'Chờ đối thủ'}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#A16207]">
                    {p1Hp}/100 HP
                  </span>
                </div>

                {/* Thanh Máu P1 */}
                <div className="h-3 w-full bg-[#E5E1D8] rounded-full overflow-hidden border border-[#D6D1C4]">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      p1Hp > 50 ? 'bg-[#15803D]' : p1Hp > 20 ? 'bg-[#FACC15]' : 'bg-[#DC2626]'
                    }`}
                    style={{ width: `${p1Hp}%` }}
                  />
                </div>
              </div>

              {/* Huy hiệu VS ở giữa */}
              <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FFFFFF] border-2 border-[#E5E1D8] items-center justify-center font-serif font-bold text-xs text-[#1E2433] z-10 shadow-md">
                VS
              </div>

              {/* Người chơi 2 */}
              <div className={`p-4 rounded-xl border transition-all ${
                pvpCurrentTurn === 2 && !pvpWinner
                  ? 'border-[#2563EB] bg-[#DBEAFE]/40 shadow-sm'
                  : 'border-[#E5E1D8] bg-[#FFFFFF]'
              }`}>
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#2563EB]/30">
                      P2
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#1E2433]">{pvpPlayer2Name}</h3>
                      <span className="text-[11px] text-[#2563EB] font-mono font-medium">
                        {pvpCurrentTurn === 2 ? '🔥 Đang tấn công' : 'Chờ đối thủ'}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#2563EB]">
                    {p2Hp}/100 HP
                  </span>
                </div>

                {/* Thanh Máu P2 */}
                <div className="h-3 w-full bg-[#E5E1D8] rounded-full overflow-hidden border border-[#D6D1C4]">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      p2Hp > 50 ? 'bg-[#2563EB]' : p2Hp > 20 ? 'bg-[#FACC15]' : 'bg-[#DC2626]'
                    }`}
                    style={{ width: `${p2Hp}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Thông báo chiến thắng K.O */}
            {pvpWinner ? (
              <div className="p-6 rounded-xl border-2 border-[#FACC15] bg-[#FEF3C7] text-center space-y-4 animate-in zoom-in-95 shadow-sm">
                <Trophy className="w-12 h-12 text-[#D97706] mx-auto animate-bounce" />
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#1E2433]">
                    {pvpWinner} ĐÃ CHIẾN THẮNG K.O!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#92400E] mt-1">
                    Đối phương đã cạn kiệt thanh máu HP trong màn so tài tư duy phản biện đỉnh cao.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetPvP}
                    className="px-6 py-2.5 rounded-lg bg-[#FACC15] text-[#1E2433] hover:bg-[#EAB308] font-bold text-sm flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Tái Đấu Trận Mới</span>
                  </button>
                </div>
              </div>
            ) : (
              /* TÌNH HUỐNG TRANH BIỆN & 4 ĐÒN TẤN CÔNG */
              <div className="space-y-4">
                
                {/* Hộp phát biểu đối đầu của hiệp */}
                <div className="p-4 rounded-xl border border-[#E5E1D8] bg-[#F2EFE8] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#1E2433]">
                      Hiệp {pvpRound} · Chủ đề: {activePvPScenario.topicMotion}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E5E1D8] text-[#1E2433] font-mono text-[11px]">
                      Lượt của: {pvpCurrentTurn === 1 ? pvpPlayer1Name : pvpPlayer2Name}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A5263]">
                    {activePvPScenario.contextDialogue}
                  </p>
                  <div className="p-3 rounded-lg bg-[#FFFFFF] border-l-4 border-[#FACC15] text-xs sm:text-sm text-[#1E2433] italic font-serif shadow-xs">
                    {activePvPScenario.opponentClaim}
                  </div>
                </div>

                {/* Tiêu đề chọn đòn */}
                <div className="flex items-center justify-between text-xs text-[#4A5263] pt-1">
                  <span className="font-bold text-[#1E2433] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#A16207]" />
                    <span>Chọn 1 trong 4 phương án phản biện để tấn công đối phương:</span>
                  </span>
                  <span className="text-[11px] text-[#DC2626]">
                    Cẩn thận: Lỗi ngụy biện sẽ bị phản đòn tự mất 10 HP!
                  </span>
                </div>

                {/* Lưới 4 phương án */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activePvPScenario.moves.map((move) => {
                    const isBackfire = move.type === 'fallacy_backfire';
                    const isCrit = move.type === 'critical';

                    return (
                      <button
                        key={move.id}
                        type="button"
                        onClick={() => handlePvPMove(move)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between hover:scale-[1.01] cursor-pointer group shadow-xs ${
                          isCrit
                            ? 'border-[#FACC15] bg-[#FEF3C7]/40 hover:bg-[#FEF3C7]'
                            : isBackfire
                            ? 'border-[#DC2626]/30 bg-[#FEE2E2]/40 hover:bg-[#FEE2E2]'
                            : 'border-[#E5E1D8] bg-[#FFFFFF] hover:bg-[#F2EFE8]'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#1E2433] group-hover:text-[#A16207] transition-colors">
                              {move.label}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                              isBackfire 
                                ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#DC2626]/30'
                                : isCrit
                                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FACC15]'
                                : 'bg-[#F2EFE8] text-[#4A5263] border border-[#E5E1D8]'
                            }`}>
                              {isBackfire ? '-10 HP (Tự trừ)' : `-${move.damage} HP`}
                            </span>
                          </div>

                          <span className="text-[11px] text-[#A16207] font-mono block font-semibold">
                            {move.tag}
                          </span>

                          <p className="text-xs text-[#4A5263] leading-relaxed mt-1">
                            {move.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#E5E1D8] flex items-center justify-between text-[11px] text-[#6B7280]">
                          <span>Bấm để tung đòn</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#1E2433] group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            )}

            {/* Phân tích đòn vừa tung */}
            {lastMoveResult && (
              <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 animate-in fade-in shadow-xs ${
                lastMoveResult.move.type === 'fallacy_backfire'
                  ? 'border-[#DC2626]/30 bg-[#FEE2E2] text-[#DC2626]'
                  : 'border-[#E5E1D8] bg-[#F2EFE8] text-[#1E2433]'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {lastMoveResult.move.type === 'fallacy_backfire' ? (
                    <XCircle className="w-4 h-4 text-[#DC2626]" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  )}
                  <span>
                    {lastMoveResult.attackerName} đã chọn: {lastMoveResult.move.label}
                  </span>
                </div>
                <p className="text-[#4A5263]">
                  <strong>Phân tích chiến thuật:</strong> {lastMoveResult.move.tacticalAnalysis}
                </p>
              </div>
            )}

            {/* Nhật ký đối kháng các hiệp */}
            {pvpBattleLogs.length > 0 && (
              <div className="pt-2 border-t border-[#E5E1D8] space-y-2">
                <h4 className="font-serif text-xs font-bold text-[#1E2433] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Diễn biến các lượt đấu:</span>
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs">
                  {pvpBattleLogs.map((log, lIdx) => (
                    <div key={lIdx} className="p-2 rounded-lg bg-[#F8F6F1] border border-[#E5E1D8] text-[11px] text-[#4A5263] flex items-start justify-between gap-3 font-mono">
                      <div>
                        <strong className="text-[#1E2433]">Hiệp {log.turnNumber} ({log.attacker}):</strong> {log.moveLabel}
                        <p className="text-[#4A5263] font-sans mt-0.5">{log.explanation}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold shrink-0 ${
                        log.damageDealt < 0 ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}>
                        {log.damageDealt < 0 ? `${log.damageDealt} HP` : `-${log.damageDealt} HP`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Hộp Đổi Tên 2 Người Chơi */}
          <div className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#A16207]" />
              <span className="font-bold text-[#1E2433]">Đổi tên người chơi:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-[#A16207] font-mono text-[11px] font-bold">P1:</span>
                <input
                  type="text"
                  value={pvpPlayer1Name}
                  onChange={(e) => setPvpPlayer1Name(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-[#F2EFE8] border border-[#E5E1D8] text-xs text-[#1E2433] focus:outline-none focus:border-[#FACC15]"
                  placeholder="Tên Người 1"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#2563EB] font-mono text-[11px] font-bold">P2:</span>
                <input
                  type="text"
                  value={pvpPlayer2Name}
                  onChange={(e) => setPvpPlayer2Name(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-[#F2EFE8] border border-[#E5E1D8] text-xs text-[#1E2433] focus:outline-none focus:border-[#2563EB]"
                  placeholder="Tên Người 2"
                />
              </div>

              <button
                type="button"
                onClick={handleResetPvP}
                className="px-3.5 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F2EFE8] text-[#1E2433] text-xs transition-colors cursor-pointer border border-[#D6D1C4] shadow-xs"
              >
                Áp dụng & Đấu lại
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};


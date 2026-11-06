/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIỂU ĐỒ RADAR NĂNG LỰC TƯ DUY PHẢN BIỆN (CRITICAL THINKING RADAR)
 * Tính toán 100% từ Bài kiểm tra chẩn đoán 20 câu (Bộ A & B) và các bài được AI chấm thật.
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Nền ngà, Card trắng #FFFFFF viền #E5E1D8, Nền phụ #F2EFE8.
 * - Chữ đen #1E2433, chữ phụ #4A5263, chú thích #6B7280.
 * - Nút nhấn #FACC15 chữ #1E2433, vàng đậm #A16207.
 */

import React, { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { UserProfile, DebateMatchRecord } from '../types';
import { useGamification } from '../context/GamificationContext';
import { ShareProgressModal } from './ShareProgressModal';
import { 
  Sparkles, 
  Compass, 
  Award, 
  ChevronRight, 
  TrendingUp, 
  Share2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Play
} from 'lucide-react';

interface CriticalThinkingRadarChartProps {
  profile: UserProfile;
  onNavigateToModule?: (moduleKey: 'fallacy_challenge' | 'debate_arena') => void;
}

interface RadarSkillPoint {
  skill: string;
  shortLabel: string;
  scoreCurrent: number;
  scoreA: number;
  benchmarkScore: number;
  description: string;
  advice: string;
}

export const CriticalThinkingRadarChart: React.FC<CriticalThinkingRadarChartProps> = ({
  profile,
  onNavigateToModule
}) => {
  const { 
    openDiagnosticTest, 
    isEligibleForTestB, 
    daysSinceTestA, 
    daysUntilTestB, 
    simulateFourWeeksPassed,
    debateHistory 
  } = useGamification();

  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);
  const [activeSkill, setActiveSkill] = useState<RadarSkillPoint | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const testA = profile.diagnosticTestA;
  const testB = profile.diagnosticTestB;
  const fallaciesHistory = profile.evaluatedFallaciesHistory || [];
  const matches = debateHistory || [];

  // Tính tổng số bài đánh giá thực tế N
  const testCount = (testA ? 1 : 0) + (testB ? 1 : 0);
  const evaluatedN = testCount + fallaciesHistory.length + matches.length;
  const hasBothTests = Boolean(testA && testB);

  // Tính toán điểm số 6 kỹ năng DỰA TRÊN BÀI LÀM THẬT (Thang điểm 0 - 100)
  const skillsData: RadarSkillPoint[] = useMemo(() => {
    if (evaluatedN === 0) {
      return [];
    }

    // 1. Nhận ra giả định ngầm (từ Test A / Test B)
    const implicitScoreA = testA?.groupScores.implicit_assumptions ?? 0;
    const implicitScoreCurrent = testB?.groupScores.implicit_assumptions ?? implicitScoreA;

    // 2. Suy luận logic (Test + bài AI chấm)
    const logicScoreA = testA?.groupScores.logical_validity ?? 0;
    let avgFallacyLogic = 0;
    if (fallaciesHistory.length > 0) {
      avgFallacyLogic = Math.round(
        (fallaciesHistory.reduce((s, f) => s + f.logicScore, 0) / (fallaciesHistory.length * 40)) * 100
      );
    }
    const baseLogicCurrent = testB?.groupScores.logical_validity ?? logicScoreA;
    const logicScoreCurrent = fallaciesHistory.length > 0
      ? Math.round(baseLogicCurrent * 0.7 + avgFallacyLogic * 0.3)
      : baseLogicCurrent;

    // 3. Đánh giá độ mạnh bằng chứng
    const evidenceScoreA = testA?.groupScores.evidence_strength ?? 0;
    const evidenceScoreCurrent = testB?.groupScores.evidence_strength ?? evidenceScoreA;

    // 4. Nhận diện ngụy biện (Test + bài vạch lá tìm sâu thực tế)
    const fallacyScoreA = testA?.groupScores.fallacy_recognition ?? 0;
    let avgFallacyIdent = 0;
    if (fallaciesHistory.length > 0) {
      avgFallacyIdent = Math.round(
        (fallaciesHistory.reduce((s, f) => s + f.identificationScore, 0) / (fallaciesHistory.length * 30)) * 100
      );
    }
    const baseFallacyCurrent = testB?.groupScores.fallacy_recognition ?? fallacyScoreA;
    const fallacyScoreCurrent = fallaciesHistory.length > 0
      ? Math.round(baseFallacyCurrent * 0.6 + avgFallacyIdent * 0.4)
      : baseFallacyCurrent;

    // 5. Phân biệt sự thật vs ý kiến
    const factScoreA = testA?.groupScores.fact_vs_opinion ?? 0;
    const factScoreCurrent = testB?.groupScores.fact_vs_opinion ?? factScoreA;

    // 6. Bản lĩnh & Phản biện WSDC
    const baseDebateA = testA 
      ? Math.round((implicitScoreA + logicScoreA + fallacyScoreA) / 3) 
      : 0;
    let debateScoreCurrent = baseDebateA;
    if (matches.length > 0) {
      const totalWsdc = matches.reduce((sum, m) => sum + (m.wsdcScore || (m.outcome === 'victory' ? 85 : 65)), 0);
      debateScoreCurrent = Math.round(totalWsdc / matches.length);
    }

    return [
      {
        skill: 'Nhận ra giả định ngầm',
        shortLabel: 'Giả định ngầm',
        scoreCurrent: implicitScoreCurrent,
        scoreA: implicitScoreA,
        benchmarkScore: 70,
        description: 'Bóc trần những tiền đề ẩn mà người nói mặc định là đúng dù chưa chứng minh.',
        advice: implicitScoreCurrent < 70 ? 'Chú ý các phát biểu đánh đồng nguyên nhân duy nhất hoặc suy diễn một chiều.' : 'Khả năng bóc tách ngầm định của bạn rất sắc bén!'
      },
      {
        skill: 'Suy luận logic hợp lệ',
        shortLabel: 'Suy luận logic',
        scoreCurrent: logicScoreCurrent,
        scoreA: logicScoreA,
        benchmarkScore: 72,
        description: 'Phân định suy luận diễn dịch hợp lệ, tránh lỗi khẳng định hậu quả và phủ định tiền đề.',
        advice: logicScoreCurrent < 72 ? 'Rèn thêm cấu trúc tam đoạn luận và phân biệt điều kiện cần với điều kiện đủ.' : 'Tư duy logic rất chặt chẽ, không có lỗ hổng hình thức!'
      },
      {
        skill: 'Đánh giá độ mạnh bằng chứng',
        shortLabel: 'Độ mạnh bằng chứng',
        scoreCurrent: evidenceScoreCurrent,
        scoreA: evidenceScoreA,
        benchmarkScore: 68,
        description: 'Đánh giá quy mô mẫu, tính đại diện, xung đột lợi ích và tính thực chứng của dữ liệu.',
        advice: evidenceScoreCurrent < 68 ? 'Cảnh giác với mẫu quá nhỏ, thiên kiến chọn mẫu và tương quan giả mạo.' : 'Độ nhạy bén khi kiểm tra nguồn dữ liệu rất đáng tin cậy!'
      },
      {
        skill: 'Nhận diện ngụy biện',
        shortLabel: 'Nhận diện ngụy biện',
        scoreCurrent: fallacyScoreCurrent,
        scoreA: fallacyScoreA,
        benchmarkScore: 75,
        description: 'Phát hiện bẫy công kích cá nhân, nhị nguyên giả, dốc trượt và chuyện kể cá nhân.',
        advice: fallacyScoreCurrent < 75 ? 'Luyện tập thêm trong Module Vạch lá tìm sâu với các tình huống nâng cao.' : 'Bạn là thợ săn ngụy biện thực thụ!'
      },
      {
        skill: 'Phân biệt sự thật vs ý kiến',
        shortLabel: 'Sự thật & Ý kiến',
        scoreCurrent: factScoreCurrent,
        scoreA: factScoreA,
        benchmarkScore: 70,
        description: 'Phân định rạch ròi giữa sự thật khách quan kiểm chứng được và phán xét chủ quan.',
        advice: factScoreCurrent < 70 ? 'Tách bạch từ ngữ cảm xúc, phán xét giá trị khỏi số liệu đo đạc khách quan.' : 'Con mắt khách quan, không bị cảm xúc dẫn dắt!'
      },
      {
        skill: 'Bản lĩnh & Phản biện WSDC',
        shortLabel: 'Bản lĩnh WSDC',
        scoreCurrent: debateScoreCurrent,
        scoreA: baseDebateA,
        benchmarkScore: 70,
        description: 'Phản biện trực diện luận điểm đối thủ theo chuẩn WSDC và tinh thần công tâm Dựng Người Thép.',
        advice: debateScoreCurrent < 70 ? 'Tham gia thêm các hiệp đấu WSDC và ghi nhận ý hợp lý của đối phương.' : 'Bản lĩnh tranh biện kiên định và thuyết phục!'
      }
    ];
  }, [evaluatedN, testA, testB, fallaciesHistory, matches]);

  // Điểm Trung bình
  const averageCurrent = useMemo(() => {
    if (skillsData.length === 0) return 0;
    const total = skillsData.reduce((acc, curr) => acc + curr.scoreCurrent, 0);
    return Math.round(total / skillsData.length);
  }, [skillsData]);

  const averageA = useMemo(() => {
    if (skillsData.length === 0) return 0;
    const total = skillsData.reduce((acc, curr) => acc + curr.scoreA, 0);
    return Math.round(total / skillsData.length);
  }, [skillsData]);

  const growthDelta = averageCurrent - averageA;

  // Custom Tooltip
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: RadarSkillPoint = payload[0].payload;
      return (
        <div className="p-3 rounded-md bg-white border border-[#E5E1D8] shadow-md max-w-xs text-xs space-y-1.5 z-50 text-[#1E2433]">
          <div className="font-semibold text-[#1E2433] flex items-center justify-between gap-3 border-b border-[#E5E1D8] pb-1">
            <span className="font-serif">{data.skill}</span>
            <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] font-mono font-bold text-[11px] border border-[#FDE68A]">
              {data.scoreCurrent} / 100
            </span>
          </div>
          {hasBothTests && (
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#A16207]">Trước (Bộ A): {data.scoreA}</span>
              <span className={data.scoreCurrent >= data.scoreA ? 'text-[#15803D] font-bold' : 'text-[#DC2626] font-bold'}>
                {data.scoreCurrent >= data.scoreA ? `+${data.scoreCurrent - data.scoreA}` : `${data.scoreCurrent - data.scoreA}`} điểm
              </span>
            </div>
          )}
          <p className="text-[#4A5263] text-[11px] leading-relaxed">
            {data.description}
          </p>
          <div className="flex items-center justify-between text-[10px] text-[#6B7280] font-mono pt-1 border-t border-[#E5E1D8]">
            <span>Chuẩn WSDC: <strong className="text-[#A16207]">{data.benchmarkScore}</strong></span>
            <span className={data.scoreCurrent >= data.benchmarkScore ? 'text-[#15803D] font-semibold' : 'text-[#A16207] font-semibold'}>
              {data.scoreCurrent >= data.benchmarkScore ? '✓ Vượt chuẩn' : 'Cần rèn luyện'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-[#E5E1D8] rounded-md p-5 sm:p-6 space-y-4 shadow-xs">
      {/* HEADER & THANH CÔNG CỤ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E1D8]">
        <div className="flex items-center gap-3">
          <Compass className="w-5 h-5 text-[#1E2433]" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1E2433]">
                Bản đồ năng lực phản biện
              </h3>
              {evaluatedN > 0 && (
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  Dựa trên {evaluatedN} bài làm thật
                </span>
              )}
            </div>
            <p className="text-xs text-[#4A5263] mt-0.5">
              Đo lường 6 chiều năng lực. Không dùng điểm số ước tính cũ.
            </p>
          </div>
        </div>

        {/* NÚT TÁC VỤ: LÀM TEST / CHIA SẺ TIẾN ĐỘ */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
          {evaluatedN > 0 && (
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-2.5 py-1.5 rounded border border-[#D6D1C4] hover:bg-[#F2EFE8] text-[#1E2433] bg-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Tạo link chỉ xem gửi Phụ huynh hoặc Thầy cô"
            >
              <Share2 className="w-3.5 h-3.5 text-[#4A5263]" />
              <span>Chia sẻ tiến độ</span>
            </button>
          )}

          {!testA ? (
            <button
              type="button"
              onClick={() => openDiagnosticTest('A')}
              className="px-3.5 py-1.5 rounded font-bold bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Làm bài kiểm tra Bộ A (15p)</span>
            </button>
          ) : !testB ? (
            <button
              type="button"
              onClick={() => openDiagnosticTest('B')}
              className={`px-3.5 py-1.5 rounded font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isEligibleForTestB
                  ? 'bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] shadow-2xs'
                  : 'border border-[#D6D1C4] text-[#1E2433] bg-white hover:bg-[#F2EFE8]'
              }`}
              title={isEligibleForTestB ? 'Đã tròn 4 tuần! Làm bài ngay' : 'Mở bài kiểm tra Bộ B'}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEligibleForTestB ? 'Làm bài Bộ B (Đến kỳ 4 tuần)' : 'Làm bài Bộ B'}</span>
            </button>
          ) : null}

          {evaluatedN > 0 && (
            <button
              type="button"
              onClick={() => setShowBenchmark(!showBenchmark)}
              className={`px-2.5 py-1.5 rounded text-xs border transition-colors cursor-pointer ${
                showBenchmark
                  ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E] font-medium'
                  : 'bg-[#F2EFE8] border-[#E5E1D8] text-[#6B7280]'
              }`}
            >
              Chuẩn WSDC
            </button>
          )}
        </div>
      </div>

      {/* BANNER THÔNG BÁO CHU KỲ 4 TUẦN KHI ĐÃ CÓ BỘ A NHƯNG CHƯA CÓ BỘ B */}
      {testA && !testB && (
        <div className={`p-3.5 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isEligibleForTestB 
            ? 'bg-[#FEF3C7] border-[#FDE68A]' 
            : 'bg-[#F2EFE8] border-[#E5E1D8] text-[#1E2433]'
        }`}>
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded border border-[#E5E1D8] bg-white text-[#1E2433] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#A16207]" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-[#1E2433] flex items-center gap-2">
                {isEligibleForTestB ? (
                  <>
                    <span>Đã đến kỳ đánh giá sau 4 tuần!</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FACC15] text-[#1E2433] font-bold">
                      Sẵn sàng
                    </span>
                  </>
                ) : (
                  <span>Lộ trình rèn luyện 4 tuần (Đánh giá tiến bộ)</span>
                )}
              </div>
              <p className="text-xs text-[#4A5263] mt-0.5">
                {isEligibleForTestB 
                  ? 'Bạn đã hoàn thành 4 tuần rèn luyện. Hãy làm bài kiểm tra Bộ B (20 câu) để xem sự tiến bộ trên biểu đồ Radar so sánh Trước/Sau!' 
                  : `Bài kiểm tra Bộ A đã hoàn thành ngày ${new Date(testA.completedAt).toLocaleDateString('vi-VN')} (${daysSinceTestA} ngày trước). Còn ${daysUntilTestB} ngày nữa sẽ đến đợt kiểm tra Bộ B.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openDiagnosticTest('B')}
              className="px-3.5 py-1.5 rounded font-bold text-xs text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span>{isEligibleForTestB ? 'Làm Bộ B Ngay' : 'Làm Bộ B Sớm'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {!isEligibleForTestB && (
              <button
                type="button"
                onClick={simulateFourWeeksPassed}
                className="px-2.5 py-1.5 rounded bg-white hover:bg-[#F2EFE8] border border-[#D6D1C4] text-[#4A5263] hover:text-[#1E2433] text-xs font-mono transition-colors cursor-pointer"
                title="Giả lập mốc 4 tuần để kiểm thử ngay biểu đồ so sánh Bộ A và Bộ B"
              >
                Giả lập 4 tuần
              </button>
            )}
          </div>
        </div>
      )}

      {/* HIỂN THỊ KHI N = 0: CHƯA CÓ BÀI LÀM THẬT */}
      {evaluatedN === 0 ? (
        <div className="p-6 sm:p-8 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-center space-y-3">
          <div className="w-12 h-12 rounded border border-[#E5E1D8] bg-white text-[#1E2433] flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6 text-[#A16207]" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-serif text-base font-bold text-[#1E2433]">
              Chưa có dữ liệu bài làm thực tế
            </h4>
            <p className="text-xs text-[#4A5263] leading-relaxed">
              Biểu đồ Radar tính từ các bài làm thật (không dùng điểm ảo). Hãy hoàn thành Bài kiểm tra chẩn đoán 20 câu để kích hoạt biểu đồ năng lực của bạn.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => openDiagnosticTest('A')}
              className="px-4 py-2 rounded font-bold text-xs sm:text-sm text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] flex items-center gap-2 mx-auto transition-colors cursor-pointer shadow-2xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Làm Bài Kiểm Tra Chẩn Đoán Bộ A (15 phút)</span>
            </button>
          </div>
        </div>
      ) : (
        /* KHU VỰC BIỂU ĐỒ RADAR & PHÂN TÍCH TIẾN BỘ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* CỘT TRÁI (7 CỘT): BIỂU ĐỒ RADAR RECHARTS */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full h-[310px] sm:h-[350px] max-w-md mx-auto relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillsData}>
                  <PolarGrid stroke="#E5E1D8" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="shortLabel"
                    tick={{ fill: '#4A5263', fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#6B7280', fontSize: 9 }}
                    stroke="#E5E1D8"
                  />

                  {/* Vùng đối sánh chuẩn WSDC */}
                  {showBenchmark && (
                    <Radar
                      name="Chuẩn WSDC"
                      dataKey="benchmarkScore"
                      stroke="#A16207"
                      fill="#FACC15"
                      fillOpacity={0.15}
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Vùng điểm Trước (Bộ A) nếu cả 2 bộ đã làm */}
                  {hasBothTests && (
                    <Radar
                      name="Trước (Bộ A)"
                      dataKey="scoreA"
                      stroke="#B45309"
                      fill="#B45309"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Vùng điểm Hiện tại / Bộ B */}
                  <Radar
                    name={hasBothTests ? 'Sau 4 tuần (Bộ B)' : 'Năng lực thực tế'}
                    dataKey="scoreCurrent"
                    stroke={hasBothTests ? '#15803D' : '#2563EB'}
                    fill={hasBothTests ? '#15803D' : '#2563EB'}
                    fillOpacity={0.35}
                    strokeWidth={2}
                    activeDot={{ r: 6, fill: '#2563EB', stroke: '#1E2433', strokeWidth: 2 }}
                  />

                  <Tooltip content={<CustomRadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Chú giải màu sắc */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#4A5263] pt-1">
              {hasBothTests ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#FEF3C7] border border-[#A16207] border-dashed"></span>
                    <span className="text-[#A16207]">Trước (Bộ A)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#DCFCE7] border border-[#15803D]"></span>
                    <span className="text-[#15803D]">Sau 4 tuần (Bộ B)</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#DBEAFE] border border-[#2563EB]"></span>
                  <span className="text-[#1E2433]">Điểm thực tế của {profile?.name || 'Học sinh'}</span>
                </div>
              )}

              {showBenchmark && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#FEF3C7] border border-[#A16207] border-dashed"></span>
                  <span className="text-[#A16207]">Chuẩn WSDC (70+)</span>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI (5 CỘT): TÓM TẮT ĐIỂM SỐ & TIẾN BỘ */}
          <div className="lg:col-span-5 space-y-3">
            {/* Card Điểm Tổng Hợp Thực Tế */}
            <div className="p-3.5 rounded bg-[#F2EFE8] border border-[#E5E1D8] flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-medium text-[#4A5263] block">
                  Chỉ số Năng lực Tư duy (CTQ)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-[#1E2433] font-mono">
                    {averageCurrent}
                  </span>
                  <span className="text-xs text-[#6B7280] font-mono">/ 100 điểm</span>
                  {hasBothTests && growthDelta > 0 && (
                    <span className="text-xs font-mono font-semibold text-[#15803D]">
                      +{growthDelta}đ so với Bộ A
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#4A5263] mt-0.5">
                  Dựa trên {evaluatedN} bài kiểm tra và bài chấm AI thực tế.
                </p>
              </div>

              <div className="w-10 h-10 rounded border border-[#E5E1D8] bg-white flex items-center justify-center shrink-0 text-[#1E2433]">
                <TrendingUp className="w-5 h-5 text-[#A16207]" />
              </div>
            </div>

            {/* Chi tiết từng nguồn bài đánh giá */}
            <div className="p-3 rounded bg-[#F2EFE8] border border-[#E5E1D8] space-y-1.5 text-xs">
              <span className="font-semibold text-[#1E2433] block text-[11px]">
                Nguồn dữ liệu cấu thành biểu đồ ({evaluatedN} bài):
              </span>
              <div className="space-y-1 text-[#4A5263] text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Bài kiểm tra chẩn đoán:</span>
                  <span className="font-mono font-semibold text-[#1E2433]">
                    {testCount} bài ({testA ? 'Bộ A ✓' : ''} {testB ? '· Bộ B ✓' : ''})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bài Vạch lá tìm sâu AI chấm thật:</span>
                  <span className="font-mono font-semibold text-[#1E2433]">
                    {fallaciesHistory.length} bài
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trận đấu WSDC & Dựng người thép:</span>
                  <span className="font-mono font-semibold text-[#1E2433]">
                    {matches.length} trận
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHI TIẾT 6 CHỈ SỐ THÀNH PHẦN */}
      {skillsData.length > 0 && (
        <div className="pt-2 border-t border-[#E5E1D8]">
          <span className="text-[11px] font-semibold text-[#4A5263] block mb-2">
            Chi tiết 6 chỉ số thành phần (Nhấp để xem giải thích):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {skillsData.map(item => {
              const delta = item.scoreCurrent - item.scoreA;
              return (
                <div
                  key={item.skill}
                  onClick={() => setActiveSkill(activeSkill?.skill === item.skill ? null : item)}
                  className={`p-2.5 rounded border cursor-pointer transition-colors ${
                    activeSkill?.skill === item.skill
                      ? 'bg-[#FEF3C7] text-[#1E2433] border-[#FDE68A] font-semibold shadow-2xs'
                      : 'bg-white border-[#E5E1D8] hover:border-[#D6D1C4] text-[#4A5263]'
                  }`}
                >
                  <div className="text-[10px] text-[#6B7280] truncate">{item.shortLabel}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold font-mono text-[#1E2433]">
                      {item.scoreCurrent}
                    </span>
                    {hasBothTests ? (
                      <span className={`text-[10px] font-mono font-semibold ${
                        delta >= 0 ? 'text-[#15803D]' : 'text-[#DC2626]'
                      }`}>
                        {delta >= 0 ? `+${delta}` : delta}
                      </span>
                    ) : (
                      <span className={`text-[10px] font-mono font-semibold ${
                        item.scoreCurrent >= item.benchmarkScore ? 'text-[#15803D]' : 'text-[#A16207]'
                      }`}>
                        {item.scoreCurrent >= item.benchmarkScore ? `+${item.scoreCurrent - item.benchmarkScore}` : `${item.scoreCurrent - item.benchmarkScore}`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hộp chi tiết khi nhấp vào kỹ năng */}
          {activeSkill && (
            <div className="mt-2.5 p-3 rounded bg-[#F2EFE8] border border-[#FDE68A] text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-[#1E2433]">
                <span className="font-serif">{activeSkill.skill} ({activeSkill.scoreCurrent}/100)</span>
                <button 
                  type="button" 
                  onClick={() => setActiveSkill(null)}
                  className="text-[#6B7280] hover:text-[#1E2433] p-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-[#4A5263]">{activeSkill.description}</p>
              <p className="text-[#92400E] font-medium">Gợi ý phát triển: {activeSkill.advice}</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL CHIA SẺ TIẾN ĐỘ CHO PHỤ HUYNH / THẦY CÔ */}
      <ShareProgressModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        debateHistory={matches}
        evaluatedTaskCount={evaluatedN}
      />
    </div>
  );
};

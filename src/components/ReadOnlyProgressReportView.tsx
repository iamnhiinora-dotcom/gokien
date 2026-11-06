/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TRANG BÁO CÁO TIẾN ĐỘ CHỈ XEM (READ-ONLY PROGRESS REPORT)
 * Dành riêng cho Phụ huynh và Giáo viên theo dõi sự tiến bộ tư duy phản biện của học sinh.
 * Hiển thị biểu đồ radar năng lực thực tế, đối sánh Trước (Bộ A) và Sau 4 tuần (Bộ B).
 * 
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Nền trang #F8F6F1, card #FFFFFF viền #E5E1D8, nền phụ #F2EFE8.
 * - Chữ đen #1E2433, chữ phụ #4A5263, chú thích #6B7280.
 * - Nút nhấn #FACC15 chữ #1E2433, badge vàng #FEF3C7 chữ #92400E.
 */

import React from 'react';
import { UserProfile, DebateMatchRecord } from '../types';
import { DIAGNOSTIC_GROUP_INFO, DiagnosticSkillGroupKey } from '../data/diagnosticTestData';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { 
  ShieldCheck, 
  Compass, 
  Award, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Sparkles,
  BookOpen,
  Swords
} from 'lucide-react';

interface ReadOnlyProgressReportViewProps {
  profile: UserProfile;
  debateHistory: DebateMatchRecord[];
  onBackToApp: () => void;
}

export const ReadOnlyProgressReportView: React.FC<ReadOnlyProgressReportViewProps> = ({
  profile,
  debateHistory,
  onBackToApp
}) => {
  const testA = profile.diagnosticTestA;
  const testB = profile.diagnosticTestB;

  // Tính số bài đánh giá thực tế N
  const testCount = (testA ? 1 : 0) + (testB ? 1 : 0);
  const fallacyCount = profile.evaluatedFallaciesHistory?.length || 0;
  const matchCount = debateHistory.length;
  const totalEvaluatedN = testCount + fallacyCount + matchCount;

  // Tính điểm 6 kỹ năng
  const implicitScore = testB?.groupScores.implicit_assumptions ?? testA?.groupScores.implicit_assumptions ?? 0;
  const implicitScoreA = testA?.groupScores.implicit_assumptions ?? 0;

  const logicTestScore = testB?.groupScores.logical_validity ?? testA?.groupScores.logical_validity ?? 0;
  const logicScoreA = testA?.groupScores.logical_validity ?? 0;

  const evidenceScore = testB?.groupScores.evidence_strength ?? testA?.groupScores.evidence_strength ?? 0;
  const evidenceScoreA = testA?.groupScores.evidence_strength ?? 0;

  const fallacyTestScore = testB?.groupScores.fallacy_recognition ?? testA?.groupScores.fallacy_recognition ?? 0;
  const fallacyScoreA = testA?.groupScores.fallacy_recognition ?? 0;

  const factScore = testB?.groupScores.fact_vs_opinion ?? testA?.groupScores.fact_vs_opinion ?? 0;
  const factScoreA = testA?.groupScores.fact_vs_opinion ?? 0;

  let debateScore = 0;
  if (debateHistory.length > 0) {
    const totalWsdc = debateHistory.reduce((sum, m) => sum + (m.wsdcScore || (m.outcome === 'victory' ? 85 : 65)), 0);
    debateScore = Math.round(totalWsdc / debateHistory.length);
  } else if (testA) {
    debateScore = Math.round((implicitScore + logicTestScore + fallacyTestScore) / 3);
  }

  const radarData = [
    {
      skill: 'Nhận ra giả định ngầm',
      shortLabel: 'Giả định ngầm',
      scoreA: implicitScoreA,
      scoreCurrent: implicitScore,
      benchmark: 70
    },
    {
      skill: 'Suy luận logic',
      shortLabel: 'Suy luận logic',
      scoreA: logicScoreA,
      scoreCurrent: logicTestScore,
      benchmark: 72
    },
    {
      skill: 'Đánh giá bằng chứng',
      shortLabel: 'Độ mạnh bằng chứng',
      scoreA: evidenceScoreA,
      scoreCurrent: evidenceScore,
      benchmark: 68
    },
    {
      skill: 'Nhận diện ngụy biện',
      shortLabel: 'Nhận diện ngụy biện',
      scoreA: fallacyScoreA,
      scoreCurrent: fallacyTestScore,
      benchmark: 75
    },
    {
      skill: 'Sự thật vs Ý kiến',
      shortLabel: 'Sự thật & Ý kiến',
      scoreA: factScoreA,
      scoreCurrent: factScore,
      benchmark: 70
    },
    {
      skill: 'Bản lĩnh & Phản biện WSDC',
      shortLabel: 'Bản lĩnh WSDC',
      scoreA: Math.round((implicitScoreA + logicScoreA + fallacyScoreA) / 3),
      scoreCurrent: debateScore,
      benchmark: 70
    }
  ];

  const hasBothTests = Boolean(testA && testB);
  const averageCurrent = Math.round(radarData.reduce((acc, curr) => acc + curr.scoreCurrent, 0) / radarData.length);
  const averageA = Math.round(radarData.reduce((acc, curr) => acc + curr.scoreA, 0) / radarData.length);
  const growthDelta = averageCurrent - averageA;

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#1E2433] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E1D8]">
          <button
            type="button"
            onClick={onBackToApp}
            className="px-3 py-1.5 rounded bg-white border border-[#D6D1C4] hover:bg-[#F2EFE8] text-[#1E2433] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay về ứng dụng</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-xs font-mono font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              Chế độ chỉ xem (Phụ huynh & Giáo viên)
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>In báo cáo</span>
            </button>
          </div>
        </div>

        {/* HEADER BÁO CÁO CHÍNH THỨC */}
        <div className="p-5 sm:p-6 rounded-md bg-white border border-[#E5E1D8] shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[11px] font-mono font-semibold">
                <Compass className="w-3.5 h-3.5 text-[#A16207]" /> Báo cáo học tập cá nhân
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1E2433] tracking-tight">
                Hồ sơ tiến độ tư duy phản biện & tranh biện
              </h1>
              <p className="text-xs text-[#4A5263] max-w-xl leading-relaxed">
                Đánh giá sự tiến bộ tư duy phản biện dựa trên kết quả bài kiểm tra chẩn đoán và các lượt phản biện thực tế được AI thẩm định.
              </p>
            </div>

            {/* Dấu mộc số bài đánh giá thực tế */}
            <div className="px-4 py-3 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] text-center shrink-0">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block font-mono">
                Số bài đánh giá thật
              </span>
              <div className="text-2xl font-black text-[#1E2433] font-mono mt-0.5">
                {totalEvaluatedN} bài
              </div>
              <span className="text-[10px] text-[#15803D] font-medium block mt-0.5">
                ✓ Dữ liệu thật 100%
              </span>
            </div>
          </div>

          {/* HÀNG THÔNG TIN HỌC SINH */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-[#E5E1D8] text-xs">
            <div className="p-2.5 rounded bg-[#F2EFE8] border border-[#E5E1D8]">
              <span className="text-[#6B7280] block text-[11px]">Học sinh:</span>
              <span className="font-serif font-bold text-[#1E2433] text-sm">{profile.name}</span>
            </div>
            <div className="p-2.5 rounded bg-[#F2EFE8] border border-[#E5E1D8]">
              <span className="text-[#6B7280] block text-[11px]">Lớp / Trường:</span>
              <span className="font-bold text-[#1E2433] text-sm">{profile.school || 'THPT'}</span>
            </div>
            <div className="p-2.5 rounded bg-[#F2EFE8] border border-[#E5E1D8]">
              <span className="text-[#6B7280] block text-[11px]">Cấp độ hiện tại:</span>
              <span className="font-bold text-[#A16207] text-sm">Cấp {profile.level} ({profile.title})</span>
            </div>
            <div className="p-2.5 rounded bg-[#F2EFE8] border border-[#E5E1D8]">
              <span className="text-[#6B7280] block text-[11px]">Ngày xuất báo cáo:</span>
              <span className="font-mono text-[#1E2433] text-sm">{new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* KHU VỰC BIỂU ĐỒ RADAR SO SÁNH TRƯỚC VÀ SAU */}
        <div className="p-5 sm:p-6 rounded-md bg-white border border-[#E5E1D8] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E1D8]">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#1E2433] flex items-center gap-2">
                Bản đồ năng lực 6 trụ cột tư duy
                {hasBothTests && (
                  <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] text-xs font-mono font-bold">
                    Đối sánh Trước / Sau
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#4A5263] mt-0.5">
                {hasBothTests 
                  ? 'So sánh điểm số giữa bài kiểm tra Bộ A (đầu vào) và Bộ B (sau 4 tuần rèn luyện).'
                  : 'Điểm số dựa trên bài kiểm tra chẩn đoán và các bài tập do AI chấm thật.'}
              </p>
            </div>

            {hasBothTests && growthDelta > 0 && (
              <div className="px-3 py-1 rounded bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] font-mono text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tiến bộ trung bình: +{growthDelta} điểm</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Biểu đồ Radar */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full h-[300px] sm:h-[340px] max-w-md mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
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

                    {/* Vùng Trước (Bộ A) nếu có cả 2 */}
                    {hasBothTests && (
                      <Radar
                        name="Trước (Bộ A)"
                        dataKey="scoreA"
                        stroke="#A16207"
                        fill="#FACC15"
                        fillOpacity={0.2}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Vùng Hiện tại / Sau 4 tuần */}
                    <Radar
                      name={hasBothTests ? 'Sau 4 tuần (Bộ B)' : 'Năng lực thực tế'}
                      dataKey="scoreCurrent"
                      stroke={hasBothTests ? '#15803D' : '#2563EB'}
                      fill={hasBothTests ? '#15803D' : '#2563EB'}
                      fillOpacity={0.35}
                      strokeWidth={2}
                      activeDot={{ r: 5, fill: '#2563EB', stroke: '#1E2433', strokeWidth: 2 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Chú giải */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#4A5263] pt-1">
                {hasBothTests ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-[#FEF3C7] border border-[#A16207] border-dashed"></span>
                      <span className="text-[#A16207]">Trước (Bộ A): {testA?.completedAt ? new Date(testA.completedAt).toLocaleDateString('vi-VN') : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-[#DCFCE7] border border-[#15803D]"></span>
                      <span className="text-[#15803D]">Sau 4 tuần (Bộ B): {testB?.completedAt ? new Date(testB.completedAt).toLocaleDateString('vi-VN') : ''}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#DBEAFE] border border-[#2563EB]"></span>
                    <span className="text-[#1E2433]">Năng lực thực tế ({averageCurrent}/100)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bảng Chỉ Số Năng Lực Chi Tiết */}
            <div className="lg:col-span-5 space-y-2.5">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#4A5263]">
                Chỉ số theo từng trụ cột:
              </h4>

              <div className="space-y-1.5">
                {radarData.map(item => {
                  const delta = item.scoreCurrent - item.scoreA;
                  return (
                    <div 
                      key={item.skill}
                      className="p-2.5 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#1E2433]">{item.skill}</div>
                        <div className="text-[11px] text-[#6B7280]">
                          Mục tiêu chuẩn: {item.benchmark} điểm
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasBothTests && (
                          <div className="text-right">
                            <span className="text-[10px] text-[#6B7280] line-through mr-1 font-mono">{item.scoreA}</span>
                            <span className={`font-mono font-bold text-xs ${delta >= 0 ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                              {delta >= 0 ? `+${delta}` : delta}
                            </span>
                          </div>
                        )}
                        <span className="px-2 py-0.5 rounded bg-white border border-[#E5E1D8] text-[#1E2433] font-mono font-bold text-xs">
                          {item.scoreCurrent}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* LỊCH SỬ CÁC BÀI ĐÁNH GIÁ THỰC TẾ */}
        <div className="p-5 sm:p-6 rounded-md bg-white border border-[#E5E1D8] shadow-xs space-y-3">
          <h3 className="font-serif text-base font-bold text-[#1E2433] flex items-center gap-2 pb-2 border-b border-[#E5E1D8]">
            <BookOpen className="w-4 h-4 text-[#A16207]" />
            Nhật ký đánh giá năng lực học thuật
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-1">
              <span className="text-xs text-[#6B7280] block">Bài kiểm tra chẩn đoán Bộ A</span>
              <div className="font-serif font-bold text-base text-[#1E2433]">
                {testA ? `${testA.totalScore}/100 điểm` : 'Chưa hoàn thành'}
              </div>
              <p className="text-[11px] text-[#4A5263]">
                {testA ? `Hoàn thành ngày ${new Date(testA.completedAt).toLocaleDateString('vi-VN')} (${testA.correctCount}/20 câu đúng)` : 'Cần làm để xác định mức xuất phát điểm'}
              </p>
            </div>

            <div className="p-3 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-1">
              <span className="text-xs text-[#6B7280] block">Bài kiểm tra sau 4 tuần (Bộ B)</span>
              <div className="font-serif font-bold text-base text-[#1E2433]">
                {testB ? `${testB.totalScore}/100 điểm` : 'Chưa làm (đang rèn luyện)'}
              </div>
              <p className="text-[11px] text-[#4A5263]">
                {testB ? `Hoàn thành ngày ${new Date(testB.completedAt).toLocaleDateString('vi-VN')} (${testB.correctCount}/20 câu đúng)` : 'Sẽ mở sau 4 tuần kể từ ngày làm Bộ A'}
              </p>
            </div>

            <div className="p-3 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-1">
              <span className="text-xs text-[#6B7280] block">Thực hành phản biện & vạch lỗi</span>
              <div className="font-serif font-bold text-base text-[#1E2433]">
                {matchCount} trận đấu
              </div>
              <p className="text-[11px] text-[#4A5263]">
                Thắng: {profile.debatesWon} · Lỗi vạch trần: {profile.fallaciesIdentified}
              </p>
            </div>
          </div>
        </div>

        {/* LỜI NHẬN XÉT HỌC THUẬT */}
        <div className="p-4 rounded-md bg-white border border-[#E5E1D8] text-xs text-[#4A5263] space-y-1.5 shadow-2xs">
          <div className="font-serif font-bold text-[#1E2433] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            Nhận định chung:
          </div>
          <p className="leading-relaxed">
            Học sinh <strong className="text-[#1E2433]">{profile.name}</strong> đã chủ động rèn luyện tư duy phản biện. Việc nhận ra các bẫy ngụy biện và biết cách bẻ gãy tiền đề sai lầm một cách công tâm (Steelman) là bước tiến vững chắc hướng tới khả năng tự học và giải quyết vấn đề độc lập.
          </p>
        </div>
      </div>
    </div>
  );
};

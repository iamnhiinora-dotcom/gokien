/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BẢNG LỊCH SỬ CÁC TRẬN ĐẤU TRANH BIỆN WSDC (DEBATE HISTORY SECTION)
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Card trắng #FFFFFF viền #E5E1D8, nền phụ #F2EFE8.
 * - Chữ đen #1E2433, chữ phụ #4A5263, chú thích #6B7280.
 * - Nút nhấn #FACC15 chữ #1E2433, liên kết #B45309.
 */

import React, { useState, useMemo } from 'react';
import { DebateMatchRecord } from '../types';
import { useGamification } from '../context/GamificationContext';
import { 
  Swords, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  Shield, 
  Users 
} from 'lucide-react';

interface DebateHistorySectionProps {
  history: DebateMatchRecord[];
  onNavigateToDebate?: () => void;
}

export const DebateHistorySection: React.FC<DebateHistorySectionProps> = ({
  history,
  onNavigateToDebate
}) => {
  const { profile, openAuthModal } = useGamification();
  const [filter, setFilter] = useState<'all' | 'victory' | 'defeat'>('all');

  // Lọc danh sách theo trạng thái
  const filteredHistory = useMemo(() => {
    if (filter === 'all') return history;
    return history.filter(m => m.outcome === filter);
  }, [history, filter]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = history.length;
    const wins = history.filter(m => m.outcome === 'victory').length;
    const losses = history.filter(m => m.outcome === 'defeat').length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const totalXp = history.reduce((sum, m) => sum + (m.xpEarned || 0), 0);

    return { total, wins, losses, winRate, totalXp };
  }, [history]);

  return (
    <div className="bg-white border border-[#E5E1D8] rounded-md p-5 sm:p-6 space-y-4 shadow-xs">
      {/* Tiêu đề & Thống kê tóm tắt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E1D8]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#1E2433] flex items-center gap-2">
              Nhật ký trận đấu tranh biện
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                {history.length} trận
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#4A5263]">
            <span>Học sinh:</span>
            <span className="font-semibold text-[#1E2433]">
              {profile.name}
            </span>
            <span className="font-mono text-[#6B7280]">(@{profile.username || 'user'})</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="text-[#B45309] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Users className="w-3 h-3" />
              <span>Quản lý tài khoản</span>
            </button>
          </div>
        </div>

        {/* Nút hành động nhanh */}
        {onNavigateToDebate && (
          <button
            type="button"
            onClick={onNavigateToDebate}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded font-bold text-xs text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Vào sàn đấu ngay</span>
          </button>
        )}
      </div>

      {/* 4 Thẻ Chỉ số nhanh */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-center">
          <span className="text-xs text-[#6B7280] block">Tổng số trận</span>
          <span className="text-base font-mono font-bold text-[#1E2433] mt-0.5 block">
            {stats.total}
          </span>
        </div>

        <div className="p-3 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-center">
          <span className="text-xs text-[#6B7280] block">Số trận thắng</span>
          <span className="text-base font-mono font-bold text-[#15803D] mt-0.5 block">
            {stats.wins} trận
          </span>
        </div>

        <div className="p-3 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-center">
          <span className="text-xs text-[#6B7280] block">Tỷ lệ thắng</span>
          <span className="text-base font-mono font-bold text-[#1E2433] mt-0.5 block">
            {stats.winRate}% ({stats.wins}W - {stats.losses}L)
          </span>
        </div>

        <div className="p-3 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-center">
          <span className="text-xs text-[#6B7280] block">Kinh nghiệm</span>
          <span className="text-base font-mono font-bold text-[#A16207] mt-0.5 block">
            +{stats.totalXp.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* Bộ Lọc Trạng Thái */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer border ${
            filter === 'all'
              ? 'bg-[#FACC15] text-[#1E2433] border-[#FACC15] font-bold shadow-2xs'
              : 'bg-white text-[#4A5263] border-[#D6D1C4] hover:bg-[#F2EFE8]'
          }`}
        >
          Tất cả ({history.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('victory')}
          className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer border ${
            filter === 'victory'
              ? 'bg-[#FACC15] text-[#1E2433] border-[#FACC15] font-bold shadow-2xs'
              : 'bg-white text-[#4A5263] border-[#D6D1C4] hover:bg-[#F2EFE8]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
          <span>Thắng ({stats.wins})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('defeat')}
          className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer border ${
            filter === 'defeat'
              ? 'bg-[#FACC15] text-[#1E2433] border-[#FACC15] font-bold shadow-2xs'
              : 'bg-white text-[#4A5263] border-[#FACC15] font-bold shadow-2xs'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Thất bại ({stats.losses})</span>
        </button>
      </div>

      {/* Danh Sách Trận Đấu */}
      {history.length === 0 ? (
        <div className="py-10 text-center space-y-3 bg-[#F2EFE8] rounded border border-[#E5E1D8] p-6">
          <div className="w-12 h-12 mx-auto rounded border border-[#E5E1D8] bg-white flex items-center justify-center text-[#6B7280]">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[#1E2433] font-semibold text-sm">
              Chưa có trận đấu nào trong nhật ký
            </div>
            <p className="text-xs text-[#4A5263] max-w-md mx-auto mt-1 leading-relaxed">
              Mỗi tài khoản được ghi nhớ lịch sử tranh biện độc lập. Hãy vào Sàn Đấu Tranh Biện để thử sức với các chủ đề WSDC thú vị!
            </p>
          </div>
          {onNavigateToDebate && (
            <button
              type="button"
              onClick={onNavigateToDebate}
              className="px-4 py-2 rounded font-bold text-xs text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Bắt đầu trận đấu đầu tiên</span>
            </button>
          )}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-10 text-center space-y-2 bg-[#F2EFE8] rounded border border-[#E5E1D8] p-4">
          <div className="text-[#1E2433] font-medium text-xs">
            Không tìm thấy trận đấu nào phù hợp với bộ lọc.
          </div>
          <p className="text-[11px] text-[#6B7280] max-w-sm mx-auto">
            Hãy chọn bộ lọc "Tất cả" để xem toàn bộ danh sách trận đấu.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Bảng cho Màn Hình Máy Tính & Tablet */}
          <table className="w-full text-left text-xs hidden md:table">
            <thead>
              <tr className="border-b border-[#E5E1D8] text-[#6B7280] font-mono text-[11px]">
                <th className="py-2.5 px-3">Thời gian</th>
                <th className="py-2.5 px-3">Chủ đề & Lập trường</th>
                <th className="py-2.5 px-3">Đối thủ</th>
                <th className="py-2.5 px-3 text-center">Tỷ số máu</th>
                <th className="py-2.5 px-3 text-center">Kết quả</th>
                <th className="py-2.5 px-3 text-right">Kinh nghiệm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1D8]">
              {filteredHistory.map(match => (
                <tr key={match.id} className="hover:bg-[#F2EFE8] transition-colors">
                  {/* Thời gian */}
                  <td className="py-3 px-3 whitespace-nowrap text-[#6B7280] font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#1E2433]">
                      <Calendar className="w-3 h-3 text-[#6B7280]" />
                      <span>{match.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#6B7280] text-[10px] mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{match.timestamp}</span>
                    </div>
                  </td>

                  {/* Kiến nghị & Phe */}
                  <td className="py-3 px-3 max-w-md">
                    <div className="font-semibold text-[#1E2433] line-clamp-2 leading-relaxed">
                      &ldquo;{match.topicMotion}&rdquo;
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`text-[11px] font-semibold ${match.studentSide === 'pro' ? 'text-[#2563EB]' : 'text-[#DC2626]'}`}>
                        {match.studentSide === 'pro' ? 'Phe Ủng hộ' : 'Phe Phản đối'}
                      </span>
                      {match.steelmanScore !== undefined && (
                        <span className="text-[10px] text-[#4A5263] bg-[#F2EFE8] border border-[#E5E1D8] px-1.5 py-0.5 rounded">
                          Người Thép: {match.steelmanScore}/10đ
                        </span>
                      )}
                      {match.concessionCount !== undefined && match.concessionCount > 0 && (
                        <span className="text-[10px] text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] px-1.5 py-0.5 rounded">
                          Công tâm: {match.concessionCount} lần
                        </span>
                      )}
                      <span className="text-[10px] text-[#6B7280] font-mono">
                        {match.roundsCompleted} hiệp
                      </span>
                    </div>

                    {match.reflection && (
                      <div className="mt-1.5 p-2 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-[11px] space-y-1 text-[#4A5263]">
                        {match.reflection.opponentThoughtProvokingPoint && (
                          <div>
                            <strong className="text-[#1E2433]">Ý đối thủ làm nghĩ lại:</strong> {match.reflection.opponentThoughtProvokingPoint}
                          </div>
                        )}
                        {match.reflection.oppositeSideOpeningIdea && (
                          <div>
                            <strong className="text-[#1E2433]">Nếu đổi phe:</strong> {match.reflection.oppositeSideOpeningIdea}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Đối thủ */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-xs text-[#1E2433] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span>{match.personaName || 'AI Debater'}</span>
                    </span>
                  </td>

                  {/* Tỷ số Máu HP */}
                  <td className="py-3 px-3 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#1E2433]">
                      <span className="font-semibold">{match.studentHp}</span>
                      <span className="text-[#6B7280]">:</span>
                      <span className="font-semibold">{match.aiHp}</span>
                      <span className="text-[10px] text-[#6B7280]">HP</span>
                    </div>
                  </td>

                  {/* Kết quả */}
                  <td className="py-3 px-3 whitespace-nowrap text-center">
                    {match.outcome === 'victory' ? (
                      <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Thắng trận
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#DC2626] font-semibold text-xs">
                        <XCircle className="w-3.5 h-3.5" /> Thất bại
                      </span>
                    )}
                  </td>

                  {/* Điểm thưởng XP */}
                  <td className="py-3 px-3 whitespace-nowrap text-right font-mono font-bold text-xs text-[#A16207]">
                    +{match.xpEarned} XP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Dạng Danh Sách Thẻ cho Màn Hình Di Động */}
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {filteredHistory.map(match => (
              <div 
                key={match.id}
                className="p-3 rounded bg-[#F2EFE8] border border-[#E5E1D8] space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#6B7280] pb-1.5 border-b border-[#E5E1D8]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#6B7280]" />
                    {match.date}
                  </span>
                  <span className="font-bold text-[#A16207]">
                    +{match.xpEarned} XP
                  </span>
                </div>

                <div className="font-semibold text-xs text-[#1E2433] leading-snug">
                  &ldquo;{match.topicMotion}&rdquo;
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#4A5263]">
                  <span className={match.studentSide === 'pro' ? 'text-[#2563EB] font-semibold' : 'text-[#DC2626] font-semibold'}>
                    {match.studentSide === 'pro' ? 'Phe Ủng hộ' : 'Phe Phản đối'}
                  </span>
                  {match.steelmanScore !== undefined && (
                    <span className="bg-white border border-[#E5E1D8] px-1.5 py-0.2 rounded text-[10px]">
                      Người Thép: {match.steelmanScore}/10đ
                    </span>
                  )}
                  {match.concessionCount !== undefined && match.concessionCount > 0 && (
                    <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-1.5 py-0.2 rounded text-[10px]">
                      Công tâm: {match.concessionCount}
                    </span>
                  )}
                </div>

                {match.reflection && (
                  <div className="p-2 rounded bg-white border border-[#E5E1D8] text-[11px] space-y-1 text-[#4A5263]">
                    {match.reflection.opponentThoughtProvokingPoint && (
                      <div>
                        <strong className="text-[#1E2433] block text-[10px]">Ý đối thủ làm nghĩ lại:</strong>
                        <p className="italic text-[11px]">{match.reflection.opponentThoughtProvokingPoint}</p>
                      </div>
                    )}
                    {match.reflection.oppositeSideOpeningIdea && (
                      <div className="pt-1 border-t border-[#E5E1D8]">
                        <strong className="text-[#1E2433] block text-[10px]">Nếu đổi phe mở đầu:</strong>
                        <p className="italic text-[11px]">{match.reflection.oppositeSideOpeningIdea}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="font-mono text-[#4A5263]">
                    HP: <strong className="text-[#1E2433]">{match.studentHp}</strong> - <strong className="text-[#1E2433]">{match.aiHp}</strong>
                  </div>

                  <div>
                    {match.outcome === 'victory' ? (
                      <span className="text-[#15803D] font-semibold text-xs">
                        ✓ Thắng trận
                      </span>
                    ) : (
                      <span className="text-[#DC2626] font-semibold text-xs">
                        Thất bại
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

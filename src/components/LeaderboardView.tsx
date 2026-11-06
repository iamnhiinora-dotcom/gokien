/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MÀN HÌNH "BẢNG XẾP HẠNG"
 * Tập trung hoàn toàn vào thi đua học tập giữa các học sinh:
 * 1. Tiêu đề "Bảng xếp hạng học sinh" & mô tả ngắn
 * 2. Bộ lọc theo lớp VÀ nút chuyển sắp xếp (theo XP hoặc theo Số trận thắng)
 * 3. Bục vinh danh Top 3 (Podium): Hạng 2 bên trái (bạc), Hạng 1 ở giữa cao nhất (vàng), Hạng 3 bên phải (đồng)
 * 4. Bảng danh sách từ hạng 4 trở đi (hoặc từ hạng 1 nếu danh sách ngắn), dòng học sinh hiện tại bôi #FEF3C7
 *    Nếu học sinh chưa nằm trong danh sách, luôn ghim 1 dòng "Hạng của bạn" ở dưới cùng bảng
 * 5. Thông báo cho khách: "Đăng nhập để có tên trên bảng xếp hạng" + nút Đăng nhập Google
 * 6. Trạng thái trống: "Chưa có học sinh nào ở lớp này"
 * 7. Dữ liệu thật 100% từ Firestore.
 */

import React, { useState, useMemo } from 'react';
import { useGamification } from '../context/GamificationContext';
import { 
  Crown, 
  Award, 
  Medal, 
  Filter, 
  RefreshCw, 
  Users, 
  LogIn, 
  Swords, 
  Zap, 
  Trophy,
  ArrowUpDown
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { 
    currentUser, 
    isGuest, 
    profile, 
    leaderboard, 
    isLeaderboardLoading, 
    selectedClassFilter, 
    setSelectedClassFilter, 
    refreshLeaderboard,
    openAuthModal 
  } = useGamification();

  // Sắp xếp theo XP (mặc định) hoặc theo Số trận thắng
  const [sortBy, setSortBy] = useState<'xp' | 'debatesWon'>('xp');

  // Sắp xếp danh sách người dùng theo tiêu chí được chọn
  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort((a, b) => {
      if (sortBy === 'xp') {
        if (b.xp !== a.xp) return b.xp - a.xp;
        return (b.debatesWon || 0) - (a.debatesWon || 0);
      } else {
        if ((b.debatesWon || 0) !== (a.debatesWon || 0)) {
          return (b.debatesWon || 0) - (a.debatesWon || 0);
        }
        return b.xp - a.xp;
      }
    });
  }, [leaderboard, sortBy]);

  // Top 3 cho Podium
  const top1 = sortedLeaderboard[0] || null;
  const top2 = sortedLeaderboard[1] || null;
  const top3 = sortedLeaderboard[2] || null;

  // Danh sách hiển thị dưới bảng (từ hạng 4 trở đi nếu có > 3 người, hoặc hiển thị tất cả nếu có <= 3 người)
  const remainingStudents = sortedLeaderboard.length > 3 ? sortedLeaderboard.slice(3) : sortedLeaderboard;
  const startIndex = sortedLeaderboard.length > 3 ? 4 : 1;

  // Kiểm tra xem học sinh hiện tại có nằm trong bảng đang hiển thị không
  const isCurrentUserInTable = useMemo(() => {
    if (!currentUser) return false;
    return remainingStudents.some(u => u.id === currentUser.uid) || 
      (top1?.id === currentUser.uid) || 
      (top2?.id === currentUser.uid) || 
      (top3?.id === currentUser.uid);
  }, [currentUser, remainingStudents, top1, top2, top3]);

  // Tìm thứ hạng tổng thể của người dùng hiện tại nếu có
  const currentUserOverallRank = useMemo(() => {
    if (!currentUser) return null;
    const idx = sortedLeaderboard.findIndex(u => u.id === currentUser.uid);
    return idx !== -1 ? idx + 1 : null;
  }, [currentUser, sortedLeaderboard]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 overflow-x-hidden">
      
      {/* 1. TIÊU ĐỀ & MÔ TẢ NGẮN */}
      <div className="p-5 sm:p-6 rounded-md bg-white border border-[#E5E1D8] text-[#1E2433] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#A16207]" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1E2433] leading-snug">
              Bảng xếp hạng học sinh
            </h1>
          </div>
          <p className="text-[#4A5263] text-xs sm:text-sm mt-1 leading-relaxed">
            Thi đua phản biện trí tuệ, rèn luyện tư duy logic cùng bạn bè các trường THPT.
          </p>
        </div>

        {/* Nút Làm Mới */}
        <button
          type="button"
          onClick={refreshLeaderboard}
          disabled={isLeaderboardLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#D6D1C4] hover:bg-[#F2EFE8] text-xs font-medium text-[#1E2433] bg-white cursor-pointer transition-colors self-start sm:self-auto shrink-0"
          title="Tải lại bảng xếp hạng"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLeaderboardLoading ? 'animate-spin text-[#A16207]' : 'text-[#6B7280]'}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* 5. THÔNG BÁO CHO CHẾ ĐỘ KHÁCH */}
      {isGuest && (
        <div className="bg-white border border-[#E5E1D8] rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <LogIn className="w-4 h-4 text-[#6B7280] shrink-0" />
            <div>
              <span className="font-semibold text-[#1E2433]">
                Đăng nhập để có tên trên bảng xếp hạng!
              </span>
              <span className="text-[#4A5263] ml-1">
                Ghi danh điểm số, khẳng định năng lực phản biện cùng các bạn cùng trường.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={openAuthModal}
            className="px-3.5 py-1.5 rounded font-bold bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] shrink-0 cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
          >
            Đăng nhập Google
          </button>
        </div>
      )}

      {/* 2. BỘ LỌC THEO LỚP & NÚT CHUYỂN SẮP XẾP */}
      <div className="bg-white border border-[#E5E1D8] rounded-md p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Bộ lọc theo lớp */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-[#4A5263] font-medium">Lớp:</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-1.5 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-xs text-[#1E2433] font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả các lớp</option>
            <option value="10 Tin">Lớp 10 Tin</option>
            <option value="10A1">Lớp 10A1</option>
            <option value="11A1">Lớp 11A1</option>
            <option value="11 Chuyên Anh">Lớp 11 Chuyên Anh</option>
            <option value="12 Tin">Lớp 12 Tin</option>
            <option value="12 Hóa">Lớp 12 Hóa</option>
          </select>
        </div>

        {/* Nút chuyển sắp xếp */}
        <div className="flex items-center gap-1.5 bg-[#F2EFE8] p-1 rounded border border-[#E5E1D8]">
          <span className="text-[11px] text-[#6B7280] px-2 font-medium">Sắp xếp theo:</span>
          <button
            type="button"
            onClick={() => setSortBy('xp')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              sortBy === 'xp'
                ? 'bg-[#FACC15] text-[#1E2433] font-bold shadow-2xs'
                : 'text-[#4A5263] hover:text-[#1E2433]'
            }`}
          >
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#A16207]" />
              <span>Điểm XP</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSortBy('debatesWon')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              sortBy === 'debatesWon'
                ? 'bg-[#FACC15] text-[#1E2433] font-bold shadow-2xs'
                : 'text-[#4A5263] hover:text-[#1E2433]'
            }`}
          >
            <div className="flex items-center gap-1">
              <Swords className="w-3 h-3 text-[#A16207]" />
              <span>Số trận thắng</span>
            </div>
          </button>
        </div>
      </div>

      {/* 6. TRẠNG THÁI TRỐNG KHI LỚP CHƯA CÓ AI */}
      {sortedLeaderboard.length === 0 ? (
        <div className="bg-white border border-[#E5E1D8] rounded-md p-10 text-center space-y-2 shadow-xs">
          <Users className="w-8 h-8 mx-auto text-[#6B7280]" />
          <h3 className="font-serif font-bold text-base text-[#1E2433]">
            Chưa có học sinh nào ở lớp này
          </h3>
          <p className="text-xs text-[#4A5263] max-w-md mx-auto">
            {selectedClassFilter !== 'all' 
              ? `Hiện chưa có bạn nào thuộc ${selectedClassFilter} hoàn thành bài kiểm tra hoặc trận đấu trường.`
              : 'Hãy là người đầu tiên tham gia vạch lỗi hoặc đấu trường để ghi tên lên bảng vàng!'}
          </p>
        </div>
      ) : (
        <>
          {/* 3. BỤC VINH DANH TOP 3 (PODIUM) */}
          <div className="bg-white border border-[#E5E1D8] rounded-md p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-sm text-[#1E2433] flex items-center gap-1.5 pb-2 border-b border-[#E5E1D8]">
              <Crown className="w-4 h-4 text-[#A16207]" />
              <span>Top 3 Vinh Quang</span>
            </h2>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
              
              {/* HẠNG 2: Bục bên trái, viền bạc #94A3B8 */}
              <div className="flex flex-col items-center text-center">
                {top2 ? (
                  <div className="w-full space-y-2">
                    <div className="relative mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F2EFE8] border-2 border-[#94A3B8] flex items-center justify-center font-serif font-bold text-base sm:text-lg text-[#1E2433] shadow-xs">
                      {(top2.name || 'H').charAt(0)}
                      <span className="absolute -top-2 -right-1 bg-[#94A3B8] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                        #2
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="font-serif font-bold text-xs sm:text-sm text-[#1E2433] truncate px-1" title={top2.name}>
                        {top2.name}
                        {currentUser && top2.id === currentUser.uid && ' (Bạn)'}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[#4A5263] truncate">
                        {top2.schoolClass} · {top2.title}
                      </p>
                      <div className="font-mono font-bold text-xs text-[#1E2433] pt-1">
                        {sortBy === 'xp' ? `${top2.xp.toLocaleString()} XP` : `${top2.debatesWon || 0} trận thắng`}
                      </div>
                    </div>

                    <div className="h-16 sm:h-20 bg-[#F2EFE8] border-t-2 border-[#94A3B8] rounded-t-md flex items-center justify-center">
                      <Medal className="w-5 h-5 text-[#94A3B8]" />
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex items-center justify-center text-[11px] text-[#6B7280]">
                    Trống
                  </div>
                )}
              </div>

              {/* HẠNG 1: Bục cao nhất ở giữa, viền vàng #FACC15, icon vương miện */}
              <div className="flex flex-col items-center text-center -mt-4">
                {top1 ? (
                  <div className="w-full space-y-2">
                    <div className="relative mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FEF3C7] border-2 border-[#FACC15] ring-2 ring-[#FDE68A] flex items-center justify-center font-serif font-bold text-lg sm:text-xl text-[#1E2433] shadow-sm">
                      {(top1.name || 'H').charAt(0)}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Crown className="w-5 h-5 text-[#A16207] fill-[#FACC15]" />
                      </div>
                      <span className="absolute -bottom-1 bg-[#FACC15] text-[#1E2433] text-[10px] font-bold px-2 py-0.2 rounded-full font-mono border border-[#E5E1D8]">
                        #1
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="font-serif font-bold text-xs sm:text-base text-[#1E2433] truncate px-1" title={top1.name}>
                        {top1.name || 'Học sinh'}
                        {currentUser && top1.id === currentUser.uid && ' (Bạn)'}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[#A16207] font-medium truncate">
                        {top1.schoolClass} · {top1.title}
                      </p>
                      <div className="font-mono font-bold text-xs sm:text-sm text-[#1E2433] pt-1">
                        {sortBy === 'xp' ? `${top1.xp.toLocaleString()} XP` : `${top1.debatesWon || 0} trận thắng`}
                      </div>
                    </div>

                    <div className="h-24 sm:h-28 bg-[#FEF3C7] border-t-2 border-[#FACC15] rounded-t-md flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-[#A16207]" />
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-[11px] text-[#6B7280]">
                    Trống
                  </div>
                )}
              </div>

              {/* HẠNG 3: Bục bên phải, viền đồng #B45309 */}
              <div className="flex flex-col items-center text-center">
                {top3 ? (
                  <div className="w-full space-y-2">
                    <div className="relative mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F2EFE8] border-2 border-[#B45309] flex items-center justify-center font-serif font-bold text-base sm:text-lg text-[#1E2433] shadow-xs">
                      {(top3.name || 'H').charAt(0)}
                      <span className="absolute -top-2 -right-1 bg-[#B45309] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                        #3
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="font-serif font-bold text-xs sm:text-sm text-[#1E2433] truncate px-1" title={top3.name}>
                        {top3.name}
                        {currentUser && top3.id === currentUser.uid && ' (Bạn)'}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[#4A5263] truncate">
                        {top3.schoolClass} · {top3.title}
                      </p>
                      <div className="font-mono font-bold text-xs text-[#1E2433] pt-1">
                        {sortBy === 'xp' ? `${top3.xp.toLocaleString()} XP` : `${top3.debatesWon || 0} trận thắng`}
                      </div>
                    </div>

                    <div className="h-12 sm:h-16 bg-[#F2EFE8] border-t-2 border-[#B45309] rounded-t-md flex items-center justify-center">
                      <Award className="w-5 h-5 text-[#B45309]" />
                    </div>
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center text-[11px] text-[#6B7280]">
                    Trống
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 4. BẢNG DANH SÁCH TỪ HẠNG 4 TRỞ ĐI */}
          <div className="bg-white border border-[#E5E1D8] rounded-md p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D8]">
              <h3 className="font-serif font-bold text-sm text-[#1E2433]">
                {sortedLeaderboard.length > 3 ? 'Bảng xếp hạng (Từ hạng #4)' : 'Toàn bộ danh sách xếp hạng'}
              </h3>
              <span className="text-xs text-[#6B7280] font-mono">
                Tổng cộng {sortedLeaderboard.length} học sinh
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E1D8] text-[#6B7280] font-mono">
                    <th className="py-2.5 px-3">Hạng</th>
                    <th className="py-2.5 px-3">Học sinh</th>
                    <th className="py-2.5 px-3">Lớp</th>
                    <th className="py-2.5 px-3">Danh hiệu</th>
                    <th className="py-2.5 px-3 text-right">Thắng</th>
                    <th className="py-2.5 px-3 text-right">Điểm XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D8]">
                  {remainingStudents.map((user, idx) => {
                    const rank = startIndex + idx;
                    const isCurrent = currentUser && user.id === currentUser.uid;
                    const isEven = idx % 2 === 1;

                    return (
                      <tr 
                        key={user.id}
                        className={`transition-colors ${
                          isCurrent 
                            ? 'bg-[#FEF3C7] font-semibold text-[#1E2433]' 
                            : isEven
                            ? 'bg-[#F2EFE8] hover:bg-[#EAE6DE]'
                            : 'bg-white hover:bg-[#F2EFE8]'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono">
                          {rank <= 3 ? (
                            <span className="font-bold text-[#B45309]">#{rank}</span>
                          ) : (
                            <span className="text-[#6B7280]">#{rank}</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-[#1E2433]">
                          <span className={isCurrent ? 'font-bold' : ''}>
                            {user.name} {isCurrent && '(Bạn)'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-[#4A5263]">
                          {user.schoolClass}
                        </td>

                        <td className="py-2.5 px-3 text-[#4A5263]">
                          {user.title}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-[#4A5263]">
                          {user.debatesWon || 0}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#1E2433]">
                          {user.xp.toLocaleString()} XP
                        </td>
                      </tr>
                    );
                  })}

                  {/* GHIM DÒNG "HẠNG CỦA BẠN" Ở DƯỚI CÙNG NẾU HỌC SINH HIỆN TẠI CHƯA NẰM TRONG DANH SÁCH */}
                  {!isGuest && currentUser && !isCurrentUserInTable && (
                    <tr className="bg-[#FEF3C7] font-semibold text-[#1E2433] border-t-2 border-[#FACC15]">
                      <td className="py-2.5 px-3 font-mono text-[#A16207]">
                        {currentUserOverallRank ? `#${currentUserOverallRank}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[#1E2433]">
                        {profile?.name || 'Học sinh'} (Bạn - Hạng của bạn)
                      </td>
                      <td className="py-2.5 px-3 text-[#4A5263]">
                        {profile?.school || 'THPT'}
                      </td>
                      <td className="py-2.5 px-3 text-[#4A5263]">
                        {profile?.title || 'Tập sự phản biện'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#4A5263]">
                        {profile?.debatesWon || 0}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#1E2433]">
                        {(profile?.currentXP || 0).toLocaleString()} XP
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

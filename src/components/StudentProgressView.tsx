/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MÀN HÌNH "TIẾN ĐỘ"
 * Hiển thị toàn bộ thông tin cá nhân của học sinh theo đúng thứ tự 9 phần quy định:
 * 1. Banner chế độ khách + nút "Đăng nhập Google" (chỉ hiện khi chưa đăng nhập)
 * 2. Thẻ hồ sơ học sinh: tên, lớp, cấp độ (Level 1–6), danh hiệu, thanh tiến trình XP
 * 3. Thống kê nhanh: Chuỗi ngày, Thắng trận, Vạch lỗi, Tổng XP
 * 4. Chuỗi 7 ngày rèn luyện (T2 đến CN)
 * 5. Nhiệm vụ rèn luyện mỗi ngày
 * 6. Biểu đồ radar năng lực tư duy phản biện
 * 7. Lịch sử các trận đấu trường
 * 8. Bộ sưu tập huy hiệu
 * 9. Lộ trình các cấp bậc (từ Lv.1 Tập sự đến Lv.6 Đại sư)
 */

import React from 'react';
import { useGamification, LEVEL_TITLES, getTodayDateString } from '../context/GamificationContext';
import { CriticalThinkingRadarChart } from './CriticalThinkingRadarChart';
import { DebateHistorySection } from './DebateHistorySection';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Flame, 
  Crown, 
  Search, 
  Swords, 
  Target,
  LogIn,
  User,
  Zap,
  BookOpen
} from 'lucide-react';

interface StudentProgressViewProps {
  onNavigateToDebate?: () => void;
  onNavigateToFallacy?: () => void;
}

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({ 
  onNavigateToDebate,
  onNavigateToFallacy 
}) => {
  const { 
    currentUser,
    isGuest,
    profile, 
    badges, 
    quests, 
    debateHistory, 
    claimQuest, 
    openAuthModal
  } = useGamification();

  const studentName = profile?.name || 'Học sinh';
  const studentLevel = Math.max(1, Number(profile?.level || 1));
  const studentXP = Number(profile?.currentXP || 0);
  const studentTitle = profile?.title || LEVEL_TITLES[studentLevel]?.title || 'Tập sự phản biện';
  const studentSchool = profile?.school || 'THPT';

  // Tính phần trăm XP trong cấp hiện tại
  const xpCurrentLevelFloor = LEVEL_TITLES[studentLevel]?.minXP || 0;
  const xpCurrentLevelCeiling = LEVEL_TITLES[studentLevel]?.maxXP || 300;
  const nextLevelXP = Number(profile?.nextLevelXP || xpCurrentLevelCeiling);
  const levelProgressPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((studentXP - xpCurrentLevelFloor) /
          Math.max(1, xpCurrentLevelCeiling - xpCurrentLevelFloor)) *
          100
      )
    )
  );

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search':
        return <Search className="w-4 h-4 text-[#1E2433]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-[#15803D]" />;
      case 'Swords':
        return <Swords className="w-4 h-4 text-[#A16207]" />;
      case 'Crown':
        return <Crown className="w-4 h-4 text-[#B45309]" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-[#A16207] fill-[#A16207]" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-4 h-4 text-[#1E2433]" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 overflow-x-hidden">
      
      {/* 1. BANNER CHẾ ĐỘ KHÁCH + NÚT "ĐĂNG NHẬP GOOGLE" (Chỉ hiện khi chưa đăng nhập) */}
      {isGuest && (
        <div className="bg-white border border-[#E5E1D8] rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <LogIn className="w-4 h-4 text-[#6B7280] shrink-0" />
            <div>
              <span className="font-semibold text-[#1E2433]">
                Bạn đang xem ở chế độ khách.
              </span>
              <span className="text-[#4A5263] ml-1">
                Đăng nhập tài khoản Google để lưu trữ toàn bộ lịch sử tranh luận, huy hiệu và chuỗi ngày rèn luyện.
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

      {/* 2. THẺ HỒ SƠ HỌC SINH: tên, lớp, cấp độ (Level 1–6), danh hiệu, thanh tiến trình XP */}
      <div className="bg-white border border-[#E5E1D8] rounded-md p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded bg-[#F2EFE8] border border-[#E5E1D8] flex items-center justify-center font-serif font-bold text-xl text-[#1E2433] shrink-0">
              {studentName.charAt(0)}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif font-bold text-lg sm:text-xl text-[#1E2433] leading-tight">
                  {studentName}
                </h1>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  Level {studentLevel}
                </span>
                <span className="px-2 py-0.5 rounded text-xs bg-[#F2EFE8] text-[#4A5263] border border-[#E5E1D8]">
                  {studentSchool}
                </span>
              </div>
              <p className="text-xs font-medium text-[#A16207]">
                Danh hiệu: {studentTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAuthModal}
            className="px-3 py-1.5 rounded text-xs border border-[#D6D1C4] hover:bg-[#F2EFE8] text-[#1E2433] bg-white cursor-pointer transition-colors self-start sm:self-auto shrink-0 font-medium"
          >
            {currentUser ? 'Chỉnh sửa hồ sơ' : 'Đăng nhập Google'}
          </button>
        </div>

        {/* Thanh tiến trình XP */}
        <div className="pt-3 border-t border-[#E5E1D8] space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[#4A5263]">
              Tiến trình Cấp {studentLevel} ({studentTitle}):
            </span>
            <span className="font-semibold text-[#1E2433]">
              {studentXP} / {nextLevelXP} XP ({levelProgressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#F2EFE8] rounded border border-[#E5E1D8] overflow-hidden">
            <div 
              className="h-full bg-[#FACC15] transition-all duration-300" 
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-[#6B7280] text-right font-mono">
            Còn {Math.max(0, nextLevelXP - studentXP)} XP để thăng cấp tiếp theo
          </div>
        </div>
      </div>

      {/* 3. THỐNG KÊ NHANH: Chuỗi ngày, Thắng trận, Vạch lỗi, Tổng XP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-md border border-[#E5E1D8] bg-white shadow-xs">
          <span className="text-[#6B7280] block text-[11px]">Chuỗi ngày</span>
          <span className="text-lg font-mono font-bold text-[#1E2433] flex items-center gap-1.5 mt-0.5">
            <Flame className="w-4 h-4 text-[#A16207] fill-[#A16207]" />
            {profile?.streakCount || 1} ngày
          </span>
        </div>

        <div className="p-3.5 rounded-md border border-[#E5E1D8] bg-white shadow-xs">
          <span className="text-[#6B7280] block text-[11px]">Thắng trận đấu trường</span>
          <span className="text-lg font-mono font-bold text-[#1E2433] flex items-center gap-1.5 mt-0.5">
            <Swords className="w-4 h-4 text-[#A16207]" />
            {profile?.debatesWon || 0} trận
          </span>
        </div>

        <div className="p-3.5 rounded-md border border-[#E5E1D8] bg-white shadow-xs">
          <span className="text-[#6B7280] block text-[11px]">Vạch lỗi ngụy biện</span>
          <span className="text-lg font-mono font-bold text-[#1E2433] flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-[#15803D]" />
            {profile?.fallaciesIdentified || 0} lỗi
          </span>
        </div>

        <div className="p-3.5 rounded-md border border-[#E5E1D8] bg-white shadow-xs">
          <span className="text-[#6B7280] block text-[11px]">Tổng điểm kinh nghiệm</span>
          <span className="text-lg font-mono font-bold text-[#1E2433] flex items-center gap-1.5 mt-0.5">
            <Zap className="w-4 h-4 text-[#A16207] fill-[#FACC15]" />
            {studentXP.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* 4. CHUỖI 7 NGÀY RÈN LUYỆN (T2 đến CN) */}
      <div className="bg-white border border-[#E5E1D8] rounded-md p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-[#A16207] fill-[#A16207]" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg text-[#1E2433]">
                  Chuỗi {profile.streakCount || 1} ngày rèn luyện
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  Đang giữ chuỗi
                </span>
              </div>
              <p className="text-xs text-[#4A5263]">
                {profile.lastActiveDate === getTodayDateString() 
                  ? 'Bạn đã hoàn thành thử thách và duy trì chuỗi hôm nay. Hẹn gặp lại bạn vào ngày mai!'
                  : 'Hãy làm 1 bài vạch lá tìm sâu hoặc 1 trận đấu trường hôm nay để tiếp tục giữ chuỗi nhé!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => {
              const currentStreak = profile.streakCount || 1;
              const isActiveDay = idx < Math.min(7, currentStreak);

              return (
                <div 
                  key={day}
                  className={`flex flex-col items-center gap-1 p-2 rounded border text-xs min-w-[36px] ${
                    isActiveDay
                      ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
                      : 'bg-[#F2EFE8] border-[#E5E1D8] text-[#6B7280]'
                  }`}
                >
                  <span className="font-mono text-[10px] font-medium">{day}</span>
                  <Flame className={`w-3.5 h-3.5 ${isActiveDay ? 'fill-[#A16207] text-[#A16207]' : 'text-[#6B7280]'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. NHIỆM VỤ RÈN LUYỆN MỖI NGÀY */}
      <div className="bg-white border border-[#E5E1D8] rounded-md p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D8]">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#6B7280]" />
            <h3 className="font-serif font-bold text-sm text-[#1E2433]">
              Nhiệm vụ rèn luyện mỗi ngày
            </h3>
          </div>
          <span className="text-[11px] text-[#6B7280] font-mono">Làm mới 00:00</span>
        </div>

        <div className="space-y-2.5">
          {quests.map(quest => (
            <div
              key={quest.id}
              className="p-3 rounded border border-[#E5E1D8] bg-[#F2EFE8] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1E2433]">
                    {quest.title}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#A16207]">
                    +{quest.rewardXP} XP
                  </span>
                </div>
                <p className="text-[#4A5263] leading-relaxed">
                  {quest.description}
                </p>

                <div className="flex items-center gap-2 pt-0.5">
                  <div className="w-24 h-1.5 bg-white border border-[#E5E1D8] rounded overflow-hidden">
                    <div 
                      className="h-full bg-[#FACC15]"
                      style={{ width: `${Math.min(100, (quest.currentCount / quest.targetCount) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[#6B7280] font-mono">
                    {quest.currentCount}/{quest.targetCount}
                  </span>
                </div>
              </div>

              <div>
                {quest.isClaimed ? (
                  <span className="text-xs text-[#15803D] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" /> Đã nhận
                  </span>
                ) : quest.isCompleted ? (
                  <button
                    type="button"
                    onClick={() => claimQuest(quest.id)}
                    className="px-3 py-1 rounded font-bold text-xs bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    Nhận thưởng
                  </button>
                ) : (
                  <span className="text-[11px] text-[#6B7280]">
                    Đang làm
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. BIỂU ĐỒ RADAR NĂNG LỰC TƯ DUY PHẢN BIỆN */}
      <CriticalThinkingRadarChart 
        profile={profile} 
        onNavigateToModule={(mod) => {
          if (mod === 'debate_arena' && onNavigateToDebate) onNavigateToDebate();
          if (mod === 'fallacy_challenge' && onNavigateToFallacy) onNavigateToFallacy();
        }} 
      />

      {/* 7. LỊCH SỬ CÁC TRẬN ĐẤU TRƯỜNG */}
      <DebateHistorySection 
        history={debateHistory} 
        onNavigateToDebate={onNavigateToDebate} 
      />

      {/* 8. BỘ SƯU TẬP HUY HIỆU */}
      <div className="bg-white border border-[#E5E1D8] rounded-md p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D8]">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#6B7280]" />
            <h3 className="font-serif font-bold text-sm text-[#1E2433]">
              Bộ sưu tập huy hiệu
            </h3>
          </div>
          <span className="text-xs text-[#6B7280] font-mono">
            {badges.filter(b => b.isUnlocked).length} / {badges.length} đã mở
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`p-3 rounded border text-xs space-y-1.5 transition-colors ${
                badge.isUnlocked
                  ? 'bg-white border-[#E5E1D8] shadow-2xs'
                  : 'bg-[#F2EFE8] border-[#E5E1D8] opacity-65'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded bg-[#F2EFE8] border border-[#E5E1D8] flex items-center justify-center">
                  {renderBadgeIcon(badge.iconName)}
                </div>
                {badge.isUnlocked ? (
                  <span className="text-[10px] font-mono font-medium text-[#15803D]">✓ Đã đạt</span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#6B7280]" />
                )}
              </div>

              <div>
                <h4 className="font-semibold text-[#1E2433]">
                  {badge.title}
                </h4>
                <p className="text-[#4A5263] text-[11px] leading-relaxed mt-0.5">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. LỘ TRÌNH CÁC CẤP BẬC (Từ Lv.1 Tập sự đến Lv.6 Đại sư) */}
      <div className="bg-white border border-[#E5E1D8] rounded-md p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-1.5 pb-2 border-b border-[#E5E1D8]">
          <BookOpen className="w-4 h-4 text-[#6B7280]" />
          <h3 className="font-serif font-bold text-sm text-[#1E2433]">
            Lộ trình các cấp bậc phản biện
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {[1, 2, 3, 4, 5, 6].map(lvl => {
            const isReached = profile.level >= lvl;
            const isCurrent = profile.level === lvl;
            const lvlInfo = LEVEL_TITLES[lvl];

            return (
              <div 
                key={lvl}
                className={`p-3 rounded border flex flex-col justify-between gap-2 text-xs transition-colors ${
                  isCurrent
                    ? 'bg-[#FEF3C7] border-[#FACC15] ring-1 ring-[#FACC15]'
                    : isReached
                    ? 'bg-white border-[#E5E1D8]'
                    : 'bg-[#F2EFE8] border-[#E5E1D8] opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-white/70 border border-[#E5E1D8] text-[#1E2433]">
                    Cấp {lvl}
                  </span>
                  {isCurrent ? (
                    <span className="text-[10px] font-bold text-[#92400E] bg-[#FDE68A] px-2 py-0.5 rounded">
                      Hiện tại
                    </span>
                  ) : isReached ? (
                    <span className="text-[10px] text-[#15803D] font-medium">
                      ✓ Đã mở
                    </span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#6B7280]" />
                  )}
                </div>

                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1E2433]">
                    {lvlInfo?.title}
                  </h4>
                  <p className="text-[#6B7280] text-[11px] font-mono mt-0.5">
                    {lvlInfo?.minXP} - {lvlInfo?.maxXP} XP
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

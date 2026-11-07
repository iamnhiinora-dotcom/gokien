/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODULE 3: BẢNG TIẾN ĐỘ & BẢNG VINH QUANG
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Nền ngà (#F8F6F1), Card trắng (#FFFFFF) viền #E5E1D8, Nền phụ #F2EFE8
 * - Chữ đen tuyền #1E2433, chữ phụ #4A5263, chú thích #6B7280
 * - Nút nhấn #FACC15 chữ #1E2433, vàng đậm #A16207, badge vàng #FEF3C7 chữ #92400E
 * - Dữ liệu thật 100% từ Firestore Database, hỗ trợ lọc theo lớp.
 */

import React from 'react';
import { useGamification, LEVEL_TITLES, getTodayDateString } from '../context/GamificationContext';
import { CriticalThinkingRadarChart } from './CriticalThinkingRadarChart';
import { DebateHistorySection } from './DebateHistorySection';
import { 
  Trophy, 
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
  Filter,
  RefreshCw,
  User,
  Users
} from 'lucide-react';

interface GamificationHubViewProps {
  onNavigateToModule?: (moduleKey: 'fallacy_challenge' | 'debate_arena' | 'gamification_hub') => void;
}

export const GamificationHubView: React.FC<GamificationHubViewProps> = ({ onNavigateToModule }) => {
  const { 
    currentUser,
    isGuest,
    profile, 
    badges, 
    quests, 
    leaderboard, 
    isLeaderboardLoading,
    selectedClassFilter,
    setSelectedClassFilter,
    refreshLeaderboard,
    debateHistory, 
    claimQuest, 
    openAuthModal
  } = useGamification();

  // Tính phần trăm XP
  const xpCurrentLevelFloor = LEVEL_TITLES[profile.level]?.minXP || 0;
  const xpCurrentLevelCeiling = LEVEL_TITLES[profile.level]?.maxXP || 300;
  const nextLevelXP = LEVEL_TITLES[profile.level]?.maxXP ?? 99999;
  const levelProgressPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((profile.currentXP - xpCurrentLevelFloor) /
          (xpCurrentLevelCeiling - xpCurrentLevelFloor)) *
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
      {/* BANNER DÀNH CHO KHÁCH */}
      {isGuest && (
        <div className="bg-white border border-[#E5E1D8] rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <LogIn className="w-4 h-4 text-[#6B7280] shrink-0" />
            <div>
              <span className="font-semibold text-[#1E2433]">
                Bạn đang xem ở chế độ khách.
              </span>
              <span className="text-[#4A5263] ml-1">
                Đăng nhập tài khoản Google để lưu trữ toàn bộ lịch sử tranh luận và điểm kiểm tra.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={openAuthModal}
            className="px-3.5 py-1.5 rounded font-bold bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] shrink-0 cursor-pointer transition-colors shadow-2xs"
          >
            Đăng nhập Google
          </button>
        </div>
      )}

      {/* Header Module */}
      <div className="p-5 sm:p-6 rounded-md bg-white border border-[#E5E1D8] text-[#1E2433] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1E2433] leading-snug">
            Tiến độ & Bảng xếp hạng
          </h1>
          <p className="text-[#4A5263] text-xs sm:text-sm mt-1 leading-relaxed">
            Theo dõi thành tích cá nhân, bộ sưu tập huy hiệu và chuỗi ngày rèn luyện.
          </p>
        </div>

        {/* Thống kê nhanh */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded border border-[#E5E1D8] bg-[#F2EFE8] text-center text-[#1E2433]">
            <span className="text-[#6B7280] block text-[11px]">Chuỗi ngày</span>
            <span className="font-mono font-semibold text-[#1E2433] flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#A16207] fill-[#A16207]" />
              {profile.streakCount || 1}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded border border-[#E5E1D8] bg-[#F2EFE8] text-center text-[#1E2433]">
            <span className="text-[#6B7280] block text-[11px]">Thắng trận</span>
            <span className="font-mono font-semibold text-[#1E2433]">{profile.debatesWon}</span>
          </div>
          <div className="px-3 py-1.5 rounded border border-[#E5E1D8] bg-[#F2EFE8] text-center text-[#1E2433]">
            <span className="text-[#6B7280] block text-[11px]">Vạch lỗi</span>
            <span className="font-mono font-semibold text-[#1E2433]">{profile.fallaciesIdentified}</span>
          </div>
        </div>
      </div>

      {/* CHUỖI NGÀY RÈN LUYỆN (STREAK WIDGET) */}
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
                  className={`flex flex-col items-center gap-1 p-1.5 rounded border text-xs ${
                    isActiveDay
                      ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
                      : 'bg-[#F2EFE8] border-[#E5E1D8] text-[#6B7280]'
                  }`}
                >
                  <span className="font-mono text-[10px]">{day}</span>
                  <Flame className={`w-3.5 h-3.5 ${isActiveDay ? 'fill-[#A16207] text-[#A16207]' : 'text-[#6B7280]'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid 2 Cột: Hồ Sơ Cấp Độ & Nhiệm Vụ Ngày */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Thẻ Hồ Sơ Học Sinh & Level */}
        <div className="lg:col-span-5 bg-white border border-[#E5E1D8] rounded-md p-5 space-y-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#F2EFE8] border border-[#E5E1D8] flex items-center justify-center font-serif font-bold text-lg text-[#1E2433] shrink-0">
                {profile.name.charAt(0)}
              </div>

              <div>
                <h2 className="font-serif font-bold text-base text-[#1E2433] leading-tight">
                  {profile.name}
                </h2>
                <div className="text-xs text-[#4A5263] mt-0.5">
                  Lớp: {profile.school || 'THPT'} · Level {profile.level}
                </div>
                <div className="text-xs font-medium text-[#1E2433] mt-1">
                  {profile.title}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openAuthModal}
              className="px-2.5 py-1 rounded text-xs border border-[#D6D1C4] hover:bg-[#F2EFE8] text-[#1E2433] bg-white cursor-pointer transition-colors"
            >
              {currentUser ? 'Hồ sơ' : 'Đăng nhập'}
            </button>
          </div>

          {/* Thanh Tiến Trình Cấp Độ */}
          <div className="space-y-1.5 pt-2 border-t border-[#E5E1D8] text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[#4A5263]">Tiến trình Level {profile.level}:</span>
              <span className="font-semibold text-[#1E2433]">
                {profile.currentXP} / {nextLevelXP} XP
              </span>
            </div>
            <div className="w-full h-2 bg-[#F2EFE8] rounded border border-[#E5E1D8] overflow-hidden">
              <div 
                className="h-full bg-[#FACC15] transition-all duration-300" 
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-[#6B7280] text-right font-mono">
              Còn {Math.max(0, nextLevelXP - profile.currentXP)} XP để lên cấp
            </div>
          </div>

          {/* Lộ trình các cấp bậc */}
          <div className="pt-2 border-t border-[#E5E1D8] space-y-1.5">
            <span className="text-xs font-semibold text-[#1E2433] block">
              Danh hiệu phản biện:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[1, 2, 3, 4, 5, 6].map(lvl => (
                <div 
                  key={lvl}
                  className={`p-1.5 rounded border flex items-center justify-between text-[11px] ${
                    profile.level >= lvl
                      ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E] font-medium'
                      : 'bg-[#F2EFE8] border-[#E5E1D8] text-[#6B7280]'
                  }`}
                >
                  <span className="truncate">{LEVEL_TITLES[lvl]?.title}</span>
                  <span className="font-mono text-[#6B7280]">Lv.{lvl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Thẻ Nhiệm Vụ Hàng Ngày */}
        <div className="lg:col-span-7 bg-white border border-[#E5E1D8] rounded-md p-5 space-y-3 shadow-xs">
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
                      className="px-3 py-1 rounded font-bold text-xs bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] cursor-pointer shadow-2xs"
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
      </div>

      {/* BIỂU ĐỒ RADAR NĂNG LỰC TƯ DUY PHẢN BIỆN */}
      <CriticalThinkingRadarChart 
        profile={profile} 
        onNavigateToModule={onNavigateToModule} 
      />

      {/* LỊCH SỬ CÁC TRẬN ĐẤU */}
      <DebateHistorySection 
        history={debateHistory} 
        onNavigateToDebate={onNavigateToModule ? () => onNavigateToModule('debate_arena') : undefined} 
      />

      {/* BỘ SƯU TẬP HUY HIỆU */}
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

      {/* BẢNG XẾP HẠNG THẬT TỪ FIRESTORE */}
      <div className="bg-white border border-[#E5E1D8] rounded-md p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E1D8]">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-[#6B7280]" />
            <h3 className="font-serif font-bold text-sm text-[#1E2433]">
              Bảng xếp hạng học sinh
            </h3>
          </div>

          {/* Bộ lọc theo lớp */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-2.5 py-1 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-xs text-[#1E2433] focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả các lớp</option>
              <option value="10 Tin">Lớp 10 Tin</option>
              <option value="10A1">Lớp 10A1</option>
              <option value="11A1">Lớp 11A1</option>
              <option value="11 Chuyên Anh">Lớp 11 Chuyên Anh</option>
              <option value="12 Tin">Lớp 12 Tin</option>
              <option value="12 Hóa">Lớp 12 Hóa</option>
            </select>

            <button
              type="button"
              onClick={refreshLeaderboard}
              disabled={isLeaderboardLoading}
              title="Làm mới"
              className="p-1 rounded text-[#4A5263] hover:text-[#1E2433] cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLeaderboardLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Trạng thái trống */}
        {leaderboard.length === 0 ? (
          <div className="py-8 px-4 text-center space-y-2 text-xs">
            <Users className="w-6 h-6 mx-auto text-[#6B7280]" />
            <p className="text-[#4A5263]">
              Chưa có học sinh nào trên bảng xếp hạng {selectedClassFilter !== 'all' ? `lớp ${selectedClassFilter}` : ''}.
            </p>
          </div>
        ) : (
          /* Danh sách Leaderboard thật từ Firestore */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E1D8] text-[#6B7280] font-mono">
                  <th className="py-2 px-2.5">Hạng</th>
                  <th className="py-2 px-2.5">Học sinh</th>
                  <th className="py-2 px-2.5">Lớp</th>
                  <th className="py-2 px-2.5">Danh hiệu</th>
                  <th className="py-2 px-2.5 text-right">Thắng</th>
                  <th className="py-2 px-2.5 text-right">Điểm XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D8]">
                {leaderboard.map((user, idx) => {
                  const rank = idx + 1;
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
                      <td className="py-2.5 px-2.5 font-mono">
                        {rank <= 3 ? (
                          <span className="font-bold text-[#B45309]">#{rank}</span>
                        ) : (
                          <span className="text-[#6B7280]">#{rank}</span>
                        )}
                      </td>

                      <td className="py-2.5 px-2.5 text-[#1E2433]">
                        <span className={isCurrent ? 'font-bold' : ''}>
                          {user.name} {isCurrent && '(Bạn)'}
                        </span>
                      </td>

                      <td className="py-2.5 px-2.5 text-[#4A5263]">
                        {user.schoolClass}
                      </td>

                      <td className="py-2.5 px-2.5 text-[#4A5263]">
                        {user.title}
                      </td>

                      <td className="py-2.5 px-2.5 text-right font-mono text-[#4A5263]">
                        {user.debatesWon}
                      </td>

                      <td className="py-2.5 px-2.5 text-right font-mono font-semibold text-[#1E2433]">
                        {user.xp.toLocaleString()} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

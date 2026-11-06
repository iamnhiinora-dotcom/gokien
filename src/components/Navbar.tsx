/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * THANH ĐIỀU HƯỚNG CHÍNH (NAVIGATION BAR)
 * Phong cách "Giấy và Bút dạ quang" - Tối giản, không viền dày, không hiệu ứng AI-slop.
 * Logo: Chim gõ kiến "Gõ" (tìm sâu trong thân cây = tìm lỗi trong lập luận).
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  ShieldAlert, 
  Swords, 
  Trophy, 
  Flame, 
  HelpCircle, 
  BookOpen, 
  MoreVertical,
  LogIn, 
  LogOut, 
  User,
  Sun,
  Moon,
  FileCheck2,
  BarChart3,
  Dices,
  Compass
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { soundFX } from '../services/soundEffects';
import { WoodpeckerLogo } from './WoodpeckerLogo';

export type ActiveModule = 
  | 'landing_guide'
  | 'fallacy_challenge' 
  | 'debate_arena' 
  | 'multiplayer_games'
  | 'progress_hub'
  | 'leaderboard_hub'
  // Backward compatibility aliases:
  | 'wsdc_tournament'
  | 'gamification_hub';

interface NavbarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onSelectModule,
  onOpenSettings
}) => {
  const { 
    currentUser,
    isGuest,
    profile, 
    toggleSound, 
    openAuthModal, 
    openIntroModal, 
    openHandbook,
    openDiagnosticTest,
    logout,
    theme,
    toggleTheme
  } = useGamification();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (mod: ActiveModule) => {
    soundFX.playClick();
    onSelectModule(mod);
  };

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* TOP HEADER - Giấy phẳng, viền mảnh */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFFFF] border-b border-[#E5E1D8] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* 1. Logo Chim Gõ Kiến & Tên "Gõ" */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('landing_guide');
              }}
              className="flex items-center gap-2 group text-decoration-none"
            >
              <div className="w-8 h-8 rounded flex items-center justify-center shrink-0">
                <WoodpeckerLogo size={28} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-serif font-bold tracking-tight text-[#1E2433]">
                  Gõ Kiến
                </span>
                <span className="text-xs text-[#6B7280] font-normal">
                  · Luyện phản biện
                </span>
              </div>
            </a>
          </div>

          {/* 2. Các Mục Chính: Phẳng, dùng màu vàng dạ quang cho mục đang chọn */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => handleTabClick('landing_guide')}
              className={`whitespace-nowrap px-2.5 lg:px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeModule === 'landing_guide'
                  ? 'bg-[#FACC15] text-[#1E2433] font-semibold hover:bg-[#EAB308]'
                  : 'text-[#4A5263] hover:text-[#1E2433] hover:bg-[#F2EFE8]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Giới thiệu</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('fallacy_challenge')}
              className={`whitespace-nowrap px-2.5 lg:px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeModule === 'fallacy_challenge'
                  ? 'bg-[#FACC15] text-[#1E2433] font-semibold hover:bg-[#EAB308]'
                  : 'text-[#4A5263] hover:text-[#1E2433] hover:bg-[#F2EFE8]'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Vạch lá tìm sâu</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('debate_arena')}
              className={`whitespace-nowrap px-2.5 lg:px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeModule === 'debate_arena' || activeModule === 'wsdc_tournament'
                  ? 'bg-[#FACC15] text-[#1E2433] font-semibold hover:bg-[#EAB308]'
                  : 'text-[#4A5263] hover:text-[#1E2433] hover:bg-[#F2EFE8]'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Đấu trường</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('multiplayer_games')}
              className={`whitespace-nowrap px-2.5 lg:px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeModule === 'multiplayer_games'
                  ? 'bg-[#FACC15] text-[#1E2433] font-semibold hover:bg-[#EAB308]'
                  : 'text-[#4A5263] hover:text-[#1E2433] hover:bg-[#F2EFE8]'
              }`}
            >
              <Dices className="w-4 h-4 text-[#A16207]" />
              <span>Chơi cùng bạn</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('progress_hub')}
              className={`whitespace-nowrap px-2.5 lg:px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeModule === 'progress_hub' || activeModule === 'gamification_hub'
                  ? 'bg-[#FACC15] text-[#1E2433] font-semibold hover:bg-[#EAB308]'
                  : 'text-[#4A5263] hover:text-[#1E2433] hover:bg-[#F2EFE8]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tiến độ</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('leaderboard_hub')}
              className={`whitespace-nowrap px-2.5 lg:px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeModule === 'leaderboard_hub'
                  ? 'bg-[#FACC15] text-[#1E2433] font-semibold hover:bg-[#EAB308]'
                  : 'text-[#4A5263] hover:text-[#1E2433] hover:bg-[#F2EFE8]'
              }`}
            >
              <Trophy className="w-4 h-4 text-[#A16207]" />
              <span>Bảng xếp hạng</span>
            </button>
          </nav>

          {/* 3. Tiện ích: Chuỗi ngày, Menu tài khoản */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Streak rèn luyện (mộc mạc) */}
            <div
              onClick={() => handleTabClick('progress_hub')}
              className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#E5E1D8] bg-[#FFFFFF] text-xs font-medium text-[#1E2433] hover:border-[#FACC15] cursor-pointer transition-colors"
              title={`Chuỗi rèn luyện: ${profile.streakCount || 1} ngày`}
            >
              <Flame className="w-3.5 h-3.5 text-[#D97706] fill-[#FACC15]" />
              <span className="font-mono font-bold">{profile.streakCount || 1}</span>
              <span className="text-[11px] text-[#6B7280] hidden sm:inline">ngày</span>
            </div>

            {/* Menu Tài khoản */}
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#E5E1D8] bg-[#FFFFFF] hover:bg-[#F2EFE8] text-[#1E2433] text-xs transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded bg-[#F2EFE8] flex items-center justify-center font-bold text-[11px] text-[#1E2433] shrink-0 border border-[#E5E1D8]">
                  {(profile?.name || 'H').charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate text-xs font-medium">
                  {isGuest ? 'Khách' : (profile?.name || 'Học sinh')}
                </span>
                <MoreVertical className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>

              {/* Dropdown Menu phẳng, giấy mộc */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-[#FFFFFF] border border-[#E5E1D8] shadow-md rounded-md py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-[#E5E1D8]">
                    <p className="font-medium text-[#1E2433] truncate">{profile?.name || 'Học sinh'}</p>
                    <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                      {currentUser?.email || 'Chế độ khách (chưa lưu)'}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        openAuthModal();
                      }}
                      className="w-full px-3 py-1.5 text-[#1E2433] hover:bg-[#F2EFE8] flex items-center gap-2 cursor-pointer text-left"
                    >
                      {currentUser ? <User className="w-4 h-4 text-[#6B7280]" /> : <LogIn className="w-4 h-4 text-[#6B7280]" />}
                      <span>{currentUser ? 'Hồ sơ học sinh' : 'Đăng nhập Google'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        openDiagnosticTest();
                      }}
                      className="w-full px-3 py-1.5 text-[#1E2433] hover:bg-[#F2EFE8] flex items-center gap-2 cursor-pointer text-left"
                    >
                      <FileCheck2 className="w-4 h-4 text-[#6B7280]" />
                      <span>Bài kiểm tra 20 câu (Bộ A/B)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        openHandbook();
                      }}
                      className="w-full px-3 py-1.5 text-[#1E2433] hover:bg-[#F2EFE8] flex items-center gap-2 cursor-pointer text-left"
                    >
                      <BookOpen className="w-4 h-4 text-[#6B7280]" />
                      <span>Sổ tay phản biện & Thiên kiến</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        openIntroModal();
                      }}
                      className="w-full px-3 py-1.5 text-[#1E2433] hover:bg-[#F2EFE8] flex items-center gap-2 cursor-pointer text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-[#6B7280]" />
                      <span>Cách học hiệu quả</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleSound}
                      className="w-full px-3 py-1.5 text-[#1E2433] hover:bg-[#F2EFE8] flex items-center justify-between cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-2">
                        {profile.soundEnabled ? <Volume2 className="w-4 h-4 text-[#6B7280]" /> : <VolumeX className="w-4 h-4 text-[#6B7280]" />}
                        <span>Âm thanh</span>
                      </span>
                      <span className="text-[11px] text-[#6B7280] font-mono">
                        {profile.soundEnabled ? 'Bật' : 'Tắt'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full px-3 py-1.5 text-[#1E2433] hover:bg-[#F2EFE8] flex items-center gap-2 cursor-pointer text-left"
                    >
                      <Settings className="w-4 h-4 text-[#6B7280]" />
                      <span>Cài đặt hệ thống</span>
                    </button>
                  </div>

                  {currentUser && (
                    <div className="pt-1 border-t border-[#E5E1D8]">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsAccountMenuOpen(false);
                          await logout();
                        }}
                        className="w-full px-3 py-1.5 text-[#DC2626] hover:bg-[#FEE2E2] flex items-center gap-2 cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BOTTOM NAVIGATION CHO ĐIỆN THOẠI (< 768px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] border-t border-[#E5E1D8] h-14 flex items-center justify-around px-1 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          onClick={() => handleTabClick('landing_guide')}
          className={`flex-1 min-w-[48px] flex flex-col items-center justify-center py-1 rounded transition-colors whitespace-nowrap ${
            activeModule === 'landing_guide'
              ? 'text-[#1E2433] font-bold'
              : 'text-[#6B7280] hover:text-[#1E2433]'
          }`}
        >
          <div className={`p-1 rounded ${activeModule === 'landing_guide' ? 'bg-[#FACC15]' : ''}`}>
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-[9px] mt-0.5">Giới thiệu</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('fallacy_challenge')}
          className={`flex-1 min-w-[48px] flex flex-col items-center justify-center py-1 rounded transition-colors whitespace-nowrap ${
            activeModule === 'fallacy_challenge'
              ? 'text-[#1E2433] font-bold'
              : 'text-[#6B7280] hover:text-[#1E2433]'
          }`}
        >
          <div className={`p-1 rounded ${activeModule === 'fallacy_challenge' ? 'bg-[#FACC15]' : ''}`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="text-[9px] mt-0.5">Vạch lỗi</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('debate_arena')}
          className={`flex-1 min-w-[48px] flex flex-col items-center justify-center py-1 rounded transition-colors whitespace-nowrap ${
            activeModule === 'debate_arena' || activeModule === 'wsdc_tournament'
              ? 'text-[#1E2433] font-bold'
              : 'text-[#6B7280] hover:text-[#1E2433]'
          }`}
        >
          <div className={`p-1 rounded ${activeModule === 'debate_arena' || activeModule === 'wsdc_tournament' ? 'bg-[#FACC15]' : ''}`}>
            <Swords className="w-4 h-4" />
          </div>
          <span className="text-[9px] mt-0.5">Đấu trường</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('multiplayer_games')}
          className={`flex-1 min-w-[48px] flex flex-col items-center justify-center py-1 rounded transition-colors whitespace-nowrap ${
            activeModule === 'multiplayer_games'
              ? 'text-[#1E2433] font-bold'
              : 'text-[#6B7280] hover:text-[#1E2433]'
          }`}
        >
          <div className={`p-1 rounded ${activeModule === 'multiplayer_games' ? 'bg-[#FACC15]' : ''}`}>
            <Dices className="w-4 h-4" />
          </div>
          <span className="text-[9px] mt-0.5">Cùng bạn</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('progress_hub')}
          className={`flex-1 min-w-[48px] flex flex-col items-center justify-center py-1 rounded transition-colors whitespace-nowrap ${
            activeModule === 'progress_hub' || activeModule === 'gamification_hub'
              ? 'text-[#1E2433] font-bold'
              : 'text-[#6B7280] hover:text-[#1E2433]'
          }`}
        >
          <div className={`p-1 rounded ${activeModule === 'progress_hub' || activeModule === 'gamification_hub' ? 'bg-[#FACC15]' : ''}`}>
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="text-[9px] mt-0.5">Tiến độ</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('leaderboard_hub')}
          className={`flex-1 min-w-[48px] flex flex-col items-center justify-center py-1 rounded transition-colors whitespace-nowrap ${
            activeModule === 'leaderboard_hub'
              ? 'text-[#1E2433] font-bold'
              : 'text-[#6B7280] hover:text-[#1E2433]'
          }`}
        >
          <div className={`p-1 rounded ${activeModule === 'leaderboard_hub' ? 'bg-[#FACC15]' : ''}`}>
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-[9px] mt-0.5">BXH</span>
        </button>
      </nav>
    </>
  );
};

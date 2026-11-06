/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TRÍ TUỆ PHẢN BIỆN - NỀN TẢNG RÈN LUYỆN TƯ DUY & TRANH BIỆN WSDC CHO HỌC SINH THPT
 * Ứng dụng Single-Page Web cao cấp theo mô hình Gamification với Dual AI Engine
 */

import React, { useState, Suspense, lazy } from 'react';
import { GamificationProvider, useGamification } from './context/GamificationContext';
import { Navbar, ActiveModule } from './components/Navbar';
import { IntroSplashAnimation } from './components/IntroSplashAnimation';
import { LandingGuideView } from './components/LandingGuideView';
import { XpNotification } from './components/XpNotification';

// Lazy-load heavy views to drastically reduce initial JS bundle size and LCP/TTI
const FallacyChallengeView = lazy(() => import('./components/FallacyChallengeView').then(m => ({ default: m.FallacyChallengeView })));
const DebateArenaView = lazy(() => import('./components/DebateArenaView').then(m => ({ default: m.DebateArenaView })));
const MultiplayerPvPArenaView = lazy(() => import('./components/MultiplayerPvPArenaView').then(m => ({ default: m.MultiplayerPvPArenaView })));
const StudentProgressView = lazy(() => import('./components/StudentProgressView').then(m => ({ default: m.StudentProgressView })));
const LeaderboardView = lazy(() => import('./components/LeaderboardView').then(m => ({ default: m.LeaderboardView })));
const ReadOnlyProgressReportView = lazy(() => import('./components/ReadOnlyProgressReportView').then(m => ({ default: m.ReadOnlyProgressReportView })));

// Lazy-load modals so they only load when user opens them
const SettingsModal = lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));
const BadgeModal = lazy(() => import('./components/BadgeModal').then(m => ({ default: m.BadgeModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const PlatformIntroModal = lazy(() => import('./components/PlatformIntroModal').then(m => ({ default: m.PlatformIntroModal })));
const DebateTrainingHandbookModal = lazy(() => import('./components/DebateTrainingHandbookModal').then(m => ({ default: m.DebateTrainingHandbookModal })));
const DiagnosticTestModal = lazy(() => import('./components/DiagnosticTestModal').then(m => ({ default: m.DiagnosticTestModal })));

const ModuleLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 px-4">
    <div className="w-10 h-10 border-4 border-[#E5E1D8] border-t-[#D97706] rounded-full animate-spin mb-4" />
    <p className="text-sm font-medium text-[#4A5263]">Đang tải dữ liệu...</p>
  </div>
);

const AppContent: React.FC = () => {
  // Trạng thái mở đầu và trang hướng dẫn
  const [showIntroAnimation, setShowIntroAnimation] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('go_seen_intro');
    }
    return true;
  });

  const [activeModule, setActiveModule] = useState<ActiveModule>('landing_guide');
  const [arenaSubmode, setArenaSubmode] = useState<'1v1' | 'wsdc'>('1v1');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProgressReportView, setIsProgressReportView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'progress_report';
    }
    return false;
  });

  const handleSelectModule = (mod: ActiveModule, submode?: '1v1' | 'wsdc') => {
    if (submode) {
      setArenaSubmode(submode);
    }
    if (mod === 'wsdc_tournament') {
      setArenaSubmode('wsdc');
      setActiveModule('debate_arena');
      return;
    }
    if (mod === 'gamification_hub') {
      setActiveModule('progress_hub');
      return;
    }
    setActiveModule(mod);
  };

  const { 
    newUnlockedBadge, 
    dismissBadgeNotification, 
    profile, 
    isAuthModalOpen, 
    closeAuthModal,
    isIntroModalOpen,
    closeIntroModal,
    isHandbookOpen,
    closeHandbook,
    isDiagnosticModalOpen,
    activeDiagnosticSet,
    closeDiagnosticTest,
    recordDiagnosticTestResult,
    debateHistory
  } = useGamification();

  const handleBackToApp = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('student');
      url.searchParams.delete('class');
      url.searchParams.delete('n');
      window.history.replaceState({}, '', url.pathname);
    }
    setIsProgressReportView(false);
  };

  const handleCompleteIntro = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('go_seen_intro', '1');
      } catch {
        // Ignored
      }
    }
    setShowIntroAnimation(false);
    setActiveModule('landing_guide');
  }, []);

  if (isProgressReportView) {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <ReadOnlyProgressReportView
          profile={profile}
          debateHistory={debateHistory}
          onBackToApp={handleBackToApp}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#1E2433] flex flex-col selection:bg-[#FDE68A] selection:text-[#1E2433]">
      {/* Hiệu Ứng Mở Đầu Mượt Mà (Intro Animation) */}
      {showIntroAnimation && (
        <IntroSplashAnimation onComplete={handleCompleteIntro} />
      )}

      {/* Thanh Điều Hướng Trên Cùng */}
      <Navbar
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Nội Dung Module Chính */}
      <main className="flex-1 w-full pb-20 md:pb-10 overflow-x-hidden">
        <Suspense fallback={<ModuleLoadingFallback />}>
          {/* 1. Trang Riêng Biệt: Giới Thiệu Chung & Hướng Dẫn Sử Dụng */}
          {activeModule === 'landing_guide' && (
            <LandingGuideView 
              onSelectModule={handleSelectModule} 
              onReplayIntro={() => setShowIntroAnimation(true)} 
            />
          )}

          {/* 2. Vạch Lá Tìm Sâu */}
          {activeModule === 'fallacy_challenge' && <FallacyChallengeView />}

          {/* 3. Đấu Trường Phản Biện (Gộp 1v1 và WSDC 3v3) */}
          {(activeModule === 'debate_arena' || activeModule === 'wsdc_tournament') && (
            <DebateArenaView initialSubmode={arenaSubmode} />
          )}

          {/* 4. Chơi Game Đối Kháng Nhiều Người (Cờ Cá Ngựa & Đấu 2 Người) */}
          {activeModule === 'multiplayer_games' && <MultiplayerPvPArenaView />}

          {/* 5. Tiến Độ Cá Nhân */}
          {(activeModule === 'progress_hub' || activeModule === 'gamification_hub') && (
            <StudentProgressView 
              onNavigateToDebate={() => handleSelectModule('debate_arena', '1v1')} 
              onNavigateToFallacy={() => handleSelectModule('fallacy_challenge')} 
            />
          )}

          {/* 6. Bảng Xếp Hạng Thi Đua Học Sinh */}
          {activeModule === 'leaderboard_hub' && (
            <LeaderboardView />
          )}
        </Suspense>
      </main>

      {/* Chân trang mộc mạc, gần gũi */}
      <footer className="w-full border-t border-[#E5E1D8] bg-[#FFFFFF] py-5 px-4 text-xs text-[#4A5263]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#1E2433]">Gõ</span>
            <span>·</span>
            <span>Không gian nhặt hạt sạn trong lập luận và rèn luyện tranh luận cho học sinh</span>
          </div>

          <div className="flex items-center gap-2 text-[#6B7280] text-xs">
            <span>Dành cho học sinh THPT</span>
            <span>·</span>
            <span>Chế độ: {profile.aiEngineMode === 'gemini_cloud' ? 'AI Phản biện' : 'Luyện tập'}</span>
          </div>
        </div>
      </footer>

      {/* Lazy-loaded Modals with Suspense fallback null */}
      <Suspense fallback={null}>
        {/* Modal Cài Đặt */}
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}

        {/* Modal Vinh Danh Huy Hiệu */}
        {newUnlockedBadge && (
          <BadgeModal
            badge={newUnlockedBadge}
            onClose={dismissBadgeNotification}
          />
        )}

        {/* Modal Đăng Nhập / Đăng Ký & Chuyển Đổi Tài Khoản Học Sinh */}
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={closeAuthModal}
          />
        )}

        {/* Modal Mở Đầu & Hướng Dẫn Nền Tảng Cho Học Sinh */}
        {isIntroModalOpen && (
          <PlatformIntroModal
            isOpen={isIntroModalOpen}
            onClose={closeIntroModal}
            onSelectModule={handleSelectModule}
          />
        )}

        {/* Sổ Tay Huấn Luyện Tranh Biện PEEL & 4 Bước */}
        {isHandbookOpen && (
          <DebateTrainingHandbookModal
            isOpen={isHandbookOpen}
            onClose={closeHandbook}
            onSelectTopicToDebate={() => handleSelectModule('debate_arena', '1v1')}
          />
        )}

        {/* Modal Bài Kiểm Tra Chẩn Đoán Năng Lực 20 Câu (Bộ A & Bộ B) */}
        {isDiagnosticModalOpen && (
          <DiagnosticTestModal
            isOpen={isDiagnosticModalOpen}
            testSet={activeDiagnosticSet}
            onClose={closeDiagnosticTest}
            onSaveResult={recordDiagnosticTestResult}
          />
        )}
      </Suspense>

      {/* Hiệu ứng Floating XP */}
      <XpNotification />
    </div>
  );
};

export default function App() {
  return (
    <GamificationProvider>
      <AppContent />
    </GamificationProvider>
  );
}

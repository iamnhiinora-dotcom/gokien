/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QUẢN LÝ TIẾN TRÌNH TRÒ CHƠI HÓA (GAMIFICATION CONTEXT & STORE)
 * Tích hợp Firebase Auth (Sign in with Google) và Firestore Database thực tế.
 * Không còn mật khẩu, tài khoản mẫu hay dữ liệu ảo.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { 
  UserProfile, 
  Badge, 
  DailyQuest, 
  LeaderboardUser, 
  DebateMatchRecord, 
  DebateSide,
  DiagnosticTestResult,
  EvaluatedFallacyRecord
} from '../types';
import { soundFX } from '../services/soundEffects';
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  fetchUserProfile, 
  createInitialUserProfile,
  updateUserSettings,
  recordDebateMatchInFirestore,
  recordFallacyInFirestore,
  syncUserProgressToFirestore,
  fetchStudentMatches,
  fetchLeaderboardFromFirestore
} from '../services/firebase';

// Bảng danh hiệu tương ứng với từng cấp độ (Level 1 -> 10)
export const LEVEL_TITLES: { [level: number]: { title: string; minXP: number; maxXP: number } } = {
  1: { title: 'Tập sự phản biện', minXP: 0, maxXP: 300 },
  2: { title: 'Người dò tìm lỗi', minXP: 300, maxXP: 700 },
  3: { title: 'Thợ săn ngụy biện', minXP: 700, maxXP: 1300 },
  4: { title: 'Chiến binh tranh biện', minXP: 1300, maxXP: 2100 },
  5: { title: 'Hiệp sĩ Logic', minXP: 2100, maxXP: 3100 },
  6: { title: 'Bậc thầy vạch lỗi', minXP: 3100, maxXP: 4400 },
  7: { title: 'Kiến trúc sư luận điểm', minXP: 4400, maxXP: 6000 },
  8: { title: 'Trọng tài WSDC cừ khôi', minXP: 6000, maxXP: 8000 },
  9: { title: 'Học giả hùng biện', minXP: 8000, maxXP: 10500 },
  10: { title: 'Đại kiện tướng triết luận', minXP: 10500, maxXP: 99999 }
};

export const getTodayDateString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Danh sách 8 Huy hiệu thành tựu
export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge_first_blood',
    title: 'Khởi đầu trí tuệ',
    description: 'Hoàn thành thử thách "Vạch lá tìm sâu" đầu tiên.',
    iconName: 'Sparkles',
    tier: 'dong',
    isUnlocked: false,
    conditionDescription: 'Giải quyết 1 tình huống ngụy biện'
  },
  {
    id: 'badge_fallacy_hunter',
    title: 'Thợ săn ngụy biện',
    description: 'Vạch trần chính xác 3 lỗi ngụy biện trong các tình huống thực tế.',
    iconName: 'Search',
    tier: 'bac',
    isUnlocked: false,
    conditionDescription: 'Tìm đúng 3 lỗi ngụy biện'
  },
  {
    id: 'badge_iron_rebuttal',
    title: 'Luận điểm vững chắc',
    description: 'Đạt điểm xuất sắc (từ 85 điểm trở lên) cho một bài phản biện vững chắc.',
    iconName: 'ShieldCheck',
    tier: 'vang',
    isUnlocked: false,
    conditionDescription: 'Đạt điểm số >= 85'
  },
  {
    id: 'badge_debate_warrior',
    title: 'Bản lĩnh tranh biện',
    description: 'Thuyết phục thành công và chiến thắng trong Đấu trường tranh biện.',
    iconName: 'Swords',
    tier: 'vang',
    isUnlocked: false,
    conditionDescription: 'Thuyết phục thành công trong Đấu trường'
  },
  {
    id: 'badge_wsdc_master',
    title: 'Bậc thầy WSDC',
    description: 'Bảo toàn trên 60 HP khi kết thúc một trận đấu tranh biện đỉnh cao.',
    iconName: 'Crown',
    tier: 'kim_cuong',
    isUnlocked: false,
    conditionDescription: 'Thắng trận với HP >= 60'
  },
  {
    id: 'badge_critical_sage',
    title: 'Nhà phản biện kiệt xuất',
    description: 'Đạt Cấp độ 4 trở lên trên con đường tôi luyện trí tuệ.',
    iconName: 'Flame',
    tier: 'kim_cuong',
    isUnlocked: false,
    conditionDescription: 'Đạt Level 4'
  },
  {
    id: 'badge_streak_3',
    title: 'Ngọn Lửa Kiên Trì',
    description: 'Duy trì chuỗi rèn luyện tư duy phản biện 3 ngày liên tiếp.',
    iconName: 'Flame',
    tier: 'bac',
    isUnlocked: false,
    conditionDescription: 'Đạt Streak 3 ngày'
  },
  {
    id: 'badge_streak_7',
    title: 'Trí tuệ vững chắc',
    description: 'Duy trì chuỗi rèn luyện tư duy phản biện 7 ngày liên tiếp.',
    iconName: 'Crown',
    tier: 'kim_cuong',
    isUnlocked: false,
    conditionDescription: 'Đạt Streak 7 ngày'
  },
  {
    id: 'badge_open_minded',
    title: 'Đổi ý có căn cứ',
    description: 'Biết tự nhìn lại mình: hoàn thành bài tập Dựng Người Thép đạt từ 6 điểm trở lên hoặc ghi nhận ý hợp lý của đối thủ.',
    iconName: 'Sparkles',
    tier: 'vang',
    isUnlocked: false,
    conditionDescription: 'Đạt >=6đ Dựng Người Thép hoặc có điểm Công tâm'
  }
];

// Danh sách Nhiệm vụ hàng ngày
export const INITIAL_QUESTS: DailyQuest[] = [
  {
    id: 'quest_1',
    title: 'Vạch lá tìm sâu 2 tình huống',
    description: 'Luyện tập phát hiện bẫy ngụy biện trong 2 tình huống học đường/mạng xã hội.',
    targetCount: 2,
    currentCount: 0,
    rewardXP: 100,
    isCompleted: false,
    isClaimed: false
  },
  {
    id: 'quest_2',
    title: 'Thách đấu Đấu trường tranh biện',
    description: 'Tham gia Đấu trường (1v1 hoặc WSDC) và hoàn thành một trận tranh luận trí tuệ.',
    targetCount: 1,
    currentCount: 0,
    rewardXP: 150,
    isCompleted: false,
    isClaimed: false
  },
  {
    id: 'quest_3',
    title: 'Luận điểm sắc bén 80+ điểm',
    description: 'Ghi điểm số trên 80 trong phần chấm điểm tư duy của AI Mentor.',
    targetCount: 1,
    currentCount: 0,
    rewardXP: 120,
    isCompleted: false,
    isClaimed: false
  }
];

// Hồ sơ mặc định cho Chế độ khách (Guest Mode)
const GUEST_PROFILE: UserProfile = {
  id: 'guest',
  username: 'khach',
  email: undefined,
  name: 'Học Sinh Khách',
  school: 'Chưa chọn lớp',
  avatarSeed: 'GuestUser',
  level: 1,
  currentXP: 0,
  nextLevelXP: 300,
  title: 'Tập sự phản biện',
  totalDebates: 0,
  debatesWon: 0,
  fallaciesIdentified: 0,
  unlockedBadgeIds: [],
  soundEnabled: true,
  screenShakeEnabled: true,
  geminiApiKey: '',
  aiEngineMode: 'gemini_cloud',
  streakCount: 1,
  lastActiveDate: getTodayDateString()
};

export interface FloatingXpItem {
  id: string;
  amount: number;
  reason: string;
}

interface GamificationContextType {
  currentUser: FirebaseUser | null;
  isAuthLoading: boolean;
  isGuest: boolean;
  profile: UserProfile;
  badges: Badge[];
  quests: DailyQuest[];
  leaderboard: LeaderboardUser[];
  isLeaderboardLoading: boolean;
  selectedClassFilter: string;
  setSelectedClassFilter: (cls: string) => void;
  refreshLeaderboard: () => Promise<void>;
  debateHistory: DebateMatchRecord[];
  floatingXps: FloatingXpItem[];
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isIntroModalOpen: boolean;
  openIntroModal: () => void;
  closeIntroModal: () => void;
  isHandbookOpen: boolean;
  openHandbook: () => void;
  closeHandbook: () => void;
  loginWithGooglePopup: () => Promise<void>;
  logout: () => Promise<void>;
  addXP: (amount: number, reason: string) => void;
  recordFallacyResult: (
    isCorrect: boolean, 
    score: number,
    details?: { scenarioId?: string; fallacyName?: string; logicScore?: number; identificationScore?: number }
  ) => void;
  recordDebateEnd: (
    outcomeOrWon: boolean | 'victory' | 'defeat' | Partial<DebateMatchRecord>,
    remainingHp?: number,
    additionalDetails?: Partial<DebateMatchRecord>
  ) => void;
  claimQuest: (questId: string) => void;
  updateDailyStreak: () => void;
  toggleSound: () => void;
  toggleScreenShake: () => void;
  updateSettings: (apiKey: string, mode: 'gemini_cloud' | 'intelligent_fallback', name?: string, school?: string) => void;
  resetProgress: () => void;
  newUnlockedBadge: Badge | null;
  dismissBadgeNotification: () => void;
  unlockBadge: (badgeId: string) => void;
  // Quản lý Bài kiểm tra chẩn đoán (Bộ A & Bộ B)
  isDiagnosticModalOpen: boolean;
  activeDiagnosticSet: 'A' | 'B';
  openDiagnosticTest: (testSet?: 'A' | 'B') => void;
  closeDiagnosticTest: () => void;
  recordDiagnosticTestResult: (testSet: 'A' | 'B', result: DiagnosticTestResult) => void;
  isEligibleForTestB: boolean;
  daysSinceTestA: number;
  daysUntilTestB: number;
  simulateFourWeeksPassed: () => void;
  // Chế độ hiển thị (Mặc định: light - Giấy & Bút dạ quang)
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Quản lý Auth State từ Firebase
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // 2. State Hồ Sơ, Huy Hiệu, Lịch Sử
  const [profile, setProfile] = useState<UserProfile>(GUEST_PROFILE);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [quests, setQuests] = useState<DailyQuest[]>(INITIAL_QUESTS);
  const [debateHistory, setDebateHistory] = useState<DebateMatchRecord[]>([]);

  // 3. Leaderboard từ Firestore (Không mock, hỗ trợ lọc lớp)
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState<boolean>(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  const [floatingXps, setFloatingXps] = useState<FloatingXpItem[]>([]);
  const [newUnlockedBadge, setNewUnlockedBadge] = useState<Badge | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState<boolean>(false);
  const [isHandbookOpen, setIsHandbookOpen] = useState<boolean>(false);

  // Helper lưu trữ kết quả kiểm tra chẩn đoán và bài đánh giá AI
  const getDiagStorageKey = (userId: string) => `tri_tue_phan_bien_diag_${userId}`;

  const loadLocalDiagData = (userId: string) => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(getDiagStorageKey(userId));
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  };

  const saveLocalDiagData = (userId: string, data: { diagnosticTestA?: DiagnosticTestResult; diagnosticTestB?: DiagnosticTestResult; evaluatedFallaciesHistory?: EvaluatedFallacyRecord[] }) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(getDiagStorageKey(userId), JSON.stringify(data));
    } catch (e) {
      console.error('Error saving diagnostic data to localStorage:', e);
    }
  };

  // Helper quản lý tiến độ và chống nhận thưởng lặp lại cho Nhiệm vụ hàng ngày (Fix Lỗi 3)
  const getQuestStorageKey = (userId: string) => `tri_tue_phan_bien_quests_${userId}`;

  const loadLocalQuests = (userId: string, today: string, cloudClaimedIds?: string[], cloudLastDate?: string): DailyQuest[] => {
    let savedData: { date: string; quests: { id: string; currentCount: number; isCompleted: boolean; isClaimed: boolean }[] } | null = null;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(getQuestStorageKey(userId));
        if (raw) savedData = JSON.parse(raw);
      } catch {}
    }

    const effectiveDate = cloudLastDate || savedData?.date;
    // Nếu khác ngày hôm nay -> Tự động đặt lại nhiệm vụ cho ngày mới
    if (effectiveDate && effectiveDate !== today) {
      return INITIAL_QUESTS;
    }

    const claimedSet = new Set(cloudClaimedIds || []);
    return INITIAL_QUESTS.map(q => {
      const saved = savedData?.quests?.find(sq => sq.id === q.id);
      const isClaimed = claimedSet.has(q.id) || (saved?.isClaimed ?? false);
      const currentCount = saved?.currentCount ?? (isClaimed ? q.targetCount : 0);
      return {
        ...q,
        currentCount,
        isCompleted: isClaimed || currentCount >= q.targetCount,
        isClaimed
      };
    });
  };

  const saveQuestsState = (userId: string, today: string, currentQuests: DailyQuest[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(getQuestStorageKey(userId), JSON.stringify({
          date: today,
          quests: currentQuests.map(q => ({
            id: q.id,
            currentCount: q.currentCount,
            isCompleted: q.isCompleted,
            isClaimed: q.isClaimed
          }))
        }));
      } catch {}
    }
  };

  // Quản lý Modal Bài kiểm tra chẩn đoán
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState<boolean>(false);
  const [activeDiagnosticSet, setActiveDiagnosticSet] = useState<'A' | 'B'>('A');

  // Chế độ hiển thị: Giao diện sáng với bảng màu thống nhất (Light mode)
  const theme = 'light' as const;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('tri_tue_phan_bien_theme', 'light');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    // Luôn giữ giao diện sáng chuẩn
  }, []);

  // Dọn dẹp triệt để localStorage chứa mật khẩu cũ của phiên bản trước
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tri_tue_phan_bien_accounts_v3');
      localStorage.removeItem('tri_tue_phan_bien_active_user_id');
      localStorage.removeItem('tri_tue_phan_bien_user_accounts');
    }
  }, []);

  // Lắng nghe trạng thái đăng nhập Firebase Google
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      setCurrentUser(user);

      if (user) {
        try {
          let userProf = await fetchUserProfile(user.uid);
          if (!userProf) {
            // Học sinh mới đăng nhập lần đầu
            userProf = await createInitialUserProfile(user, '11A1');
          }
          const localDiag = loadLocalDiagData(user.uid);
          const resolvedName = userProf?.name || (userProf as any)?.displayName || user.displayName || (user.email ? user.email.split('@')[0] : '') || 'Học sinh';
          const resolvedSchool = userProf?.school || (userProf as any)?.schoolClass || '11A1';
          const resolvedLevel = Math.max(1, Number(userProf?.level || 1));
          // Fix Lỗi 1: Đảm bảo đồng bộ tuyệt đối giữa currentXP và xp, lấy giá trị lớn nhất
          const resolvedCurrentXP = Math.max(Number(userProf?.currentXP || 0), Number((userProf as any)?.xp || 0));
          const resolvedNextLevelXP = Number(userProf?.nextLevelXP || LEVEL_TITLES[resolvedLevel]?.maxXP || 300);
          const resolvedTitle = userProf?.title || LEVEL_TITLES[resolvedLevel]?.title || 'Tập sự phản biện';

          const sanitizedProfile: UserProfile = {
            ...GUEST_PROFILE,
            ...userProf,
            id: user.uid,
            name: resolvedName,
            school: resolvedSchool,
            email: user.email || userProf?.email || undefined,
            level: resolvedLevel,
            currentXP: resolvedCurrentXP,
            xp: resolvedCurrentXP,
            nextLevelXP: resolvedNextLevelXP,
            title: resolvedTitle,
            streakCount: Math.max(1, Number(userProf?.streakCount || 1)),
            debatesWon: Number(userProf?.debatesWon || 0),
            fallaciesIdentified: Number(userProf?.fallaciesIdentified || 0),
            unlockedBadgeIds: Array.isArray(userProf?.unlockedBadgeIds) ? userProf.unlockedBadgeIds : [],
            claimedQuestIds: Array.isArray(userProf?.claimedQuestIds) ? userProf.claimedQuestIds : [],
            lastQuestDate: userProf?.lastQuestDate,
            diagnosticTestA: localDiag.diagnosticTestA || userProf?.diagnosticTestA,
            diagnosticTestB: localDiag.diagnosticTestB || userProf?.diagnosticTestB,
            evaluatedFallaciesHistory: localDiag.evaluatedFallaciesHistory || userProf?.evaluatedFallaciesHistory || []
          };
          setProfile(sanitizedProfile);

          // Fix Lỗi 3: Nạp và khôi phục trạng thái nhiệm vụ hàng ngày theo ngày
          const today = getTodayDateString();
          const loadedQuests = loadLocalQuests(user.uid, today, userProf?.claimedQuestIds, userProf?.lastQuestDate);
          setQuests(loadedQuests);

          // Cập nhật huy hiệu đã mở khóa
          const unlockedIds = new Set(sanitizedProfile.unlockedBadgeIds || []);
          setBadges(INITIAL_BADGES.map(b => ({
            ...b,
            isUnlocked: unlockedIds.has(b.id)
          })));

          // Tải lịch sử trận đấu thực tế từ Firestore
          const matches = await fetchStudentMatches(user.uid);
          setDebateHistory(matches.sort((a, b) => b.id.localeCompare(a.id)));
        } catch (err) {
          console.error('Lỗi tải dữ liệu người dùng từ Firestore:', err);
          const fallbackName = user.displayName || (user.email ? user.email.split('@')[0] : '') || 'Học sinh';
          setProfile(prev => ({
            ...GUEST_PROFILE,
            ...prev,
            id: user.uid,
            name: fallbackName,
            email: user.email || undefined
          }));
        }
      } else {
        // Chế độ khách (Guest)
        const localDiag = loadLocalDiagData('guest');
        setProfile({
          ...GUEST_PROFILE,
          diagnosticTestA: localDiag.diagnosticTestA,
          diagnosticTestB: localDiag.diagnosticTestB,
          evaluatedFallaciesHistory: localDiag.evaluatedFallaciesHistory || []
        });
        const today = getTodayDateString();
        const loadedQuests = loadLocalQuests('guest', today);
        setQuests(loadedQuests);
        setBadges(INITIAL_BADGES);
        setDebateHistory([]);
      }

      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Tải bảng xếp hạng thực tế từ Firestore
  const refreshLeaderboard = useCallback(async () => {
    setIsLeaderboardLoading(true);
    try {
      const data = await fetchLeaderboardFromFirestore(selectedClassFilter);
      setLeaderboard(data);
    } catch (err) {
      console.error('Lỗi tải bảng xếp hạng từ Firestore:', err);
      setLeaderboard([]);
    } finally {
      setIsLeaderboardLoading(false);
    }
  }, [selectedClassFilter]);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  // Đồng bộ âm thanh
  useEffect(() => {
    soundFX.setEnabled(profile.soundEnabled);
  }, [profile.soundEnabled]);

  // Đăng nhập Google
  const loginWithGooglePopup = useCallback(async () => {
    soundFX.playClick();
    try {
      await signInWithGoogle();
      setIsAuthModalOpen(false);
      soundFX.playSuccess();
      refreshLeaderboard();
    } catch (err: any) {
      console.error('Google Sign-in Error:', err);
      soundFX.playHPDamage();
    }
  }, [refreshLeaderboard]);

  // Đăng xuất
  const logout = useCallback(async () => {
    soundFX.playClick();
    try {
      await signOutUser();
      setProfile(GUEST_PROFILE);
      setBadges(INITIAL_BADGES);
      setDebateHistory([]);
      soundFX.playSuccess();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  const openIntroModal = useCallback(() => setIsIntroModalOpen(true), []);
  const closeIntroModal = useCallback(() => setIsIntroModalOpen(false), []);
  const openHandbook = useCallback(() => setIsHandbookOpen(true), []);
  const closeHandbook = useCallback(() => setIsHandbookOpen(false), []);

  // Kiểm tra mở khóa huy hiệu
  const checkBadgeUnlocks = useCallback((updatedProfile: UserProfile, lastScore?: number, debateHp?: number) => {
    setBadges(prevBadges => {
      let newlyUnlocked: Badge | null = null;
      const updated = prevBadges.map(b => {
        if (b.isUnlocked) return b;

        let shouldUnlock = false;
        if (b.id === 'badge_first_blood' && updatedProfile.fallaciesIdentified >= 1) shouldUnlock = true;
        else if (b.id === 'badge_fallacy_hunter' && updatedProfile.fallaciesIdentified >= 3) shouldUnlock = true;
        else if (b.id === 'badge_iron_rebuttal' && (lastScore ?? 0) >= 85) shouldUnlock = true;
        else if (b.id === 'badge_debate_warrior' && updatedProfile.debatesWon >= 1) shouldUnlock = true;
        else if (b.id === 'badge_wsdc_master' && (debateHp ?? 0) >= 60) shouldUnlock = true;
        else if (b.id === 'badge_critical_sage' && updatedProfile.level >= 4) shouldUnlock = true;
        else if (b.id === 'badge_streak_3' && (updatedProfile.streakCount ?? 0) >= 3) shouldUnlock = true;
        else if (b.id === 'badge_streak_7' && (updatedProfile.streakCount ?? 0) >= 7) shouldUnlock = true;
        else if (b.id === 'badge_open_minded' && updatedProfile.debatesWon >= 1) shouldUnlock = true;

        if (shouldUnlock) {
          const unlockedBadge = { ...b, isUnlocked: true, unlockedAt: new Date().toLocaleDateString('vi-VN') };
          if (!newlyUnlocked) newlyUnlocked = unlockedBadge;
          return unlockedBadge;
        }
        return b;
      });

      if (newlyUnlocked) {
        setNewUnlockedBadge(newlyUnlocked);
        soundFX.playBadgeUnlock();
      }
      return updated;
    });
  }, []);

  // Mở khóa trực tiếp huy hiệu cụ thể (ví dụ: Đổi ý có căn cứ sau bài Dựng Người Thép)
  const unlockBadge = useCallback((badgeId: string) => {
    setBadges(prevBadges => {
      let newlyUnlocked: Badge | null = null;
      const updated = prevBadges.map(b => {
        if (b.id === badgeId && !b.isUnlocked) {
          const unlockedBadge = { ...b, isUnlocked: true, unlockedAt: new Date().toLocaleDateString('vi-VN') };
          newlyUnlocked = unlockedBadge;
          return unlockedBadge;
        }
        return b;
      });

      if (newlyUnlocked) {
        setNewUnlockedBadge(newlyUnlocked);
        soundFX.playBadgeUnlock();
      }
      return updated;
    });
  }, []);

  // Cập nhật chuỗi ngày rèn luyện
  const updateDailyStreak = useCallback(() => {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    setProfile(prev => {
      if (prev.lastActiveDate === today) return prev;

      let newStreak = 1;
      let bonusXP = 30;
      let streakMsg = 'Khởi động ngọn lửa ngày 1!';

      if (prev.lastActiveDate === yesterday) {
        newStreak = (prev.streakCount || 0) + 1;
        bonusXP = Math.min(100, 40 + newStreak * 10);
        streakMsg = `Duy trì chuỗi ngọn lửa: ${newStreak} ngày liên tiếp!`;
      }

      soundFX.playStreakBonus();

      const xpId = 'streak_' + Date.now();
      setFloatingXps(fxp => [...fxp, { id: xpId, amount: bonusXP, reason: streakMsg }]);
      setTimeout(() => {
        setFloatingXps(fxp => fxp.filter(item => item.id !== xpId));
      }, 1500);

      const updatedTotalXP = prev.currentXP + bonusXP;
      let newLevel = prev.level;
      let currentCap = LEVEL_TITLES[newLevel]?.maxXP || 99999;
      while (updatedTotalXP >= currentCap && newLevel < 10) {
        newLevel += 1;
        currentCap = LEVEL_TITLES[newLevel]?.maxXP || 99999;
      }

      const newTitle = LEVEL_TITLES[newLevel]?.title || prev.title;

      const updated = {
        ...prev,
        currentXP: updatedTotalXP,
        xp: updatedTotalXP,
        level: newLevel,
        nextLevelXP: currentCap,
        title: newTitle,
        streakCount: newStreak,
        lastActiveDate: today
      };

      // Fix Lỗi 4: Lưu đầy đủ điểm streak, bonusXP, level, title vào Firestore & Leaderboard
      if (currentUser) {
        syncUserProgressToFirestore(currentUser.uid, {
          newXp: updatedTotalXP,
          newLevel: newLevel,
          newTitle: newTitle,
          nextLevelXP: currentCap,
          streakCount: newStreak,
          lastActiveDate: today
        }).catch(err => console.error('Lỗi cập nhật streak lên Firestore:', err));
      }

      setTimeout(() => checkBadgeUnlocks(updated), 200);
      return updated;
    });
  }, [currentUser, checkBadgeUnlocks]);

  // Thêm XP và đồng bộ bền vững vào Firestore (Fix Lỗi 2)
  const addXP = useCallback((amount: number, reason: string) => {
    const xpId = Date.now().toString() + Math.random().toString();
    setFloatingXps(prev => [...prev, { id: xpId, amount, reason }]);
    setTimeout(() => {
      setFloatingXps(prev => prev.filter(item => item.id !== xpId));
    }, 1500);

    setProfile(prev => {
      const newTotalXP = prev.currentXP + amount;
      let newLevel = prev.level;
      let currentCap = LEVEL_TITLES[newLevel]?.maxXP || 99999;

      while (newTotalXP >= currentCap && newLevel < 10) {
        newLevel += 1;
        currentCap = LEVEL_TITLES[newLevel]?.maxXP || 99999;
      }

      const didLevelUp = newLevel > prev.level;
      if (didLevelUp) soundFX.playLevelUp();
      else soundFX.playSuccess();

      const newTitle = LEVEL_TITLES[newLevel]?.title || prev.title;
      const updated = {
        ...prev,
        currentXP: newTotalXP,
        xp: newTotalXP,
        level: newLevel,
        nextLevelXP: currentCap,
        title: newTitle
      };

      // Fix Lỗi 2: Bất kỳ hoạt động nào cộng XP (Nhiệm vụ, Bài test chẩn đoán, Cờ cá ngựa, v.v.)
      // đều được lưu bền vững vào Firestore & Bảng xếp hạng nếu đã đăng nhập
      if (currentUser) {
        syncUserProgressToFirestore(currentUser.uid, {
          newXp: newTotalXP,
          newLevel: newLevel,
          newTitle: newTitle,
          nextLevelXP: currentCap,
          unlockedBadgeIds: updated.unlockedBadgeIds,
          claimedQuestIds: updated.claimedQuestIds,
          lastQuestDate: updated.lastQuestDate
        }).then(() => {
          refreshLeaderboard();
        }).catch(err => console.error('Lỗi lưu addXP vào Firestore:', err));
      }

      setTimeout(() => checkBadgeUnlocks(updated), 200);
      return updated;
    });
  }, [currentUser, checkBadgeUnlocks, refreshLeaderboard]);

  // Ghi nhận hoàn thành thử thách Vạch lá tìm sâu (Đồng bộ Firestore nếu đã đăng nhập)
  const recordFallacyResult = useCallback((
    isCorrect: boolean, 
    score: number,
    details?: { scenarioId?: string; fallacyName?: string; logicScore?: number; identificationScore?: number }
  ) => {
    updateDailyStreak();

    setProfile(prev => {
      const newCount = prev.fallaciesIdentified + (isCorrect ? 1 : 0);
      const bonusXP = isCorrect ? Math.round(score * 1.2) : 20;
      const newTotalXP = prev.currentXP + bonusXP;

      let newLevel = prev.level;
      let currentCap = LEVEL_TITLES[newLevel]?.maxXP || 99999;
      while (newTotalXP >= currentCap && newLevel < 10) {
        newLevel += 1;
        currentCap = LEVEL_TITLES[newLevel]?.maxXP || 99999;
      }

      const newHistory = prev.evaluatedFallaciesHistory ? [...prev.evaluatedFallaciesHistory] : [];
      if (details) {
        newHistory.push({
          scenarioId: details.scenarioId || `sc_${Date.now()}`,
          fallacyName: details.fallacyName || 'Lập luận',
          score,
          logicScore: details.logicScore || Math.round(score * 0.4),
          identificationScore: details.identificationScore || (isCorrect ? 30 : 0),
          timestamp: new Date().toISOString()
        });
      }

      const updated: UserProfile = {
        ...prev,
        currentXP: newTotalXP,
        level: newLevel,
        nextLevelXP: currentCap,
        title: LEVEL_TITLES[newLevel]?.title || prev.title,
        fallaciesIdentified: newCount,
        evaluatedFallaciesHistory: newHistory
      };

      saveLocalDiagData(prev.id, {
        diagnosticTestA: updated.diagnosticTestA,
        diagnosticTestB: updated.diagnosticTestB,
        evaluatedFallaciesHistory: updated.evaluatedFallaciesHistory
      });

      if (currentUser) {
        const unlockedIds = badges.filter(b => b.isUnlocked).map(b => b.id);
        recordFallacyInFirestore(currentUser.uid, {
          newXp: newTotalXP,
          newLevel: newLevel,
          newTitle: updated.title,
          newFallaciesIdentified: newCount,
          unlockedBadgeIds: unlockedIds,
          streakCount: updated.streakCount,
          lastActiveDate: updated.lastActiveDate
        }).then(() => refreshLeaderboard()).catch(err => console.error('Lỗi lưu fallacy Firestore:', err));
      }

      setTimeout(() => checkBadgeUnlocks(updated, score), 200);
      return updated;
    });

    setQuests(prev => {
      const nextQuests = prev.map(q => {
        if (q.id === 'quest_1' && !q.isCompleted) {
          const nextCount = q.currentCount + 1;
          return { ...q, currentCount: nextCount, isCompleted: nextCount >= q.targetCount };
        }
        if (q.id === 'quest_3' && !q.isCompleted && score >= 80) {
          return { ...q, currentCount: 1, isCompleted: true };
        }
        return q;
      });
      const activeUserId = currentUser ? currentUser.uid : 'guest';
      saveQuestsState(activeUserId, getTodayDateString(), nextQuests);
      return nextQuests;
    });
  }, [currentUser, badges, updateDailyStreak, checkBadgeUnlocks, refreshLeaderboard]);

  // Quản lý Modal & Logic Bài kiểm tra chẩn đoán
  const openDiagnosticTest = useCallback((set?: 'A' | 'B') => {
    soundFX.playClick();
    if (set) {
      setActiveDiagnosticSet(set);
    } else {
      setActiveDiagnosticSet(profile.diagnosticTestA ? 'B' : 'A');
    }
    setIsDiagnosticModalOpen(true);
  }, [profile.diagnosticTestA]);

  const closeDiagnosticTest = useCallback(() => {
    setIsDiagnosticModalOpen(false);
  }, []);

  const recordDiagnosticTestResult = useCallback((testSet: 'A' | 'B', result: DiagnosticTestResult) => {
    const key = testSet === 'A' ? 'diagnosticTestA' : 'diagnosticTestB';
    setProfile(prev => {
      const updated = {
        ...prev,
        [key]: result
      };
      saveLocalDiagData(prev.id, {
        diagnosticTestA: updated.diagnosticTestA,
        diagnosticTestB: updated.diagnosticTestB,
        evaluatedFallaciesHistory: updated.evaluatedFallaciesHistory
      });
      return updated;
    });

    addXP(150, `Hoàn thành bài kiểm tra chẩn đoán Bộ ${testSet}!`);
    updateDailyStreak();

    // Fix Lỗi 2: Lưu kết quả kiểm tra chẩn đoán bền vững vào Firestore
    if (currentUser) {
      syncUserProgressToFirestore(currentUser.uid, {
        newXp: profile.currentXP + 150,
        newLevel: profile.level,
        newTitle: profile.title,
        [key]: result
      }).catch(err => console.error('Lỗi lưu kết quả chẩn đoán lên Firestore:', err));
    }
  }, [currentUser, profile, addXP, updateDailyStreak]);

  // Tính số ngày kể từ Bài kiểm tra A để nhắc làm Bài kiểm tra B sau 4 tuần (28 ngày)
  const testACompletedAt = profile.diagnosticTestA?.completedAt;
  let daysSinceTestA = 0;
  let isEligibleForTestB = false;
  let daysUntilTestB = 28;

  if (testACompletedAt) {
    const diffMs = Date.now() - new Date(testACompletedAt).getTime();
    daysSinceTestA = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    daysUntilTestB = Math.max(0, 28 - daysSinceTestA);
    isEligibleForTestB = daysSinceTestA >= 28 && !profile.diagnosticTestB;
  }

  // Cho phép kiểm thử viên / học sinh giả lập đã trôi qua 4 tuần để kiểm tra tính năng so sánh Bộ A & Bộ B
  const simulateFourWeeksPassed = useCallback(() => {
    setProfile(prev => {
      if (!prev.diagnosticTestA) return prev;
      const pastDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString();
      const updatedTestA = { ...prev.diagnosticTestA, completedAt: pastDate };
      const updated = { ...prev, diagnosticTestA: updatedTestA };
      saveLocalDiagData(prev.id, {
        diagnosticTestA: updatedTestA,
        diagnosticTestB: prev.diagnosticTestB,
        evaluatedFallaciesHistory: prev.evaluatedFallaciesHistory
      });
      return updated;
    });
    soundFX.playSuccess();
  }, []);

  // Ghi nhận kết quả trận đấu trong Đấu trường tranh biện
  const recordDebateEnd = useCallback((
    outcomeOrWon: boolean | 'victory' | 'defeat' | Partial<DebateMatchRecord>,
    remainingHp?: number,
    additionalDetails?: Partial<DebateMatchRecord>
  ) => {
    updateDailyStreak();

    let outcome: 'victory' | 'defeat' = 'defeat';
    let won = false;
    let studentHp = remainingHp ?? 0;
    let aiHp = 0;
    let xpEarned = 60;
    let topicMotion = 'Trận đấu tranh biện học đường WSDC';
    let studentSide: DebateSide = 'pro';
    let roundsCompleted = 4;
    let personaName = 'Đại kiện tướng WSDC';

    if (typeof outcomeOrWon === 'boolean') {
      won = outcomeOrWon;
      outcome = won ? 'victory' : 'defeat';
      xpEarned = won ? 180 : 60;
      if (additionalDetails) {
        topicMotion = additionalDetails.topicMotion || topicMotion;
        studentSide = additionalDetails.studentSide || studentSide;
        roundsCompleted = additionalDetails.roundsCompleted || roundsCompleted;
        personaName = additionalDetails.personaName || personaName;
        aiHp = additionalDetails.aiHp || 0;
      }
    } else if (typeof outcomeOrWon === 'string') {
      outcome = outcomeOrWon === 'victory' ? 'victory' : 'defeat';
      won = outcome === 'victory';
      xpEarned = won ? 180 : 60;
      if (additionalDetails) {
        topicMotion = additionalDetails.topicMotion || topicMotion;
        studentSide = additionalDetails.studentSide || studentSide;
        roundsCompleted = additionalDetails.roundsCompleted || roundsCompleted;
        personaName = additionalDetails.personaName || personaName;
        aiHp = additionalDetails.aiHp || 0;
      }
    } else if (typeof outcomeOrWon === 'object') {
      outcome = outcomeOrWon.outcome === 'victory' ? 'victory' : 'defeat';
      won = outcome === 'victory';
      studentHp = outcomeOrWon.studentHp ?? (remainingHp ?? 0);
      aiHp = outcomeOrWon.aiHp ?? 0;
      xpEarned = outcomeOrWon.xpEarned ?? (won ? 180 : 60);
      topicMotion = outcomeOrWon.topicMotion || topicMotion;
      studentSide = outcomeOrWon.studentSide || studentSide;
      roundsCompleted = outcomeOrWon.roundsCompleted || roundsCompleted;
      personaName = outcomeOrWon.personaName || personaName;
    }

    const reflection = typeof outcomeOrWon === 'object' ? outcomeOrWon.reflection : additionalDetails?.reflection;
    const steelmanScore = typeof outcomeOrWon === 'object' ? outcomeOrWon.steelmanScore : additionalDetails?.steelmanScore;
    const concessionCount = typeof outcomeOrWon === 'object' ? outcomeOrWon.concessionCount : additionalDetails?.concessionCount;
    const wsdcScore = typeof outcomeOrWon === 'object' ? outcomeOrWon.wsdcScore : additionalDetails?.wsdcScore;

    const newMatch: DebateMatchRecord = {
      id: `match_${Date.now()}`,
      topicMotion,
      studentSide,
      outcome,
      studentHp,
      aiHp,
      xpEarned,
      roundsCompleted,
      personaName,
      date: new Date().toLocaleDateString('vi-VN'),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      reflection,
      steelmanScore,
      concessionCount,
      wsdcScore
    };

    setDebateHistory(prev => [newMatch, ...prev]);

    if ((steelmanScore !== undefined && steelmanScore >= 6) || (concessionCount !== undefined && concessionCount > 0)) {
      unlockBadge('badge_open_minded');
    }

    setProfile(prev => {
      const newWon = prev.debatesWon + (won ? 1 : 0);
      const newTotalDebates = prev.totalDebates + 1;
      const newTotalXP = prev.currentXP + xpEarned;

      let newLevel = prev.level;
      let currentCap = LEVEL_TITLES[newLevel]?.maxXP || 99999;
      while (newTotalXP >= currentCap && newLevel < 10) {
        newLevel += 1;
        currentCap = LEVEL_TITLES[newLevel]?.maxXP || 99999;
      }

      const updated = {
        ...prev,
        currentXP: newTotalXP,
        level: newLevel,
        nextLevelXP: currentCap,
        title: LEVEL_TITLES[newLevel]?.title || prev.title,
        totalDebates: newTotalDebates,
        debatesWon: newWon
      };

      if (currentUser) {
        const unlockedIds = badges.filter(b => b.isUnlocked).map(b => b.id);
        recordDebateMatchInFirestore(currentUser.uid, newMatch, {
          newXp: newTotalXP,
          newLevel: newLevel,
          newTitle: updated.title,
          newDebatesWon: newWon,
          unlockedBadgeIds: unlockedIds,
          streakCount: updated.streakCount,
          lastActiveDate: updated.lastActiveDate,
          name: updated.name,
          schoolClass: updated.school,
          avatarSeed: updated.avatarSeed || 'Hero',
          fallaciesFound: updated.fallaciesIdentified
        }).then(() => refreshLeaderboard()).catch(err => console.error('Lỗi lưu match Firestore:', err));
      }

      setTimeout(() => checkBadgeUnlocks(updated, undefined, won ? studentHp : 0), 200);
      return updated;
    });

    setQuests(prev => {
      const nextQuests = prev.map(q => {
        if (q.id === 'quest_2' && !q.isCompleted) {
          const nextCount = q.currentCount + 1;
          return { ...q, currentCount: nextCount, isCompleted: nextCount >= q.targetCount };
        }
        return q;
      });
      const activeUserId = currentUser ? currentUser.uid : 'guest';
      saveQuestsState(activeUserId, getTodayDateString(), nextQuests);
      return nextQuests;
    });
  }, [currentUser, badges, updateDailyStreak, checkBadgeUnlocks, refreshLeaderboard]);

  const claimQuest = useCallback((questId: string) => {
    const quest = quests.find(q => q.id === questId);
    // Fix Lỗi 3: Ngăn chặn nhận thưởng nhiều lần
    if (!quest || !quest.isCompleted || quest.isClaimed) return;

    const today = getTodayDateString();
    updateDailyStreak();

    const updatedQuests = quests.map(q => q.id === questId ? { ...q, isClaimed: true } : q);
    setQuests(updatedQuests);

    const activeUserId = currentUser ? currentUser.uid : 'guest';
    saveQuestsState(activeUserId, today, updatedQuests);

    const updatedClaimedIds = Array.from(new Set([...(profile.claimedQuestIds || []), questId]));
    setProfile(prev => ({
      ...prev,
      claimedQuestIds: updatedClaimedIds,
      lastQuestDate: today
    }));

    if (currentUser) {
      syncUserProgressToFirestore(currentUser.uid, {
        newXp: profile.currentXP + quest.rewardXP,
        newLevel: profile.level,
        newTitle: profile.title,
        claimedQuestIds: updatedClaimedIds,
        lastQuestDate: today
      }).catch(err => console.error('Lỗi lưu claimed quests lên Firestore:', err));
    }

    addXP(quest.rewardXP, `Nhiệm vụ: ${quest.title}`);
  }, [quests, profile, currentUser, addXP, updateDailyStreak]);

  const toggleSound = useCallback(() => {
    setProfile(prev => {
      const next = !prev.soundEnabled;
      if (currentUser) {
        updateUserSettings(currentUser.uid, { soundEnabled: next }).catch(() => {});
      }
      return { ...prev, soundEnabled: next };
    });
  }, [currentUser]);

  const toggleScreenShake = useCallback(() => {
    setProfile(prev => {
      const next = !prev.screenShakeEnabled;
      if (currentUser) {
        updateUserSettings(currentUser.uid, { screenShakeEnabled: next }).catch(() => {});
      }
      return { ...prev, screenShakeEnabled: next };
    });
  }, [currentUser]);

  const updateSettings = useCallback((_apiKey: string, _mode: any, name?: string, school?: string) => {
    setProfile(prev => {
      const updatedName = name?.trim() || prev.name;
      const updatedSchool = school?.trim() || prev.school;
      if (currentUser) {
        updateUserSettings(currentUser.uid, {
          displayName: updatedName,
          schoolClass: updatedSchool
        }).then(() => refreshLeaderboard()).catch(() => {});
      }
      return {
        ...prev,
        name: updatedName,
        school: updatedSchool
      };
    });
  }, [currentUser, refreshLeaderboard]);

  const resetProgress = useCallback(() => {
    setProfile(GUEST_PROFILE);
    setBadges(INITIAL_BADGES);
    setQuests(INITIAL_QUESTS);
    setDebateHistory([]);
  }, []);

  const dismissBadgeNotification = useCallback(() => {
    setNewUnlockedBadge(null);
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        isGuest: !currentUser,
        profile,
        badges,
        quests,
        leaderboard,
        isLeaderboardLoading,
        selectedClassFilter,
        setSelectedClassFilter,
        refreshLeaderboard,
        debateHistory,
        floatingXps,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isIntroModalOpen,
        openIntroModal,
        closeIntroModal,
        isHandbookOpen,
        openHandbook,
        closeHandbook,
        loginWithGooglePopup,
        logout,
        addXP,
        recordFallacyResult,
        recordDebateEnd,
        claimQuest,
        updateDailyStreak,
        toggleSound,
        toggleScreenShake,
        updateSettings,
        resetProgress,
        newUnlockedBadge,
        dismissBadgeNotification,
        unlockBadge,
        isDiagnosticModalOpen,
        activeDiagnosticSet,
        openDiagnosticTest,
        closeDiagnosticTest,
        recordDiagnosticTestResult,
        isEligibleForTestB,
        daysSinceTestA,
        daysUntilTestB,
        simulateFourWeeksPassed,
        theme,
        toggleTheme
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

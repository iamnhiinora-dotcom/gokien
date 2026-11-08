/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QUẢN LÝ TIẾN TRÌNH TRÒ CHƠI HÓA (GAMIFICATION CONTEXT & STORE)
 * Tích hợp Firebase Auth (Sign in with Google) và Firestore Database thực tế.
 * Không còn mật khẩu, tài khoản mẫu hay dữ liệu ảo.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { 
  UserProfile, 
  Badge, 
  DailyQuest, 
  LeaderboardUser, 
  DebateMatchRecord, 
  DebateSide,
  DiagnosticTestResult,
  EvaluatedFallacyRecord,
  PostMatchReflection
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
  updateDebateMatchReflectionInFirestore,
  recordFallacyInFirestore,
  syncUserProgressToFirestore,
  awardXPInFirestore,
  resetUserProfileInFirestore,
  saveDailyQuestsInFirestore,
  saveUnlockedBadgesInFirestore,
  fetchStudentMatches,
  fetchLeaderboardFromFirestore
} from '../services/firebase';
import { LEVELS, LEVEL_TITLES, getLevelFromXP, getProgressFromXP } from '../utils/levelSystem';

// Re-export để các view khác vẫn import được từ GamificationContext
export { LEVELS, LEVEL_TITLES, getLevelFromXP, getProgressFromXP };

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
  addXP: (amount: number, reason: string) => Promise<boolean>;
  recordFallacyResult: (
    isCorrect: boolean, 
    score: number,
    details?: { scenarioId?: string; fallacyName?: string; logicScore?: number; identificationScore?: number },
    customXpEarned?: number,
    customReason?: string
  ) => Promise<void> | void;
  recordDebateEnd: (
    outcomeOrWon: boolean | 'victory' | 'defeat' | Partial<DebateMatchRecord>,
    remainingHp?: number,
    additionalDetails?: Partial<DebateMatchRecord>
  ) => string;
  saveDebateReflection: (
    matchId: string,
    reflection: PostMatchReflection
  ) => Promise<boolean>;
  claimQuest: (questId: string) => Promise<void> | void;
  updateDailyStreak: () => Promise<void> | void;
  toggleSound: () => void;
  toggleScreenShake: () => void;
  updateSettings: (apiKey: string, mode: 'gemini_cloud' | 'intelligent_fallback', name?: string, school?: string) => void;
  resetProgress: () => Promise<void>;
  newUnlockedBadge: Badge | null;
  dismissBadgeNotification: () => void;
  unlockBadge: (badgeId: string) => void;
  // Quản lý Bài kiểm tra chẩn đoán (Bộ A & Bộ B)
  isDiagnosticModalOpen: boolean;
  activeDiagnosticSet: 'A' | 'B';
  openDiagnosticTest: (testSet?: 'A' | 'B') => void;
  closeDiagnosticTest: () => void;
  recordDiagnosticTestResult: (testSet: 'A' | 'B', result: DiagnosticTestResult) => Promise<void> | void;
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
  const unlockedBadgeIdsRef = useRef<Set<string>>(new Set());
  const claimingQuestIdsRef = useRef<Set<string>>(new Set());
  const isRecordingDiagTestRef = useRef<boolean>(false);
  const isRecordingFallacyRef = useRef<boolean>(false);
  const claimedReflectionMatchIdsRef = useRef<Set<string>>(new Set());
  const reflectionRewardInFlightRef = useRef<Record<string, boolean>>({});
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

  const mergeWithQuestDefinitions = (
    savedQuests: { id: string; currentCount: number; isCompleted: boolean; isClaimed: boolean }[] | undefined,
    claimedQuestIds?: string[]
  ): DailyQuest[] => {
    const claimedSet = new Set(claimedQuestIds || []);
    return INITIAL_QUESTS.map(q => {
      const saved = savedQuests?.find(sq => sq.id === q.id);
      const isClaimed = claimedSet.has(q.id) || (saved?.isClaimed ?? false);
      const currentCount = isClaimed ? q.targetCount : (saved?.currentCount ?? 0);
      return {
        ...q,
        currentCount,
        isCompleted: isClaimed || currentCount >= q.targetCount,
        isClaimed
      };
    });
  };

  const loadQuests = (
    userId: string, 
    today: string, 
    cloudDailyQuests?: { date: string; quests: { id: string; currentCount: number; isCompleted: boolean; isClaimed: boolean }[] },
    cloudClaimedIds?: string[], 
    cloudLastDate?: string
  ): DailyQuest[] => {
    // 1. Ưu tiên số 1: Đọc tiến độ dailyQuests từ Firestore (nếu cùng ngày)
    if (cloudDailyQuests && cloudDailyQuests.date === today && Array.isArray(cloudDailyQuests.quests)) {
      return mergeWithQuestDefinitions(cloudDailyQuests.quests, cloudClaimedIds);
    }

    // 2. Nếu ngày ghi nhận trên đám mây khác ngày hôm nay -> Đặt lại nhiệm vụ cho ngày mới
    const effectiveDate = cloudDailyQuests?.date || cloudLastDate;
    if (effectiveDate && effectiveDate !== today) {
      return INITIAL_QUESTS;
    }

    // 3. Fallback đọc từ bộ nhớ tạm localStorage
    let savedLocal: { date: string; quests: { id: string; currentCount: number; isCompleted: boolean; isClaimed: boolean }[] } | null = null;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(getQuestStorageKey(userId));
        if (raw) savedLocal = JSON.parse(raw);
      } catch {}
    }

    if (savedLocal && savedLocal.date === today && Array.isArray(savedLocal.quests)) {
      return mergeWithQuestDefinitions(savedLocal.quests, cloudClaimedIds);
    }

    return INITIAL_QUESTS;
  };

  const saveQuestsState = (
    userId: string, 
    today: string, 
    currentQuests: DailyQuest[], 
    syncToCloud: boolean = false
  ) => {
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

    if (syncToCloud && userId !== 'guest') {
      saveDailyQuestsInFirestore(userId, currentQuests, today).catch(err => {
        console.error('Lỗi đồng bộ dailyQuests Firestore:', err);
      });
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
          // Tính lại toàn bộ Level, Title và NextLevelXP từ nguồn dữ liệu duy nhất (getProgressFromXP)
          const resolvedXP = Math.max(Number(userProf?.currentXP || 0), Number((userProf as any)?.xp || 0));
          const progress = getProgressFromXP(resolvedXP);

          // BUG-08 FIX: Với người dùng đăng nhập, Firestore là nguồn dữ liệu duy nhất (single source of truth).
          // Tuyệt đối không fallback về localStorage khi Firestore là undefined hoặc mảng rỗng [] (sau khi reset).
          const resolvedDiagA = userProf?.diagnosticTestA || undefined;
          const resolvedDiagB = userProf?.diagnosticTestB || undefined;
          const resolvedFallacies = Array.isArray(userProf?.evaluatedFallaciesHistory)
            ? userProf.evaluatedFallaciesHistory
            : [];

          // Ghi đè lại localStorage bằng dữ liệu chuẩn từ Firestore để tránh dữ liệu cũ tồn đọng
          saveLocalDiagData(user.uid, {
            diagnosticTestA: resolvedDiagA,
            diagnosticTestB: resolvedDiagB,
            evaluatedFallaciesHistory: resolvedFallacies
          });

          const sanitizedProfile: UserProfile = {
            ...GUEST_PROFILE,
            ...userProf,
            id: user.uid,
            name: resolvedName,
            school: resolvedSchool,
            email: user.email || userProf?.email || undefined,
            level: progress.level,
            currentXP: progress.currentXP,
            xp: progress.xp,
            nextLevelXP: progress.nextLevelXP,
            title: progress.title,
            streakCount: Math.max(1, Number(userProf?.streakCount || 1)),
            lastActiveDate: userProf?.lastActiveDate || getTodayDateString(),
            lastStreakRewardDate: userProf?.lastStreakRewardDate,
            totalDebates: Number(userProf?.totalDebates ?? ((userProf?.debatesWon || 0) + ((userProf as any)?.debatesLost || 0))),
            debatesWon: Number(userProf?.debatesWon || 0),
            fallaciesIdentified: Number(userProf?.fallaciesIdentified || 0),
            unlockedBadgeIds: Array.isArray(userProf?.unlockedBadgeIds) ? userProf.unlockedBadgeIds : [],
            claimedQuestIds: Array.isArray(userProf?.claimedQuestIds) ? userProf.claimedQuestIds : [],
            lastQuestDate: userProf?.lastQuestDate,
            dailyQuests: userProf?.dailyQuests,
            diagnosticTestA: resolvedDiagA,
            diagnosticTestB: resolvedDiagB,
            evaluatedFallaciesHistory: resolvedFallacies
          };
          setProfile(sanitizedProfile);

          // Nạp và khôi phục trạng thái nhiệm vụ hàng ngày theo ngày ưu tiên Firestore
          const today = getTodayDateString();
          const loadedQuests = loadQuests(user.uid, today, userProf?.dailyQuests, userProf?.claimedQuestIds, userProf?.lastQuestDate);
          setQuests(loadedQuests);

          // Cập nhật ref và huy hiệu đã mở khóa
          unlockedBadgeIdsRef.current = new Set(sanitizedProfile.unlockedBadgeIds || []);
          const unlockedIds = unlockedBadgeIdsRef.current;
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
        unlockedBadgeIdsRef.current = new Set();
        const localDiag = loadLocalDiagData('guest');
        setProfile({
          ...GUEST_PROFILE,
          diagnosticTestA: localDiag.diagnosticTestA,
          diagnosticTestB: localDiag.diagnosticTestB,
          evaluatedFallaciesHistory: localDiag.evaluatedFallaciesHistory || []
        });
        const today = getTodayDateString();
        const loadedQuests = loadQuests('guest', today);
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

  // Kiểm tra mở khóa huy hiệu (Độc lập, dùng ref đồng bộ, không gọi side effect trong callback setState)
  const checkBadgeUnlocks = useCallback((updatedProfile: UserProfile, lastScore?: number, debateHp?: number) => {
    const currentSet = unlockedBadgeIdsRef.current;
    const newlyUnlockedBadges: Badge[] = [];

    for (const b of INITIAL_BADGES) {
      if (currentSet.has(b.id)) continue;

      let shouldUnlock = false;
      if (b.id === 'badge_first_blood' && updatedProfile.fallaciesIdentified >= 1) shouldUnlock = true;
      else if (b.id === 'badge_fallacy_hunter' && updatedProfile.fallaciesIdentified >= 3) shouldUnlock = true;
      else if (b.id === 'badge_iron_rebuttal' && (lastScore ?? 0) >= 85) shouldUnlock = true;
      else if (b.id === 'badge_debate_warrior' && updatedProfile.debatesWon >= 1) shouldUnlock = true;
      else if (b.id === 'badge_wsdc_master' && (debateHp ?? 0) >= 60) shouldUnlock = true;
      else if (b.id === 'badge_critical_sage' && updatedProfile.level >= 4) shouldUnlock = true;
      else if (b.id === 'badge_streak_3' && (updatedProfile.streakCount ?? 0) >= 3) shouldUnlock = true;
      else if (b.id === 'badge_streak_7' && (updatedProfile.streakCount ?? 0) >= 7) shouldUnlock = true;

      if (shouldUnlock) {
        currentSet.add(b.id);
        newlyUnlockedBadges.push({
          ...b,
          isUnlocked: true,
          unlockedAt: new Date().toLocaleDateString('vi-VN')
        });
      }
    }

    if (newlyUnlockedBadges.length > 0) {
      const allIds = Array.from(currentSet);
      setBadges(INITIAL_BADGES.map(b => ({
        ...b,
        isUnlocked: currentSet.has(b.id),
        unlockedAt: currentSet.has(b.id) ? (b.unlockedAt || new Date().toLocaleDateString('vi-VN')) : undefined
      })));

      setProfile(prev => ({
        ...prev,
        unlockedBadgeIds: allIds
      }));

      setNewUnlockedBadge(newlyUnlockedBadges[0]);
      soundFX.playBadgeUnlock();

      if (currentUser) {
        saveUnlockedBadgesInFirestore(currentUser.uid, allIds).catch(err => {
          console.error('Lỗi lưu huy hiệu Firestore:', err);
        });
      }
    }
  }, [currentUser]);

  // Mở khóa trực tiếp huy hiệu cụ thể (ví dụ: Đổi ý có căn cứ sau bài Dựng Người Thép)
  const unlockBadge = useCallback((badgeId: string) => {
    const currentSet = unlockedBadgeIdsRef.current;
    if (currentSet.has(badgeId)) return;

    currentSet.add(badgeId);
    const targetBadge = INITIAL_BADGES.find(b => b.id === badgeId);
    const unlockedItem: Badge = targetBadge
      ? { ...targetBadge, isUnlocked: true, unlockedAt: new Date().toLocaleDateString('vi-VN') }
      : {
          id: badgeId,
          title: 'Thành tựu mới',
          description: 'Mở khóa thành tựu phản biện',
          iconName: 'Sparkles',
          tier: 'vang',
          isUnlocked: true,
          unlockedAt: new Date().toLocaleDateString('vi-VN'),
          conditionDescription: ''
        };

    const allIds = Array.from(currentSet);

    setBadges(INITIAL_BADGES.map(b => ({
      ...b,
      isUnlocked: currentSet.has(b.id),
      unlockedAt: currentSet.has(b.id) ? (b.unlockedAt || new Date().toLocaleDateString('vi-VN')) : undefined
    })));

    setProfile(prev => ({
      ...prev,
      unlockedBadgeIds: allIds
    }));

    setNewUnlockedBadge(unlockedItem);
    soundFX.playBadgeUnlock();

    if (currentUser) {
      saveUnlockedBadgesInFirestore(currentUser.uid, allIds).catch(err => {
        console.error('Lỗi lưu unlocked badge Firestore:', err);
      });
    }
  }, [currentUser]);

  // Cập nhật chuỗi ngày rèn luyện bằng Transaction (P1): Kiểm tra lastStreakRewardDate trước khi cộng XP
  const updateDailyStreak = useCallback(async () => {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    // Nếu đã nhận thưởng streak hôm nay rồi thì không nhận thêm
    if (profile.lastStreakRewardDate === today) return;

    if (currentUser) {
      try {
        // BUG-10: Chuyển toàn bộ việc tính streak và thưởng XP vào Firestore transaction
        const progress = await awardXPInFirestore(currentUser.uid, {
          rewardXP: 0,
          streakBonus: {
            todayDate: today,
            yesterdayDate: yesterday
          }
        });

        // Chỉ hiển thị thông báo và hiệu ứng XP sau khi transaction thành công và streak được trao thưởng
        if (progress.streakAwarded) {
          soundFX.playStreakBonus();
          const xpId = 'streak_' + Date.now();
          const reason = progress.streakMsg || (progress.streakCount === 1 ? 'Khởi động ngọn lửa ngày 1!' : `Duy trì chuỗi ngọn lửa: ${progress.streakCount} ngày liên tiếp!`);
          setFloatingXps(fxp => [...fxp, { id: xpId, amount: progress.streakBonusXP || 30, reason }]);
          setTimeout(() => {
            setFloatingXps(fxp => fxp.filter(item => item.id !== xpId));
          }, 1500);

          setProfile(prev => {
            const updated = {
              ...prev,
              currentXP: progress.currentXP,
              xp: progress.xp,
              level: progress.level,
              nextLevelXP: progress.nextLevelXP,
              title: progress.title,
              streakCount: progress.streakCount ?? 1,
              lastActiveDate: progress.lastActiveDate ?? today,
              lastStreakRewardDate: progress.lastStreakRewardDate ?? today
            };
            setTimeout(() => checkBadgeUnlocks(updated), 200);
            return updated;
          });
          refreshLeaderboard();
        }
      } catch (err) {
        console.error('Lỗi cập nhật streak qua transaction:', err);
      }
    } else {
      // Chế độ Guest
      let guestStreak = 1;
      let guestBonusXP = 30;
      let guestStreakMsg = 'Khởi động ngọn lửa ngày 1!';

      const prevDate = profile.lastStreakRewardDate || profile.lastActiveDate;
      if (prevDate === yesterday) {
        guestStreak = (profile.streakCount || 0) + 1;
        guestBonusXP = Math.min(100, 40 + guestStreak * 10);
        guestStreakMsg = `Duy trì chuỗi ngọn lửa: ${guestStreak} ngày liên tiếp!`;
      }

      soundFX.playStreakBonus();
      const xpId = 'streak_' + Date.now();
      setFloatingXps(fxp => [...fxp, { id: xpId, amount: guestBonusXP, reason: guestStreakMsg }]);
      setTimeout(() => {
        setFloatingXps(fxp => fxp.filter(item => item.id !== xpId));
      }, 1500);

      setProfile(prev => {
        const newTotalXP = prev.currentXP + guestBonusXP;
        const progress = getProgressFromXP(newTotalXP);
        const updated = {
          ...prev,
          currentXP: progress.currentXP,
          xp: progress.xp,
          level: progress.level,
          nextLevelXP: progress.nextLevelXP,
          title: progress.title,
          streakCount: guestStreak,
          lastActiveDate: today,
          lastStreakRewardDate: today
        };
        setTimeout(() => checkBadgeUnlocks(updated), 200);
        return updated;
      });
    }
  }, [currentUser, profile.lastStreakRewardDate, profile.lastActiveDate, profile.streakCount, checkBadgeUnlocks, refreshLeaderboard]);

  // Thêm XP bằng Firestore Transaction, CHỈ hiển thị thông báo nhận thưởng SAU KHI lưu Firestore thành công
  const addXP = useCallback(async (amount: number, reason: string) => {
    const safeAmount = Math.max(0, amount);
    if (safeAmount === 0) return false;

    if (currentUser) {
      try {
        const progress = await awardXPInFirestore(currentUser.uid, { rewardXP: safeAmount });

        // CHỈ hiển thị thông báo thành công và cộng điểm sau khi Firestore xác nhận lưu thành công
        const didLevelUp = progress.level > profile.level;
        if (didLevelUp) soundFX.playLevelUp();
        else soundFX.playSuccess();

        const xpId = 'xp_' + Date.now().toString() + Math.random().toString();
        setFloatingXps(prev => [...prev, { id: xpId, amount: safeAmount, reason }]);
        setTimeout(() => {
          setFloatingXps(prev => prev.filter(item => item.id !== xpId));
        }, 1500);

        setProfile(prev => {
          const updated = {
            ...prev,
            currentXP: progress.currentXP,
            xp: progress.xp,
            level: progress.level,
            nextLevelXP: progress.nextLevelXP,
            title: progress.title
          };
          setTimeout(() => checkBadgeUnlocks(updated), 200);
          return updated;
        });
        refreshLeaderboard();
        return true;
      } catch (err) {
        console.error('Lỗi transaction awardXP:', err);
        // Lưu thất bại: Không hiển thị floating XP sai lệch!
        return false;
      }
    } else {
      // Chế độ Guest: tính toán qua getProgressFromXP
      const newTotalXP = profile.currentXP + safeAmount;
      const progress = getProgressFromXP(newTotalXP);
      const didLevelUp = progress.level > profile.level;
      if (didLevelUp) soundFX.playLevelUp();
      else soundFX.playSuccess();

      const xpId = 'guest_xp_' + Date.now().toString() + Math.random().toString();
      setFloatingXps(prev => [...prev, { id: xpId, amount: safeAmount, reason }]);
      setTimeout(() => {
        setFloatingXps(prev => prev.filter(item => item.id !== xpId));
      }, 1500);

      setProfile(prev => {
        const updated = {
          ...prev,
          currentXP: progress.currentXP,
          xp: progress.xp,
          level: progress.level,
          nextLevelXP: progress.nextLevelXP,
          title: progress.title
        };
        setTimeout(() => checkBadgeUnlocks(updated), 200);
        return updated;
      });
      return true;
    }
  }, [currentUser, profile.level, profile.currentXP, checkBadgeUnlocks, refreshLeaderboard]);

  // BUG-12: Ghi nhận hoàn thành thử thách Vạch lá tìm sâu bằng 1 TRANSACTION DUY NHẤT
  // Gộp cộng XP luyện tập, cập nhật số lỗi ngụy biện VÀ kiểm tra thưởng streak vào cùng 1 transaction,
  // dựa trên dữ liệu Firestore mới nhất (single source of truth), ngăn chặn hoàn toàn race condition hay mất điểm.
  const recordFallacyResult = useCallback(async (
    isCorrect: boolean, 
    score: number,
    details?: { scenarioId?: string; fallacyName?: string; logicScore?: number; identificationScore?: number },
    customXpEarned?: number,
    customReason?: string
  ) => {
    if (isRecordingFallacyRef.current) return;
    isRecordingFallacyRef.current = true;

    try {
      // 1. Xác định XP thưởng luyện tập dựa trên công thức hiện tại
      const fallacyXP = customXpEarned !== undefined 
        ? Math.max(0, customXpEarned) 
        : (isCorrect ? Math.round(score * 1.2) : (score > 0 ? 20 : 0));

      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();

      const historyItem: EvaluatedFallacyRecord | undefined = details ? {
        scenarioId: details.scenarioId || `sc_${Date.now()}`,
        fallacyName: details.fallacyName || 'Lập luận',
        score,
        logicScore: details.logicScore || Math.round(score * 0.4),
        identificationScore: details.identificationScore || (isCorrect ? 30 : 0),
        timestamp: new Date().toISOString()
      } : undefined;

      if (currentUser) {
        try {
          const unlockedIds = Array.from(unlockedBadgeIdsRef.current);
          const progress = await awardXPInFirestore(currentUser.uid, {
            rewardXP: fallacyXP,
            streakBonus: {
              todayDate: today,
              yesterdayDate: yesterday
            },
            fallacyRecord: {
              isCorrect,
              historyItem
            },
            unlockedBadgeIds: unlockedIds
          });

          // Chỉ hiển thị thông báo nhận thưởng SAU KHI transaction Firestore xác nhận thành công
          if (fallacyXP > 0) {
            const xpId = 'fallacy_' + Date.now();
            const reason = customReason || (isCorrect ? `Phát hiện ngụy biện: ${details?.fallacyName || 'Chính xác'}` : 'Hoàn thành bài tập phản biện');
            setFloatingXps(fxp => [...fxp, { id: xpId, amount: fallacyXP, reason }]);
            setTimeout(() => {
              setFloatingXps(fxp => fxp.filter(item => item.id !== xpId));
            }, 1500);
          }

          if (progress.streakAwarded && progress.streakBonusXP) {
            soundFX.playStreakBonus();
            const streakXpId = 'streak_' + Date.now();
            setFloatingXps(fxp => [...fxp, { id: streakXpId, amount: progress.streakBonusXP!, reason: progress.streakMsg || 'Điểm danh ngọn lửa!' }]);
            setTimeout(() => {
              setFloatingXps(fxp => fxp.filter(item => item.id !== streakXpId));
            }, 1500);
          }

          setProfile(prev => {
            const didLevelUp = progress.level > prev.level;
            if (didLevelUp) soundFX.playLevelUp();
            else if (score >= 60 || isCorrect) soundFX.playSuccess();

            const updated: UserProfile = {
              ...prev,
              currentXP: progress.currentXP,
              xp: progress.xp,
              level: progress.level,
              nextLevelXP: progress.nextLevelXP,
              title: progress.title,
              streakCount: progress.streakCount ?? prev.streakCount,
              lastActiveDate: progress.lastActiveDate ?? prev.lastActiveDate,
              lastStreakRewardDate: progress.lastStreakRewardDate ?? prev.lastStreakRewardDate,
              fallaciesIdentified: progress.fallaciesIdentified ?? prev.fallaciesIdentified,
              evaluatedFallaciesHistory: progress.evaluatedFallaciesHistory ?? prev.evaluatedFallaciesHistory
            };

            saveLocalDiagData(prev.id, {
              diagnosticTestA: updated.diagnosticTestA,
              diagnosticTestB: updated.diagnosticTestB,
              evaluatedFallaciesHistory: updated.evaluatedFallaciesHistory
            });

            setTimeout(() => checkBadgeUnlocks(updated, score), 200);
            return updated;
          });

          refreshLeaderboard();
        } catch (err) {
          console.error('Lỗi transaction recordFallacyResult:', err);
        }
      } else {
        // Chế độ Guest
        const guestStreakAwarded = profile.lastStreakRewardDate !== today;
        let guestStreakBonus = 0;
        let guestStreak = profile.streakCount || 1;
        let guestStreakMsg = '';

        if (guestStreakAwarded) {
          const prevDate = profile.lastStreakRewardDate || profile.lastActiveDate;
          if (prevDate === yesterday) {
            guestStreak = (profile.streakCount || 0) + 1;
            guestStreakBonus = Math.min(100, 40 + guestStreak * 10);
            guestStreakMsg = `Duy trì chuỗi ngọn lửa: ${guestStreak} ngày liên tiếp!`;
          } else {
            guestStreak = 1;
            guestStreakBonus = 30;
            guestStreakMsg = 'Khởi động ngọn lửa ngày 1!';
          }
        }

        const totalEarned = fallacyXP + guestStreakBonus;
        const newTotalXP = profile.currentXP + totalEarned;
        const progress = getProgressFromXP(newTotalXP);

        if (fallacyXP > 0) {
          const xpId = 'fallacy_' + Date.now();
          setFloatingXps(fxp => [...fxp, { id: xpId, amount: fallacyXP, reason: customReason || 'Hoàn thành bài tập phản biện' }]);
          setTimeout(() => {
            setFloatingXps(fxp => fxp.filter(item => item.id !== xpId));
          }, 1500);
        }

        if (guestStreakAwarded && guestStreakBonus > 0) {
          soundFX.playStreakBonus();
          const streakXpId = 'streak_' + Date.now();
          setFloatingXps(fxp => [...fxp, { id: streakXpId, amount: guestStreakBonus, reason: guestStreakMsg }]);
          setTimeout(() => {
            setFloatingXps(fxp => fxp.filter(item => item.id !== streakXpId));
          }, 1500);
        }

        setProfile(prev => {
          const newHistory = prev.evaluatedFallaciesHistory ? [...prev.evaluatedFallaciesHistory] : [];
          if (historyItem) newHistory.push(historyItem);

          const updated: UserProfile = {
            ...prev,
            currentXP: progress.currentXP,
            xp: progress.xp,
            level: progress.level,
            nextLevelXP: progress.nextLevelXP,
            title: progress.title,
            fallaciesIdentified: prev.fallaciesIdentified + (isCorrect ? 1 : 0),
            evaluatedFallaciesHistory: newHistory,
            streakCount: guestStreak,
            lastActiveDate: today,
            lastStreakRewardDate: today
          };

          saveLocalDiagData('guest', {
            diagnosticTestA: updated.diagnosticTestA,
            diagnosticTestB: updated.diagnosticTestB,
            evaluatedFallaciesHistory: updated.evaluatedFallaciesHistory
          });

          setTimeout(() => checkBadgeUnlocks(updated, score), 200);
          return updated;
        });
      }

      // Cập nhật tiến độ nhiệm vụ ngày
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
        saveQuestsState(activeUserId, getTodayDateString(), nextQuests, !!currentUser);
        return nextQuests;
      });
    } finally {
      isRecordingFallacyRef.current = false;
    }
  }, [currentUser, profile.level, profile.currentXP, profile.lastStreakRewardDate, profile.lastActiveDate, profile.streakCount, checkBadgeUnlocks, refreshLeaderboard]);

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

  const recordDiagnosticTestResult = useCallback(async (testSet: 'A' | 'B', result: DiagnosticTestResult) => {
    if (isRecordingDiagTestRef.current) return;
    isRecordingDiagTestRef.current = true;

    const key = testSet === 'A' ? 'diagnosticTestA' : 'diagnosticTestB';
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (currentUser) {
      try {
        // Gộp test chẩn đoán (150 XP) và kiểm tra streak vào cùng 1 transaction duy nhất
        const progress = await awardXPInFirestore(currentUser.uid, {
          rewardXP: 150,
          testSetToRecord: {
            testSet,
            result
          },
          streakBonus: {
            todayDate: today,
            yesterdayDate: yesterday
          }
        });

        // CHỈ hiển thị thông báo nhận thưởng sau khi transaction Firestore thành công
        soundFX.playSuccess();
        saveLocalDiagData(currentUser.uid, {
          [key]: result
        });

        const xpId = 'diag_' + Date.now().toString() + Math.random().toString();
        setFloatingXps(prev => [...prev, { id: xpId, amount: 150, reason: `Hoàn thành bài kiểm tra chẩn đoán Bộ ${testSet}!` }]);
        setTimeout(() => {
          setFloatingXps(prev => prev.filter(item => item.id !== xpId));
        }, 1500);

        if (progress.streakAwarded && progress.streakBonusXP) {
          soundFX.playStreakBonus();
          const streakXpId = 'streak_' + Date.now();
          setFloatingXps(fxp => [...fxp, { id: streakXpId, amount: progress.streakBonusXP!, reason: progress.streakMsg || 'Điểm danh ngọn lửa!' }]);
          setTimeout(() => {
            setFloatingXps(fxp => fxp.filter(item => item.id !== streakXpId));
          }, 1500);
        }

        setProfile(prev => {
          const updated = {
            ...prev,
            [key]: result,
            currentXP: progress.currentXP,
            xp: progress.xp,
            level: progress.level,
            nextLevelXP: progress.nextLevelXP,
            title: progress.title,
            streakCount: progress.streakCount ?? prev.streakCount,
            lastActiveDate: progress.lastActiveDate ?? prev.lastActiveDate,
            lastStreakRewardDate: progress.lastStreakRewardDate ?? prev.lastStreakRewardDate
          };
          setTimeout(() => checkBadgeUnlocks(updated), 200);
          return updated;
        });
        refreshLeaderboard();
      } catch (err) {
        console.error('Lỗi lưu kết quả test chẩn đoán qua transaction:', err);
      } finally {
        isRecordingDiagTestRef.current = false;
      }
    } else {
      try {
        saveLocalDiagData('guest', {
          [key]: result
        });
        setProfile(prev => ({
          ...prev,
          [key]: result
        }));
        await addXP(150, `Hoàn thành bài kiểm tra chẩn đoán Bộ ${testSet}!`);
        await updateDailyStreak();
      } finally {
        isRecordingDiagTestRef.current = false;
      }
    }
  }, [currentUser, addXP, updateDailyStreak, checkBadgeUnlocks, refreshLeaderboard]);

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

    const matchId = (typeof outcomeOrWon === 'object' && outcomeOrWon.id)
      ? outcomeOrWon.id
      : `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const newMatch: DebateMatchRecord = {
      id: matchId,
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
      reflectionRewardClaimed: false,
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
        const unlockedIds = Array.from(unlockedBadgeIdsRef.current);
        recordDebateMatchInFirestore(currentUser.uid, newMatch, {
          newXp: newTotalXP,
          newLevel: newLevel,
          newTitle: updated.title,
          nextLevelXP: currentCap,
          newTotalDebates: newTotalDebates,
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
      saveQuestsState(activeUserId, getTodayDateString(), nextQuests, !!currentUser);
      return nextQuests;
    });

    return matchId;
  }, [currentUser, badges, updateDailyStreak, checkBadgeUnlocks, refreshLeaderboard]);

  // Lưu phản tư sau trận đấu (BUG-16): Cập nhật trường reflection vào bản ghi trận đấu đã có
  // Chỉ cộng 25 XP đúng 1 lần duy nhất cho mỗi trận đấu (Idempotent & Atomic)
  const saveDebateReflection = useCallback(async (
    matchId: string,
    reflection: PostMatchReflection
  ): Promise<boolean> => {
    if (!matchId) return false;

    // Khóa tránh gửi đồng thời (Multi-click lock)
    if (reflectionRewardInFlightRef.current[matchId]) {
      return false;
    }

    const claimStorageKey = `gokien_reflection_claimed_${currentUser ? currentUser.uid : 'guest'}_${matchId}`;
    let isAlreadyClaimedLocally = false;
    try {
      isAlreadyClaimedLocally = localStorage.getItem(claimStorageKey) === '1';
    } catch {}
    const isAlreadyClaimed = isAlreadyClaimedLocally || claimedReflectionMatchIdsRef.current.has(matchId);

    // Kiểm tra trong debateHistory
    const targetMatch = debateHistory.find(m => m.id === matchId);
    if (targetMatch?.reflectionRewardClaimed || isAlreadyClaimed) {
      // Đã nhận thưởng rồi -> Chỉ cập nhật nội dung phản tư, không cộng XP lần 2
      setDebateHistory(prev => prev.map(m => 
        m.id === matchId ? { ...m, reflection, reflectionRewardClaimed: true } : m
      ));
      if (currentUser) {
        updateDebateMatchReflectionInFirestore(currentUser.uid, matchId, reflection).catch(() => {});
      }
      return true;
    }

    reflectionRewardInFlightRef.current[matchId] = true;

    try {
      const REFLECTION_XP = 25;

      // Cộng 25 XP qua addXP (Đã có transaction Firestore an toàn và cập nhật leaderboard)
      const success = await addXP(REFLECTION_XP, 'Hoàn thành phản tư sau trận đấu (+25 XP)');
      if (!success) {
        // Lưu thất bại: không đánh dấu thành công
        return false;
      }

      // Đánh dấu đã nhận thưởng
      claimedReflectionMatchIdsRef.current.add(matchId);
      try {
        localStorage.setItem(claimStorageKey, '1');
      } catch {}

      // Cập nhật reflection và cờ reflectionRewardClaimed vào state debateHistory
      setDebateHistory(prev => prev.map(m => 
        m.id === matchId ? { ...m, reflection, reflectionRewardClaimed: true } : m
      ));

      // Thử cập nhật tài liệu match trên Firestore (graceful fallback nếu rules chặn)
      if (currentUser) {
        updateDebateMatchReflectionInFirestore(currentUser.uid, matchId, reflection).catch(err => {
          console.warn('[GamificationContext] Ghi chú: Không thể cập nhật trực tiếp subcollection matches trên Firestore do rules hiện tại (allow update: if false). Dữ liệu phản tư và 25 XP đã được bảo toàn an toàn trong user doc và session state:', err);
        });
      }

      return true;
    } catch (err) {
      console.error('[GamificationContext] Lỗi khi lưu phản tư:', err);
      return false;
    } finally {
      delete reflectionRewardInFlightRef.current[matchId];
    }
  }, [currentUser, debateHistory, addXP]);

  const claimQuest = useCallback(async (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    // Fix Lỗi 3 & P1: Ngăn chặn nhận thưởng nhiều lần bằng Transaction và in-flight lock
    if (!quest || !quest.isCompleted || quest.isClaimed) return;
    if (claimingQuestIdsRef.current.has(questId)) return;
    claimingQuestIdsRef.current.add(questId);

    const today = getTodayDateString();

    try {
      if (currentUser) {
        try {
          const updatedQuests = quests.map(q => q.id === questId ? { ...q, isClaimed: true } : q);
          const progress = await awardXPInFirestore(currentUser.uid, {
            rewardXP: quest.rewardXP,
            questIdToClaim: questId,
            todayDate: today,
            dailyQuestsToUpdate: {
              date: today,
              quests: updatedQuests.map(q => ({
                id: q.id,
                currentCount: q.currentCount,
                isCompleted: q.isCompleted,
                isClaimed: q.isClaimed
              }))
            }
          });

          // CHỈ hiển thị thông báo thành công và cập nhật UI sau khi transaction thành công
          soundFX.playSuccess();
          setQuests(updatedQuests);
          saveQuestsState(currentUser.uid, today, updatedQuests, false);

          const xpId = 'quest_' + Date.now().toString() + Math.random().toString();
          setFloatingXps(prev => [...prev, { id: xpId, amount: quest.rewardXP, reason: `Nhiệm vụ: ${quest.title}` }]);
          setTimeout(() => {
            setFloatingXps(prev => prev.filter(item => item.id !== xpId));
          }, 1500);

          setProfile(prev => {
            const updated = {
              ...prev,
              currentXP: progress.currentXP,
              xp: progress.xp,
              level: progress.level,
              nextLevelXP: progress.nextLevelXP,
              title: progress.title,
              claimedQuestIds: progress.claimedQuestIds,
              lastQuestDate: progress.lastQuestDate
            };
            setTimeout(() => checkBadgeUnlocks(updated), 200);
            return updated;
          });
          refreshLeaderboard();
        } catch (err) {
          console.error('Lỗi nhận thưởng nhiệm vụ qua transaction:', err);
        }
      } else {
        // Chế độ Guest
        const updatedQuests = quests.map(q => q.id === questId ? { ...q, isClaimed: true } : q);
        setQuests(updatedQuests);
        saveQuestsState('guest', today, updatedQuests);
        await addXP(quest.rewardXP, `Nhiệm vụ: ${quest.title}`);
      }

      await updateDailyStreak();
    } finally {
      claimingQuestIdsRef.current.delete(questId);
    }
  }, [quests, currentUser, addXP, updateDailyStreak, checkBadgeUnlocks, refreshLeaderboard]);

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

  // Fix P2: Đặt lại toàn bộ tiến độ thật sự (cả Firestore users, leaderboard, matches và localStorage)
  const resetProgress = useCallback(async (): Promise<void> => {
    if (currentUser) {
      try {
        await resetUserProfileInFirestore(currentUser.uid);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`tri_tue_phan_bien_quests_${currentUser.uid}`);
          localStorage.removeItem(`tri_tue_phan_bien_diag_${currentUser.uid}`);
        }
        await refreshLeaderboard();
      } catch (err) {
        console.error('Lỗi khi đặt lại hồ sơ trên Firestore:', err);
        throw err;
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tri_tue_phan_bien_quests_guest');
        localStorage.removeItem('tri_tue_phan_bien_diag_guest');
      }
    }

    unlockedBadgeIdsRef.current = new Set();
    claimedReflectionMatchIdsRef.current.clear();
    reflectionRewardInFlightRef.current = {};
    setProfile(prev => ({
      ...GUEST_PROFILE,
      id: currentUser ? currentUser.uid : 'guest',
      name: prev.name,
      school: prev.school,
      email: prev.email,
      avatarSeed: prev.avatarSeed,
      diagnosticTestA: undefined,
      diagnosticTestB: undefined,
      evaluatedFallaciesHistory: []
    }));
    setBadges(INITIAL_BADGES.map(b => ({ ...b, isUnlocked: false })));
    setQuests(INITIAL_QUESTS);
    setDebateHistory([]);
  }, [currentUser, refreshLeaderboard]);

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
        saveDebateReflection,
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DỊCH VỤ FIREBASE AUTHENTICATION & FIRESTORE
 * Kết nối Google Sign-in và đồng bộ hồ sơ, điểm XP, bảng xếp hạng và lịch sử trận đấu.
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  getDocFromServer,
  writeBatch,
  runTransaction,
  deleteDoc,
  deleteField,
  arrayUnion
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, LeaderboardUser, DebateMatchRecord, DiagnosticTestResult, DailyQuest, EvaluatedFallacyRecord, PostMatchReflection } from '../types';
import { getProgressFromXP } from '../utils/levelSystem';

// Khởi tạo Firebase App và Firestore kết nối đúng database ID
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Kiểm tra kết nối Firestore khi khởi động theo chuẩn skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Phân loại thao tác theo chuẩn Firestore Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. Đăng nhập với tài khoản Google
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// 2. Đăng xuất tài khoản
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// 3. Tải hồ sơ học sinh từ Firestore (/users/{userId})
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      const raw = docSnap.data() as any;
      const name = raw.name || raw.displayName || (raw.email ? raw.email.split('@')[0] : '') || 'Học sinh';
      const school = raw.school || raw.schoolClass || '11A1';
      // Tính lại toàn bộ Level, Title và NextLevelXP từ nguồn chân lý duy nhất (getProgressFromXP)
      const currentXP = Math.max(Number(raw.currentXP || 0), Number(raw.xp || 0));
      const progress = getProgressFromXP(currentXP);

      const profile: UserProfile = {
        id: userId,
        username: raw.username || (raw.email ? raw.email.split('@')[0] : 'hocsinh'),
        email: raw.email || undefined,
        name,
        school,
        avatarSeed: raw.avatarSeed || userId.slice(0, 5),
        level: progress.level,
        currentXP: progress.currentXP,
        xp: progress.xp,
        nextLevelXP: progress.nextLevelXP,
        title: progress.title,
        totalDebates: Number(raw.totalDebates ?? ((raw.debatesWon || 0) + (raw.debatesLost || 0))),
        debatesWon: Number(raw.debatesWon || 0),
        fallaciesIdentified: Number(raw.fallaciesIdentified || 0),
        unlockedBadgeIds: Array.isArray(raw.unlockedBadgeIds) ? raw.unlockedBadgeIds : [],
        soundEnabled: raw.soundEnabled !== false,
        screenShakeEnabled: raw.screenShakeEnabled !== false,
        geminiApiKey: raw.geminiApiKey || '',
        aiEngineMode: raw.aiEngineMode || 'gemini_cloud',
        streakCount: Math.max(1, Number(raw.streakCount || 1)),
        lastActiveDate: raw.lastActiveDate || new Date().toISOString().slice(0, 10),
        lastStreakRewardDate: raw.lastStreakRewardDate || undefined,
        claimedQuestIds: Array.isArray(raw.claimedQuestIds) ? raw.claimedQuestIds : [],
        lastQuestDate: raw.lastQuestDate || undefined,
        dailyQuests: raw.dailyQuests,
        diagnosticTestA: raw.diagnosticTestA,
        diagnosticTestB: raw.diagnosticTestB,
        evaluatedFallaciesHistory: Array.isArray(raw.evaluatedFallaciesHistory) ? raw.evaluatedFallaciesHistory : []
      };
      return profile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// 4. Khởi tạo hồ sơ học sinh mới lần đầu đăng nhập Google
export async function createInitialUserProfile(
  user: FirebaseUser, 
  schoolClass: string = '11A1'
): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  const leaderboardPath = `leaderboard/${user.uid}`;
  const fallbackName = user.displayName || (user.email ? user.email.split('@')[0] : '') || 'Học Sinh THPT';
  const newProfile: UserProfile = {
    id: user.uid,
    username: user.email ? user.email.split('@')[0] : 'hocsinh',
    email: user.email || undefined,
    name: fallbackName,
    school: schoolClass,
    avatarSeed: user.uid.slice(0, 5),
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
    lastActiveDate: new Date().toISOString().slice(0, 10),
    lastStreakRewardDate: new Date().toISOString().slice(0, 10)
  };

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', user.uid), {
      id: user.uid,
      name: newProfile.name,
      displayName: newProfile.name,
      school: schoolClass,
      schoolClass: schoolClass,
      email: user.email || '',
      avatarSeed: newProfile.avatarSeed,
      level: 1,
      xp: 0,
      currentXP: 0,
      nextLevelXP: 300,
      title: 'Tập sự phản biện',
      totalDebates: 0,
      debatesWon: 0,
      fallaciesIdentified: 0,
      unlockedBadgeIds: [],
      streakCount: 1,
      lastActiveDate: newProfile.lastActiveDate,
      lastStreakRewardDate: newProfile.lastStreakRewardDate,
      soundEnabled: true,
      screenShakeEnabled: true
    });

    batch.set(doc(db, 'leaderboard', user.uid), {
      id: user.uid,
      name: newProfile.name,
      displayName: newProfile.name,
      schoolClass: schoolClass,
      avatarSeed: newProfile.avatarSeed,
      level: 1,
      xp: 0,
      title: 'Tập sự phản biện',
      debatesWon: 0,
      fallaciesFound: 0
    });

    await batch.commit();
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return newProfile;
  }
}

// 5. Cập nhật thông tin cá nhân (Tên, Lớp, Cài đặt)
export async function updateUserSettings(
  userId: string,
  settings: {
    displayName?: string;
    schoolClass?: string;
    avatarSeed?: string;
    soundEnabled?: boolean;
    screenShakeEnabled?: boolean;
    lastActiveDate?: string;
    streakCount?: number;
  }
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', userId);
    const userUpdates: Record<string, any> = { ...settings };
    if (settings.displayName) {
      userUpdates.name = settings.displayName;
    }
    if (settings.schoolClass) {
      userUpdates.school = settings.schoolClass;
    }
    batch.update(userRef, userUpdates);

    // Đồng bộ tên và lớp sang leaderboard
    const lbUpdates: Record<string, any> = {};
    if (settings.displayName) {
      lbUpdates.displayName = settings.displayName;
      lbUpdates.name = settings.displayName;
    }
    if (settings.schoolClass) lbUpdates.schoolClass = settings.schoolClass;
    if (settings.avatarSeed) lbUpdates.avatarSeed = settings.avatarSeed;

    if (Object.keys(lbUpdates).length > 0) {
      batch.update(doc(db, 'leaderboard', userId), lbUpdates);
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export interface RecordDebateMatchResult {
  currentXP: number;
  xp: number;
  level: number;
  nextLevelXP: number;
  title: string;
  totalDebates: number;
  debatesWon: number;
  streakCount: number;
  lastActiveDate: string;
  unlockedBadgeIds?: string[];
}

// 6. Ghi nhận kết quả trận đấu nguyên tử qua Firestore Transaction
export async function recordDebateMatchInFirestore(
  userId: string,
  match: DebateMatchRecord,
  options?: {
    unlockedBadgeIds?: string[];
  }
): Promise<RecordDebateMatchResult> {
  const matchPath = `users/${userId}/matches/${match.id}`;
  try {
    return await runTransaction(db, async (tx) => {
      const userRef = doc(db, 'users', userId);
      const matchRef = doc(db, 'users', userId, 'matches', match.id);
      const lbRef = doc(db, 'leaderboard', userId);

      // 1. Đọc dữ liệu mới nhất từ Firestore transaction trước khi ghi
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists()) {
        throw new Error('User document not found in Firestore');
      }
      const matchSnap = await tx.get(matchRef);
      const userData = userSnap.data();

      // Kiểm tra tính lũy đọng (Idempotency): Tránh ghi đúp trận đấu nếu matchId đã tồn tại
      if (matchSnap.exists() || userData.lastMatchId === match.id) {
        console.warn(`[recordDebateMatchInFirestore] Match ${match.id} đã được ghi nhận trước đó. Bỏ qua ghi đúp.`);
        const currentXP = Math.max(Number(userData.xp || 0), Number(userData.currentXP || 0));
        const progress = getProgressFromXP(currentXP);
        return {
          ...progress,
          totalDebates: Number(userData.totalDebates || 0),
          debatesWon: Number(userData.debatesWon || 0),
          streakCount: Number(userData.streakCount || 1),
          lastActiveDate: userData.lastActiveDate || new Date().toISOString().slice(0, 10),
          unlockedBadgeIds: userData.unlockedBadgeIds || []
        };
      }

      // 2. Đọc XP mới nhất từ server - Ngăn chặn dữ liệu React state cũ ghi đè
      const currentServerXP = Math.max(Number(userData.xp || 0), Number(userData.currentXP || 0));
      const xpEarned = Math.max(0, match.xpEarned || 0);
      const newXp = currentServerXP + xpEarned;
      const progress = getProgressFromXP(newXp);

      const currentTotalDebates = Number(userData.totalDebates || 0);
      const currentDebatesWon = Number(userData.debatesWon || 0);
      const won = match.outcome === 'victory';
      const newTotalDebates = currentTotalDebates + 1;
      const newDebatesWon = currentDebatesWon + (won ? 1 : 0);

      const today = new Date().toISOString().slice(0, 10);
      const streakCount = Number(userData.streakCount || 1);

      // 3. Chuẩn bị bản ghi trận đấu
      const matchData: Record<string, any> = {
        id: match.id,
        userId: userId,
        topicMotion: (match.topicMotion || 'Tranh biện học đường').slice(0, 500),
        studentSide: match.studentSide || 'pro',
        outcome: match.outcome,
        studentHp: Number(match.studentHp ?? 0),
        aiHp: Number(match.aiHp ?? 0),
        xpEarned: xpEarned,
        roundsCompleted: Math.min(10, Math.max(1, Number(match.roundsCompleted || 4))),
        personaName: (match.personaName || 'AI Debater').slice(0, 100),
        date: match.date || today,
        timestamp: match.timestamp || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      if (match.reflection) {
        matchData.reflection = match.reflection;
      }
      if (match.reflectionRewardClaimed !== undefined) {
        matchData.reflectionRewardClaimed = match.reflectionRewardClaimed;
      }

      // 4. Chuẩn bị cập nhật hồ sơ người dùng (tuân thủ nghiêm ngặt Branch 2 affectedKeys trong firestore.rules)
      const userUpdates: Record<string, any> = {
        xp: newXp,
        currentXP: newXp,
        level: progress.level,
        nextLevelXP: progress.nextLevelXP,
        title: progress.title,
        totalDebates: newTotalDebates,
        debatesWon: newDebatesWon,
        streakCount: streakCount,
        lastActiveDate: today,
        lastMatchId: match.id
      };
      if (userData.lastStreakRewardDate) {
        userUpdates.lastStreakRewardDate = userData.lastStreakRewardDate;
      }
      if (options?.unlockedBadgeIds && options.unlockedBadgeIds.length > 0) {
        userUpdates.unlockedBadgeIds = arrayUnion(...options.unlockedBadgeIds);
      }

      // 5. Ghi nhận nguyên tử: match record + user profile + leaderboard
      tx.set(matchRef, matchData);
      tx.update(userRef, userUpdates);

      const lbUpdates: Record<string, any> = {
        xp: newXp,
        level: progress.level,
        title: progress.title,
        debatesWon: newDebatesWon
      };
      tx.update(lbRef, lbUpdates);

      return {
        ...progress,
        totalDebates: newTotalDebates,
        debatesWon: newDebatesWon,
        streakCount: streakCount,
        lastActiveDate: today,
        unlockedBadgeIds: options?.unlockedBadgeIds
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, matchPath);
    throw error;
  }
}

export interface SaveReflectionResult {
  claimedReward: boolean;
  xpEarned: number;
  newXP: number;
  level: number;
  nextLevelXP: number;
  title: string;
}

/**
 * 6b. Lưu phản tư sau trận đấu và nhận thưởng 25 XP nguyên tử qua Transaction (BUG-16)
 * - Đọc matchRef, userRef, lbRef trước
 * - Kiểm tra match thuộc đúng user
 * - Kiểm tra reflectionRewardClaimed
 * - Nếu chưa nhận: tx.update(matchRef), tx.update(userRef, +25 XP), tx.update(lbRef, +25 XP)
 * - Nếu đã nhận: chỉ tx.update(matchRef, { reflection }), không cộng XP
 */
export async function saveReflectionAndRewardInFirestore(
  userId: string,
  matchId: string,
  reflection: PostMatchReflection
): Promise<SaveReflectionResult> {
  const matchPath = `users/${userId}/matches/${matchId}`;
  try {
    return await runTransaction(db, async (tx) => {
      const matchRef = doc(db, 'users', userId, 'matches', matchId);
      const userRef = doc(db, 'users', userId);
      const lbRef = doc(db, 'leaderboard', userId);

      // 1. ĐỌC DỮ LIỆU TRƯỚC (READS FIRST)
      const matchSnap = await tx.get(matchRef);
      if (!matchSnap.exists()) {
        throw new Error('Không tìm thấy bản ghi trận đấu.');
      }

      const userSnap = await tx.get(userRef);
      if (!userSnap.exists()) {
        throw new Error('Không tìm thấy hồ sơ người dùng.');
      }

      const matchData = matchSnap.data();
      const userData = userSnap.data();

      // Xác thực quyền sở hữu
      if (matchData.userId && matchData.userId !== userId) {
        throw new Error('Bạn không có quyền cập nhật phản tư cho trận đấu này.');
      }

      const alreadyClaimed = matchData.reflectionRewardClaimed === true;
      const currentServerXP = Math.max(Number(userData.xp || 0), Number(userData.currentXP || 0));

      let newXP = currentServerXP;
      let xpEarned = 0;
      let claimedReward = false;

      if (!alreadyClaimed) {
        xpEarned = 25;
        newXP = currentServerXP + 25;
        claimedReward = true;
      }

      const progress = getProgressFromXP(newXP);

      // 2. GHI NGUYÊN TỬ (WRITES)
      if (claimedReward) {
        tx.update(matchRef, {
          reflection,
          reflectionRewardClaimed: true
        });

        tx.update(userRef, {
          xp: newXP,
          currentXP: newXP,
          level: progress.level,
          nextLevelXP: progress.nextLevelXP,
          title: progress.title
        });

        tx.update(lbRef, {
          xp: newXP,
          level: progress.level,
          title: progress.title
        });
      } else {
        // Đã nhận thưởng trước đó: chỉ cập nhật nội dung reflection, không đổi XP
        tx.update(matchRef, {
          reflection
        });
      }

      return {
        claimedReward,
        xpEarned,
        newXP,
        level: progress.level,
        nextLevelXP: progress.nextLevelXP,
        title: progress.title
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, matchPath);
    throw error;
  }
}

/**
 * Cập nhật phản tư sau trận đấu vào tài liệu match trên Firestore (Wrapper tương thích)
 */
export async function updateDebateMatchReflectionInFirestore(
  userId: string,
  matchId: string,
  reflection: PostMatchReflection
): Promise<boolean> {
  try {
    await saveReflectionAndRewardInFirestore(userId, matchId, reflection);
    return true;
  } catch {
    return false;
  }
}

// 7. Ghi nhận kết quả vạch lá tìm sâu nguyên tử
export async function recordFallacyInFirestore(
  userId: string,
  updatedData: {
    newXp: number;
    newLevel: number;
    newTitle: string;
    nextLevelXP?: number;
    newFallaciesIdentified: number;
    evaluatedFallaciesHistory?: EvaluatedFallacyRecord[];
    unlockedBadgeIds: string[];
    streakCount: number;
    lastActiveDate: string;
  }
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', userId);
    const userUpdates: Record<string, any> = {
      xp: updatedData.newXp,
      currentXP: updatedData.newXp, // Đồng bộ tuyệt đối cả xp và currentXP
      level: updatedData.newLevel,
      title: updatedData.newTitle,
      fallaciesIdentified: updatedData.newFallaciesIdentified,
      ...(Array.isArray(updatedData.unlockedBadgeIds) && updatedData.unlockedBadgeIds.length > 0
        ? { unlockedBadgeIds: arrayUnion(...updatedData.unlockedBadgeIds) }
        : {}),
      streakCount: updatedData.streakCount,
      lastActiveDate: updatedData.lastActiveDate
    };
    if (updatedData.nextLevelXP !== undefined) {
      userUpdates.nextLevelXP = updatedData.nextLevelXP;
    }
    if (updatedData.evaluatedFallaciesHistory !== undefined) {
      userUpdates.evaluatedFallaciesHistory = updatedData.evaluatedFallaciesHistory;
    }
    batch.update(userRef, userUpdates);

    const lbRef = doc(db, 'leaderboard', userId);
    batch.update(lbRef, {
      xp: updatedData.newXp,
      level: updatedData.newLevel,
      title: updatedData.newTitle,
      fallaciesFound: updatedData.newFallaciesIdentified
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 8. Đồng bộ hóa XP và tiến độ học tập (Streak ngọn lửa, Nhiệm vụ ngày, Bài test chẩn đoán, Cờ cá ngựa)
export async function syncUserProgressToFirestore(
  userId: string,
  progress: {
    newXp: number;
    newLevel: number;
    newTitle: string;
    nextLevelXP?: number;
    streakCount?: number;
    lastActiveDate?: string;
    claimedQuestIds?: string[];
    lastQuestDate?: string;
    unlockedBadgeIds?: string[];
    diagnosticTestA?: DiagnosticTestResult;
    diagnosticTestB?: DiagnosticTestResult;
  }
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', userId);
    const userUpdates: Record<string, any> = {
      xp: progress.newXp,
      currentXP: progress.newXp,
      level: progress.newLevel,
      title: progress.newTitle
    };
    if (progress.nextLevelXP !== undefined) userUpdates.nextLevelXP = progress.nextLevelXP;
    if (progress.streakCount !== undefined) userUpdates.streakCount = progress.streakCount;
    if (progress.lastActiveDate !== undefined) userUpdates.lastActiveDate = progress.lastActiveDate;
    if (progress.claimedQuestIds !== undefined) userUpdates.claimedQuestIds = progress.claimedQuestIds;
    if (progress.lastQuestDate !== undefined) userUpdates.lastQuestDate = progress.lastQuestDate;
    if (progress.unlockedBadgeIds !== undefined) userUpdates.unlockedBadgeIds = progress.unlockedBadgeIds;
    if (progress.diagnosticTestA !== undefined) userUpdates.diagnosticTestA = progress.diagnosticTestA;
    if (progress.diagnosticTestB !== undefined) userUpdates.diagnosticTestB = progress.diagnosticTestB;

    batch.update(userRef, userUpdates);

    const lbRef = doc(db, 'leaderboard', userId);
    batch.update(lbRef, {
      xp: progress.newXp,
      level: progress.newLevel,
      title: progress.newTitle
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export interface AwardXPOptions {
  rewardXP: number;
  questIdToClaim?: string;
  todayDate?: string;
  dailyQuestsToUpdate?: {
    date: string;
    quests: {
      id: string;
      currentCount: number;
      isCompleted: boolean;
      isClaimed: boolean;
    }[];
  };
  testSetToRecord?: {
    testSet: 'A' | 'B';
    result: DiagnosticTestResult;
  };
  streakBonus?: {
    streakCount?: number;
    todayDate?: string;
    yesterdayDate?: string;
    lastActiveDate?: string;
  };
  unlockedBadgeIds?: string[];
  fallacyRecord?: {
    isCorrect: boolean;
    historyItem?: EvaluatedFallacyRecord;
  };
}

/**
 * 9. Cộng điểm XP và cập nhật tiến trình bằng Firestore Transaction
 * Đọc XP mới nhất từ server, ngăn chặn mất điểm khi thao tác liên tiếp
 * và bảo đảm chống nhận thưởng 2 lần cho nhiệm vụ/bài kiểm tra/streak/bài tập ngụy biện.
 */
export async function awardXPInFirestore(
  userId: string,
  options: AwardXPOptions
): Promise<{
  currentXP: number;
  xp: number;
  level: number;
  nextLevelXP: number;
  title: string;
  streakAwarded?: boolean;
  streakBonusXP?: number;
  streakMsg?: string;
  lastStreakRewardDate?: string;
  claimedQuestIds?: string[];
  lastQuestDate?: string;
  dailyQuests?: {
    date: string;
    quests: {
      id: string;
      currentCount: number;
      isCompleted: boolean;
      isClaimed: boolean;
    }[];
  };
  streakCount?: number;
  lastActiveDate?: string;
  unlockedBadgeIds?: string[];
  diagnosticTestA?: DiagnosticTestResult;
  diagnosticTestB?: DiagnosticTestResult;
  fallaciesIdentified?: number;
  evaluatedFallaciesHistory?: EvaluatedFallacyRecord[];
}> {
  const path = `users/${userId}`;
  try {
    return await runTransaction(db, async (tx) => {
      const userRef = doc(db, 'users', userId);
      const leaderboardRef = doc(db, 'leaderboard', userId);

      const snapshot = await tx.get(userRef);
      if (!snapshot.exists()) {
        throw new Error('User not found');
      }

      const userData = snapshot.data();

      // Kiểm tra chống nhận thưởng nhiệm vụ 2 lần trong cùng transaction
      let updatedClaimedIds = Array.isArray(userData.claimedQuestIds) ? [...userData.claimedQuestIds] : [];
      let updatedLastQuestDate = userData.lastQuestDate;

      if (options.questIdToClaim) {
        const today = options.todayDate || new Date().toISOString().slice(0, 10);
        // Nếu trong cùng ngày và nhiệm vụ đã nhận thưởng -> Chặn không cho nhận lại
        if (userData.lastQuestDate === today && updatedClaimedIds.includes(options.questIdToClaim)) {
          throw new Error('Nhiệm vụ này đã được nhận thưởng trong ngày');
        }
        if (userData.lastQuestDate !== today) {
          updatedClaimedIds = [options.questIdToClaim];
          updatedLastQuestDate = today;
        } else {
          updatedClaimedIds.push(options.questIdToClaim);
          updatedLastQuestDate = today;
        }
      }

      // BUG-10 & BUG-12: Chuyển toàn bộ việc xác định ngày nhận thưởng, tính chuỗi ngày liên tiếp và số XP thưởng VÀO TRANSACTION
      let streakAwarded = false;
      let streakBonusXP = 0;
      let streakMsg = '';
      let updatedStreakCount = Number(userData.streakCount) || 1;
      let updatedLastActiveDate = userData.lastActiveDate;
      let updatedLastStreakRewardDate = userData.lastStreakRewardDate;

      if (options.streakBonus) {
        const streakToday = options.streakBonus.todayDate || options.streakBonus.lastActiveDate || options.todayDate || new Date().toISOString().slice(0, 10);

        // 1. Kiểm tra ngày đã nhận thưởng ngay trong transaction đọc từ Firestore
        if (userData.lastStreakRewardDate === streakToday) {
          // Đã nhận thưởng streak hôm nay rồi -> không cộng lại
          streakAwarded = false;
          streakBonusXP = 0;
        } else {
          streakAwarded = true;
          // Tính chuỗi ngày liên tiếp hoàn toàn dựa trên dữ liệu mới nhất từ Firestore
          let computedYesterday = options.streakBonus.yesterdayDate;
          if (!computedYesterday) {
            const d = new Date(streakToday);
            d.setDate(d.getDate() - 1);
            computedYesterday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          }

          const prevDate = userData.lastStreakRewardDate || userData.lastActiveDate;
          const currentStreak = Math.max(0, Number(userData.streakCount || 0));

          if (prevDate === computedYesterday) {
            updatedStreakCount = currentStreak + 1;
            streakBonusXP = Math.min(100, 40 + updatedStreakCount * 10);
            streakMsg = `Duy trì chuỗi ngọn lửa: ${updatedStreakCount} ngày liên tiếp!`;
          } else {
            updatedStreakCount = 1;
            streakBonusXP = 30;
            streakMsg = 'Khởi động ngọn lửa ngày 1!';
          }

          updatedLastActiveDate = streakToday;
          updatedLastStreakRewardDate = streakToday;
        }
      }

      // BUG-12: Xử lý cập nhật số lỗi ngụy biện và lịch sử luyện tập ngay trong cùng transaction
      let updatedFallaciesIdentified = Number(userData.fallaciesIdentified) || 0;
      let updatedFallaciesHistory = Array.isArray(userData.evaluatedFallaciesHistory)
        ? [...userData.evaluatedFallaciesHistory]
        : [];

      if (options.fallacyRecord) {
        if (options.fallacyRecord.isCorrect) {
          updatedFallaciesIdentified += 1;
        }
        if (options.fallacyRecord.historyItem) {
          updatedFallaciesHistory.push(options.fallacyRecord.historyItem);
        }
      }

      // Đọc XP mới nhất từ Firestore transaction
      const currentXP = Math.max(Number(userData.xp || 0), Number(userData.currentXP || 0));
      // Base XP từ bài tập ngụy biện / nhiệm vụ / kiểm tra chẩn đoán
      const baseRewardXP = Math.max(0, options.rewardXP || 0);
      const totalRewardXP = baseRewardXP + (streakAwarded ? streakBonusXP : 0);
      const newXP = currentXP + totalRewardXP;
      const progress = getProgressFromXP(newXP);

      const userUpdates: Record<string, any> = {
        xp: newXP,
        currentXP: newXP,
        level: progress.level,
        nextLevelXP: progress.nextLevelXP,
        title: progress.title
      };

      if (options.fallacyRecord) {
        userUpdates.fallaciesIdentified = updatedFallaciesIdentified;
        userUpdates.evaluatedFallaciesHistory = updatedFallaciesHistory;
      }

      if (options.questIdToClaim) {
        userUpdates.claimedQuestIds = updatedClaimedIds;
        userUpdates.lastQuestDate = updatedLastQuestDate;
      }

      if (options.dailyQuestsToUpdate) {
        userUpdates.dailyQuests = options.dailyQuestsToUpdate;
      }

      if (options.streakBonus) {
        userUpdates.lastActiveDate = updatedLastActiveDate;
        if (streakAwarded) {
          userUpdates.streakCount = updatedStreakCount;
          userUpdates.lastStreakRewardDate = updatedLastStreakRewardDate;
        }
      }

      // Sử dụng arrayUnion để không bao giờ ghi đè danh sách huy hiệu
      if (options.unlockedBadgeIds && options.unlockedBadgeIds.length > 0) {
        userUpdates.unlockedBadgeIds = arrayUnion(...options.unlockedBadgeIds);
      }

      let diagA = userData.diagnosticTestA;
      let diagB = userData.diagnosticTestB;
      if (options.testSetToRecord) {
        if (options.testSetToRecord.testSet === 'A') {
          userUpdates.diagnosticTestA = options.testSetToRecord.result;
          diagA = options.testSetToRecord.result;
        } else {
          userUpdates.diagnosticTestB = options.testSetToRecord.result;
          diagB = options.testSetToRecord.result;
        }
      }

      tx.update(userRef, userUpdates);

      const lbUpdates: Record<string, any> = {
        xp: newXP,
        level: progress.level,
        title: progress.title
      };
      if (options.fallacyRecord) {
        lbUpdates.fallaciesFound = updatedFallaciesIdentified;
      }
      tx.update(leaderboardRef, lbUpdates);

      return {
        ...progress,
        streakAwarded,
        streakBonusXP,
        streakMsg,
        lastStreakRewardDate: userUpdates.lastStreakRewardDate || userData.lastStreakRewardDate,
        claimedQuestIds: userUpdates.claimedQuestIds,
        lastQuestDate: userUpdates.lastQuestDate,
        dailyQuests: userUpdates.dailyQuests || userData.dailyQuests,
        streakCount: userUpdates.streakCount ?? userData.streakCount,
        lastActiveDate: userUpdates.lastActiveDate ?? userData.lastActiveDate,
        unlockedBadgeIds: userUpdates.unlockedBadgeIds,
        diagnosticTestA: diagA,
        diagnosticTestB: diagB,
        fallaciesIdentified: options.fallacyRecord ? updatedFallaciesIdentified : userData.fallaciesIdentified,
        evaluatedFallaciesHistory: options.fallacyRecord ? updatedFallaciesHistory : userData.evaluatedFallaciesHistory
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * 10. Lưu tiến độ nhiệm vụ hàng ngày lên Firestore
 * KHÔNG tự ý cập nhật lastActiveDate để bảo toàn logic kiểm tra Streak
 */
export async function saveDailyQuestsInFirestore(
  userId: string,
  quests: DailyQuest[],
  date: string
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      dailyQuests: {
        date,
        quests: quests.map(q => ({
          id: q.id,
          currentCount: q.currentCount,
          isCompleted: q.isCompleted,
          isClaimed: q.isClaimed
        }))
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * 11. Lưu danh sách huy hiệu đã mở khóa vào Firestore
 */
export async function saveUnlockedBadgesInFirestore(
  userId: string,
  badgeIds: string[]
): Promise<void> {
  const path = `users/${userId}`;
  try {
    if (!badgeIds || badgeIds.length === 0) return;
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      unlockedBadgeIds: arrayUnion(...badgeIds)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * 12. Đặt lại toàn bộ tiến độ cá nhân của học sinh (Reset Progress)
 * Cập nhật users, leaderboard về Level 1 / 0 XP, xóa lịch sử trận đấu và xóa bài kiểm tra diagnosticTestA/B.
 */
export async function resetUserProfileInFirestore(userId: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const batch = writeBatch(db);

    // 1. Reset tài liệu users bao gồm xóa diagnosticTestA và diagnosticTestB
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      xp: 0,
      currentXP: 0,
      level: 1,
      nextLevelXP: 300,
      title: 'Tập sự phản biện',
      totalDebates: 0,
      debatesWon: 0,
      fallaciesIdentified: 0,
      unlockedBadgeIds: [],
      streakCount: 1,
      lastActiveDate: today,
      lastStreakRewardDate: today,
      claimedQuestIds: [],
      lastQuestDate: today,
      dailyQuests: { date: today, quests: [] },
      evaluatedFallaciesHistory: [],
      diagnosticTestA: deleteField(),
      diagnosticTestB: deleteField()
    });

    // 2. Reset tài liệu leaderboard
    const lbRef = doc(db, 'leaderboard', userId);
    batch.update(lbRef, {
      xp: 0,
      level: 1,
      title: 'Tập sự phản biện',
      debatesWon: 0,
      fallaciesFound: 0
    });

    // 3. Xóa các trận đấu trong subcollection matches
    const matchesCol = collection(db, 'users', userId, 'matches');
    const matchesSnap = await getDocs(matchesCol);
    matchesSnap.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// 8. Tải lịch sử trận đấu của học sinh
export async function fetchStudentMatches(userId: string): Promise<DebateMatchRecord[]> {
  const path = `users/${userId}/matches`;
  try {
    const matchesCol = collection(db, 'users', userId, 'matches');
    const snapshot = await getDocs(matchesCol);
    const list: DebateMatchRecord[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as DebateMatchRecord);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 9. Tải bảng xếp hạng từ Firestore (Lọc theo lớp học, chỉ hiện name và schoolClass, không bao giờ lộ email)
export async function fetchLeaderboardFromFirestore(schoolClassFilter?: string): Promise<LeaderboardUser[]> {
  const path = 'leaderboard';
  try {
    const lbCol = collection(db, 'leaderboard');
    let q = query(lbCol, orderBy('xp', 'desc'), limit(50));

    if (schoolClassFilter && schoolClassFilter !== 'all') {
      q = query(lbCol, where('schoolClass', '==', schoolClassFilter), orderBy('xp', 'desc'), limit(50));
    }

    const snapshot = await getDocs(q);
    const results: LeaderboardUser[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      results.push({
        id: data.id || docSnap.id,
        name: data.displayName || 'Học sinh',
        schoolClass: data.schoolClass || 'Khối THPT',
        avatarSeed: data.avatarSeed || 'Hero',
        level: Number(data.level) || 1,
        xp: Number(data.xp) || 0,
        title: data.title || 'Tập sự phản biện',
        debatesWon: Number(data.debatesWon) || 0,
        fallaciesFound: Number(data.fallaciesFound) || 0
      });
    });

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

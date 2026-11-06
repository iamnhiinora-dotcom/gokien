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
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, LeaderboardUser, DebateMatchRecord, DiagnosticTestResult } from '../types';

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
      const level = Math.max(1, Number(raw.level || 1));
      // Fix Lỗi 1: Đảm bảo đồng bộ tuyệt đối giữa currentXP và xp, khắc phục trường hợp currentXP = 0 và xp = 500
      const currentXP = Math.max(Number(raw.currentXP || 0), Number(raw.xp || 0));
      const nextLevelXP = Number(raw.nextLevelXP || (level === 1 ? 300 : level === 2 ? 700 : level === 3 ? 1200 : level === 4 ? 2000 : level === 5 ? 3200 : 5000));
      const title = raw.title || (level === 1 ? 'Tập sự phản biện' : level === 2 ? 'Người tập sự' : 'Chiến binh phản biện');

      const profile: UserProfile = {
        id: userId,
        username: raw.username || (raw.email ? raw.email.split('@')[0] : 'hocsinh'),
        email: raw.email || undefined,
        name,
        school,
        avatarSeed: raw.avatarSeed || userId.slice(0, 5),
        level,
        currentXP,
        xp: currentXP,
        nextLevelXP,
        title,
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
        claimedQuestIds: Array.isArray(raw.claimedQuestIds) ? raw.claimedQuestIds : [],
        lastQuestDate: raw.lastQuestDate || undefined,
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
    lastActiveDate: new Date().toISOString().slice(0, 10)
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

// 6. Ghi nhận kết quả trận đấu nguyên tử (Atomic Batch Write)
export async function recordDebateMatchInFirestore(
  userId: string,
  match: DebateMatchRecord,
  updatedProfileData: {
    newXp: number;
    newLevel: number;
    newTitle: string;
    newDebatesWon: number;
    unlockedBadgeIds: string[];
    streakCount: number;
    lastActiveDate: string;
    name: string;
    schoolClass: string;
    avatarSeed: string;
    fallaciesFound: number;
  }
): Promise<void> {
  const matchPath = `users/${userId}/matches/${match.id}`;
  try {
    const batch = writeBatch(db);

    // 1. Tạo bản ghi trận đấu
    const matchRef = doc(db, 'users', userId, 'matches', match.id);
    batch.set(matchRef, {
      id: match.id,
      userId: userId,
      topicMotion: match.topicMotion.slice(0, 500),
      studentSide: match.studentSide,
      outcome: match.outcome,
      studentHp: match.studentHp,
      aiHp: match.aiHp,
      xpEarned: match.xpEarned,
      roundsCompleted: match.roundsCompleted,
      personaName: match.personaName || 'AI Debater',
      date: match.date,
      timestamp: match.timestamp
    });

    // 2. Cập nhật hồ sơ người dùng kèm lastMatchId để thỏa mãn rules atomicity
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      xp: updatedProfileData.newXp,
      currentXP: updatedProfileData.newXp, // Đồng bộ tuyệt đối cả xp và currentXP
      level: updatedProfileData.newLevel,
      title: updatedProfileData.newTitle,
      debatesWon: updatedProfileData.newDebatesWon,
      unlockedBadgeIds: updatedProfileData.unlockedBadgeIds,
      streakCount: updatedProfileData.streakCount,
      lastActiveDate: updatedProfileData.lastActiveDate,
      lastMatchId: match.id
    });

    // 3. Cập nhật Leaderboard công khai
    const lbRef = doc(db, 'leaderboard', userId);
    batch.update(lbRef, {
      xp: updatedProfileData.newXp,
      level: updatedProfileData.newLevel,
      title: updatedProfileData.newTitle,
      debatesWon: updatedProfileData.newDebatesWon
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, matchPath);
  }
}

// 7. Ghi nhận kết quả vạch lá tìm sâu nguyên tử
export async function recordFallacyInFirestore(
  userId: string,
  updatedData: {
    newXp: number;
    newLevel: number;
    newTitle: string;
    newFallaciesIdentified: number;
    unlockedBadgeIds: string[];
    streakCount: number;
    lastActiveDate: string;
  }
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      xp: updatedData.newXp,
      currentXP: updatedData.newXp, // Đồng bộ tuyệt đối cả xp và currentXP
      level: updatedData.newLevel,
      title: updatedData.newTitle,
      fallaciesIdentified: updatedData.newFallaciesIdentified,
      unlockedBadgeIds: updatedData.unlockedBadgeIds,
      streakCount: updatedData.streakCount,
      lastActiveDate: updatedData.lastActiveDate
    });

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

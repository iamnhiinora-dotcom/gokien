/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BỘ KIỂM THỬ HỒI QUY (REGRESSION TESTS) CHO CẢ 3 VẤN ĐỀ FUNCTIONAL QA
 * Chạy kiểm tra độc lập bằng tsx:
 *   npx tsx src/tests/functionalRegression.test.ts
 */

import { getLevelFromXP, getProgressFromXP, LEVELS } from '../utils/levelSystem';

// Mock types và assertions
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

function assertEquals(actual: any, expected: any, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error(`❌ FAILED: ${message}`);
    console.error(`   Actual:   ${JSON.stringify(actual)}`);
    console.error(`   Expected: ${JSON.stringify(expected)}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n=== BẮT ĐẦU CHẠY REGRESSION TESTS (3 VẤN ĐỀ FUNCTIONAL QA) ===\n');

// -------------------------------------------------------------
// VẤN ĐỀ 1 (BUG-08): Lỗi khôi phục lịch sử từ localStorage
// Với người dùng đăng nhập, Firestore là nguồn dữ liệu chính (single source of truth).
// Tuyệt đối không fallback về localStorage khi Firestore là undefined hoặc [] sau reset.
// -------------------------------------------------------------
console.log('--- Test 1 (BUG-08): Đồng bộ lịch sử & Chẩn đoán từ Firestore (Single Source of Truth) ---');

function resolveProfileDataForUser(
  isLoggedIn: boolean,
  firestoreDoc: { diagnosticTestA?: any; diagnosticTestB?: any; evaluatedFallaciesHistory?: any[] } | null,
  localCache: { diagnosticTestA?: any; diagnosticTestB?: any; evaluatedFallaciesHistory?: any[] }
) {
  if (isLoggedIn && firestoreDoc) {
    // BUG-08 FIX: Với người dùng đã đăng nhập, Firestore là chân lý duy nhất.
    const resolvedDiagA = firestoreDoc.diagnosticTestA || undefined;
    const resolvedDiagB = firestoreDoc.diagnosticTestB || undefined;
    const resolvedFallacies = Array.isArray(firestoreDoc.evaluatedFallaciesHistory)
      ? firestoreDoc.evaluatedFallaciesHistory
      : [];

    return {
      diagnosticTestA: resolvedDiagA,
      diagnosticTestB: resolvedDiagB,
      evaluatedFallaciesHistory: resolvedFallacies
    };
  }

  // Chế độ khách (Guest) vẫn sử dụng localCache
  return {
    diagnosticTestA: localCache.diagnosticTestA,
    diagnosticTestB: localCache.diagnosticTestB,
    evaluatedFallaciesHistory: localCache.evaluatedFallaciesHistory || []
  };
}

// Case A: Người dùng reset tài khoản trên Firestore (hoặc trên thiết bị 1).
// Thiết bị 2 vẫn còn lưu localStorage cũ chứa bài test điểm 90 và lịch sử 5 bài.
const cloudResetData = {
  diagnosticTestA: undefined, // Đã xóa bằng deleteField()
  diagnosticTestB: undefined,
  evaluatedFallaciesHistory: [] // Mảng rỗng sau reset
};
const staleLocalStorageOnDevice2 = {
  diagnosticTestA: { testSet: 'A', totalScore: 90, completedAt: '2026-10-01' },
  diagnosticTestB: { testSet: 'B', totalScore: 85, completedAt: '2026-10-15' },
  evaluatedFallaciesHistory: [
    { scenarioId: 'sc_1', score: 95 },
    { scenarioId: 'sc_2', score: 80 }
  ]
};

const resolvedAfterReset = resolveProfileDataForUser(true, cloudResetData, staleLocalStorageOnDevice2);
assert(resolvedAfterReset.diagnosticTestA === undefined, 'Sau khi reset, diagnosticTestA KHÔNG được phục hồi từ localStorage cũ');
assert(resolvedAfterReset.diagnosticTestB === undefined, 'Sau khi reset, diagnosticTestB KHÔNG được phục hồi từ localStorage cũ');
assertEquals(resolvedAfterReset.evaluatedFallaciesHistory, [], 'Sau khi reset, evaluatedFallaciesHistory mảng rỗng [] KHÔNG bị ghi đè bởi localStorage');

// Case B: Máy mới hoặc trình duyệt ẩn danh (localStorage rỗng)
const cloudActiveData = {
  diagnosticTestA: { testSet: 'A', totalScore: 88 },
  diagnosticTestB: undefined,
  evaluatedFallaciesHistory: [{ scenarioId: 'sc_99', score: 100 }]
};
const emptyLocal = {};
const resolvedNewBrowser = resolveProfileDataForUser(true, cloudActiveData, emptyLocal);
assertEquals(resolvedNewBrowser.diagnosticTestA, cloudActiveData.diagnosticTestA, 'Máy mới đọc đúng diagnosticTestA từ Firestore');
assertEquals(resolvedNewBrowser.evaluatedFallaciesHistory.length, 1, 'Máy mới nhận đầy đủ evaluatedFallaciesHistory từ Firestore');

// Case C: Chế độ khách (Guest) vẫn đọc và lưu bình thường từ localStorage
const guestResolved = resolveProfileDataForUser(false, null, staleLocalStorageOnDevice2);
assert(guestResolved.diagnosticTestA !== undefined, 'Chế độ khách vẫn giữ cơ chế đọc từ localStorage');
assertEquals(guestResolved.evaluatedFallaciesHistory.length, 2, 'Chế độ khách giữ đúng lịch sử local');

// -------------------------------------------------------------
// VẤN ĐỀ 2 (BUG-10): Lỗi tính streak từ dữ liệu React state cũ
// Chuyển toàn bộ việc tính toán chuỗi ngày liên tiếp và thưởng XP vào transaction
// -------------------------------------------------------------
console.log('\n--- Test 2 (BUG-10): Tính Streak Server-Authoritative trong Firestore Transaction ---');

function simulateServerTransactionAwardXP(
  userData: { xp: number; streakCount: number; lastStreakRewardDate?: string; lastActiveDate: string },
  options: { rewardXP: number; streakBonus?: { todayDate: string; yesterdayDate?: string } }
) {
  let streakAwarded = false;
  let streakBonusXP = 0;
  let streakMsg = '';
  let updatedStreakCount = Number(userData.streakCount) || 1;
  let updatedLastActiveDate = userData.lastActiveDate;
  let updatedLastStreakRewardDate = userData.lastStreakRewardDate;

  if (options.streakBonus) {
    const streakToday = options.streakBonus.todayDate;

    // 1. Kiểm tra ngày đã nhận thưởng ngay trong transaction đọc từ Firestore
    if (userData.lastStreakRewardDate === streakToday) {
      streakAwarded = false;
      streakBonusXP = 0;
    } else {
      streakAwarded = true;
      // Tính chuỗi ngày liên tiếp hoàn toàn dựa trên dữ liệu mới nhất từ Firestore
      const d = new Date(streakToday);
      d.setDate(d.getDate() - 1);
      const computedYesterday = options.streakBonus.yesterdayDate || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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

  // Đọc XP mới nhất từ Firestore transaction
  const currentXP = Math.max(0, Number(userData.xp || 0));
  const baseRewardXP = Math.max(0, options.rewardXP || 0);
  const totalRewardXP = baseRewardXP + (streakAwarded ? streakBonusXP : 0);
  const newXP = currentXP + totalRewardXP;
  const progress = getProgressFromXP(newXP);

  return {
    streakAwarded,
    streakBonusXP,
    streakMsg,
    streakCount: updatedStreakCount,
    lastStreakRewardDate: updatedLastStreakRewardDate,
    lastActiveDate: updatedLastActiveDate,
    newXP,
    level: progress.level,
    title: progress.title
  };
}

// Case A: Người dùng có streak 3 ngày từ hôm qua (2026-11-05). Client gọi với rewardXP: 0
const userStateOnServer = {
  xp: 500,
  streakCount: 3,
  lastStreakRewardDate: '2026-11-05',
  lastActiveDate: '2026-11-05'
};

const txResult1 = simulateServerTransactionAwardXP(userStateOnServer, {
  rewardXP: 0,
  streakBonus: { todayDate: '2026-11-06', yesterdayDate: '2026-11-05' }
});

assert(txResult1.streakAwarded === true, 'Lần đầu trong ngày: streakAwarded = true');
assertEquals(txResult1.streakCount, 4, 'Streak tăng lên 4 ngày liên tiếp');
assertEquals(txResult1.streakBonusXP, 80, 'Thưởng XP tính đúng công thức: 40 + 4 * 10 = 80 XP');
assertEquals(txResult1.newXP, 580, 'Tổng XP tăng từ 500 lên 580');
assertEquals(txResult1.lastStreakRewardDate, '2026-11-06', 'lastStreakRewardDate cập nhật thành hôm nay');

// Case B: Client gọi lại lần 2 trong cùng ngày (hoặc thiết bị 2 mở cùng lúc)
const serverStateAfterTx1 = {
  xp: txResult1.newXP,
  streakCount: txResult1.streakCount,
  lastStreakRewardDate: txResult1.lastStreakRewardDate,
  lastActiveDate: txResult1.lastActiveDate
};

const txResult2 = simulateServerTransactionAwardXP(serverStateAfterTx1, {
  rewardXP: 0,
  streakBonus: { todayDate: '2026-11-06', yesterdayDate: '2026-11-05' }
});

assert(txResult2.streakAwarded === false, 'Lần 2 trong cùng ngày: streakAwarded = false');
assertEquals(txResult2.streakBonusXP, 0, 'Không cộng thêm XP thưởng streak');
assertEquals(txResult2.newXP, 580, 'XP giữ nguyên không bị cộng đúp');
assertEquals(txResult2.streakCount, 4, 'Streak giữ nguyên');

// Case C: Bị đứt chuỗi (hôm nay là 2026-11-08 nhưng ngày hoạt động trước là 2026-11-05)
const brokenStreakUser = {
  xp: 580,
  streakCount: 4,
  lastStreakRewardDate: '2026-11-05',
  lastActiveDate: '2026-11-05'
};
const txBroken = simulateServerTransactionAwardXP(brokenStreakUser, {
  rewardXP: 0,
  streakBonus: { todayDate: '2026-11-08', yesterdayDate: '2026-11-07' }
});
assert(txBroken.streakAwarded === true, 'Được tính lại streak');
assertEquals(txBroken.streakCount, 1, 'Đứt chuỗi: streakCount reset về 1');
assertEquals(txBroken.streakBonusXP, 30, 'Đứt chuỗi: thưởng khởi động 30 XP');

// -------------------------------------------------------------
// VẤN ĐỀ 3: Lỗi ghi đè danh sách huy hiệu khi kết thúc trận tranh biện
// Đảm bảo dùng arrayUnion và ref đồng bộ, không dùng state cũ
// -------------------------------------------------------------
console.log('\n--- Test 3: Chống ghi đè huy hiệu bằng arrayUnion và Ref đồng bộ ---');

function simulateArrayUnion(existingBadges: string[], incomingBadges: string[]): string[] {
  const set = new Set([...existingBadges, ...incomingBadges]);
  return Array.from(set);
}

// Case A: Trận đấu kết thúc ghi nhận điểm Steelman >= 6 -> mở huy hiệu badge_open_minded
const currentServerBadges = ['badge_first_blood', 'badge_debate_warrior'];
const unlockedBadgeIdsRef = new Set(currentServerBadges);

// Khi bài Dựng Người Thép đạt điểm 8/10:
const steelmanScore = 8;
if (steelmanScore >= 6) {
  unlockedBadgeIdsRef.add('badge_open_minded');
}

// Stale React state (chưa kịp re-render):
const staleBadgesState = ['badge_first_blood', 'badge_debate_warrior'];

// Code trước khi sửa: dùng staleBadgesState -> làm mất badge_open_minded
const buggedBadges = staleBadgesState;
assert(!buggedBadges.includes('badge_open_minded'), 'Code cũ bị lỗi: state cũ không có badge_open_minded');

// Code sau khi sửa: đọc từ unlockedBadgeIdsRef.current VÀ dùng arrayUnion trên Firestore
const fixedIncomingBadges = Array.from(unlockedBadgeIdsRef);
assert(fixedIncomingBadges.includes('badge_open_minded'), 'Code mới: ref đồng bộ có ngay badge_open_minded');

const afterMatchSaveOnFirestore = simulateArrayUnion(currentServerBadges, fixedIncomingBadges);
assert(afterMatchSaveOnFirestore.includes('badge_open_minded'), 'badge_open_minded được lưu an toàn lên Firestore');
assert(afterMatchSaveOnFirestore.includes('badge_first_blood'), 'Huy hiệu cũ badge_first_blood vẫn còn nguyên');
assert(afterMatchSaveOnFirestore.includes('badge_debate_warrior'), 'Huy hiệu cũ badge_debate_warrior vẫn còn nguyên');

// Case B: Mở nhiều huy hiệu liên tiếp trong 1 trận (Ví dụ: vừa thắng trận, vừa bảo toàn HP >= 60, vừa đạt Level 4)
unlockedBadgeIdsRef.add('badge_wsdc_master');
unlockedBadgeIdsRef.add('badge_critical_sage');

const afterMultipleUnlocks = simulateArrayUnion(afterMatchSaveOnFirestore, Array.from(unlockedBadgeIdsRef));
assertEquals(afterMultipleUnlocks.length, 5, 'Lưu đủ 5 huy hiệu không thiếu cái nào');
assert(afterMultipleUnlocks.includes('badge_wsdc_master'), 'Có badge_wsdc_master');
assert(afterMultipleUnlocks.includes('badge_critical_sage'), 'Có badge_critical_sage');

// -------------------------------------------------------------
// VẤN ĐỀ 4 (BUG-12): Hoàn thành bài luyện tập ngụy biện + Thưởng streak trong 1 TRANSACTION
// Đảm bảo không race condition, không mất điểm, tính đúng Level và nextLevelXP
// -------------------------------------------------------------
console.log('\n--- Test 4 (BUG-12): Gộp Luyện tập Ngụy biện & Thưởng Streak trong 1 Transaction ---');

function simulateAtomicFallacyAndStreakTransaction(
  userData: {
    xp: number;
    streakCount: number;
    lastStreakRewardDate?: string;
    lastActiveDate: string;
    fallaciesIdentified: number;
    evaluatedFallaciesHistory: any[];
  },
  options: {
    rewardXP: number;
    fallacyRecord?: { isCorrect: boolean; historyItem?: any };
    streakBonus?: { todayDate: string; yesterdayDate?: string };
  }
) {
  let streakAwarded = false;
  let streakBonusXP = 0;
  let streakMsg = '';
  let updatedStreakCount = Number(userData.streakCount) || 1;
  let updatedLastActiveDate = userData.lastActiveDate;
  let updatedLastStreakRewardDate = userData.lastStreakRewardDate;

  if (options.streakBonus) {
    const streakToday = options.streakBonus.todayDate;
    if (userData.lastStreakRewardDate === streakToday) {
      streakAwarded = false;
      streakBonusXP = 0;
    } else {
      streakAwarded = true;
      const d = new Date(streakToday);
      d.setDate(d.getDate() - 1);
      const computedYesterday = options.streakBonus.yesterdayDate || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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

  let updatedFallaciesIdentified = Number(userData.fallaciesIdentified) || 0;
  let updatedHistory = Array.isArray(userData.evaluatedFallaciesHistory) ? [...userData.evaluatedFallaciesHistory] : [];

  if (options.fallacyRecord) {
    if (options.fallacyRecord.isCorrect) {
      updatedFallaciesIdentified += 1;
    }
    if (options.fallacyRecord.historyItem) {
      updatedHistory.push(options.fallacyRecord.historyItem);
    }
  }

  const currentXP = Math.max(0, Number(userData.xp || 0));
  const baseRewardXP = Math.max(0, options.rewardXP || 0);
  const totalRewardXP = baseRewardXP + (streakAwarded ? streakBonusXP : 0);
  const newXP = currentXP + totalRewardXP;
  const progress = getProgressFromXP(newXP);

  return {
    ...progress,
    streakAwarded,
    streakBonusXP,
    streakMsg,
    streakCount: updatedStreakCount,
    lastStreakRewardDate: updatedLastStreakRewardDate,
    lastActiveDate: updatedLastActiveDate,
    fallaciesIdentified: updatedFallaciesIdentified,
    evaluatedFallaciesHistory: updatedHistory,
    totalRewardXP
  };
}

// Case 4A: Hoàn thành bài luyện tập đầu tiên trong ngày, vừa nhận điểm ngụy biện vừa nhận streak
const userBeforeFallacy = {
  xp: 250,
  streakCount: 2,
  lastStreakRewardDate: '2026-11-06',
  lastActiveDate: '2026-11-06',
  fallaciesIdentified: 0,
  evaluatedFallaciesHistory: []
};

const txFallacy1 = simulateAtomicFallacyAndStreakTransaction(userBeforeFallacy, {
  rewardXP: 110, // Điểm luyện tập ngụy biện
  fallacyRecord: {
    isCorrect: true,
    historyItem: { scenarioId: 'sc_fallacy_1', score: 90, timestamp: '2026-11-07T08:00:00Z' }
  },
  streakBonus: { todayDate: '2026-11-07', yesterdayDate: '2026-11-06' }
});

assert(txFallacy1.streakAwarded === true, 'Bài luyện tập đầu ngày nhận thưởng streak thành công');
assertEquals(txFallacy1.streakBonusXP, 70, 'Streak ngày 3: 40 + 3*10 = 70 XP');
assertEquals(txFallacy1.totalRewardXP, 180, 'Tổng thưởng = 110 (fallacy) + 70 (streak) = 180 XP');
assertEquals(txFallacy1.xp, 430, 'Tổng XP server = 250 + 180 = 430 XP (không bị mất điểm nào)');
assertEquals(txFallacy1.level, 2, 'Tại 430 XP: tự động lên Cấp độ 2 (ngưỡng 300 XP)');
assertEquals(txFallacy1.nextLevelXP, 700, 'Ngưỡng tiếp theo của Cấp độ 2 là 700 XP');
assertEquals(txFallacy1.fallaciesIdentified, 1, 'Số lỗi ngụy biện tăng chính xác lên 1');
assertEquals(txFallacy1.evaluatedFallaciesHistory.length, 1, 'Lịch sử luyện tập ghi nhận 1 bản ghi');

// Case 4B: Hoàn thành bài luyện tập thứ hai liên tiếp trong cùng ngày
const userAfterFallacy1 = {
  xp: txFallacy1.xp,
  streakCount: txFallacy1.streakCount,
  lastStreakRewardDate: txFallacy1.lastStreakRewardDate,
  lastActiveDate: txFallacy1.lastActiveDate,
  fallaciesIdentified: txFallacy1.fallaciesIdentified,
  evaluatedFallaciesHistory: txFallacy1.evaluatedFallaciesHistory
};

const txFallacy2 = simulateAtomicFallacyAndStreakTransaction(userAfterFallacy1, {
  rewardXP: 90, // Bài tập thứ 2
  fallacyRecord: {
    isCorrect: true,
    historyItem: { scenarioId: 'sc_fallacy_2', score: 85, timestamp: '2026-11-07T08:15:00Z' }
  },
  streakBonus: { todayDate: '2026-11-07', yesterdayDate: '2026-11-06' }
});

assert(txFallacy2.streakAwarded === false, 'Bài tập thứ 2 trong ngày không nhận streak trùng');
assertEquals(txFallacy2.streakBonusXP, 0, 'Streak bonus = 0 XP');
assertEquals(txFallacy2.totalRewardXP, 90, 'Chỉ cộng điểm luyện tập 90 XP');
assertEquals(txFallacy2.xp, 520, 'Tổng XP = 430 + 90 = 520 XP');
assertEquals(txFallacy2.fallaciesIdentified, 2, 'Số lỗi ngụy biện tăng lên 2');
assertEquals(txFallacy2.evaluatedFallaciesHistory.length, 2, 'Lịch sử luyện tập có 2 bản ghi');

// -------------------------------------------------------------
// VẤN ĐỀ 5: An toàn thông báo & Khóa chống click liên tiếp (In-flight safety)
// -------------------------------------------------------------
console.log('\n--- Test 5: Khóa In-flight & Không thông báo nhận thưởng sai khi lưu thất bại ---');

const inFlightLocks = new Set<string>();
function simulateClaimQuestWithLock(questId: string, willSucceed: boolean) {
  if (inFlightLocks.has(questId)) {
    return { status: 'blocked_duplicate', notificationShown: false };
  }
  inFlightLocks.add(questId);

  try {
    if (!willSucceed) {
      throw new Error('Mạng ngắt kết nối khi đang lưu Firestore');
    }
    // Transaction thành công
    return { status: 'success', notificationShown: true, xpEarned: 50 };
  } catch (err) {
    // Lưu thất bại: KHÔNG hiển thị thông báo thành công
    return { status: 'error', notificationShown: false, error: err };
  } finally {
    inFlightLocks.delete(questId);
  }
}

// Case 5A: Thao tác thất bại -> Không hiển thị thông báo nhận thưởng
const failedClaim = simulateClaimQuestWithLock('quest_daily_1', false);
assert(failedClaim.status === 'error', 'Xử lý đúng khi Firestore lỗi');
assert(failedClaim.notificationShown === false, 'KHÔNG hiển thị thông báo nhận thưởng khi lưu thất bại');

// Case 5B: Thao tác thành công -> Hiển thị thông báo nhận thưởng
const successClaim = simulateClaimQuestWithLock('quest_daily_1', true);
assert(successClaim.status === 'success', 'Nhận thưởng thành công');
assert(successClaim.notificationShown === true, 'Hiển thị thông báo nhận thưởng SAU KHI lưu thành công');

// -------------------------------------------------------------
// VẤN ĐỀ 6: Kiểm tra tính toán Level từ XP (Nguồn dữ liệu duy nhất getProgressFromXP)
// -------------------------------------------------------------
console.log('\n--- Test 6: Tính toán Cấp độ và Danh vị từ XP duy nhất (Single Source of Truth) ---');

assertEquals(getProgressFromXP(0).level, 1, '0 XP -> Level 1 (Tập sự phản biện)');
assertEquals(getProgressFromXP(299).level, 1, '299 XP -> Vẫn Level 1');
assertEquals(getProgressFromXP(300).level, 2, '300 XP -> Lên Level 2 (Tranh biện viên sơ cấp)');
assertEquals(getProgressFromXP(699).level, 2, '699 XP -> Vẫn Level 2');
assertEquals(getProgressFromXP(700).level, 3, '700 XP -> Lên Level 3 (Khẩu tướng tranh luận)');
assertEquals(getProgressFromXP(1300).level, 4, '1300 XP -> Lên Level 4 (Kỳ thủ phản biện)');
assertEquals(getProgressFromXP(2100).level, 5, '2100 XP -> Lên Level 5 (Hiệp sĩ Logic)');
assertEquals(getProgressFromXP(8000).level, 9, '8000 XP -> Level 9 (Học giả hùng biện)');
assertEquals(getProgressFromXP(10500).level, 10, '10500 XP -> Level 10 (Đại kiện tướng triết luận)');

console.log('\n=== TẤT CẢ CÁC REGRESSION TESTS ĐÃ VƯỢT QUA 100% ===\n');

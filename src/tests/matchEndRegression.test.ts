/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BỘ KIỂM THỬ HỒI QUY TOÀN DIỆN CHO BUG-13:
 * "Trùng XP khi kết thúc trận tranh biện 1v1"
 * 
 * Kiểm tra đầy đủ 10 kịch bản theo yêu cầu Functional QA Section 5:
 * 1. Thắng 1 trận -> XP tăng đúng 180, đúng 1 bản ghi, totalDebates +1, debatesWon +1
 * 2. Thua 1 trận -> XP tăng đúng 60, đúng 1 bản ghi, totalDebates +1, debatesWon giữ nguyên
 * 3. Kết thúc trận bị gọi hai lần do race condition -> Chỉ thưởng đúng 1 lần (Idempotency)
 * 4. Thắng trận kèm thưởng Dựng Người Thép -> XP trận (+180) và Người Thép (+30) độc lập
 * 5. Thưởng Công tâm (+15) trong trận -> Không làm tăng trùng XP kết thúc trận
 * 6. Firestore transaction lỗi -> Không cập nhật XP thành công giả tạo trên giao diện
 * 7. Tải lại trang sau khi kết thúc trận -> XP, Level, số trận thắng từ Firestore không lệch
 * 8. Hai yêu cầu lưu đồng thời cùng matchId -> Không cộng trùng XP
 * 9. Sau khi kết thúc trận -> XP hồ sơ và bảng xếp hạng hoàn toàn khớp nhau
 * 10. Chơi tiếp trận thứ hai -> Trận mới nhận XP bình thường theo đúng kết quả
 * 
 * Chạy độc lập:
 *   npx tsx src/tests/matchEndRegression.test.ts
 */

import { DebateMatchRecord, UserProfile } from '../types';
import { getProgressFromXP } from '../utils/levelSystem';

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

console.log('\n=== BẮT ĐẦU CHẠY REGRESSION TESTS CHO BUG-13 ===\n');

// --------------------------------------------------------------------------
// Giả lập môi trường Firestore Transaction & Gamification Context Client
// --------------------------------------------------------------------------

class MockFirestoreTransactionDb {
  users: Record<string, any> = {};
  matches: Record<string, Record<string, any>> = {};
  leaderboard: Record<string, any> = {};
  simulateNetworkError: boolean = false;

  initUser(userId: string, initialData: Partial<UserProfile> = {}) {
    const xp = initialData.currentXP ?? initialData.xp ?? 0;
    const progress = getProgressFromXP(xp);
    this.users[userId] = {
      id: userId,
      displayName: initialData.name || 'Học sinh kiểm thử',
      name: initialData.name || 'Học sinh kiểm thử',
      schoolClass: initialData.school || '11A1',
      school: initialData.school || '11A1',
      xp: xp,
      currentXP: xp,
      level: progress.level,
      nextLevelXP: progress.nextLevelXP,
      title: progress.title,
      totalDebates: initialData.totalDebates ?? 0,
      debatesWon: initialData.debatesWon ?? 0,
      fallaciesIdentified: initialData.fallaciesIdentified ?? 0,
      streakCount: initialData.streakCount ?? 1,
      lastActiveDate: '2026-11-08',
      lastStreakRewardDate: '2026-11-08',
      unlockedBadgeIds: initialData.unlockedBadgeIds ?? []
    };
    this.matches[userId] = {};
    this.leaderboard[userId] = {
      id: userId,
      displayName: this.users[userId].displayName,
      schoolClass: this.users[userId].schoolClass,
      xp: xp,
      level: progress.level,
      title: progress.title,
      debatesWon: this.users[userId].debatesWon,
      fallaciesFound: this.users[userId].fallaciesIdentified
    };
  }

  // Giả lập runTransaction(db, async (tx) => ...)
  async executeRecordDebateMatchTransaction(
    userId: string,
    match: DebateMatchRecord,
    options?: { unlockedBadgeIds?: string[] }
  ) {
    if (this.simulateNetworkError) {
      throw new Error('Unavailable: Firestore backend service unreachable');
    }

    const userData = this.users[userId];
    if (!userData) {
      throw new Error('User document not found in Firestore');
    }

    const userMatches = this.matches[userId] || (this.matches[userId] = {});
    const matchSnapExists = !!userMatches[match.id];

    // Idempotency check trong transaction
    if (matchSnapExists || userData.lastMatchId === match.id) {
      const currentXP = Math.max(Number(userData.xp || 0), Number(userData.currentXP || 0));
      const progress = getProgressFromXP(currentXP);
      return {
        ...progress,
        totalDebates: Number(userData.totalDebates || 0),
        debatesWon: Number(userData.debatesWon || 0),
        streakCount: Number(userData.streakCount || 1),
        lastActiveDate: userData.lastActiveDate,
        unlockedBadgeIds: userData.unlockedBadgeIds || []
      };
    }

    // Đọc server snapshot mới nhất
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

    // Atomically write match record
    userMatches[match.id] = { ...match, userId };

    // Atomically update user document
    userData.xp = newXp;
    userData.currentXP = newXp;
    userData.level = progress.level;
    userData.nextLevelXP = progress.nextLevelXP;
    userData.title = progress.title;
    userData.totalDebates = newTotalDebates;
    userData.debatesWon = newDebatesWon;
    userData.lastActiveDate = today;
    userData.lastMatchId = match.id;

    // Atomically update leaderboard document
    const lbData = this.leaderboard[userId] || (this.leaderboard[userId] = {});
    lbData.xp = newXp;
    lbData.level = progress.level;
    lbData.title = progress.title;
    lbData.debatesWon = newDebatesWon;

    return {
      ...progress,
      totalDebates: newTotalDebates,
      debatesWon: newDebatesWon,
      streakCount: Number(userData.streakCount || 1),
      lastActiveDate: today,
      unlockedBadgeIds: userData.unlockedBadgeIds || []
    };
  }
}

class DebateClientSimulator {
  userId: string | null; // null => guest
  db: MockFirestoreTransactionDb;
  profile: UserProfile;
  debateHistory: DebateMatchRecord[] = [];
  floatingXps: Array<{ id: string; amount: number; reason: string }> = [];

  // Idempotency refs
  recordedMatchIds = new Set<string>();
  recordingMatchInFlight: Record<string, boolean> = {};

  constructor(userId: string | null, db: MockFirestoreTransactionDb, initialXP = 0) {
    this.userId = userId;
    this.db = db;
    const progress = getProgressFromXP(initialXP);
    this.profile = {
      id: userId || 'guest',
      name: 'Nguyễn Văn A',
      school: '11A1',
      avatarSeed: 'Hero',
      level: progress.level,
      xp: progress.xp,
      currentXP: progress.currentXP,
      nextLevelXP: progress.nextLevelXP,
      title: progress.title,
      totalDebates: 0,
      debatesWon: 0,
      fallaciesIdentified: 0,
      username: 'nguyenvana',
      unlockedBadgeIds: [],
      soundEnabled: true,
      screenShakeEnabled: true,
      geminiApiKey: '',
      aiEngineMode: 'gemini_cloud',
      streakCount: 1,
      lastActiveDate: '2026-11-08'
    };
    if (userId) {
      db.initUser(userId, this.profile);
    }
  }

  // addXP độc lập (dành cho Steelman +30, Concession +15)
  async addXP(amount: number, reason: string): Promise<boolean> {
    const newXP = this.profile.currentXP + amount;
    const progress = getProgressFromXP(newXP);
    this.profile = {
      ...this.profile,
      currentXP: progress.currentXP,
      xp: progress.xp,
      level: progress.level,
      nextLevelXP: progress.nextLevelXP,
      title: progress.title
    };
    if (this.userId) {
      const u = this.db.users[this.userId];
      if (u) {
        u.xp = newXP;
        u.currentXP = newXP;
        u.level = progress.level;
        u.nextLevelXP = progress.nextLevelXP;
        u.title = progress.title;
      }
      const lb = this.db.leaderboard[this.userId];
      if (lb) {
        lb.xp = newXP;
        lb.level = progress.level;
        lb.title = progress.title;
      }
    }
    this.floatingXps.push({ id: `xp_${Date.now()}_${Math.random()}`, amount, reason });
    return true;
  }

  // recordDebateEnd: Tuân thủ logic đã sửa của BUG-13
  async recordDebateEnd(data: {
    id?: string;
    outcome: 'victory' | 'defeat';
    studentHp?: number;
    aiHp?: number;
    xpEarned?: number;
    topicMotion?: string;
    studentSide?: 'pro' | 'con';
    roundsCompleted?: number;
    personaName?: string;
    wsdcScore?: number;
    steelmanScore?: number;
    concessionCount?: number;
  }): Promise<string> {
    const won = data.outcome === 'victory';
    const xpEarned = data.xpEarned ?? (won ? 180 : 60);
    const matchId = data.id || `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // 1. Client idempotency guard
    if (this.recordedMatchIds.has(matchId) || this.recordingMatchInFlight[matchId]) {
      console.warn(`[Client] Match ${matchId} đã được ghi nhận hoặc đang xử lý. Bỏ qua ghi đúp.`);
      return matchId;
    }
    this.recordingMatchInFlight[matchId] = true;

    const newMatch: DebateMatchRecord = {
      id: matchId,
      topicMotion: data.topicMotion || 'Chủ đề tranh biện WSDC',
      studentSide: data.studentSide || 'pro',
      outcome: data.outcome,
      studentHp: data.studentHp ?? 80,
      aiHp: data.aiHp ?? 0,
      xpEarned,
      roundsCompleted: data.roundsCompleted ?? 4,
      personaName: data.personaName || 'AI Debater',
      date: '08/11/2026',
      timestamp: '17:30',
      wsdcScore: data.wsdcScore,
      steelmanScore: data.steelmanScore,
      concessionCount: data.concessionCount
    };

    try {
      if (this.userId) {
        // Ghi nhận qua transaction trên Firestore
        const result = await this.db.executeRecordDebateMatchTransaction(this.userId, newMatch);

        // Chỉ cập nhật state khi Firestore transaction thành công
        this.recordedMatchIds.add(matchId);
        this.debateHistory = [newMatch, ...this.debateHistory.filter(m => m.id !== matchId)];
        this.profile = {
          ...this.profile,
          currentXP: result.currentXP,
          xp: result.xp,
          level: result.level,
          nextLevelXP: result.nextLevelXP,
          title: result.title,
          totalDebates: result.totalDebates,
          debatesWon: result.debatesWon,
          streakCount: result.streakCount,
          lastActiveDate: result.lastActiveDate
        };

        const xpId = 'match_xp_' + Date.now();
        const reason = won ? 'Thắng trận tranh biện (+180 XP)' : 'Hoàn thành trận tranh biện (+60 XP)';
        this.floatingXps.push({ id: xpId, amount: xpEarned, reason });

        return matchId;
      } else {
        // Guest mode
        this.recordedMatchIds.add(matchId);
        this.debateHistory = [newMatch, ...this.debateHistory.filter(m => m.id !== matchId)];
        const newTotalXP = this.profile.currentXP + xpEarned;
        const progress = getProgressFromXP(newTotalXP);
        this.profile = {
          ...this.profile,
          currentXP: progress.currentXP,
          xp: progress.xp,
          level: progress.level,
          nextLevelXP: progress.nextLevelXP,
          title: progress.title,
          totalDebates: this.profile.totalDebates + 1,
          debatesWon: this.profile.debatesWon + (won ? 1 : 0)
        };
        const xpId = 'guest_match_xp_' + Date.now();
        const reason = won ? 'Thắng trận tranh biện (+180 XP)' : 'Hoàn thành trận tranh biện (+60 XP)';
        this.floatingXps.push({ id: xpId, amount: xpEarned, reason });
        return matchId;
      }
    } finally {
      delete this.recordingMatchInFlight[matchId];
    }
  }
}

// --------------------------------------------------------------------------
// TIẾN TRÌNH KIỂM THỬ 10 TEST CASES
// --------------------------------------------------------------------------

async function runAllTests() {
  const db = new MockFirestoreTransactionDb();

  // Test Case 1: Thắng 1 trận -> XP tăng đúng 180, đúng 1 bản ghi lịch sử, totalDebates +1, debatesWon +1
  console.log('--- Test Case 1: Thắng 1 trận 1v1 ---');
  {
    const client = new DebateClientSimulator('user_tc1', db, 0);
    const matchId = await client.recordDebateEnd({
      outcome: 'victory',
      xpEarned: 180
    });

    assertEquals(client.profile.currentXP, 180, 'XP trên React state tăng đúng 180');
    assertEquals(client.debateHistory.length, 1, 'Đúng 1 bản ghi trong debateHistory');
    assertEquals(client.profile.totalDebates, 1, 'totalDebates tăng 1');
    assertEquals(client.profile.debatesWon, 1, 'debatesWon tăng 1');
    assertEquals(db.users['user_tc1'].currentXP, 180, 'XP trên Firestore users đúng 180');
    assertEquals(db.users['user_tc1'].totalDebates, 1, 'Firestore totalDebates đúng 1');
    assertEquals(db.users['user_tc1'].debatesWon, 1, 'Firestore debatesWon đúng 1');
    assert(!!db.matches['user_tc1'][matchId], 'Bản ghi match tồn tại trên Firestore subcollection');
  }

  // Test Case 2: Thua 1 trận -> XP tăng đúng 60, đúng 1 bản ghi lịch sử, totalDebates +1, debatesWon không đổi
  console.log('\n--- Test Case 2: Thua 1 trận 1v1 ---');
  {
    const client = new DebateClientSimulator('user_tc2', db, 100);
    const matchId = await client.recordDebateEnd({
      outcome: 'defeat',
      xpEarned: 60
    });

    assertEquals(client.profile.currentXP, 160, 'XP trên React state tăng từ 100 lên 160 (+60)');
    assertEquals(client.debateHistory.length, 1, 'Đúng 1 bản ghi trong debateHistory');
    assertEquals(client.profile.totalDebates, 1, 'totalDebates tăng 1');
    assertEquals(client.profile.debatesWon, 0, 'debatesWon giữ nguyên 0 khi thua');
    assertEquals(db.users['user_tc2'].currentXP, 160, 'Firestore currentXP đúng 160');
    assertEquals(db.users['user_tc2'].debatesWon, 0, 'Firestore debatesWon không đổi (0)');
  }

  // Test Case 3: Kết thúc trận bị gọi hai lần do race condition -> Chỉ được nhận thưởng đúng một lần
  console.log('\n--- Test Case 3: Gọi trigger kết thúc trận 2 lần liên tiếp ---');
  {
    const client = new DebateClientSimulator('user_tc3', db, 0);
    const stableMatchId = 'match_tc3_fixed_id';

    // Gọi lần 1
    const res1 = await client.recordDebateEnd({
      id: stableMatchId,
      outcome: 'victory',
      xpEarned: 180
    });
    // Giả lập triggerEndMatch lần 2 với cùng matchId
    const res2 = await client.recordDebateEnd({
      id: stableMatchId,
      outcome: 'victory',
      xpEarned: 180
    });

    assertEquals(res1, res2, 'Hai lần gọi trả về cùng một matchId');
    assertEquals(client.profile.currentXP, 180, 'XP chỉ được cộng 1 lần (+180), không bị nhân đôi lên 360');
    assertEquals(client.debateHistory.length, 1, 'Chỉ có duy nhất 1 bản ghi lịch sử trận đấu');
    assertEquals(client.profile.totalDebates, 1, 'totalDebates chỉ tăng 1 lần');
    assertEquals(db.users['user_tc3'].currentXP, 180, 'Firestore XP chỉ tăng đúng 180');
  }

  // Test Case 4: Thắng trận và nhận thưởng bài tập Dựng Người Thép -> XP trận (+180) và Người Thép (+30) độc lập
  console.log('\n--- Test Case 4: Thắng trận kèm hoàn thành Dựng Người Thép ---');
  {
    const client = new DebateClientSimulator('user_tc4', db, 50);

    // Bước 1: Học sinh hoàn thành Dựng Người Thép trước khi vào trận -> +30 XP
    await client.addXP(30, 'Đạt chuẩn bài tập Dựng Người Thép');
    assertEquals(client.profile.currentXP, 80, 'Sau Người Thép, XP tăng lên 80 (50 + 30)');

    // Bước 2: Vào trận và giành chiến thắng -> +180 XP từ recordDebateEnd
    const matchId = await client.recordDebateEnd({
      outcome: 'victory',
      xpEarned: 180,
      steelmanScore: 8
    });

    assertEquals(client.profile.currentXP, 260, 'Tổng XP đạt 260 (50 + 30 + 180), độc lập và chính xác');
    assertEquals(db.users['user_tc4'].currentXP, 260, 'Firestore lưu đúng 260 XP');
    assertEquals(client.debateHistory[0].steelmanScore, 8, 'Điểm Người Thép được ghi nhận trong chi tiết trận');
  }

  // Test Case 5: Học sinh có điểm Công tâm (+15 XP) -> Không làm tăng trùng XP kết thúc trận đấu
  console.log('\n--- Test Case 5: Điểm Công tâm (Concession Bonus) trong trận ---');
  {
    const client = new DebateClientSimulator('user_tc5', db, 200);

    // Học sinh thừa nhận ý hợp lý trong hiệp 2 -> +15 XP Công tâm
    await client.addXP(15, 'Điểm Công tâm: Thừa nhận ý hợp lý của đối thủ');
    assertEquals(client.profile.currentXP, 215, 'XP sau khi nhận điểm Công tâm là 215');

    // Kết thúc trận: Thắng trận -> +180 XP
    await client.recordDebateEnd({
      outcome: 'victory',
      xpEarned: 180,
      concessionCount: 1
    });

    assertEquals(client.profile.currentXP, 395, 'Tổng XP là 395 (200 + 15 + 180), không bị cộng trùng');
    assertEquals(db.users['user_tc5'].currentXP, 395, 'Firestore XP chuẩn 395');
  }

  // Test Case 6: Khi Firestore transaction báo lỗi -> Ứng dụng không tự ý cập nhật XP thành công giả tạo
  console.log('\n--- Test Case 6: Firestore transaction báo lỗi kết nối ---');
  {
    const client = new DebateClientSimulator('user_tc6', db, 150);
    db.simulateNetworkError = true; // Bật lỗi mạng

    let caughtError = false;
    try {
      await client.recordDebateEnd({
        id: 'match_tc6_fail',
        outcome: 'victory',
        xpEarned: 180
      });
    } catch (e: any) {
      caughtError = true;
      assert(e.message.includes('Firestore backend service unreachable'), 'Bắt đúng lỗi ném ra từ Firestore');
    }

    assert(caughtError, 'Lỗi Firestore được xử lý và ném ra đúng cách');
    assertEquals(client.profile.currentXP, 150, 'React state XP KHÔNG bị tăng ảo khi transaction thất bại');
    assertEquals(client.debateHistory.length, 0, 'Lịch sử không thêm trận ảo');
    assertEquals(db.users['user_tc6'].currentXP, 150, 'Firestore nguyên trạng 150 XP');

    db.simulateNetworkError = false; // Tắt lỗi mạng
  }

  // Test Case 7: Học sinh tải lại trang sau khi kết thúc trận -> Dữ liệu XP, Level, số trận thắng từ Firestore không bị sai lệch
  console.log('\n--- Test Case 7: Tải lại trang sau khi kết thúc trận đấu ---');
  {
    const client = new DebateClientSimulator('user_tc7', db, 250);
    await client.recordDebateEnd({
      outcome: 'victory',
      xpEarned: 180
    });

    // Giả lập Reload trang: Đọc lại toàn bộ thông tin từ Firestore
    const firestoreUserData = db.users['user_tc7'];
    const reloadedProgress = getProgressFromXP(firestoreUserData.currentXP);

    const reloadedProfile: UserProfile = {
      ...client.profile,
      currentXP: firestoreUserData.currentXP,
      xp: firestoreUserData.xp,
      level: reloadedProgress.level,
      nextLevelXP: reloadedProgress.nextLevelXP,
      title: reloadedProgress.title,
      totalDebates: firestoreUserData.totalDebates,
      debatesWon: firestoreUserData.debatesWon
    };

    assertEquals(reloadedProfile.currentXP, 430, 'XP sau tải lại trang là 430 (250 + 180)');
    assertEquals(reloadedProfile.level, 2, 'Level 2 chính xác theo thang cấp độ');
    assertEquals(reloadedProfile.totalDebates, 1, 'totalDebates khớp 1');
    assertEquals(reloadedProfile.debatesWon, 1, 'debatesWon khớp 1');
  }

  // Test Case 8: Hai yêu cầu lưu đồng thời với cùng matchId -> Không có trường hợp cả hai cùng được cộng XP
  console.log('\n--- Test Case 8: Hai yêu cầu ghi đồng thời cùng matchId (Race Condition) ---');
  {
    const client = new DebateClientSimulator('user_tc8', db, 0);
    const concurrentMatchId = 'match_tc8_concurrent';

    // Chạy song song 2 Promise đồng thời
    const [resA, resB] = await Promise.all([
      client.recordDebateEnd({ id: concurrentMatchId, outcome: 'victory', xpEarned: 180 }),
      client.recordDebateEnd({ id: concurrentMatchId, outcome: 'victory', xpEarned: 180 })
    ]);

    assertEquals(resA, concurrentMatchId, 'Yêu cầu A thành công với matchId');
    assertEquals(resB, concurrentMatchId, 'Yêu cầu B được nhận biết idempotent');
    assertEquals(client.profile.currentXP, 180, 'XP chỉ tăng 180, không bị nhân đôi do race condition');
    assertEquals(db.users['user_tc8'].currentXP, 180, 'Firestore currentXP chỉ tăng 1 lần (+180)');
    assertEquals(db.users['user_tc8'].totalDebates, 1, 'Firestore totalDebates chỉ tăng 1');
  }

  // Test Case 9: Sau khi kết thúc trận -> XP trên hồ sơ người dùng và bảng xếp hạng hoàn toàn khớp nhau
  console.log('\n--- Test Case 9: Tính nhất quán giữa Hồ sơ và Bảng xếp hạng ---');
  {
    const client = new DebateClientSimulator('user_tc9', db, 400);
    await client.recordDebateEnd({
      outcome: 'victory',
      xpEarned: 180
    });

    const userProfileXP = client.profile.currentXP;
    const firestoreUserXP = db.users['user_tc9'].currentXP;
    const leaderboardXP = db.leaderboard['user_tc9'].xp;
    const leaderboardDebatesWon = db.leaderboard['user_tc9'].debatesWon;

    assertEquals(userProfileXP, 580, 'Profile XP = 580');
    assertEquals(firestoreUserXP, 580, 'Firestore User XP = 580');
    assertEquals(leaderboardXP, 580, 'Leaderboard XP = 580');
    assertEquals(leaderboardDebatesWon, 1, 'Leaderboard debatesWon = 1');
    assert(userProfileXP === leaderboardXP, 'Hồ sơ người dùng và Bảng xếp hạng hoàn toàn đồng bộ 100%');
  }

  // Test Case 10: Học sinh chơi tiếp trận thứ hai -> Trận mới vẫn được cộng XP bình thường theo đúng kết quả
  console.log('\n--- Test Case 10: Chơi tiếp trận thứ hai liên tiếp ---');
  {
    const client = new DebateClientSimulator('user_tc10', db, 0);

    // Trận 1: Thắng (+180 XP)
    const match1Id = await client.recordDebateEnd({
      id: 'match_10_first',
      outcome: 'victory',
      xpEarned: 180
    });
    assertEquals(client.profile.currentXP, 180, 'Trận 1 thắng: XP = 180');
    assertEquals(client.profile.totalDebates, 1, 'Trận 1: totalDebates = 1');

    // Trận 2: Thua (+60 XP)
    const match2Id = await client.recordDebateEnd({
      id: 'match_10_second',
      outcome: 'defeat',
      xpEarned: 60
    });
    assertEquals(client.profile.currentXP, 240, 'Trận 2 thua: XP = 180 + 60 = 240');
    assertEquals(client.profile.totalDebates, 2, 'Sau 2 trận: totalDebates = 2');
    assertEquals(client.profile.debatesWon, 1, 'Sau 2 trận: debatesWon = 1');
    assertEquals(client.debateHistory.length, 2, 'Có đủ 2 trận trong lịch sử');
    assert(match1Id !== match2Id, 'Hai trận có matchId khác nhau hoàn toàn');
    assertEquals(db.users['user_tc10'].currentXP, 240, 'Firestore lưu 240 XP');
    assertEquals(db.users['user_tc10'].totalDebates, 2, 'Firestore lưu 2 totalDebates');
    assertEquals(db.users['user_tc10'].debatesWon, 1, 'Firestore lưu 1 debatesWon');
  }

  console.log('\n🎉 TOÀN BỘ 10 TEST CASES CỦA BUG-13 ĐÃ VƯỢT QUA 100%! 🎉\n');
}

runAllTests().catch(err => {
  console.error('\n💥 TEST THẤT BẠI:', err);
  process.exit(1);
});

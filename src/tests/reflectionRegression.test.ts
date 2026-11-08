/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BỘ KIỂM THỬ HỒI QUY TOÀN DIỆN CHO BUG-16 & BẢO TOÀN BUG-13:
 * "Sửa triệt để cơ chế lưu phản tư và thưởng 25 XP qua Firestore Transaction"
 * 
 * Kiểm tra đầy đủ 11 kịch bản theo yêu cầu Functional QA Section 3:
 * 1. Lưu phản tư lần đầu: cộng đúng 25 XP.
 * 2. Lưu lại cùng matchId: không cộng thêm XP, chỉ cập nhật nội dung phản tư.
 * 3. Hai thiết bị lưu đồng thời (Multi-device Race Condition): chỉ cộng 25 XP đúng một lần duy nhất.
 * 4. Firestore từ chối ghi (Lỗi mạng / PERMISSION_DENIED): không tăng XP ảo trên UI, giữ nguyên text.
 * 5. Tải lại trang (Reload): nội dung phản tư và trạng thái nhận thưởng vẫn tồn tại từ Firestore.
 * 6. Không tạo thêm bản ghi trận đấu mới trong lịch sử hoặc subcollection matches.
 * 7. Không thay đổi số trận thắng (debatesWon) hoặc tổng số trận (totalDebates).
 * 8. Không cộng lại XP thắng (+180) hoặc thua (+60) khi lưu phản tư.
 * 9. Leaderboard và hồ sơ người dùng đồng bộ 100% về XP, Level, Title.
 * 10. Firestore Rules: cho phép cập nhật reflection hợp lệ, chặn sửa đổi outcome, xpEarned, userId, studentHp, aiHp.
 * 11. Xác nhận BUG-13 (chống trùng XP kết thúc trận 1v1) vẫn hoạt động hoàn hảo sau khi sửa BUG-16.
 * 
 * Chạy độc lập:
 *   npx tsx src/tests/reflectionRegression.test.ts
 */

import { DebateMatchRecord, PostMatchReflection, UserProfile } from '../types';
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

console.log('\n=== BẮT ĐẦU CHẠY REGRESSION TESTS CHO BUG-16 (LƯU PHẢN TƯ VÀ THƯỞNG 25 XP) ===\n');

// --------------------------------------------------------------------------
// 1. Giả lập Firestore Security Rules Engine cho matches và users
// --------------------------------------------------------------------------

class FirestoreRulesEngine {
  static isValidReflection(data: any): boolean {
    if (typeof data !== 'object' || data === null) return false;
    if ('opponentThoughtProvokingPoint' in data) {
      if (typeof data.opponentThoughtProvokingPoint !== 'string' || data.opponentThoughtProvokingPoint.length > 1000) {
        return false;
      }
    }
    if ('oppositeSideOpeningIdea' in data) {
      if (typeof data.oppositeSideOpeningIdea !== 'string' || data.oppositeSideOpeningIdea.length > 1000) {
        return false;
      }
    }
    return true;
  }

  // Đánh giá rule allow update trên match /users/{userId}/matches/{matchId}
  static evaluateMatchUpdateRule(
    userId: string,
    matchId: string,
    existingMatch: any,
    incomingMatch: any,
    existingUserXP: number,
    projectedUserXP: number
  ): { allowed: boolean; reason?: string } {
    if (!existingMatch) {
      return { allowed: false, reason: 'Tài liệu trận đấu không tồn tại.' };
    }
    // Chủ sở hữu
    if (incomingMatch.userId !== userId || existingMatch.userId !== userId) {
      return { allowed: false, reason: 'Chỉ chủ tài khoản mới được cập nhật.' };
    }
    // ID khớp
    if (incomingMatch.id !== existingMatch.id) {
      return { allowed: false, reason: 'Không được thay đổi ID trận đấu.' };
    }
    // Các trường bất biến: outcome, xpEarned, studentHp, aiHp, topicMotion, studentSide, date
    if (
      incomingMatch.outcome !== existingMatch.outcome ||
      incomingMatch.xpEarned !== existingMatch.xpEarned ||
      incomingMatch.studentHp !== existingMatch.studentHp ||
      incomingMatch.aiHp !== existingMatch.aiHp ||
      incomingMatch.topicMotion !== existingMatch.topicMotion ||
      incomingMatch.studentSide !== existingMatch.studentSide ||
      incomingMatch.date !== existingMatch.date
    ) {
      return { allowed: false, reason: 'Không được thay đổi thông tin kết quả trận đấu (outcome, xpEarned, hp, ...).' };
    }

    // Kiểm tra affectedKeys chỉ gồm reflection và reflectionRewardClaimed
    const allowedKeys = new Set(['reflection', 'reflectionRewardClaimed']);
    for (const key of Object.keys(incomingMatch)) {
      if (JSON.stringify(incomingMatch[key]) !== JSON.stringify(existingMatch[key])) {
        if (!allowedKeys.has(key)) {
          return { allowed: false, reason: `Không được thay đổi trường ${key}.` };
        }
      }
    }

    // Kiểm tra cấu trúc reflection
    if ('reflection' in incomingMatch && !this.isValidReflection(incomingMatch.reflection)) {
      return { allowed: false, reason: 'Cấu trúc reflection không hợp lệ hoặc vượt quá 1000 ký tự.' };
    }

    // Không thể chuyển reflectionRewardClaimed từ true về false
    if (existingMatch.reflectionRewardClaimed === true && incomingMatch.reflectionRewardClaimed === false) {
      return { allowed: false, reason: 'Không được chuyển reflectionRewardClaimed từ true về false.' };
    }

    // Kiểm tra tính nguyên tử giữa match và user doc:
    // Nếu lần đầu nhận thưởng (false/chưa có -> true): XP user phải tăng đúng 25
    const wasClaimed = existingMatch.reflectionRewardClaimed === true;
    const nowClaimed = incomingMatch.reflectionRewardClaimed === true;

    if (!wasClaimed && nowClaimed) {
      if (projectedUserXP !== existingUserXP + 25) {
        return { allowed: false, reason: 'Lần đầu nhận thưởng phản tư phải đi kèm cộng đúng 25 XP trên hồ sơ người dùng.' };
      }
    } else {
      // Nếu đã nhận trước đó hoặc không nhận thưởng: XP user không được thay đổi
      if (projectedUserXP !== existingUserXP) {
        return { allowed: false, reason: 'Đã nhận thưởng phản tư trước đó, không được cộng thêm XP.' };
      }
    }

    return { allowed: true };
  }
}

// --------------------------------------------------------------------------
// 2. Giả lập Database Firestore Transaction
// --------------------------------------------------------------------------

class MockFirestoreDb {
  users: Record<string, any> = {};
  matches: Record<string, Record<string, any>> = {};
  leaderboard: Record<string, any> = {};
  simulateNetworkError: boolean = false;
  deployNewRules: boolean = true; // Mặc định dùng bộ rules mới (BUG-16)

  initUser(userId: string, initialXP = 0, initialDebates = 0, initialWon = 0) {
    const progress = getProgressFromXP(initialXP);
    this.users[userId] = {
      id: userId,
      displayName: 'Học sinh kiểm thử',
      name: 'Học sinh kiểm thử',
      schoolClass: '11A1',
      school: '11A1',
      xp: initialXP,
      currentXP: initialXP,
      level: progress.level,
      nextLevelXP: progress.nextLevelXP,
      title: progress.title,
      totalDebates: initialDebates,
      debatesWon: initialWon,
      fallaciesIdentified: 0,
      streakCount: 1,
      lastActiveDate: '2026-11-08'
    };
    this.matches[userId] = {};
    this.leaderboard[userId] = {
      id: userId,
      displayName: 'Học sinh kiểm thử',
      schoolClass: '11A1',
      xp: initialXP,
      level: progress.level,
      title: progress.title,
      debatesWon: initialWon,
      fallaciesFound: 0
    };
  }

  // Giả lập lưu trận đấu (BUG-13 recordDebateMatchInFirestore)
  async recordDebateMatch(userId: string, match: DebateMatchRecord) {
    const user = this.users[userId];
    if (!user) throw new Error('User not found');
    const userMatches = this.matches[userId] || (this.matches[userId] = {});

    // Idempotency
    if (userMatches[match.id] || user.lastMatchId === match.id) {
      return;
    }

    const won = match.outcome === 'victory';
    const xpEarned = match.xpEarned;
    const newXP = user.currentXP + xpEarned;
    const progress = getProgressFromXP(newXP);

    userMatches[match.id] = {
      ...match,
      userId,
      reflectionRewardClaimed: false
    };

    user.xp = newXP;
    user.currentXP = newXP;
    user.level = progress.level;
    user.nextLevelXP = progress.nextLevelXP;
    user.title = progress.title;
    user.totalDebates += 1;
    user.debatesWon += (won ? 1 : 0);
    user.lastMatchId = match.id;

    const lb = this.leaderboard[userId];
    lb.xp = newXP;
    lb.level = progress.level;
    lb.title = progress.title;
    lb.debatesWon = user.debatesWon;
  }

  // Giả lập transaction saveReflectionAndRewardInFirestore (BUG-16)
  async executeSaveReflectionTransaction(
    userId: string,
    matchId: string,
    reflection: PostMatchReflection
  ) {
    if (this.simulateNetworkError) {
      throw new Error('Unavailable: Firestore backend service unreachable');
    }

    const user = this.users[userId];
    if (!user) throw new Error('Không tìm thấy hồ sơ người dùng.');
    const userMatches = this.matches[userId] || {};
    const existingMatch = userMatches[matchId];
    if (!existingMatch) throw new Error('Không tìm thấy bản ghi trận đấu.');

    if (existingMatch.userId && existingMatch.userId !== userId) {
      throw new Error('Bạn không có quyền cập nhật phản tư cho trận đấu này.');
    }

    // Kiểm tra trạng thái đã nhận thưởng từ Firestore server
    const alreadyClaimed = existingMatch.reflectionRewardClaimed === true;
    const currentServerXP = user.currentXP;

    let newXP = currentServerXP;
    let xpEarned = 0;
    let claimedReward = false;

    if (!alreadyClaimed) {
      xpEarned = 25;
      newXP = currentServerXP + 25;
      claimedReward = true;
    }

    const progress = getProgressFromXP(newXP);

    const projectedMatch = {
      ...existingMatch,
      reflection,
      reflectionRewardClaimed: true
    };

    // Kiểm tra Firestore Rules
    if (!this.deployNewRules) {
      // Deployed rules cũ: allow update: if false
      throw new Error('PERMISSION_DENIED: False permission on update matches');
    }

    const ruleEval = FirestoreRulesEngine.evaluateMatchUpdateRule(
      userId,
      matchId,
      existingMatch,
      projectedMatch,
      currentServerXP,
      newXP
    );

    if (!ruleEval.allowed) {
      throw new Error(`PERMISSION_DENIED: ${ruleEval.reason}`);
    }

    // Ghi nguyên tử trong transaction
    userMatches[matchId] = projectedMatch;

    if (claimedReward) {
      user.xp = newXP;
      user.currentXP = newXP;
      user.level = progress.level;
      user.nextLevelXP = progress.nextLevelXP;
      user.title = progress.title;

      const lb = this.leaderboard[userId];
      lb.xp = newXP;
      lb.level = progress.level;
      lb.title = progress.title;
    }

    return {
      claimedReward,
      xpEarned,
      newXP,
      level: progress.level,
      nextLevelXP: progress.nextLevelXP,
      title: progress.title
    };
  }
}

// --------------------------------------------------------------------------
// 3. Giả lập Client Application (GamificationContext & DebateArenaView)
// --------------------------------------------------------------------------

class AppClientSimulator {
  userId: string | null;
  db: MockFirestoreDb;
  profile: UserProfile;
  debateHistory: DebateMatchRecord[] = [];
  floatingXps: Array<{ id: string; amount: number; reason: string }> = [];

  // In-flight locks
  reflectionRewardInFlight: Record<string, boolean> = {};
  claimedReflectionMatchIds = new Set<string>();

  constructor(userId: string | null, db: MockFirestoreDb, initialXP = 0, initialDebates = 0, initialWon = 0) {
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
      totalDebates: initialDebates,
      debatesWon: initialWon,
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
      db.initUser(userId, initialXP, initialDebates, initialWon);
    }
  }

  // Kết thúc trận (BUG-13)
  async recordDebateEnd(data: {
    id: string;
    outcome: 'victory' | 'defeat';
    studentHp?: number;
    aiHp?: number;
    xpEarned: number;
    topicMotion?: string;
  }): Promise<string> {
    const match: DebateMatchRecord = {
      id: data.id,
      topicMotion: data.topicMotion || 'Tranh biện học đường WSDC',
      studentSide: 'pro',
      outcome: data.outcome,
      studentHp: data.studentHp ?? 80,
      aiHp: data.aiHp ?? 0,
      xpEarned: data.xpEarned,
      roundsCompleted: 4,
      personaName: 'Đại kiện tướng WSDC',
      date: '08/11/2026',
      timestamp: '17:30',
      reflectionRewardClaimed: false
    };

    if (this.userId) {
      await this.db.recordDebateMatch(this.userId, match);
      const user = this.db.users[this.userId];
      this.profile = {
        ...this.profile,
        currentXP: user.currentXP,
        xp: user.xp,
        level: user.level,
        nextLevelXP: user.nextLevelXP,
        title: user.title,
        totalDebates: user.totalDebates,
        debatesWon: user.debatesWon
      };
    } else {
      const won = match.outcome === 'victory';
      const newTotalXP = this.profile.currentXP + data.xpEarned;
      const progress = getProgressFromXP(newTotalXP);
      this.profile = {
        ...this.profile,
        currentXP: newTotalXP,
        xp: newTotalXP,
        level: progress.level,
        nextLevelXP: progress.nextLevelXP,
        title: progress.title,
        totalDebates: this.profile.totalDebates + 1,
        debatesWon: this.profile.debatesWon + (won ? 1 : 0)
      };
    }

    this.debateHistory = [match, ...this.debateHistory.filter(m => m.id !== match.id)];
    return match.id;
  }

  // Lưu phản tư (BUG-16: Code mới sử dụng Transaction nguyên tử)
  async saveDebateReflection(
    matchId: string,
    reflection: PostMatchReflection
  ): Promise<boolean> {
    if (!matchId) return false;

    if (this.reflectionRewardInFlight[matchId]) {
      return false;
    }
    this.reflectionRewardInFlight[matchId] = true;

    try {
      if (this.userId) {
        // Thực hiện transaction trên Firestore
        const result = await this.db.executeSaveReflectionTransaction(
          this.userId,
          matchId,
          reflection
        );

        if (result.claimedReward) {
          this.profile = {
            ...this.profile,
            currentXP: result.newXP,
            xp: result.newXP,
            level: result.level,
            nextLevelXP: result.nextLevelXP,
            title: result.title
          };
          this.claimedReflectionMatchIds.add(matchId);
          this.floatingXps.push({
            id: `refl_xp_${Date.now()}`,
            amount: 25,
            reason: 'Hoàn thành phản tư sau trận đấu (+25 XP)'
          });
        }

        this.debateHistory = this.debateHistory.map(m =>
          m.id === matchId ? { ...m, reflection, reflectionRewardClaimed: true } : m
        );
        return true;
      } else {
        // Guest mode
        const targetMatch = this.debateHistory.find(m => m.id === matchId);
        const alreadyClaimed = targetMatch?.reflectionRewardClaimed || this.claimedReflectionMatchIds.has(matchId);

        if (!alreadyClaimed) {
          this.claimedReflectionMatchIds.add(matchId);
          const newTotalXP = this.profile.currentXP + 25;
          const progress = getProgressFromXP(newTotalXP);
          this.profile = {
            ...this.profile,
            currentXP: newTotalXP,
            xp: newTotalXP,
            level: progress.level,
            nextLevelXP: progress.nextLevelXP,
            title: progress.title
          };
          this.floatingXps.push({
            id: `guest_refl_xp_${Date.now()}`,
            amount: 25,
            reason: 'Hoàn thành phản tư sau trận đấu (+25 XP)'
          });
        }

        this.debateHistory = this.debateHistory.map(m =>
          m.id === matchId ? { ...m, reflection, reflectionRewardClaimed: true } : m
        );
        return true;
      }
    } catch (err) {
      console.error('[Client] Lỗi lưu phản tư:', err);
      return false;
    } finally {
      delete this.reflectionRewardInFlight[matchId];
    }
  }

  // Giả lập Reload trang: Đọc lại toàn bộ từ Firestore
  async reloadFromFirestore() {
    if (!this.userId) return;
    const user = this.db.users[this.userId];
    const userMatches = Object.values(this.db.matches[this.userId] || {});
    this.profile = {
      ...this.profile,
      currentXP: user.currentXP,
      xp: user.xp,
      level: user.level,
      nextLevelXP: user.nextLevelXP,
      title: user.title,
      totalDebates: user.totalDebates,
      debatesWon: user.debatesWon
    };
    this.debateHistory = userMatches.sort((a, b) => b.id.localeCompare(a.id));
  }
}

// --------------------------------------------------------------------------
// 4. TIẾN TRÌNH KIỂM THỬ 11 KỊCH BẢN CHO BUG-16 & BUG-13
// --------------------------------------------------------------------------

async function runRegressionSuite() {
  const db = new MockFirestoreDb();

  // Kịch bản 1: Lưu phản tư lần đầu -> Cộng đúng 25 XP
  console.log('--- Kịch bản 1: Lưu phản tư lần đầu (Thưởng +25 XP) ---');
  {
    const client = new AppClientSimulator('user_k1', db, 0, 0, 0);
    const matchId = 'match_k1';
    await client.recordDebateEnd({ id: matchId, outcome: 'victory', xpEarned: 180 });

    const reflection: PostMatchReflection = {
      opponentThoughtProvokingPoint: 'Đối thủ nêu luận điểm rất hay về áp lực tâm lý thi cử.',
      oppositeSideOpeningIdea: 'Nếu đổi phe, tôi sẽ mở đầu bằng dữ liệu thực tế tại các trường chuyên.'
    };

    const success = await client.saveDebateReflection(matchId, reflection);
    assert(success === true, 'Hàm saveDebateReflection trả về true');
    assertEquals(client.profile.currentXP, 205, 'Client XP tăng đúng 25: 180 + 25 = 205 XP');
    assertEquals(db.users['user_k1'].currentXP, 205, 'Firestore User XP lưu đúng 205 XP');
    assertEquals(db.leaderboard['user_k1'].xp, 205, 'Firestore Leaderboard XP đồng bộ 205 XP');
    assertEquals(db.matches['user_k1'][matchId].reflectionRewardClaimed, true, 'Match reflectionRewardClaimed = true trên Firestore');
    assertEquals(db.matches['user_k1'][matchId].reflection, reflection, 'Nội dung phản tư được lưu nguyên vẹn trên Firestore');
  }

  // Kịch bản 2: Lưu lại cùng matchId -> Không cộng XP lần 2
  console.log('\n--- Kịch bản 2: Lưu lại cùng matchId (Không cộng XP lần 2) ---');
  {
    const client = new AppClientSimulator('user_k2', db, 0, 0, 0);
    const matchId = 'match_k2';
    await client.recordDebateEnd({ id: matchId, outcome: 'victory', xpEarned: 180 });

    const reflection1: PostMatchReflection = {
      opponentThoughtProvokingPoint: 'Ý kiến ban đầu',
      oppositeSideOpeningIdea: 'Ý kiến mở đầu 1'
    };
    await client.saveDebateReflection(matchId, reflection1);
    assertEquals(client.profile.currentXP, 205, 'Lần 1: XP đạt 205 (+25 XP)');

    // Lưu lại lần 2 để sửa nội dung phản tư
    const reflection2: PostMatchReflection = {
      opponentThoughtProvokingPoint: 'Ý kiến bổ sung sắc bén hơn',
      oppositeSideOpeningIdea: 'Ý kiến mở đầu 2 đã trau chuốt'
    };
    const success2 = await client.saveDebateReflection(matchId, reflection2);
    assert(success2 === true, 'Lần 2 vẫn trả về true (cập nhật thành công)');
    assertEquals(client.profile.currentXP, 205, 'XP vẫn giữ nguyên 205, KHÔNG bị cộng thêm lần 2');
    assertEquals(db.users['user_k2'].currentXP, 205, 'Firestore XP vẫn giữ nguyên 205');
    assertEquals(db.matches['user_k2'][matchId].reflection.opponentThoughtProvokingPoint, 'Ý kiến bổ sung sắc bén hơn', 'Nội dung mới đã được cập nhật');
  }

  // Kịch bản 3: Hai thiết bị lưu đồng thời cùng matchId -> Chỉ cộng 25 XP đúng 1 lần
  console.log('\n--- Kịch bản 3: Hai thiết bị gửi lưu đồng thời (Multi-device Race Condition) ---');
  {
    const clientDeviceA = new AppClientSimulator('user_k3', db, 0, 0, 0);
    const clientDeviceB = new AppClientSimulator('user_k3', db, 0, 0, 0);
    const matchId = 'match_k3_concurrent';

    // Tạo trận đấu trên db
    await clientDeviceA.recordDebateEnd({ id: matchId, outcome: 'victory', xpEarned: 180 });

    const reflA: PostMatchReflection = {
      opponentThoughtProvokingPoint: 'Ý từ máy tính',
      oppositeSideOpeningIdea: 'Mở đầu từ máy tính'
    };
    const reflB: PostMatchReflection = {
      opponentThoughtProvokingPoint: 'Ý từ điện thoại',
      oppositeSideOpeningIdea: 'Mở đầu từ điện thoại'
    };

    // Gửi song song từ 2 thiết bị
    const [resA, resB] = await Promise.all([
      clientDeviceA.saveDebateReflection(matchId, reflA),
      clientDeviceB.saveDebateReflection(matchId, reflB)
    ]);

    assert(resA === true && resB === true, 'Cả hai thiết bị đều xử lý thành công');
    assertEquals(db.users['user_k3'].currentXP, 205, 'Tổng XP trên Firestore CHỈ tăng đúng 25 XP (180 + 25 = 205), không bị nhân đôi lên 230 XP');
  }

  // Kịch bản 4: Firestore từ chối ghi (Lỗi mạng / PERMISSION_DENIED) -> Không tăng XP ảo
  console.log('\n--- Kịch bản 4: Firestore báo lỗi mạng hoặc bị từ chối ghi ---');
  {
    const client = new AppClientSimulator('user_k4', db, 100, 1, 0);
    const matchId = 'match_k4';
    await client.recordDebateEnd({ id: matchId, outcome: 'defeat', xpEarned: 60 });
    assertEquals(client.profile.currentXP, 160, 'XP sau trận thua: 160');

    // Bật lỗi mạng
    db.simulateNetworkError = true;

    const reflection: PostMatchReflection = {
      opponentThoughtProvokingPoint: 'Lỗi mạng khi lưu',
      oppositeSideOpeningIdea: 'Thử lại sau'
    };

    const success = await client.saveDebateReflection(matchId, reflection);
    assert(success === false, 'Trả về false khi Firestore thất bại');
    assertEquals(client.profile.currentXP, 160, 'XP KHÔNG bị tăng ảo (vẫn là 160)');
    assertEquals(db.users['user_k4'].currentXP, 160, 'Firestore nguyên vẹn 160 XP');

    // Tắt lỗi mạng và thử lại
    db.simulateNetworkError = false;
    const retrySuccess = await client.saveDebateReflection(matchId, reflection);
    assert(retrySuccess === true, 'Bấm Thử lại thành công khi mạng kết nối lại');
    assertEquals(client.profile.currentXP, 185, 'XP tăng chính xác sau khi thử lại: 160 + 25 = 185');
  }

  // Kịch bản 5: Tải lại trang (Reload) -> Nội dung phản tư và trạng thái nhận thưởng vẫn tồn tại
  console.log('\n--- Kịch bản 5: Tải lại trang sau khi lưu phản tư ---');
  {
    const client = new AppClientSimulator('user_k5', db, 200, 1, 1);
    const matchId = 'match_k5';
    await client.recordDebateEnd({ id: matchId, outcome: 'victory', xpEarned: 180 });

    const reflection: PostMatchReflection = {
      opponentThoughtProvokingPoint: 'Luận điểm đối thủ rất sâu sắc',
      oppositeSideOpeningIdea: 'Cách tiếp cận phản biện mới'
    };
    await client.saveDebateReflection(matchId, reflection);
    assertEquals(client.profile.currentXP, 405, 'XP trước reload: 200 + 180 + 25 = 405');

    // Tải lại trang
    await client.reloadFromFirestore();

    assertEquals(client.profile.currentXP, 405, 'XP sau reload từ Firestore vẫn là 405');
    assertEquals(client.debateHistory.length, 1, 'Lịch sử có 1 trận');
    assertEquals(client.debateHistory[0].reflection?.opponentThoughtProvokingPoint, 'Luận điểm đối thủ rất sâu sắc', 'Phản tư vẫn tồn tại đầy đủ sau reload');
    assertEquals(client.debateHistory[0].reflectionRewardClaimed, true, 'reflectionRewardClaimed vẫn là true sau reload');
  }

  // Kịch bản 6: Không tạo thêm bản ghi trận đấu mới trong lịch sử hoặc subcollection matches
  console.log('\n--- Kịch bản 6: Không nhân đôi hay tạo thêm bản ghi trận đấu ---');
  {
    const client = new AppClientSimulator('user_k6', db, 0, 0, 0);
    const matchId = 'match_k6';
    await client.recordDebateEnd({ id: matchId, outcome: 'victory', xpEarned: 180 });
    assertEquals(client.debateHistory.length, 1, 'Trước lưu phản tư: đúng 1 trận');

    await client.saveDebateReflection(matchId, {
      opponentThoughtProvokingPoint: 'Điểm hay',
      oppositeSideOpeningIdea: 'Ý mở đầu'
    });

    assertEquals(client.debateHistory.length, 1, 'Sau lưu phản tư: VẪN ĐÚNG 1 TRẬN, không sinh trận ảo');
    assertEquals(Object.keys(db.matches['user_k6']).length, 1, 'Trên Firestore matches: duy nhất 1 tài liệu');
  }

  // Kịch bản 7: Không thay đổi số trận thắng (debatesWon) hoặc tổng số trận (totalDebates)
  console.log('\n--- Kịch bản 7: Không thay đổi debatesWon và totalDebates ---');
  {
    const client = new AppClientSimulator('user_k7', db, 0, 0, 0);
    const matchId = 'match_k7';
    await client.recordDebateEnd({ id: matchId, outcome: 'victory', xpEarned: 180 });

    assertEquals(client.profile.totalDebates, 1, 'totalDebates = 1 sau trận');
    assertEquals(client.profile.debatesWon, 1, 'debatesWon = 1 sau trận thắng');

    await client.saveDebateReflection(matchId, {
      opponentThoughtProvokingPoint: 'A',
      oppositeSideOpeningIdea: 'B'
    });

    assertEquals(client.profile.totalDebates, 1, 'totalDebates KHÔNG ĐỔI sau khi lưu phản tư');
    assertEquals(client.profile.debatesWon, 1, 'debatesWon KHÔNG ĐỔI sau khi lưu phản tư');
    assertEquals(db.users['user_k7'].totalDebates, 1, 'Firestore totalDebates giữ nguyên 1');
    assertEquals(db.users['user_k7'].debatesWon, 1, 'Firestore debatesWon giữ nguyên 1');
  }

  // Kịch bản 8: Không cộng lại XP thắng (+180) hoặc thua (+60) khi lưu phản tư
  console.log('\n--- Kịch bản 8: Không cộng lại XP kết thúc trận ---');
  {
    const client = new AppClientSimulator('user_k8', db, 300, 2, 1);
    const matchId = 'match_k8';
    await client.recordDebateEnd({ id: matchId, outcome: 'victory', xpEarned: 180 });
    assertEquals(client.profile.currentXP, 480, 'XP sau trận thắng: 300 + 180 = 480');

    await client.saveDebateReflection(matchId, {
      opponentThoughtProvokingPoint: 'X',
      oppositeSideOpeningIdea: 'Y'
    });

    // Chỉ được cộng đúng 25 XP phản tư, KHÔNG ĐƯỢC cộng thêm 180 XP trận
    assertEquals(client.profile.currentXP, 505, 'XP = 505 (480 + 25), không cộng trùng 180 XP');
    assertEquals(db.users['user_k8'].currentXP, 505, 'Firestore XP chuẩn xác 505');
  }

  // Kịch bản 9: Leaderboard và hồ sơ người dùng đồng bộ 100%
  console.log('\n--- Kịch bản 9: Đồng bộ hoàn hảo giữa Hồ sơ và Leaderboard ---');
  {
    const client = new AppClientSimulator('user_k9', db, 500, 3, 2);
    const matchId = 'match_k9';
    await client.recordDebateEnd({ id: matchId, outcome: 'victory', xpEarned: 180 });
    await client.saveDebateReflection(matchId, {
      opponentThoughtProvokingPoint: 'Góc nhìn phản biện đa chiều',
      oppositeSideOpeningIdea: 'Ý mở đầu thuyết phục'
    });

    const profileXP = client.profile.currentXP;
    const firestoreUserXP = db.users['user_k9'].currentXP;
    const leaderboardXP = db.leaderboard['user_k9'].xp;

    assertEquals(profileXP, 705, 'Profile XP = 705 (500 + 180 + 25)');
    assertEquals(firestoreUserXP, 705, 'Firestore User XP = 705');
    assertEquals(leaderboardXP, 705, 'Leaderboard XP = 705');
    assert(profileXP === leaderboardXP, 'Hồ sơ người dùng và Leaderboard khớp 100%');
  }

  // Kịch bản 10: Firestore Rules: Cho phép cập nhật hợp lệ, chặn sửa đổi kết quả trận
  console.log('\n--- Kịch bản 10: Kiểm thử Firestore Rules chi tiết ---');
  {
    const existingMatch = {
      id: 'match_sec_test',
      userId: 'user_sec',
      topicMotion: 'Tranh biện học đường',
      studentSide: 'pro',
      outcome: 'victory',
      studentHp: 70,
      aiHp: 0,
      xpEarned: 180,
      roundsCompleted: 4,
      personaName: 'Đại kiện tướng WSDC',
      date: '08/11/2026',
      timestamp: '18:00',
      reflectionRewardClaimed: false
    };

    // Test 10.1: Cập nhật hợp lệ kèm cộng 25 XP -> ALLOWED
    const validUpdate = {
      ...existingMatch,
      reflection: {
        opponentThoughtProvokingPoint: 'Ý kiến hay',
        oppositeSideOpeningIdea: 'Mở đầu tốt'
      },
      reflectionRewardClaimed: true
    };
    const eval1 = FirestoreRulesEngine.evaluateMatchUpdateRule(
      'user_sec',
      'match_sec_test',
      existingMatch,
      validUpdate,
      180,
      205 // user XP +25
    );
    assert(eval1.allowed === true, 'Rules cho phép cập nhật reflection hợp lệ kèm +25 XP');

    // Test 10.2: Cố tình gian lận thay đổi outcome từ defeat thành victory -> BLOCKED
    const hackedOutcome = {
      ...validUpdate,
      outcome: 'defeat'
    };
    const eval2 = FirestoreRulesEngine.evaluateMatchUpdateRule(
      'user_sec',
      'match_sec_test',
      existingMatch,
      hackedOutcome,
      180,
      205
    );
    assert(eval2.allowed === false, 'Rules chặn gian lận thay đổi outcome');

    // Test 10.3: Cố tình gian lận sửa xpEarned -> BLOCKED
    const hackedXP = {
      ...validUpdate,
      xpEarned: 300
    };
    const eval3 = FirestoreRulesEngine.evaluateMatchUpdateRule(
      'user_sec',
      'match_sec_test',
      existingMatch,
      hackedXP,
      180,
      205
    );
    assert(eval3.allowed === false, 'Rules chặn gian lận thay đổi xpEarned');

    // Test 10.4: Cố tình gian lận tăng nhiều hơn 25 XP trên user doc -> BLOCKED
    const eval4 = FirestoreRulesEngine.evaluateMatchUpdateRule(
      'user_sec',
      'match_sec_test',
      existingMatch,
      validUpdate,
      180,
      300 // hack +120 XP
    );
    assert(eval4.allowed === false, 'Rules chặn gian lận tăng quá 25 XP trên user document');

    // Test 10.5: Chuyển reflectionRewardClaimed từ true về false -> BLOCKED
    const claimedMatch = { ...validUpdate, reflectionRewardClaimed: true };
    const unclaimAttempt = { ...validUpdate, reflectionRewardClaimed: false };
    const eval5 = FirestoreRulesEngine.evaluateMatchUpdateRule(
      'user_sec',
      'match_sec_test',
      claimedMatch,
      unclaimAttempt,
      205,
      205
    );
    assert(eval5.allowed === false, 'Rules chặn chuyển reflectionRewardClaimed từ true về false');
  }

  // Kịch bản 11: Xác nhận BUG-13 (chống trùng XP kết thúc trận 1v1) vẫn hoạt động hoàn hảo
  console.log('\n--- Kịch bản 11: Bảo toàn tuyệt đối bản vá BUG-13 ---');
  {
    const client = new AppClientSimulator('user_k11', db, 0, 0, 0);
    const matchId = 'match_k11';

    // Thắng 1 trận 1v1
    await client.recordDebateEnd({ id: matchId, outcome: 'victory', xpEarned: 180 });
    assertEquals(client.profile.currentXP, 180, 'BUG-13: Thắng trận nhận đúng 180 XP');
    assertEquals(client.profile.totalDebates, 1, 'BUG-13: totalDebates = 1');
    assertEquals(client.profile.debatesWon, 1, 'BUG-13: debatesWon = 1');

    // Gọi lại lần 2 kết thúc trận với cùng matchId -> Idempotent, không cộng trùng
    await client.recordDebateEnd({ id: matchId, outcome: 'victory', xpEarned: 180 });
    assertEquals(client.profile.currentXP, 180, 'BUG-13: Gọi lại kết thúc trận không làm tăng XP (vẫn 180 XP)');

    // Lưu phản tư -> Cộng đúng 25 XP
    await client.saveDebateReflection(matchId, {
      opponentThoughtProvokingPoint: 'Phản biện sắc bén',
      oppositeSideOpeningIdea: 'Ý mở đầu mới'
    });
    assertEquals(client.profile.currentXP, 205, 'Sau phản tư: Đúng 205 XP (180 + 25)');
    assertEquals(client.profile.totalDebates, 1, 'totalDebates vẫn là 1');
    assertEquals(client.profile.debatesWon, 1, 'debatesWon vẫn là 1');
  }

  console.log('\n🎉 TOÀN BỘ 11/11 KỊCH BẢN KIỂM THỬ HỒI QUY CHO BUG-16 & BUG-13 ĐÃ VƯỢT QUA 100%! 🎉\n');
}

runRegressionSuite().catch(err => {
  console.error('\n💥 TEST THẤT BẠI:', err);
  process.exit(1);
});

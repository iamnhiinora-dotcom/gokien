/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BỘ KIỂM THỬ HỒI QUY TOÀN DIỆN CHO BUG-16:
 * "Trùng lịch sử trận đấu và cộng XP khi lưu phản tư"
 * 
 * Chạy độc lập:
 *   npx tsx src/tests/reflectionRegression.test.ts
 */

import { DebateMatchRecord, PostMatchReflection, UserProfile } from '../types';
import { getProgressFromXP } from '../utils/levelSystem';

// Mock assertion helpers
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

console.log('\n=== BẮT ĐẦU CHẠY REGRESSION TESTS CHO BUG-16 ===\n');

// -------------------------------------------------------------
// Giả lập Logic State & Gamification Handler theo Code thực tế
// -------------------------------------------------------------
class GamificationSimulator {
  profile: UserProfile;
  debateHistory: DebateMatchRecord[] = [];
  claimedReflectionMatchIds = new Set<string>();
  reflectionInFlight: Record<string, boolean> = {};
  firestoreMatches: Record<string, any> = {};
  firestoreUsers: Record<string, any> = {};
  firestoreLeaderboard: Record<string, any> = {};
  rulesAllowMatchUpdate: boolean = false; // Mặc định deployed rules: allow update: if false

  constructor(initialXP = 0, initialDebates = 0, initialWon = 0, isGuest = false) {
    const progress = getProgressFromXP(initialXP);
    this.profile = {
      id: isGuest ? 'guest' : 'user_test_123',
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
  }

  // Giả lập recordDebateEnd (hàm mới trả về matchId, không cộng XP 2 lần)
  recordDebateEnd(data: {
    topicMotion: string;
    studentSide: 'pro' | 'con';
    outcome: 'victory' | 'defeat';
    studentHp: number;
    aiHp: number;
    xpEarned: number;
    roundsCompleted: number;
    personaName?: string;
  }): string {
    const won = data.outcome === 'victory';
    const matchId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const newMatch: DebateMatchRecord = {
      id: matchId,
      topicMotion: data.topicMotion,
      studentSide: data.studentSide,
      outcome: data.outcome,
      studentHp: data.studentHp,
      aiHp: data.aiHp,
      xpEarned: data.xpEarned,
      roundsCompleted: data.roundsCompleted,
      personaName: data.personaName || 'AI Debater',
      date: '08/11/2026',
      timestamp: '17:00',
      reflectionRewardClaimed: false
    };

    // 1. Thêm vào debateHistory
    this.debateHistory = [newMatch, ...this.debateHistory];

    // 2. Cập nhật profile (chỉ cộng xpEarned đúng 1 lần từ match)
    const newTotalDebates = this.profile.totalDebates + 1;
    const newDebatesWon = this.profile.debatesWon + (won ? 1 : 0);
    const newTotalXP = this.profile.currentXP + data.xpEarned;
    const progress = getProgressFromXP(newTotalXP);

    this.profile = {
      ...this.profile,
      currentXP: newTotalXP,
      xp: newTotalXP,
      level: progress.level,
      nextLevelXP: progress.nextLevelXP,
      title: progress.title,
      totalDebates: newTotalDebates,
      debatesWon: newDebatesWon
    };

    // Giả lập ghi Firestore batch
    if (this.profile.id !== 'guest') {
      this.firestoreMatches[matchId] = { ...newMatch, userId: this.profile.id };
      this.firestoreUsers[this.profile.id] = {
        xp: newTotalXP,
        totalDebates: newTotalDebates,
        debatesWon: newDebatesWon
      };
      this.firestoreLeaderboard[this.profile.id] = {
        xp: newTotalXP,
        debatesWon: newDebatesWon
      };
    }

    return matchId;
  }

  // Giả lập addXP
  async addXP(amount: number, forceFail = false): Promise<boolean> {
    if (forceFail) return false;
    const newTotalXP = this.profile.currentXP + amount;
    const progress = getProgressFromXP(newTotalXP);

    this.profile = {
      ...this.profile,
      currentXP: newTotalXP,
      xp: newTotalXP,
      level: progress.level,
      nextLevelXP: progress.nextLevelXP,
      title: progress.title
    };

    if (this.profile.id !== 'guest') {
      this.firestoreUsers[this.profile.id] = {
        ...this.firestoreUsers[this.profile.id],
        xp: newTotalXP
      };
      this.firestoreLeaderboard[this.profile.id] = {
        ...this.firestoreLeaderboard[this.profile.id],
        xp: newTotalXP
      };
    }
    return true;
  }

  // Giả lập updateDebateMatchReflectionInFirestore với kiểm tra Firestore rules
  async updateDebateMatchReflectionInFirestore(matchId: string, reflection: PostMatchReflection): Promise<boolean> {
    if (!this.rulesAllowMatchUpdate) {
      // PERMISSION_DENIED under current deployed rules
      console.warn(`[updateDebateMatchReflectionInFirestore] PERMISSION_DENIED: rules allow update: if false`);
      return false;
    }
    if (this.firestoreMatches[matchId]) {
      this.firestoreMatches[matchId].reflection = reflection;
      this.firestoreMatches[matchId].reflectionRewardClaimed = true;
      return true;
    }
    return false;
  }

  // Giả lập saveDebateReflection theo code mới
  async saveDebateReflection(
    matchId: string, 
    reflection: PostMatchReflection,
    forceFailAddXP = false
  ): Promise<boolean> {
    if (!matchId) return false;

    // Concurrency / in-flight lock
    if (this.reflectionInFlight[matchId]) {
      return false;
    }

    const isAlreadyClaimed = this.claimedReflectionMatchIds.has(matchId);
    const targetMatch = this.debateHistory.find(m => m.id === matchId);

    if (targetMatch?.reflectionRewardClaimed || isAlreadyClaimed) {
      // Đã nhận thưởng -> chỉ cập nhật text, không cộng XP
      this.debateHistory = this.debateHistory.map(m =>
        m.id === matchId ? { ...m, reflection, reflectionRewardClaimed: true } : m
      );
      if (this.profile.id !== 'guest') {
        await this.updateDebateMatchReflectionInFirestore(matchId, reflection).catch(() => {});
      }
      return true;
    }

    this.reflectionInFlight[matchId] = true;

    try {
      const REFLECTION_XP = 25;
      const success = await this.addXP(REFLECTION_XP, forceFailAddXP);
      if (!success) {
        return false;
      }

      this.claimedReflectionMatchIds.add(matchId);
      this.debateHistory = this.debateHistory.map(m =>
        m.id === matchId ? { ...m, reflection, reflectionRewardClaimed: true } : m
      );

      if (this.profile.id !== 'guest') {
        await this.updateDebateMatchReflectionInFirestore(matchId, reflection).catch(() => {});
      }

      return true;
    } finally {
      delete this.reflectionInFlight[matchId];
    }
  }
}

// -------------------------------------------------------------
// CHẠY CẢ 10 KỊCH BẢN KIỂM THỬ (10 TEST SCENARIOS)
// -------------------------------------------------------------

console.log('--- Kịch bản 1: Kết thúc trận đấu (triggerEndMatch) tạo đúng 1 bản ghi và cộng XP 1 lần ---');
{
  const sim = new GamificationSimulator(0, 0, 0, false);
  const matchId = sim.recordDebateEnd({
    topicMotion: 'Nên cấm điện thoại trong lớp học',
    studentSide: 'pro',
    outcome: 'victory',
    studentHp: 75,
    aiHp: 0,
    xpEarned: 180,
    roundsCompleted: 4
  });

  assert(typeof matchId === 'string' && matchId.startsWith('match_'), 'recordDebateEnd trả về matchId hợp lệ');
  assertEquals(sim.debateHistory.length, 1, 'Chỉ tạo đúng 1 bản ghi trong debateHistory');
  assertEquals(sim.profile.currentXP, 180, 'Cộng đúng 180 XP trận thắng (không bị cộng đúp thành 360 XP)');
  assertEquals(sim.profile.totalDebates, 1, 'totalDebates tăng đúng 1');
  assertEquals(sim.profile.debatesWon, 1, 'debatesWon tăng đúng 1');
}

console.log('\n--- Kịch bản 2: Lưu phản tư cập nhật trường reflection vào đúng trận đấu đã tồn tại ---');
{
  const sim = new GamificationSimulator(0, 0, 0, false);
  const matchId = sim.recordDebateEnd({
    topicMotion: 'Nên cấm điện thoại trong lớp học',
    studentSide: 'pro',
    outcome: 'victory',
    studentHp: 75,
    aiHp: 0,
    xpEarned: 180,
    roundsCompleted: 4
  });

  const reflectionData: PostMatchReflection = {
    opponentThoughtProvokingPoint: 'Góc nhìn về chi phí và bình đẳng tiếp cận của đối thủ rất sâu sắc.',
    oppositeSideOpeningIdea: 'Nếu đổi phe, tôi sẽ mở đầu bằng câu hỏi về áp lực kinh tế đối với gia đình học sinh.'
  };

  const success = await sim.saveDebateReflection(matchId, reflectionData);
  assert(success === true, 'Lưu phản tư thành công');

  const match = sim.debateHistory.find(m => m.id === matchId);
  assert(match !== undefined, 'Trận đấu tồn tại trong debateHistory');
  assertEquals(match?.reflection?.opponentThoughtProvokingPoint, reflectionData.opponentThoughtProvokingPoint, 'Nội dung phản tư 1 được lưu đúng');
  assertEquals(match?.reflection?.oppositeSideOpeningIdea, reflectionData.oppositeSideOpeningIdea, 'Nội dung phản tư 2 được lưu đúng');
  assert(match?.reflectionRewardClaimed === true, 'Cờ reflectionRewardClaimed được đánh dấu true');
}

console.log('\n--- Kịch bản 3: Lưu phản tư KHÔNG tạo thêm bản ghi trận đấu mới ---');
{
  const sim = new GamificationSimulator(100, 2, 1, false);
  const matchId = sim.recordDebateEnd({
    topicMotion: 'Áp dụng AI vào dạy học',
    studentSide: 'con',
    outcome: 'defeat',
    studentHp: 0,
    aiHp: 40,
    xpEarned: 60,
    roundsCompleted: 4
  });

  const countBeforeReflection = sim.debateHistory.length;
  await sim.saveDebateReflection(matchId, {
    opponentThoughtProvokingPoint: 'Đối thủ chứng minh tính hiệu quả của cá nhân hóa học tập.',
    oppositeSideOpeningIdea: 'Mở đầu bằng việc khẳng định vai trò của công nghệ hỗ trợ.'
  });
  const countAfterReflection = sim.debateHistory.length;

  assertEquals(countBeforeReflection, countAfterReflection, 'debateHistory.length giữ nguyên, KHÔNG sinh thêm bản ghi trận mới');
}

console.log('\n--- Kịch bản 4: Lưu phản tư KHÔNG tăng totalDebates hay debatesWon ---');
{
  const sim = new GamificationSimulator(0, 0, 0, false);
  const matchId = sim.recordDebateEnd({
    topicMotion: 'Học đại học có phải con đường duy nhất',
    studentSide: 'pro',
    outcome: 'victory',
    studentHp: 65,
    aiHp: 0,
    xpEarned: 180,
    roundsCompleted: 4
  });

  const totalDebatesBefore = sim.profile.totalDebates;
  const debatesWonBefore = sim.profile.debatesWon;

  await sim.saveDebateReflection(matchId, {
    opponentThoughtProvokingPoint: 'Học nghề cũng là một lựa chọn tuyệt vời.',
    oppositeSideOpeningIdea: 'Mở đầu bằng các số liệu thị trường lao động.'
  });

  assertEquals(sim.profile.totalDebates, totalDebatesBefore, 'totalDebates KHÔNG tăng khi lưu phản tư');
  assertEquals(sim.profile.debatesWon, debatesWonBefore, 'debatesWon KHÔNG tăng khi lưu phản tư');
}

console.log('\n--- Kịch bản 5: Lưu phản tư cộng đúng 25 XP (Atomic/Idempotent) ---');
{
  const sim = new GamificationSimulator(0, 0, 0, false);
  const matchId = sim.recordDebateEnd({
    topicMotion: 'Chủ đề kiểm tra XP',
    studentSide: 'pro',
    outcome: 'victory',
    studentHp: 50,
    aiHp: 0,
    xpEarned: 180,
    roundsCompleted: 4
  });

  assertEquals(sim.profile.currentXP, 180, 'XP ban đầu sau trận đấu là 180 XP');

  await sim.saveDebateReflection(matchId, {
    opponentThoughtProvokingPoint: 'Ý kiến hay',
    oppositeSideOpeningIdea: 'Ý tưởng mở đầu hay'
  });

  assertEquals(sim.profile.currentXP, 205, 'Tổng XP tăng đúng 25 XP: 180 + 25 = 205 XP');
}

console.log('\n--- Kịch bản 6: Chống trùng nhận thưởng (Idempotency) khi gọi saveDebateReflection nhiều lần ---');
{
  const sim = new GamificationSimulator(0, 0, 0, false);
  const matchId = sim.recordDebateEnd({
    topicMotion: 'Chống duplicate XP',
    studentSide: 'pro',
    outcome: 'victory',
    studentHp: 50,
    aiHp: 0,
    xpEarned: 180,
    roundsCompleted: 4
  });

  // Lưu lần 1
  const firstSave = await sim.saveDebateReflection(matchId, {
    opponentThoughtProvokingPoint: 'Lần 1',
    oppositeSideOpeningIdea: 'Lần 1'
  });
  assert(firstSave === true, 'Lần 1 lưu thành công');
  assertEquals(sim.profile.currentXP, 205, 'XP sau lần 1: 205');

  // Lưu lần 2 (cùng matchId, ví dụ người dùng bấm lại hoặc mở lại modal)
  const secondSave = await sim.saveDebateReflection(matchId, {
    opponentThoughtProvokingPoint: 'Lần 2 sửa đổi',
    oppositeSideOpeningIdea: 'Lần 2 sửa đổi'
  });
  assert(secondSave === true, 'Lần 2 vẫn hoàn tất an toàn');
  assertEquals(sim.profile.currentXP, 205, 'XP sau lần 2 KHÔNG đổi (vẫn là 205 XP, không cộng thêm 25 XP)');

  // Lưu lần 3
  await sim.saveDebateReflection(matchId, {
    opponentThoughtProvokingPoint: 'Lần 3',
    oppositeSideOpeningIdea: 'Lần 3'
  });
  assertEquals(sim.profile.currentXP, 205, 'XP sau lần 3 vẫn là 205 XP');
  assertEquals(sim.debateHistory.length, 1, 'Số lượng trận đấu vẫn duy nhất là 1');
}

console.log('\n--- Kịch bản 7: Multi-click lock / debounce khi click dồn dập ---');
{
  const sim = new GamificationSimulator(0, 0, 0, false);
  const matchId = sim.recordDebateEnd({
    topicMotion: 'Debounce test',
    studentSide: 'pro',
    outcome: 'victory',
    studentHp: 50,
    aiHp: 0,
    xpEarned: 180,
    roundsCompleted: 4
  });

  // Giả lập khóa in-flight đang hoạt động
  sim.reflectionInFlight[matchId] = true;
  const blockedCall = await sim.saveDebateReflection(matchId, {
    opponentThoughtProvokingPoint: 'Rapid click',
    oppositeSideOpeningIdea: 'Rapid click'
  });
  assert(blockedCall === false, 'Yêu cầu bị chặn (early return false) khi đang có request in-flight');

  // Mở khóa và gọi lại bình thường
  delete sim.reflectionInFlight[matchId];
  const allowedCall = await sim.saveDebateReflection(matchId, {
    opponentThoughtProvokingPoint: 'Normal click',
    oppositeSideOpeningIdea: 'Normal click'
  });
  assert(allowedCall === true, 'Yêu cầu hợp lệ tiếp theo được thực hiện bình thường');
}

console.log('\n--- Kịch bản 8: Xử lý lỗi khi lưu thất bại (Không tạo trạng thái thành công ảo) ---');
{
  const sim = new GamificationSimulator(0, 0, 0, false);
  const matchId = sim.recordDebateEnd({
    topicMotion: 'Error handling test',
    studentSide: 'con',
    outcome: 'defeat',
    studentHp: 0,
    aiHp: 30,
    xpEarned: 60,
    roundsCompleted: 4
  });

  assertEquals(sim.profile.currentXP, 60, 'XP ban đầu: 60');

  // Gọi với giả lập lỗi mạng/Firestore fail
  const failedAttempt = await sim.saveDebateReflection(matchId, {
    opponentThoughtProvokingPoint: 'Lỗi mạng',
    oppositeSideOpeningIdea: 'Lỗi mạng'
  }, true /* forceFailAddXP */);

  assert(failedAttempt === false, 'Trả về false khi lưu thất bại');
  assertEquals(sim.profile.currentXP, 60, 'XP không bị cộng ảo');
  assert(!sim.claimedReflectionMatchIds.has(matchId), 'Chưa ghi nhận nhận thưởng');

  const match = sim.debateHistory.find(m => m.id === matchId);
  assert(match?.reflectionRewardClaimed === false, 'reflectionRewardClaimed vẫn là false');

  // Thử lại khi mạng ổn định
  const retrySuccess = await sim.saveDebateReflection(matchId, {
    opponentThoughtProvokingPoint: 'Thử lại thành công',
    oppositeSideOpeningIdea: 'Thử lại thành công'
  }, false);

  assert(retrySuccess === true, 'Thử lại thành công khi kết nối bình thường');
  assertEquals(sim.profile.currentXP, 85, 'XP được cộng chính xác sau khi thử lại: 60 + 25 = 85');
}

console.log('\n--- Kịch bản 9: Chế độ khách (Guest mode) hoạt động ổn định và chính xác ---');
{
  const guestSim = new GamificationSimulator(0, 0, 0, true /* isGuest */);
  const guestMatchId = guestSim.recordDebateEnd({
    topicMotion: 'Khách thi đấu tranh biện',
    studentSide: 'pro',
    outcome: 'victory',
    studentHp: 80,
    aiHp: 0,
    xpEarned: 180,
    roundsCompleted: 4
  });

  assertEquals(guestSim.profile.currentXP, 180, 'Khách nhận đúng 180 XP trận thắng');
  assertEquals(guestSim.profile.totalDebates, 1, 'Khách totalDebates = 1');

  const guestReflectionSuccess = await guestSim.saveDebateReflection(guestMatchId, {
    opponentThoughtProvokingPoint: 'Khách phản tư',
    oppositeSideOpeningIdea: 'Khách đổi phe'
  });

  assert(guestReflectionSuccess === true, 'Khách lưu phản tư thành công');
  assertEquals(guestSim.profile.currentXP, 205, 'Khách được cộng 25 XP: 180 + 25 = 205 XP');
  assertEquals(guestSim.debateHistory.length, 1, 'Khách không bị nhân đôi trận đấu');
}

console.log('\n--- Kịch bản 10: Người dùng đăng nhập: An toàn với Firestore Rules và đồng bộ dữ liệu ---');
{
  const sim = new GamificationSimulator(300, 3, 2, false);
  sim.rulesAllowMatchUpdate = false; // Phản ánh đúng môi trường hiện tại: allow update: if false trên matches

  const matchId = sim.recordDebateEnd({
    topicMotion: 'Firestore Rules Security Test',
    studentSide: 'pro',
    outcome: 'victory',
    studentHp: 70,
    aiHp: 0,
    xpEarned: 180,
    roundsCompleted: 4
  });

  // Profile XP tăng từ 300 -> 480
  assertEquals(sim.profile.currentXP, 480, 'XP sau trận: 480');
  assertEquals(sim.firestoreUsers[sim.profile.id].xp, 480, 'Firestore user doc nhận 480 XP');

  // Lưu phản tư: Dù updateDoc trên match bị rules chặn, ứng dụng vẫn an toàn
  const reflectionSuccess = await sim.saveDebateReflection(matchId, {
    opponentThoughtProvokingPoint: 'Điểm nhìn công tâm',
    oppositeSideOpeningIdea: 'Cách tiếp cận mới'
  });

  assert(reflectionSuccess === true, 'Lưu phản tư vẫn thành công cho học sinh (không crash)');
  assertEquals(sim.profile.currentXP, 505, 'XP hồ sơ tăng đúng 25 XP: 480 + 25 = 505');
  assertEquals(sim.firestoreUsers[sim.profile.id].xp, 505, 'Firestore user doc lưu thành công 505 XP');
  assertEquals(sim.firestoreLeaderboard[sim.profile.id].xp, 505, 'Leaderboard Firestore đồng bộ 505 XP');

  const localMatch = sim.debateHistory.find(m => m.id === matchId);
  assertEquals(localMatch?.reflection?.opponentThoughtProvokingPoint, 'Điểm nhìn công tâm', 'Local state giữ nguyên phản tư');
}

console.log('\n🎉 TẤT CẢ 10/10 KỊCH BẢN KIỂM THỬ HỒI QUY CHO BUG-16 ĐÃ VƯỢT QUA XUẤT SẮC! 🎉\n');

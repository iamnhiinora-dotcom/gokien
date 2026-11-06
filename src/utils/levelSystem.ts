/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * HỆ THỐNG CẤP ĐỘ VÀ TIẾN TRÌNH KINH NGHIỆM (SINGLE SOURCE OF TRUTH)
 * Quy định chuẩn 10 cấp độ, tính toán Level, Title và NextLevelXP duy nhất dựa trên XP.
 */

export interface LevelInfo {
  title: string;
  minXP: number;
  maxXP: number;
}

export const LEVELS: { [level: number]: LevelInfo } = {
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

export const LEVEL_TITLES = LEVELS;

/**
 * Tính cấp độ từ điểm XP theo đúng quy định từ 10 xuống 1
 */
export function getLevelFromXP(xp: number): number {
  const safeXP = Math.max(0, Number(xp || 0));
  for (let level = 10; level >= 1; level--) {
    if (safeXP >= LEVELS[level].minXP) {
      return level;
    }
  }
  return 1;
}

/**
 * Tính toàn bộ thông số tiến trình (XP, level, nextLevelXP, title) từ một nguồn duy nhất
 */
export function getProgressFromXP(xp: number): {
  currentXP: number;
  xp: number;
  level: number;
  nextLevelXP: number;
  title: string;
} {
  const safeXP = Math.max(0, Number(xp || 0));
  const level = getLevelFromXP(safeXP);

  return {
    currentXP: safeXP,
    xp: safeXP,
    level,
    nextLevelXP: LEVELS[level].maxXP,
    title: LEVELS[level].title
  };
}

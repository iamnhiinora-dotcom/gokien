/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * HIỆU ỨNG THÔNG BÁO BAY CHỮ KINH NGHIỆM (+XP FLOATING NOTIFICATION)
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Thẻ trắng #FFFFFF viền #E5E1D8, chữ điểm XP vàng đậm #A16207 để đọc rõ.
 */

import React from 'react';
import { useGamification } from '../context/GamificationContext';
import { Sparkles } from 'lucide-react';

export const XpNotification: React.FC = () => {
  const { floatingXps } = useGamification();

  if (floatingXps.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col gap-2">
      {floatingXps.map(item => (
        <div
          key={item.id}
          className="animate-xp-float flex items-center gap-2 px-3.5 py-2 rounded bg-white border border-[#E5E1D8] shadow-md"
        >
          <div className="w-5 h-5 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-[#A16207]" />
          </div>
          <div>
            <div className="font-mono font-bold text-xs text-[#A16207]">
              +{item.amount} XP
            </div>
            <div className="text-[10px] text-[#4A5263] truncate max-w-[180px]">
              {item.reason}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

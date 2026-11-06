/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * THÔNG BÁO MỞ KHÓA HUY HIỆU (GÓC MÀN HÌNH, KHÔNG CHE KHUẤT)
 * Hiển thị nhỏ gọn ở góc dưới bên phải, không chiếm tiêu điểm hoặc che ô gõ.
 * 
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Thẻ trắng #FFFFFF viền #E5E1D8, bóng đổ nhẹ.
 * - Chữ đen #1E2433, chữ phụ #4A5263.
 */

import React, { useEffect } from 'react';
import { Badge } from '../types';
import { Award, Sparkles, X } from 'lucide-react';
import { soundFX } from '../services/soundEffects';

interface BadgeModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ badge, onClose }) => {
  // Tự động đóng thông báo sau 6 giây
  useEffect(() => {
    if (!badge) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [badge, onClose]);

  if (!badge) return null;

  return (
    <div 
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-xs sm:max-w-sm w-full pointer-events-auto animate-in slide-in-from-bottom-5 duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="p-3.5 rounded-md bg-white border border-[#E5E1D8] shadow-md flex items-start gap-3 relative text-[#1E2433]">
        {/* Biểu tượng Huy hiệu */}
        <div className="w-9 h-9 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center shrink-0">
          <Award className="w-5 h-5 text-[#A16207]" />
        </div>

        {/* Nội dung thông báo */}
        <div className="flex-1 space-y-0.5 pr-4">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#A16207] font-mono">
            <Sparkles className="w-3 h-3 text-[#A16207]" />
            <span>Ghi nhận tiến bộ</span>
          </div>
          <h4 className="font-serif font-bold text-sm text-[#1E2433] leading-tight">
            {badge.title}
          </h4>
          <p className="text-xs text-[#4A5263] line-clamp-2 leading-relaxed">
            {badge.description}
          </p>
        </div>

        {/* Nút đóng */}
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="absolute top-2 right-2 p-1 rounded text-[#6B7280] hover:text-[#1E2433] transition-colors cursor-pointer"
          aria-label="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

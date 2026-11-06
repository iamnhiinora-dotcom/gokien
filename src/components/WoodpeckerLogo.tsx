/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * LOGO CHIM GÕ KIẾN "GÕ"
 * Biểu tượng: Chim gõ kiến tìm sâu trong thân cây = Nhặt hạt sạn và tìm lỗi trong lập luận.
 * Phong cách đồ họa tối giản, mộc mạc kiểu giấy & mực in.
 */

import React from 'react';

interface WoodpeckerLogoProps {
  className?: string;
  size?: number;
}

export const WoodpeckerLogo: React.FC<WoodpeckerLogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo chim gõ kiến Gõ"
    >
      {/* Thân cây đứng tượng trưng cho thân bài / lập luận */}
      <rect x="5" y="3" width="4" height="30" rx="2" fill="#94a3b8" opacity="0.35" />
      <line x1="7" y1="9" x2="8.5" y2="9" stroke="#64748b" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="7" y1="18" x2="8.5" y2="18" stroke="#64748b" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="7" y1="27" x2="8.5" y2="27" stroke="#64748b" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

      {/* Điểm gõ - hạt sạn / lỗi được phát hiện (màu vàng bút dạ quang) */}
      <circle cx="7" cy="14" r="1.8" fill="#fde047" stroke="#ca8a04" strokeWidth="0.6" />

      {/* Mỏ chim gõ kiến nhọn và dứt khoát */}
      <polygon points="9,14 16.5,11.5 16.5,15.5" fill="#16233b" className="dark:fill-slate-100" />

      {/* Mào đầu đỏ bút chì đặc trưng */}
      <path d="M16 9.5C16.5 6.5 19 4.5 22.5 4.5C24.8 4.5 26.5 6 27.5 8L24.5 10.5H16.5V9.5Z" fill="#dc2626" />

      {/* Đầu chim màu mực đậm */}
      <path d="M16 10C16 8 18 6.5 20.5 6.5C23.5 6.5 25 8.5 25 11C25 13.5 23 15 20 15H16V10Z" fill="#16233b" className="dark:fill-slate-200" />

      {/* Vệt má màu vàng bút dạ quang */}
      <ellipse cx="19.5" cy="10.5" rx="1.6" ry="1.2" fill="#fde047" />

      {/* Mắt chim tinh anh */}
      <circle cx="19.5" cy="10.5" r="0.6" fill="#16233b" />

      {/* Thân mình thon gọn */}
      <path d="M16.5 15C17 19.5 20.5 23.5 24 24C25 22.5 25.5 20 25 17C23.5 15 19 14.5 16.5 15Z" fill="#16233b" className="dark:fill-slate-200" />

      {/* Yếm ức sáng màu giấy */}
      <path d="M16.5 15C17.5 17 18.5 20 18 22C17.2 21 16.8 19 16.5 15Z" fill="#f8fafc" opacity="0.9" />

      {/* Cánh chim với các vệt kẻ sắc nét */}
      <path d="M20 16L27 24L24 25.5L18.5 19.5L20 16Z" fill="#334155" className="dark:fill-slate-400" />
      <line x1="21" y1="19" x2="25" y2="23.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.85" />

      {/* Chân chim bám chặt vào vỏ cây */}
      <line x1="9" y1="20" x2="14" y2="20" stroke="#16233b" strokeWidth="1.5" strokeLinecap="round" className="dark:stroke-amber-300" />
      <line x1="9.5" y1="22" x2="14.5" y2="22" stroke="#16233b" strokeWidth="1.5" strokeLinecap="round" className="dark:stroke-amber-300" />

      {/* Đuôi cứng cáp tì vào cây giữ thế đứng */}
      <polygon points="20.5,23.5 22.5,31 19.5,29 18,24.5" fill="#16233b" className="dark:fill-slate-300" />
    </svg>
  );
};

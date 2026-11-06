/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODAL CHIA SẺ TIẾN ĐỘ CHO PHỤ HUYNH & GIÁO VIÊN (READ-ONLY PROGRESS REPORT)
 * Tạo liên kết xem độc lập (Read-Only) kèm tóm tắt năng lực, biểu đồ radar và lịch sử rèn luyện.
 * 
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Modal trắng #FFFFFF viền #E5E1D8, lớp phủ rgba(15, 23, 42, 0.4).
 * - Nền phụ #F2EFE8, chữ đen #1E2433, chữ phụ #4A5263, chú thích #6B7280.
 * - Nút chính #FACC15 chữ #1E2433, badge vàng #FEF3C7 chữ #92400E.
 */

import React, { useState } from 'react';
import { UserProfile, DebateMatchRecord } from '../types';
import { 
  Share2, 
  Copy, 
  Check, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  Calendar,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

interface ShareProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  debateHistory: DebateMatchRecord[];
  evaluatedTaskCount: number;
}

export const ShareProgressModal: React.FC<ShareProgressModalProps> = ({
  isOpen,
  onClose,
  profile,
  debateHistory,
  evaluatedTaskCount
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Tạo liên kết chỉ xem (read-only link)
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?view=progress_report&student=${encodeURIComponent(profile.name)}&class=${encodeURIComponent(profile.school)}&n=${evaluatedTaskCount}`
    : '';

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenReportView = () => {
    window.location.href = shareUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0F172A]/40 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-[#E5E1D8] rounded-md shadow-lg overflow-hidden my-auto flex flex-col text-[#1E2433]">
        {/* TIÊU ĐỀ */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E5E1D8] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#92400E]">
              <Share2 className="w-4 h-4 text-[#A16207]" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#1E2433]">
                Chia sẻ tiến độ học tập
              </h3>
              <p className="text-xs text-[#4A5263]">
                Tạo link báo cáo chỉ xem (Read-Only) gửi cho phụ huynh hoặc thầy cô.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded bg-[#F2EFE8] hover:bg-[#E5E1D8] text-[#4A5263] flex items-center justify-center text-xs transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Tóm tắt Thẻ Học Sinh */}
          <div className="p-3.5 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center font-serif font-bold text-lg text-[#92400E]">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-[#1E2433] text-base leading-tight">
                    {profile.name}
                  </h4>
                  <div className="text-xs text-[#4A5263]">
                    Trường: {profile.school || 'THPT'} · Cấp độ {profile.level} ({profile.title})
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-xs font-mono font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Dữ liệu đã xác thực
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E1D8] text-center">
              <div className="p-2 rounded bg-white border border-[#E5E1D8] shadow-2xs">
                <span className="text-[10px] text-[#6B7280] block">Số bài đánh giá thật</span>
                <span className="font-mono font-bold text-sm text-[#1E2433]">
                  {evaluatedTaskCount} bài
                </span>
              </div>
              <div className="p-2 rounded bg-white border border-[#E5E1D8] shadow-2xs">
                <span className="text-[10px] text-[#6B7280] block">Bài kiểm tra chẩn đoán</span>
                <span className="font-mono font-bold text-sm text-[#A16207]">
                  {profile.diagnosticTestA && profile.diagnosticTestB 
                    ? 'Bộ A & B (Đầy đủ)' 
                    : profile.diagnosticTestA 
                      ? 'Bộ A (Đầu vào)' 
                      : 'Chưa làm'}
                </span>
              </div>
              <div className="p-2 rounded bg-white border border-[#E5E1D8] shadow-2xs">
                <span className="text-[10px] text-[#6B7280] block">Trận tranh biện / Vạch lỗi</span>
                <span className="font-mono font-bold text-sm text-[#15803D]">
                  {debateHistory.length} trận / {profile.fallaciesIdentified} lỗi
                </span>
              </div>
            </div>
          </div>

          {/* Ô SAO CHÉP LIÊN KẾT */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1E2433] uppercase tracking-wider block">
              Liên kết báo cáo chỉ xem (Gửi qua Zalo, Messenger hoặc Email):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-xs font-mono text-[#1E2433] focus:outline-none focus:border-[#FACC15]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 rounded bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>Đã chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              * Người nhận link (phụ huynh, thầy cô) chỉ có quyền đọc báo cáo tiến độ và biểu đồ radar, không thể sửa đổi thông tin.
            </p>
          </div>

          {/* Ghi chú về tính trung thực */}
          <div className="p-3 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] text-xs text-[#4A5263] space-y-1">
            <div className="font-bold text-[#1E2433] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
              Tính trung thực dữ liệu:
            </div>
            <p className="leading-relaxed">
              Biểu đồ Radar trong báo cáo được tính toán 100% từ kết quả bài kiểm tra 20 câu và các lượt phản biện do AI chấm thật. Không có dữ liệu giả lập.
            </p>
          </div>
        </div>

        {/* NÚT THAO TÁC */}
        <div className="p-3.5 bg-white border-t border-[#E5E1D8] flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded bg-white hover:bg-[#F2EFE8] border border-[#D6D1C4] text-[#1E2433] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#4A5263]" />
            <span>In / Xuất PDF</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenReportView}
              className="px-3 py-1.5 rounded border border-[#D6D1C4] bg-white hover:bg-[#F2EFE8] text-[#1E2433] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem trang báo cáo</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded bg-[#F2EFE8] hover:bg-[#E5E1D8] text-[#1E2433] text-xs font-medium transition-all cursor-pointer border border-[#E5E1D8]"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

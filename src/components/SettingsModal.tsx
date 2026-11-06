/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODAL CÀI ĐẶT HỆ THỐNG & CẤU HÌNH GEMINI API
 * Cho phép học sinh tùy chỉnh thông tin cá nhân, API Key, âm thanh và hiệu ứng rung.
 * Áp dụng bảng màu sáng chuẩn:
 * - Nền modal trắng #FFFFFF, viền #E5E1D8, lớp phủ rgba(15, 23, 42, 0.4)
 * - Nền phụ #F2EFE8, chữ đen #1E2433, chữ phụ #4A5263
 * - Nút chính #FACC15 chữ #1E2433
 */

import React, { useState, useEffect } from 'react';
import { useGamification } from '../context/GamificationContext';
import { soundFX } from '../services/soundEffects';
import { X, Key, Cpu, Volume2, VolumeX, Vibrate, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateSettings, resetProgress, toggleSound, toggleScreenShake } = useGamification();

  const [engineMode, setEngineMode] = useState(profile?.aiEngineMode || 'gemini_cloud');
  const [name, setName] = useState(profile?.name || 'Học sinh');
  const [school, setSchool] = useState(profile?.school || '11A1');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEngineMode(profile?.aiEngineMode || 'gemini_cloud');
      setName(profile?.name || 'Học sinh');
      setSchool(profile?.school || '11A1');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings('', engineMode, name, school);
    soundFX.playClick();
    onClose();
  };

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
    soundFX.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white border border-[#E5E1D8] rounded-md shadow-lg overflow-hidden text-[#1E2433] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E1D8] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#92400E]">
              <Cpu className="w-4 h-4 text-[#A16207]" />
            </div>
            <h2 className="font-serif font-bold text-base text-[#1E2433]">Cài đặt cá nhân & hệ thống</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[#6B7280] hover:text-[#1E2433] rounded hover:bg-[#F2EFE8] transition-colors cursor-pointer"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung cấu hình */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Thông tin học sinh */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A5263] uppercase tracking-wider mb-1">
                Họ và tên
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-xs text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#FACC15]"
                placeholder="Tên của bạn"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A5263] uppercase tracking-wider mb-1">
                Trường / Lớp
              </label>
              <input 
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-xs text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#FACC15]"
                placeholder="Ví dụ: Lớp 11A1, THPT..."
              />
            </div>
          </div>

          {/* Chọn chế độ AI Engine */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#4A5263] uppercase tracking-wider">
              Chế độ phân tích & tranh biện
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEngineMode('intelligent_fallback')}
                className={`p-3 text-left rounded-md border transition-all cursor-pointer ${
                  engineMode === 'intelligent_fallback'
                    ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E] font-medium'
                    : 'bg-[#F2EFE8] border-[#E5E1D8] text-[#4A5263] hover:border-[#D6D1C4]'
                }`}
              >
                <div className="font-serif font-bold text-xs flex items-center gap-1.5 text-[#1E2433]">
                  <Cpu className="w-3.5 h-3.5 text-[#A16207]" />
                  Mô phỏng tức thì
                </div>
                <p className="text-[11px] text-[#4A5263] mt-1 leading-relaxed">
                  Chạy ngay không cần chờ mạng, tích hợp sẵn logic WSDC.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEngineMode('gemini_cloud')}
                className={`p-3 text-left rounded-md border transition-all cursor-pointer ${
                  engineMode === 'gemini_cloud'
                    ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E] font-medium'
                    : 'bg-[#F2EFE8] border-[#E5E1D8] text-[#4A5263] hover:border-[#D6D1C4]'
                }`}
              >
                <div className="font-serif font-bold text-xs flex items-center gap-1.5 text-[#1E2433]">
                  <Key className="w-3.5 h-3.5 text-[#2563EB]" />
                  Gemini Cloud AI
                </div>
                <p className="text-[11px] text-[#4A5263] mt-1 leading-relaxed">
                  Phân tích ngôn ngữ sâu và mở rộng câu phản biện linh hoạt.
                </p>
              </button>
            </div>
          </div>

          {/* Thông tin kết nối AI Server */}
          <div className="p-3 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-1">
            <div className="flex items-center gap-2 text-[#1E2433] font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
              <span>AI Engine: Gemini 3.8 Flash (Server-Side)</span>
            </div>
            <p className="text-xs text-[#4A5263] leading-relaxed">
              Các bài kiểm tra, vạch lỗi ngụy biện và vấn đáp Socrates được xử lý trực tiếp trên máy chủ qua mô hình <strong>gemini-3.8-flash</strong>. Bạn không cần tự chuẩn bị API key.
            </p>
          </div>

          {/* Tùy chọn âm thanh */}
          <div className="pt-2 border-t border-[#E5E1D8] space-y-2">
            <span className="block text-xs font-semibold text-[#4A5263] uppercase tracking-wider">
              Âm thanh & hiệu ứng
            </span>
            <div className="flex items-center justify-between p-2.5 bg-[#F2EFE8] rounded-md border border-[#E5E1D8]">
              <div className="flex items-center gap-2.5">
                {profile.soundEnabled ? <Volume2 className="w-4 h-4 text-[#A16207]" /> : <VolumeX className="w-4 h-4 text-[#6B7280]" />}
                <div>
                  <div className="text-xs font-medium text-[#1E2433]">Âm thanh hiệu ứng</div>
                  <div className="text-[11px] text-[#4A5263]">Tiếng gõ nhặt sâu, trừ điểm và hoàn thành bài</div>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={profile.soundEnabled} 
                onChange={toggleSound}
                className="accent-[#FACC15] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#F2EFE8] rounded-md border border-[#E5E1D8]">
              <div className="flex items-center gap-2.5">
                <Vibrate className="w-4 h-4 text-[#4A5263]" />
                <div>
                  <div className="text-xs font-medium text-[#1E2433]">Hiệu ứng rung nhẹ màn hình</div>
                  <div className="text-[11px] text-[#4A5263]">Rung nhẹ khi phát hiện điểm lỗi sai</div>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={profile.screenShakeEnabled} 
                onChange={toggleScreenShake}
                className="accent-[#FACC15] w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Đặt lại tiến trình */}
          <div className="pt-2 border-t border-[#E5E1D8]">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-[#DC2626] hover:underline cursor-pointer"
              >
                Đặt lại toàn bộ tiến độ và điểm kinh nghiệm...
              </button>
            ) : (
              <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-md space-y-2">
                <div className="text-xs text-[#DC2626] font-medium">
                  Bạn có chắc chắn muốn xóa toàn bộ điểm số và kết quả đã làm?
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1 bg-[#DC2626] hover:bg-red-700 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Xác nhận đặt lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 bg-white border border-[#D6D1C4] text-[#1E2433] hover:bg-[#F2EFE8] rounded text-xs cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-[#E5E1D8] bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-[#4A5263] hover:text-[#1E2433] transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-bold text-[#1E2433] bg-[#FACC15] hover:bg-[#EAB308] rounded transition-all cursor-pointer shadow-2xs"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

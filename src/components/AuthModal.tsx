/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODAL ĐĂNG NHẬP GOOGLE & QUẢN LÝ HỒ SƠ HỌC SINH (AUTH MODAL)
 * Sử dụng Firebase Authentication với "Sign in with Google" an toàn.
 * 
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Modal trắng #FFFFFF viền #E5E1D8, lớp phủ rgba(15, 23, 42, 0.4).
 * - Nền phụ #F2EFE8, chữ đen #1E2433, chữ phụ #4A5263, chú thích #6B7280.
 * - Nút chính #FACC15 chữ #1E2433, badge vàng #FEF3C7 chữ #92400E.
 */

import React, { useState } from 'react';
import { useGamification } from '../context/GamificationContext';
import { soundFX } from '../services/soundEffects';
import { 
  X, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  School, 
  Sparkles, 
  CheckCircle2, 
  Award,
  Swords,
  Flame,
  UserCheck
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    profile, 
    loginWithGooglePopup, 
    logout, 
    updateSettings 
  } = useGamification();

  const [editSchool, setEditSchool] = useState<string>(profile.school || '11A1');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      await loginWithGooglePopup();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    soundFX.playClick();
    try {
      updateSettings('', 'gemini_cloud', profile.name, editSchool.trim() || '11A1');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white border border-[#E5E1D8] rounded-md shadow-lg overflow-hidden flex flex-col text-[#1E2433]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-4 py-3.5 border-b border-[#E5E1D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#92400E] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#A16207]" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#1E2433] tracking-tight">
                {currentUser ? 'Hồ Sơ Học Sinh' : 'Tài Khoản Học Sinh'}
              </h2>
              <p className="text-xs text-[#4A5263]">
                {currentUser ? 'Đã kết nối tài khoản Google' : 'Đăng nhập để lưu tiến độ rèn luyện'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#6B7280] hover:text-[#1E2433] hover:bg-[#F2EFE8] transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="p-5 space-y-4">
          {!currentUser ? (
            /* TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP (CHẾ ĐỘ KHÁCH) */
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 mx-auto rounded border border-[#E5E1D8] bg-[#F2EFE8] flex items-center justify-center text-[#1E2433]">
                <LogIn className="w-6 h-6 text-[#A16207]" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-[#1E2433]">
                  Đăng Nhập Với Google
                </h3>
                <p className="text-xs text-[#4A5263] leading-relaxed max-w-xs mx-auto">
                  Bạn đang ở <strong className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] font-medium border border-[#FDE68A]">Chế độ khách</strong>. Hãy đăng nhập tài khoản Google để lưu vĩnh viễn cấp độ, điểm XP, huy hiệu và lịch sử trận đấu của bạn.
                </p>
              </div>

              {/* Nút đăng nhập Google tiêu chuẩn */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 rounded font-semibold text-xs sm:text-sm text-[#1E2433] bg-white hover:bg-[#F2EFE8] flex items-center justify-center gap-2.5 transition-colors cursor-pointer border border-[#D6D1C4] shadow-2xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng nhập với Google</span>
              </button>

              <div className="p-2.5 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-[11px] text-[#4A5263] leading-relaxed text-left">
                Chế độ khách vẫn cho phép bạn luyện tập tự do trong Đấu trường tranh biện và Vạch lá tìm sâu, tuy nhiên tiến trình sẽ không được đồng bộ vào Bảng xếp hạng.
              </div>
            </div>
          ) : (
            /* TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP */
            <div className="space-y-3.5">
              <div className="p-3.5 rounded bg-[#F2EFE8] border border-[#E5E1D8] flex items-center gap-3">
                <div className="w-10 h-10 rounded border border-[#E5E1D8] bg-[#FEF3C7] flex items-center justify-center font-serif font-bold text-base text-[#92400E] shrink-0">
                  {(profile?.name || 'H').charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs sm:text-sm text-[#1E2433] truncate">{profile?.name || 'Học sinh'}</h3>
                    <span className="px-1.5 py-0.2 rounded bg-white border border-[#E5E1D8] text-[10px] font-mono text-[#4A5263]">
                      Lv.{profile?.level || 1}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B7280] truncate mt-0.5 font-mono">
                    {currentUser.email}
                  </div>
                  <div className="text-[11px] text-[#4A5263] font-medium mt-0.5">
                    {profile?.title || 'Tập sự phản biện'} · {profile?.currentXP || 0} XP
                  </div>
                </div>
              </div>

              {/* Form cập nhật Lớp học để hiển thị trên Bảng xếp hạng */}
              <form onSubmit={handleSaveClass} className="space-y-2.5 pt-2 border-t border-[#E5E1D8]">
                <div>
                  <label className="block text-xs font-medium text-[#1E2433] mb-1 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>Lớp / Đơn vị của bạn (hiển thị trên Bảng xếp hạng):</span>
                  </label>
                  <input
                    type="text"
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    placeholder="ví dụ: 11A1, 10 Tin, 12 Chuyên Anh"
                    className="w-full px-3 py-2 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-xs sm:text-sm text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2 rounded text-xs font-bold bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    {saveSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Đã lưu thành công!</span>
                      </>
                    ) : (
                      <span>Cập nhật Lớp học</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Thống kê nhanh */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E1D8] text-center">
                <div className="p-2 rounded bg-[#F2EFE8] border border-[#E5E1D8]">
                  <span className="text-[10px] text-[#6B7280] block font-mono">THẮNG TRẬN</span>
                  <span className="text-xs font-bold text-[#1E2433]">{profile.debatesWon} Trận</span>
                </div>
                <div className="p-2 rounded bg-[#F2EFE8] border border-[#E5E1D8]">
                  <span className="text-[10px] text-[#6B7280] block font-mono">VẠCH BẪY LỖI</span>
                  <span className="text-xs font-bold text-[#1E2433]">{profile.fallaciesIdentified} Lỗi</span>
                </div>
                <div className="p-2 rounded bg-[#F2EFE8] border border-[#E5E1D8]">
                  <span className="text-[10px] text-[#6B7280] block font-mono">CHUỖI NGÀY</span>
                  <span className="text-xs font-bold text-[#A16207]">{profile.streakCount || 1} Ngày</span>
                </div>
              </div>

              {/* Nút Đăng xuất */}
              <div className="pt-2 border-t border-[#E5E1D8] flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-[#DC2626] bg-[#FEE2E2] hover:bg-red-100 border border-[#FCA5A5] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

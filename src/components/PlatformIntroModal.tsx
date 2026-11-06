/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODAL MỞ ĐẦU & HƯỚNG DẪN NỀN TẢNG (PLATFORM INTRO MODAL)
 * Giới thiệu toàn diện về Mục đích, Ý nghĩa, Hướng dẫn sử dụng và Đăng nhập lưu trữ tài khoản.
 * 
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Modal trắng #FFFFFF viền #E5E1D8, lớp phủ rgba(15, 23, 42, 0.4).
 * - Nền phụ #F2EFE8, chữ đen #1E2433, chữ phụ #4A5263, chú thích #6B7280.
 * - Nút chính #FACC15 chữ #1E2433, badge vàng #FEF3C7 chữ #92400E.
 */

import React, { useState, useEffect } from 'react';
import { useGamification } from '../context/GamificationContext';
import { soundFX } from '../services/soundEffects';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  Swords, 
  Trophy, 
  CheckCircle2, 
  LogIn, 
  UserPlus, 
  Mail, 
  HelpCircle, 
  ArrowRight,
  BookOpen,
  Award,
  Target,
  ShieldCheck
} from 'lucide-react';

interface PlatformIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule?: (module: 'fallacy_challenge' | 'debate_arena' | 'gamification_hub') => void;
}

export const PlatformIntroModal: React.FC<PlatformIntroModalProps> = ({
  isOpen,
  onClose,
  onSelectModule
}) => {
  const { openAuthModal } = useGamification();
  const [activeTab, setActiveTab] = useState<'purpose' | 'how_to_use' | 'account_storage'>('purpose');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-white border border-[#E5E1D8] rounded-md shadow-lg overflow-hidden flex flex-col max-h-[90vh] text-[#1E2433]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-[#E5E1D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#92400E] font-bold">
              <BookOpen className="w-4 h-4 text-[#A16207]" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1E2433] flex items-center gap-2">
                Giới thiệu về Gõ
                <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-mono font-medium">
                  Luyện phản biện
                </span>
              </h2>
              <p className="text-xs text-[#4A5263]">
                Hiểu cách hoạt động, mục đích và cách lưu trữ kết quả rèn luyện
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#6B7280] hover:text-[#1E2433] hover:bg-[#F2EFE8] transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Tabs Điều Hướng */}
        <div className="px-5 pt-2 border-b border-[#E5E1D8] bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('purpose');
            }}
            className={`pb-2 px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'purpose'
                ? 'border-[#FACC15] text-[#1E2433] font-bold bg-[#FEF3C7] rounded-t'
                : 'border-transparent text-[#4A5263] hover:text-[#1E2433]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#A16207]" />
            <span>1. Mục đích</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('how_to_use');
            }}
            className={`pb-2 px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'how_to_use'
                ? 'border-[#FACC15] text-[#1E2433] font-bold bg-[#FEF3C7] rounded-t'
                : 'border-transparent text-[#4A5263] hover:text-[#1E2433]'
            }`}
          >
            <Target className="w-4 h-4 text-[#A16207]" />
            <span>2. Cách luyện tập</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('account_storage');
            }}
            className={`pb-2 px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'account_storage'
                ? 'border-[#FACC15] text-[#1E2433] font-bold bg-[#FEF3C7] rounded-t'
                : 'border-transparent text-[#4A5263] hover:text-[#1E2433]'
            }`}
          >
            <Mail className="w-4 h-4 text-[#A16207]" />
            <span>3. Lưu tài khoản</span>
          </button>
        </div>

        {/* Nội dung Tab */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TAB 1: MỤC ĐÍCH */}
          {activeTab === 'purpose' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-2">
                <h3 className="font-serif font-bold text-sm text-[#1E2433] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A16207]" />
                  <span>Tại sao học sinh cần rèn luyện tư duy phản biện?</span>
                </h3>
                <p className="text-xs text-[#4A5263] leading-relaxed">
                  Lướt mạng xã hội mỗi ngày, chúng ta gặp vô số thông tin giật gân, những ý kiến một chiều hoặc ngụy biện tinh vi. <strong>Gõ</strong> giúp bạn:
                </p>
                <ul className="text-xs text-[#4A5263] space-y-1.5 pl-4 list-disc marker:text-[#A16207]">
                  <li><strong>Nhìn nhận vấn đề đa chiều:</strong> Đặt dấu hỏi trước những khẳng định thiếu căn cứ, tìm ra giả định ngầm của người nói.</li>
                  <li><strong>Tránh bẫy ngụy biện:</strong> Nhận diện công kích cá nhân, đánh tráo khái niệm, chuyện kể cá nhân, tam đoạn luận sai.</li>
                  <li><strong>Tự soi chiếu thiên kiến:</strong> Nhìn lại cách nghĩ của chính mình trước khi vội phản bác người khác.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-md bg-white border border-[#E5E1D8] space-y-1 shadow-2xs">
                  <span className="font-serif text-[#A16207] font-bold text-xs block">Khung PEEL</span>
                  <p className="text-xs text-[#4A5263] leading-relaxed">
                    Point (luận điểm) → Explanation (cơ chế A → B → C) → Evidence (dẫn chứng cụ thể) → Link (liên kết).
                  </p>
                </div>

                <div className="p-3 rounded-md bg-white border border-[#E5E1D8] space-y-1 shadow-2xs">
                  <span className="font-serif text-[#2563EB] font-bold text-xs block">Vấn đáp Socrates</span>
                  <p className="text-xs text-[#4A5263] leading-relaxed">
                    Gõ không đưa sẵn câu trả lời mà đặt câu hỏi gợi mở để bạn tự tìm ra mấu chốt vấn đề.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CÁCH LUYỆN TẬP */}
          {activeTab === 'how_to_use' && (
            <div className="space-y-3">
              {/* Bước 1 */}
              <div className="p-3.5 rounded-md bg-white border border-[#E5E1D8] flex items-start gap-3 shadow-2xs">
                <div className="w-7 h-7 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[#1E2433]">Vạch Lá Tìm Sâu</h4>
                    <ShieldAlert className="w-4 h-4 text-[#A16207]" />
                  </div>
                  <p className="text-xs text-[#4A5263] leading-relaxed">
                    Đọc tình huống đời sống (tin nhắn Zalo, bình luận mạng, họp lớp), bấm vào phần có lỗi hoặc chọn "Không có lỗi, lập luận hợp lý". Viết lời giải thích để AI chấm điểm logic.
                  </p>
                </div>
              </div>

              {/* Bước 2 */}
              <div className="p-3.5 rounded-md bg-white border border-[#E5E1D8] flex items-start gap-3 shadow-2xs">
                <div className="w-7 h-7 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[#1E2433]">Đấu Trường Phản Biện</h4>
                    <Swords className="w-4 h-4 text-[#1E2433]" />
                  </div>
                  <p className="text-xs text-[#4A5263] leading-relaxed">
                    Trước trận, hãy thử "Dựng người thép" – nói lại lập luận của phe đối phương một cách công bằng nhất. Trong trận, thừa nhận ý hợp lý của đối thủ để được cộng điểm công tâm.
                  </p>
                </div>
              </div>

              {/* Bước 3 */}
              <div className="p-3.5 rounded-md bg-white border border-[#E5E1D8] flex items-start gap-3 shadow-2xs">
                <div className="w-7 h-7 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[#1E2433]">Nhật Ký & Biểu Đồ Radar</h4>
                    <Trophy className="w-4 h-4 text-[#15803D]" />
                  </div>
                  <p className="text-xs text-[#4A5263] leading-relaxed">
                    Làm bài kiểm tra chẩn đoán 20 câu để có dữ liệu thật trên biểu đồ radar 6 kỹ năng. Sau 4 tuần, làm bài B để thấy rõ mức tiến bộ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ĐĂNG NHẬP */}
          {activeTab === 'account_storage' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-2">
                <div className="flex items-center gap-2 text-[#1E2433] font-serif font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                  <span>Đăng nhập để đồng bộ tiến độ</span>
                </div>
                <p className="text-xs text-[#4A5263] leading-relaxed">
                  Để lưu lại lịch sử làm bài và biểu đồ radar khi đổi máy tính hoặc điện thoại:
                </p>

                <div className="space-y-1.5 text-xs text-[#4A5263] pl-3 border-l-2 border-[#FACC15]">
                  <p>
                    <strong>Đăng nhập 1 chạm:</strong> Dùng tài khoản Google để đăng nhập an toàn, không cần nhớ thêm mật khẩu mới.
                  </p>
                  <p>
                    <strong>Lưu đám mây:</strong> Điểm rèn luyện, bài kiểm tra và lịch sử tranh biện được lưu tự động.
                  </p>
                  <p>
                    <strong>Chế độ khách:</strong> Bạn vẫn có thể thử sức ngay mà chưa bắt buộc đăng nhập.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal();
                  }}
                  className="w-full py-2.5 rounded bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập với Google</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-5 py-3 border-t border-[#E5E1D8] bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded text-xs font-medium text-[#4A5263] hover:text-[#1E2433] border border-[#D6D1C4] hover:bg-[#F2EFE8] transition-colors cursor-pointer"
          >
            Đóng lại
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onSelectModule) onSelectModule('fallacy_challenge');
            }}
            className="px-4 py-1.5 rounded text-xs font-bold bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
          >
            <span>Bắt đầu thử thách</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * HIỆU ỨNG MỞ ĐẦU (INTRO SPLASH ANIMATION)
 * Phong cách "Giấy và bút dạ quang" trong Dark Mode:
 * Chim gõ kiến "Gõ" gõ mỏ tìm hạt sạn ngụy biện, vệt quét bút dạ quang và chuyển mượt mà
 * đến Trang Giới Thiệu Chung & Hướng Dẫn Sử Dụng.
 */

import React, { useState, useEffect, useRef } from 'react';
import { WoodpeckerLogo } from './WoodpeckerLogo';
import { soundFX } from '../services/soundEffects';
import { ArrowRight, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface IntroSplashAnimationProps {
  onComplete: () => void;
}

export const IntroSplashAnimation: React.FC<IntroSplashAnimationProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Mặc định tắt âm tự động để tránh bị trình duyệt chặn AudioContext

  // Dùng ref để giữ callback onComplete ổn định, tránh re-render lặp vô tận
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const hasFinishedRef = useRef(false);
  const finishIntro = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onCompleteRef.current();
  };

  useEffect(() => {
    // Cho phép ấn ESC hoặc Space để bỏ qua ngay
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        finishIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Tiến trình chuyển động mượt mà
    const t1 = setTimeout(() => {
      setStep(1); // Gõ mỏ lần 1
    }, 500);

    const t2 = setTimeout(() => {
      setStep(2); // Phát hiện hạt sạn, vệt dạ quang sáng lên
    }, 1200);

    const t3 = setTimeout(() => {
      setStep(3); // Hiện đầy đủ khẩu hiệu
    }, 2000);

    // Thanh tiến trình chạy trong 3.2s
    const startTime = Date.now();
    const duration = 3200;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        finishIntro();
      }
    }, 40);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, []);

  const handleSkip = () => {
    soundFX.playClick();
    finishIntro();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8F6F1] flex flex-col items-center justify-center p-6 select-none overflow-hidden animate-in fade-in duration-300">
      {/* Vệt sáng dạ quang mờ nhẹ phía sau */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#FACC15]/20 filter blur-3xl pointer-events-none" />

      {/* Nút bỏ qua & Âm thanh góc trên */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        <button
          type="button"
          onClick={() => {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            if (!nextMuted) {
              soundFX.playClick();
            }
          }}
          className="p-2 rounded border border-[#E5E1D8] bg-[#FFFFFF] text-[#4A5263] hover:bg-[#F2EFE8] hover:text-[#1E2433] transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-[#6B7280]" /> : <Volume2 className="w-4 h-4 text-[#A16207]" />}
          <span className="hidden sm:inline">{isMuted ? 'Tắt âm' : 'Âm thanh'}</span>
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="px-3.5 py-1.5 rounded border border-[#D6D1C4] bg-[#FFFFFF] text-[#1E2433] hover:bg-[#F2EFE8] transition-colors cursor-pointer text-xs font-medium flex items-center gap-1.5 shadow-sm"
        >
          <span>Bỏ qua</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#1E2433]" />
        </button>
      </div>

      {/* Nội Dung Chính Của Màn Mở Đầu */}
      <div className="relative max-w-xl w-full flex flex-col items-center text-center">
        {/* Logo Chim Gõ Kiến Tương Tác */}
        <div className={`relative mb-6 transition-all duration-500 transform ${
          step >= 1 ? 'scale-105' : 'scale-95'
        }`}>
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] flex items-center justify-center shadow-md relative">
            <WoodpeckerLogo size={72} />

            {/* Hiệu ứng gõ mỏ và tia phát hiện hạt sạn */}
            {step >= 1 && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded bg-[#FACC15] text-[#1E2433] text-[10px] font-bold font-mono animate-bounce border border-[#E5E1D8]">
                GÕ!
              </span>
            )}
          </div>
        </div>

        {/* Tên gọi & Định vị */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1E2433] flex items-center justify-center gap-3">
            <span>Gõ</span>
            <span className="text-xl sm:text-2xl font-sans font-normal text-[#6B7280]">·</span>
            <span className="text-lg sm:text-2xl font-serif text-[#A16207] font-semibold">
              Nhặt Hạt Sạn Lập Luận
            </span>
          </h1>

          {/* Vạch dạ quang quét qua thông điệp cốt lõi */}
          <div className="relative inline-block mt-2">
            <p className="text-base sm:text-lg text-[#1E2433] font-normal leading-relaxed">
              Tụi mình cùng bạn nhặt hạt sạn trong lập luận,
              <br className="hidden sm:inline" />
              để khi lướt mạng <span className="bg-[#FDE68A] text-[#1E2433] px-2 py-0.5 rounded font-semibold border-b-2 border-dashed border-[#D97706]">không bị đuối lý</span> và <span className="bg-[#FDE68A] text-[#1E2433] px-2 py-0.5 rounded font-semibold border-b-2 border-dashed border-[#D97706]">không tin bừa</span>.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#4A5263] max-w-md mx-auto pt-2">
            Nền tảng rèn luyện tư duy phản biện & bóc trần lỗi ngụy biện dành cho học sinh THPT.
          </p>
        </div>

        {/* Thanh Tiến Trình Tự Động */}
        <div className="w-full max-w-xs mt-8 space-y-2">
          <div className="h-1.5 w-full bg-[#E5E1D8] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#FACC15] transition-all duration-75 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#6B7280] font-mono">
            <span>Đang vào trang giới thiệu & hướng dẫn...</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Nút bấm vào ngay */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSkip}
            className="px-6 py-2.5 rounded-lg bg-[#FACC15] text-[#1E2433] hover:bg-[#EAB308] transition-all font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#1E2433]" />
            <span>Đọc Hướng Dẫn & Bắt Đầu Ngay</span>
            <ArrowRight className="w-4 h-4 text-[#1E2433]" />
          </button>
        </div>
      </div>
    </div>
  );
};

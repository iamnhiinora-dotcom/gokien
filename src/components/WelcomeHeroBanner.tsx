/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TRANG ĐẦU - PHẦN MỞ ĐẦU MỘC MẠC (GIẤY VÀ BÚT DẠ QUANG)
 * Cấu trúc tối giản theo đúng yêu cầu:
 * 1. Một câu nói web giúp gì (chân thật, không màu mè marketing)
 * 2. Một tình huống làm thử ngay tại chỗ (tô vàng bút dạ quang khi tìm ra lỗi)
 * 3. Một nút bắt đầu thử thách
 * 
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Nền ngà, card trắng #FFFFFF viền #E5E1D8, nền phụ #F2EFE8.
 * - Chữ đen #1E2433, chữ phụ #4A5263, chú thích #6B7280.
 * - Nút chính #FACC15 chữ #1E2433, badge vàng #FEF3C7 chữ #92400E.
 */

import React, { useState } from 'react';
import { useGamification } from '../context/GamificationContext';
import { soundFX } from '../services/soundEffects';
import { ArrowRight, Check, RotateCcw, ShieldAlert } from 'lucide-react';
import { ActiveModule } from './Navbar';

interface MiniSample {
  speaker: string;
  context: string;
  statementPrefix: string;
  flawSegment: string;
  statementSuffix: string;
  fallacyName: string;
  plainExplanation: string;
}

const SAMPLE_SCENARIOS: MiniSample[] = [
  {
    speaker: 'Bình luận trên mạng',
    context: 'Dưới video chia sẻ về phương pháp ngủ đủ giấc mùa thi cử',
    statementPrefix: 'Bác sĩ khuyên không nên thức khuya học bài? ',
    flawSegment: 'Nhưng ổng cũng toàn thức trắng đêm trực cấp cứu đấy thôi, nghe làm gì!',
    statementSuffix: '',
    fallacyName: 'Lỗi "Bạn cũng thế" (Tu Quoque)',
    plainExplanation: 'Bác sĩ có thức đêm vì tính chất công việc hay không thì việc thức khuya gây hại cho não bộ học sinh vẫn là sự thật y học. Lấy thói quen cá nhân của người nói để gạt bỏ chân lý là trật lấc.'
  },
  {
    speaker: 'Nhóm chat lớp',
    context: 'Bàn về bộ phim lịch sử vừa ra rạp',
    statementPrefix: 'Cậu chê kịch bản phim thiếu logic à? ',
    flawSegment: 'Cậu đã tự làm được bộ phim nào ra hồn chưa mà đòi phán xét người ta!',
    statementSuffix: '',
    fallacyName: 'Lỗi "Công kích cá nhân / Đánh tráo tư cách"',
    plainExplanation: 'Khán giả không cần phải là đầu bếp mới biết món ăn bị mặn. Luận điểm phim dở ở chỗ nào cần được xét trên kịch bản, không phải trên việc người chê đã làm phim hay chưa.'
  },
  {
    speaker: 'Người nhà nhắc nhở',
    context: 'Khi nói về việc chuẩn bị bài vở thi học kỳ',
    statementPrefix: 'Bữa nay lười học bài là ',
    flawSegment: 'mai mốt thi trượt, rồi không đỗ đại học, rồi cả đời đi xin ăn cho coi.',
    statementSuffix: '',
    fallacyName: 'Lỗi "Dốc trượt" (Slippery Slope)',
    plainExplanation: 'Từ chuyện một buổi lười học mà vẽ ra viễn cảnh đi ăn xin cả đời mà không có bằng chứng cho từng mắt xích trung gian. Cường điệu hóa hậu quả để gây sợ hãi.'
  }
];

interface WelcomeHeroBannerProps {
  onSelectModule: (module: ActiveModule) => void;
}

export const WelcomeHeroBanner: React.FC<WelcomeHeroBannerProps> = ({ onSelectModule }) => {
  const { openDiagnosticTest } = useGamification();
  const [sampleIndex, setSampleIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const currentSample = SAMPLE_SCENARIOS[sampleIndex];

  const handleReveal = () => {
    soundFX.playSuccess();
    setIsRevealed(true);
  };

  const handleNextSample = () => {
    soundFX.playClick();
    setIsRevealed(false);
    setSampleIndex(prev => (prev + 1) % SAMPLE_SCENARIOS.length);
  };

  const handleStart = () => {
    soundFX.playClick();
    onSelectModule('fallacy_challenge');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-4">
      {/* 1. Một câu nói web giúp gì */}
      <div className="mb-6 p-5 sm:p-6 rounded-md bg-white border border-[#E5E1D8] text-[#1E2433] shadow-xs">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#1E2433] leading-snug">
          Gõ · Nhặt hạt sạn trong lập luận
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#4A5263] max-w-2xl leading-relaxed">
          Tụi mình cùng bạn nhặt hạt sạn trong lập luận, để khi lướt mạng hay tranh luận không bị đuối lý và không tin bừa.
        </p>
      </div>

      {/* 2. Một tình huống làm thử ngay tại chỗ */}
      <div className="bg-white border border-[#E5E1D8] rounded-md p-5 sm:p-6 mb-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E5E1D8] text-xs text-[#6B7280]">
          <div>
            <span className="font-semibold text-[#1E2433]">{currentSample.speaker}</span>
            <span className="mx-1.5">·</span>
            <span>{currentSample.context}</span>
          </div>

          <button
            type="button"
            onClick={handleNextSample}
            className="text-xs text-[#6B7280] hover:text-[#1E2433] flex items-center gap-1 cursor-pointer transition-colors"
            title="Đổi ví dụ khác"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đổi ví dụ</span>
          </button>
        </div>

        {/* Khối phát biểu thực tế - có thể bấm để tô bút dạ quang */}
        <div className="py-2">
          <p className="text-base sm:text-lg font-normal leading-relaxed text-[#1E2433]">
            <span>&ldquo;{currentSample.statementPrefix}</span>
            <span
              onClick={handleReveal}
              title="Nhấn vào cụm từ này để đánh dấu lỗi"
              className={`cursor-pointer transition-colors duration-150 ${
                isRevealed
                  ? 'bg-[#FDE68A] text-[#1E2433] px-1 py-0.5 rounded'
                  : 'border-b-2 border-dashed border-[#D97706] hover:bg-[#FEF3C7] px-0.5'
              }`}
            >
              {currentSample.flawSegment}
            </span>
            <span>{currentSample.statementSuffix}&rdquo;</span>
          </p>
        </div>

        {/* Trạng thái chưa bấm: gợi ý tương tác */}
        {!isRevealed ? (
          <div className="mt-3 pt-3 border-t border-[#E5E1D8] flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-[#6B7280]">
              Có gì đó sai sai ở phần gạch chân? Nhấn thử xem sao.
            </span>
            <button
              type="button"
              onClick={handleReveal}
              className="text-xs font-bold px-3 py-1.5 rounded bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] transition-colors cursor-pointer shadow-2xs"
            >
              Gõ tìm lỗi
            </button>
          </div>
        ) : (
          /* Trạng thái đã bấm: Giải thích mộc mạc kèm con dấu ĐÃ PHÁT HIỆN */
          <div className="mt-3 pt-3 border-t border-[#E5E1D8] text-xs sm:text-sm animate-in fade-in duration-150 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-[#1E2433] font-semibold">
                <span className="w-4 h-4 rounded-full bg-[#FACC15] text-[#1E2433] inline-flex items-center justify-center text-[10px] font-bold">✓</span>
                <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-semibold">{currentSample.fallacyName}</span>
              </div>
              <div className="border border-[#DC2626] text-[#DC2626] bg-[#FEE2E2] font-mono font-bold text-[10px] py-0.5 px-2 rounded flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                <span>ĐÃ PHÁT HIỆN</span>
              </div>
            </div>
            <p className="text-[#4A5263] leading-relaxed">
              {currentSample.plainExplanation}
            </p>
          </div>
        )}
      </div>

      {/* 3. Nút bắt đầu và chế độ thi đấu */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleStart}
          className="px-5 py-2.5 rounded bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <span>Bắt đầu nhặt hạt sạn</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onSelectModule('wsdc_tournament');
          }}
          className="px-4 py-2.5 rounded border border-[#FDE68A] bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
        >
          <span>🏆 Thi đấu WSDC (3v3)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            openDiagnosticTest('A');
          }}
          className="px-4 py-2.5 rounded border border-[#D6D1C4] hover:bg-[#F2EFE8] text-[#1E2433] bg-white text-sm font-medium transition-colors cursor-pointer"
        >
          Làm bài kiểm tra 20 câu (15 phút)
        </button>
      </div>
    </div>
  );
};

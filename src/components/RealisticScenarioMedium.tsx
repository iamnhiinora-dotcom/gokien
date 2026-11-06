/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COMPONENT: TRÌNH DIỄN TÌNH HUỐNG THỰC TẾ & BÚT DẠ QUANG VẠCH SẠN
 * 
 * 5 Hình thức ngoài đời thực (Tự vẽ giao diện, không dùng logo thương hiệu thật):
 * 1. Bong bóng chat nhóm lớp (chat_bubble)
 * 2. Bài đăng mạng xã hội có lượt thích & bình luận (social_post)
 * 3. Bình luận video ngắn có tim & ghim (video_comment)
 * 4. Biên bản họp phụ huynh trang trọng (meeting_minutes)
 * 5. Tiêu đề báo & bài báo điện tử (news_headline)
 * 
 * Bước 1 mới: Học sinh dùng "bút dạ quang" bôi vàng đúng cụm từ có lỗi.
 * Hỗ trợ kéo chọn chuột (máy tính) và chạm từng từ (điện thoại).
 * So sánh với trường flawText; bôi trùng thì hiện nét dạ quang quét qua và con dấu đỏ "ĐÃ PHÁT HIỆN".
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChallengeScenario, ScenarioMediumType } from '../types';
import { soundFX } from '../services/soundEffects';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Bookmark, 
  Send, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  Newspaper, 
  Play, 
  MoreHorizontal, 
  ThumbsUp, 
  Check, 
  RotateCcw,
  Pin,
  AlertCircle,
  HelpCircle,
  PenTool
} from 'lucide-react';

export function getScenarioMediumType(scenario: ChallengeScenario): ScenarioMediumType {
  if (scenario.mediumType) return scenario.mediumType;
  
  const text = (
    scenario.context + ' ' + 
    scenario.topicTitle + ' ' + 
    scenario.statement + ' ' + 
    scenario.speaker.name + ' ' + 
    scenario.speaker.role
  ).toLowerCase();
  
  if (
    text.includes('họp phụ huynh') || 
    text.includes('biên bản') || 
    text.includes('hội nghị') || 
    text.includes('tọa đàm') || 
    text.includes('ban giám hiệu') || 
    text.includes('quy chế')
  ) {
    return 'meeting_minutes';
  }
  if (
    text.includes('video') || 
    text.includes('tiktok') || 
    text.includes('clip') || 
    text.includes('reels') || 
    text.includes('short') || 
    text.includes('kênh') ||
    text.includes('xem phim')
  ) {
    return 'video_comment';
  }
  if (
    text.includes('nhóm chat') || 
    text.includes('chat') || 
    text.includes('tin nhắn') || 
    text.includes('zalo') || 
    text.includes('nhóm lớp') ||
    text.includes('lớp 11') ||
    text.includes('lớp 12')
  ) {
    return 'chat_bubble';
  }
  if (
    text.includes('báo') || 
    text.includes('phóng sự') || 
    text.includes('chuyên gia') || 
    text.includes('nghiên cứu') || 
    text.includes('thời sự') || 
    text.includes('bản tin') || 
    text.includes('tạp chí') || 
    text.includes('bài báo') ||
    text.includes('tiêu đề')
  ) {
    return 'news_headline';
  }
  
  // Mặc định là bài đăng mạng xã hội
  return 'social_post';
}

interface RealisticScenarioMediumProps {
  scenario: ChallengeScenario;
  highlightedText: string;
  isFlawMatched: boolean;
  isNoFallacyConfirmed: boolean;
  onHighlightConfirmed: (text: string, isMatched: boolean) => void;
  onResetHighlight: () => void;
  onConfirmNoFallacy: () => void;
}

export const RealisticScenarioMedium: React.FC<RealisticScenarioMediumProps> = ({
  scenario,
  highlightedText,
  isFlawMatched,
  isNoFallacyConfirmed,
  onHighlightConfirmed,
  onResetHighlight,
  onConfirmNoFallacy
}) => {
  const mediumType = useMemo(() => getScenarioMediumType(scenario), [scenario]);
  const textContainerRef = useRef<HTMLDivElement>(null);
  
  // Trạng thái chọn từ / cụm từ
  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Tách câu phát biểu thành mảng từ để hỗ trợ chạm trên điện thoại
  const words = useMemo(() => {
    return scenario.statement.split(/(\s+)/);
  }, [scenario.statement]);

  // Reset khi đổi scenario
  useEffect(() => {
    setSelectedWordIndices([]);
    setFeedbackMessage(null);
  }, [scenario.id]);

  // Chuẩn hóa văn bản để so sánh không phân biệt hoa thường và dấu chấm phẩy
  const normalizeText = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'“”]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Kiểm tra cụm từ chọn có khớp với flawText không
  const checkMatch = (candidateText: string): boolean => {
    if (scenario.hiddenFallacyId === 'no_fallacy') {
      return false;
    }
    const targetFlaw = scenario.flawText ? normalizeText(scenario.flawText) : '';
    if (!targetFlaw) return false;

    const cand = normalizeText(candidateText);
    if (!cand) return false;

    // Khớp nếu bao hàm nhau hoặc độ dài trùng nhau >= 60%
    if (cand.includes(targetFlaw) || targetFlaw.includes(cand)) {
      return true;
    }

    // So khớp từ khóa cốt lõi
    const targetWords = targetFlaw.split(' ').filter(w => w.length > 2);
    const candWords = cand.split(' ').filter(w => w.length > 2);
    const matchCount = candWords.filter(w => targetWords.includes(w)).length;
    
    return targetWords.length > 0 && (matchCount / targetWords.length >= 0.55);
  };

  // Xử lý khi bôi đen bằng chuột trên máy tính
  const handleMouseUpSelection = () => {
    if (isFlawMatched || isNoFallacyConfirmed) return;
    
    if (typeof window !== 'undefined') {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const selectedString = selection.toString().trim();
      if (selectedString.length >= 3 && scenario.statement.includes(selectedString)) {
        processHighlightCandidate(selectedString);
      }
    }
  };

  // Xử lý khi chạm vào từng từ trên điện thoại
  const handleWordTap = (index: number) => {
    if (isFlawMatched || isNoFallacyConfirmed) return;
    
    // Nếu là khoảng trắng thì bỏ qua
    if (words[index].trim() === '') return;

    soundFX.playClick();
    setSelectedWordIndices(prev => {
      let updated: number[];
      if (prev.length === 0) {
        updated = [index];
      } else {
        const minIdx = Math.min(...prev, index);
        const maxIdx = Math.max(...prev, index);
        // Chọn toàn bộ các từ nằm giữa min và max
        updated = [];
        for (let i = minIdx; i <= maxIdx; i++) {
          updated.push(i);
        }
      }

      const candidate = updated.map(i => words[i]).join('').trim();
      processHighlightCandidate(candidate);
      return updated;
    });
  };

  // Kiểm tra và áp dụng cụm từ bôi
  const processHighlightCandidate = (candidate: string) => {
    const isMatched = checkMatch(candidate);

    if (isMatched) {
      soundFX.playSuccess();
      setFeedbackMessage(null);
      onHighlightConfirmed(candidate, true);
    } else {
      soundFX.playDefeat();
      setFeedbackMessage('Chưa đúng chỗ có hạt sạn. Hãy chú ý câu phát biểu có tính quy chụp, ép buộc hoặc bẻ cong sự thật!');
      onHighlightConfirmed(candidate, false);
    }
  };

  // Xử lý khi bấm nút "Lập luận này vững chắc, không có hạt sạn"
  const handleNoFallacyAction = () => {
    if (scenario.hiddenFallacyId === 'no_fallacy') {
      soundFX.playSuccess();
      setFeedbackMessage(null);
      onConfirmNoFallacy();
    } else {
      soundFX.playDefeat();
      setFeedbackMessage('Khoan đã! Tình huống này thực sự có chứa một hạt sạn ngụy biện khá tinh vi đấy. Hãy dùng bút dạ quang rà soát kỹ lại nhé!');
    }
  };

  // Trích xuất hiển thị câu phát biểu có tô màu
  const renderInteractiveStatement = () => {
    if (isFlawMatched && scenario.flawText) {
      // Đã tìm trúng: Chia chuỗi thành phần trước, phần lỗi (được bôi vàng hoạt ảnh), và phần sau
      const flawIdx = scenario.statement.indexOf(scenario.flawText);
      if (flawIdx !== -1) {
        const prefix = scenario.statement.substring(0, flawIdx);
        const match = scenario.statement.substring(flawIdx, flawIdx + scenario.flawText.length);
        const suffix = scenario.statement.substring(flawIdx + scenario.flawText.length);

        return (
          <div className="relative text-sm sm:text-base leading-relaxed select-text font-serif">
            <span>&ldquo;{prefix}</span>
            <span className="highlighter-sweep-active inline-block my-0.5">
              {match}
            </span>
            <span>{suffix}&rdquo;</span>
          </div>
        );
      }
    }

    // Trạng thái đang cho học sinh thao tác
    return (
      <div 
        ref={textContainerRef}
        onMouseUp={handleMouseUpSelection}
        className="relative text-sm sm:text-base leading-relaxed select-text font-serif cursor-text"
      >
        <span>&ldquo;</span>
        {words.map((word, idx) => {
          const isSelected = selectedWordIndices.includes(idx);
          const isSpace = word.trim() === '';

          if (isSpace) {
            return <span key={idx}>{word}</span>;
          }

          return (
            <span
              key={idx}
              onClick={() => handleWordTap(idx)}
              className={`cursor-pointer transition-colors duration-150 inline-block px-0.5 rounded-xs ${
                isSelected
                  ? 'bg-[#FACC15] text-[#1E2433] font-semibold'
                  : 'hover:bg-[#FEF3C7] hover:text-[#92400E]'
              }`}
            >
              {word}
            </span>
          );
        })}
        <span>&rdquo;</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* KHUNG MÔ PHỎNG HÌNH THỨC NGOÀI ĐỜI THỰC */}
      <div className="relative rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] overflow-hidden shadow-sm">
        
        {/* CON DẤU ĐỎ ĐÃ PHÁT HIỆN KHI BÔI TRÚNG */}
        {isFlawMatched && (
          <div className="absolute right-4 top-3 z-20 pointer-events-none">
            <div className="stamp-detected">
              <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>ĐÃ PHÁT HIỆN</span>
            </div>
          </div>
        )}

        {/* CON DẤU XANH KHI XÁC NHẬN HỢP LÝ */}
        {isNoFallacyConfirmed && (
          <div className="absolute right-4 top-3 z-20 pointer-events-none">
            <div className="stamp-verified">
              <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
              <span>LẬP LUẬN HỢP LÝ</span>
            </div>
          </div>
        )}

        {/* 1. HÌNH THỨC: BONG BÓNG CHAT NHÓM LỚP */}
        {mediumType === 'chat_bubble' && (
          <div className="space-y-0">
            {/* Thanh tiêu đề App Chat giả lập */}
            <div className="px-4 py-2.5 bg-[#F2EFE8] border-b border-[#E5E1D8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#DBEAFE] border border-[#2563EB]/30 flex items-center justify-center font-bold text-xs text-[#2563EB]">
                  11A
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#1E2433]">Nhóm Lớp 11A · Thảo luận chung</span>
                    <span className="w-2 h-2 rounded-full bg-[#15803D] inline-block animate-pulse"></span>
                  </div>
                  <p className="text-[10px] text-[#6B7280]">42 thành viên · 15 bạn đang trực tuyến</p>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-[#6B7280]" />
            </div>

            {/* Vùng tin nhắn chat */}
            <div className="p-4 sm:p-5 space-y-3.5 bg-[#F8F6F1]">
              <div className="text-center">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E5E1D8] text-[#4A5263]">
                  Hôm nay, 14:25
                </span>
              </div>

              {/* Tin nhắn dẫn nhập ngữ cảnh */}
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-[#E5E1D8] flex items-center justify-center text-[10px] font-bold text-[#4A5263] shrink-0">
                  Lớp
                </div>
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] text-xs text-[#4A5263] space-y-1 shadow-sm">
                  <span className="font-semibold text-[#1E2433] block text-[11px]">Ngữ cảnh bàn luận:</span>
                  <p className="text-[#4A5263] leading-relaxed">{scenario.context}</p>
                </div>
              </div>

              {/* Tin nhắn của nhân vật mục tiêu (chứa câu phát biểu) */}
              <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-[#FEF3C7] border border-[#FACC15] flex items-center justify-center text-[10px] font-bold text-[#92400E] shrink-0">
                  {scenario.speaker.name.charAt(0)}
                </div>
                <div className="space-y-1 w-full">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-xs text-[#1E2433]">{scenario.speaker.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#92400E] border border-[#E5E1D8]">
                      {scenario.speaker.role}
                    </span>
                    <span className="text-[10px] text-[#6B7280] font-mono">14:28</span>
                  </div>

                  {/* Bong bóng chat chính */}
                  <div className="p-3.5 sm:p-4 rounded-xl rounded-tl-none bg-[#FFFFFF] border border-[#E5E1D8] text-[#1E2433] shadow-sm space-y-2">
                    {renderInteractiveStatement()}

                    {/* Thanh cảm xúc tin nhắn giả lập */}
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#6B7280] border-t border-[#E5E1D8]">
                      <span className="px-1.5 py-0.5 rounded bg-[#F2EFE8] text-[#4A5263]">👍 4</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#F2EFE8] text-[#4A5263]">😮 3</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#F2EFE8] text-[#4A5263]">❓ 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. HÌNH THỨC: BÀI ĐĂNG MẠNG XÃ HỘI */}
        {mediumType === 'social_post' && (
          <div className="p-4 sm:p-5 space-y-3.5 bg-[#FFFFFF]">
            {/* Header bài đăng */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F2EFE8] border border-[#E5E1D8] flex items-center justify-center font-bold text-sm text-[#1E2433] shrink-0">
                  {scenario.speaker.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-[#1E2433]">{scenario.speaker.name}</span>
                    <span className="text-xs text-[#2563EB]">· {scenario.speaker.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-0.5">
                    <span>2 giờ trước</span>
                    <span>·</span>
                    <span>🌐 Diễn đàn học sinh</span>
                  </div>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-[#6B7280]" />
            </div>

            {/* Ngữ cảnh ngắn gọn */}
            <div className="text-xs text-[#4A5263] bg-[#F2EFE8] p-2.5 rounded-lg border border-[#E5E1D8]">
              <span className="font-semibold text-[#1E2433]">Bối cảnh: </span>
              {scenario.context}
            </div>

            {/* Nội dung bài đăng (Chứa phát biểu) */}
            <div className="py-2 text-[#1E2433] font-serif">
              {renderInteractiveStatement()}
            </div>

            {/* Số liệu tương tác */}
            <div className="pt-2 border-t border-[#E5E1D8] flex items-center justify-between text-xs text-[#6B7280]">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[#DC2626]">
                  <Heart className="w-3.5 h-3.5 fill-[#DC2626]" /> 342
                </span>
                <span>·</span>
                <span>89 bình luận</span>
              </div>
              <span>14 lượt chia sẻ</span>
            </div>

            {/* Nút hành động */}
            <div className="pt-2 border-t border-[#E5E1D8] grid grid-cols-3 gap-1 text-center text-xs text-[#4A5263]">
              <div className="py-1.5 rounded-md hover:bg-[#F2EFE8] flex items-center justify-center gap-1.5 cursor-pointer">
                <ThumbsUp className="w-3.5 h-3.5" /> Thích
              </div>
              <div className="py-1.5 rounded-md hover:bg-[#F2EFE8] flex items-center justify-center gap-1.5 cursor-pointer">
                <MessageSquare className="w-3.5 h-3.5" /> Bình luận
              </div>
              <div className="py-1.5 rounded-md hover:bg-[#F2EFE8] flex items-center justify-center gap-1.5 cursor-pointer">
                <Share2 className="w-3.5 h-3.5" /> Chia sẻ
              </div>
            </div>
          </div>
        )}

        {/* 3. HÌNH THỨC: BÌNH LUẬN VIDEO NGẮN */}
        {mediumType === 'video_comment' && (
          <div className="space-y-0 bg-[#FFFFFF]">
            {/* Khung video ngắn mô phỏng */}
            <div className="px-4 py-2.5 bg-[#F2EFE8] border-b border-[#E5E1D8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#DC2626] flex items-center justify-center text-white">
                  <Play className="w-3 h-3 fill-white" />
                </div>
                <span className="text-xs font-semibold text-[#1E2433]">Video ngắn học đường · Kênh @tri_tue_thpt</span>
              </div>
              <span className="text-[10px] text-[#6B7280] font-mono">1.2M lượt xem</span>
            </div>

            <div className="p-4 sm:p-5 space-y-3 bg-[#F8F6F1]">
              {/* Ngữ cảnh video */}
              <div className="text-xs text-[#4A5263] italic">
                {scenario.context}
              </div>

              {/* Khung bình luận ghim nổi bật */}
              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Pin className="w-3.5 h-3.5 text-[#D97706] fill-[#FACC15]" />
                    <span className="font-semibold text-[#A16207] text-[11px]">Bình luận ghim từ tác giả</span>
                  </div>
                  <span className="text-[10px] text-[#6B7280]">1 ngày trước</span>
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <div className="w-7 h-7 rounded-full bg-[#F2EFE8] border border-[#E5E1D8] flex items-center justify-center text-xs font-bold text-[#1E2433] shrink-0">
                    {scenario.speaker.name.charAt(0)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#1E2433]">{scenario.speaker.name}</span>
                      <span className="text-[10px] text-[#6B7280]">({scenario.speaker.role})</span>
                    </div>

                    <div className="text-[#1E2433] font-serif pt-1">
                      {renderInteractiveStatement()}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#6B7280] pt-1.5">
                      <span className="flex items-center gap-1 text-[#DC2626]">
                        <Heart className="w-3.5 h-3.5 fill-[#DC2626]" /> 1.4K
                      </span>
                      <span className="hover:text-[#1E2433] cursor-pointer">Trả lời</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. HÌNH THỨC: BIÊN BẢN HỌP PHỤ HUYNH */}
        {mediumType === 'meeting_minutes' && (
          <div className="p-5 sm:p-6 space-y-3.5 bg-[#FFFFFF]">
            {/* Quốc hiệu & Tiêu ngữ nhà trường */}
            <div className="text-center pb-3 border-b border-[#E5E1D8] space-y-0.5">
              <p className="text-[11px] font-semibold tracking-wider uppercase text-[#4A5263]">
                TRƯỜNG THPT CHUYÊN · NĂM HỌC 2025 - 2026
              </p>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#1E2433] tracking-wide">
                BIÊN BẢN HỌP BAN ĐẠI DIỆN CHA MẸ HỌC SINH
              </h3>
              <p className="text-[10px] text-[#6B7280] font-mono">
                Số: 14/BB-CMHS · Ngày ghi nhận: Định kỳ học kỳ I
              </p>
            </div>

            {/* Bối cảnh cuộc họp */}
            <div className="text-xs text-[#4A5263] space-y-1">
              <span className="font-semibold text-[#1E2433] block">I. BỐI CẢNH & NỘI DUNG NGHỊ SỰ:</span>
              <p className="text-[#4A5263] leading-relaxed italic bg-[#F2EFE8] p-2.5 rounded-lg border border-[#E5E1D8]">
                {scenario.context}
              </p>
            </div>

            {/* Trích phát biểu */}
            <div className="space-y-1.5 pt-1">
              <span className="font-semibold text-xs text-[#1E2433] block">
                II. Ý KIẾN PHÁT BIỂU CỦA ĐẠI BIỂU ({scenario.speaker.name} - {scenario.speaker.role}):
              </span>
              <div className="p-3.5 rounded-lg bg-[#F8F6F1] border-l-4 border-[#FACC15] text-[#1E2433] font-serif">
                {renderInteractiveStatement()}
              </div>
            </div>
          </div>
        )}

        {/* 5. HÌNH THỨC: TIÊU ĐỀ BÁO & BÀI BÁO ĐIỆN TỬ */}
        {mediumType === 'news_headline' && (
          <div className="p-5 sm:p-6 space-y-3.5 bg-[#FFFFFF]">
            {/* Măng-sét báo */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E1D8]">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#2563EB]" />
                <span className="font-serif font-bold text-xs tracking-wider uppercase text-[#1E2433]">
                  TẠP CHÍ GIÁO DỤC & THẾ HỆ TRẺ
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280]">Xuất bản 08:30 hôm nay</span>
            </div>

            {/* Tiêu đề bài báo */}
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded bg-[#DBEAFE] text-[#2563EB] text-[10px] font-mono font-semibold uppercase">
                TIÊU ĐIỂM TRANH LUẬN
              </span>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1E2433] leading-snug">
                {scenario.topicTitle}
              </h3>
            </div>

            {/* Đoạn dẫn dắt sa-pô (Context) */}
            <p className="text-xs text-[#4A5263] leading-relaxed font-sans border-l-2 border-[#D6D1C4] pl-3">
              {scenario.context}
            </p>

            {/* Khung trích dẫn lời nhân vật */}
            <div className="p-3.5 rounded-lg bg-[#F2EFE8] border border-[#E5E1D8] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#4A5263] mb-1">
                <span className="font-semibold text-[#1E2433]">
                  Trích nguyên văn lời {scenario.speaker.name} ({scenario.speaker.role}):
                </span>
              </div>
              <div className="text-[#1E2433] font-serif">
                {renderInteractiveStatement()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* THANH ĐIỀU KHIỂN BƯỚC 1: DÙNG BÚT DẠ QUANG BÔI CỤM TỪ CÓ LỖI */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#FEF3C7] border border-[#FACC15]/40 flex items-center justify-center text-[#A16207] shrink-0">
              <PenTool className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-xs text-[#1E2433]">
                Bước 1: Bôi vàng hạt sạn trong câu
              </span>
              <p className="text-[11px] text-[#6B7280]">
                Kéo chuột bôi đen hoặc chạm vào từng từ trên điện thoại để đánh dấu cụm từ ngụy biện.
              </p>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {selectedWordIndices.length > 0 && !isFlawMatched && (
              <button
                type="button"
                onClick={onResetHighlight}
                className="px-2.5 py-1 rounded-lg border border-[#D6D1C4] bg-[#FFFFFF] text-[#4A5263] hover:bg-[#F2EFE8] hover:text-[#1E2433] text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                title="Tô lại từ đầu"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Bôi lại</span>
              </button>
            )}

            {/* Nút dành cho tình huống không có lỗi */}
            <button
              type="button"
              onClick={handleNoFallacyAction}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm ${
                isNoFallacyConfirmed
                  ? 'bg-[#15803D] text-white font-bold'
                  : 'bg-[#FFFFFF] border border-[#D6D1C4] hover:border-[#15803D] text-[#4A5263] hover:text-[#15803D]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Lập luận này vững chắc, không có lỗi</span>
            </button>
          </div>
        </div>

        {/* Thông báo hướng dẫn hoặc phản hồi */}
        {feedbackMessage && (
          <div className="p-2.5 rounded-lg bg-[#FEE2E2] border border-[#DC2626]/30 text-[#DC2626] text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Trạng thái đã phát hiện chính xác */}
        {isFlawMatched && (
          <div className="p-2.5 rounded-lg bg-[#DCFCE7] border border-[#15803D]/30 text-[#15803D] text-xs flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#15803D] shrink-0" />
              <span>
                <strong>Chính xác!</strong> Đã đánh dấu đúng hạt sạn lập luận. Giờ hãy sang Bước 2 để gọi tên loại lỗi nhé.
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-[#92400E] bg-[#FEF3C7] border border-[#E5E1D8] px-2 py-0.5 rounded">
              +20 XP Chính xác
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

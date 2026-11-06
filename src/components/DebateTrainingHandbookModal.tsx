/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SỔ TAY HUẤN LUYỆN TRANH BIỆN CHO HỌC SINH THPT
 * Hệ thống 2 khung phương pháp cốt lõi:
 * 1. Khung PEEL: Xây dựng luận điểm (với cơ chế nhân quả A -> B -> C trong chữ E - Explanation).
 * 2. Kỹ thuật Phản biện 4 bước: Bẻ gãy luận điểm đối thủ (Signal - State - Support - Summarize).
 * 
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Modal trắng #FFFFFF viền #E5E1D8, lớp phủ rgba(15, 23, 42, 0.4).
 * - Nền phụ #F2EFE8, chữ đen #1E2433, chữ phụ #4A5263, chú thích #6B7280.
 * - Nút chính #FACC15 chữ #1E2433, badge vàng #FEF3C7 chữ #92400E.
 */

import React, { useState, useEffect } from 'react';
import { 
  PEEL_FRAMEWORK, 
  MOTION_TYPES, 
  FOUR_STEP_REBUTTAL, 
  ADVANCED_STRATEGIES, 
  TIME_MANAGEMENT_RULES 
} from '../data/trainingHandbook';
import { DEBATE_TOPICS } from '../data/debateTopics';
import { COGNITIVE_BIASES, BIAS_VS_FALLACY_DISTINCTION } from '../data/cognitiveBiases';
import { soundFX } from '../services/soundEffects';
import { 
  X, 
  BookOpen, 
  Cpu, 
  Scale, 
  Target, 
  Award, 
  Swords, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Search, 
  Clock, 
  Sparkles, 
  Copy, 
  Check,
  HelpCircle,
  Eye,
  Compass
} from 'lucide-react';

interface DebateTrainingHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopicToDebate?: (topicId: string) => void;
}

export const DebateTrainingHandbookModal: React.FC<DebateTrainingHandbookModalProps> = ({
  isOpen,
  onClose,
  onSelectTopicToDebate
}) => {
  const [activeTab, setActiveTab] = useState<'peel' | 'rebuttal' | 'motions_formats' | 'topics' | 'biases'>('peel');
  const [selectedPeelCode, setSelectedPeelCode] = useState<'P' | 'E1' | 'E2' | 'L'>('P');
  const [topicCategoryFilter, setTopicCategoryFilter] = useState<string>('all');
  const [topicSearchQuery, setTopicSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

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

  const handleCopyFormula = (formula: string, id: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(formula);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const selectedPeel = PEEL_FRAMEWORK.find(m => m.code === selectedPeelCode) || PEEL_FRAMEWORK[0];

  const filteredTopics = DEBATE_TOPICS.filter(t => {
    const matchesCat = topicCategoryFilter === 'all' || t.category === topicCategoryFilter;
    const matchesSearch = !topicSearchQuery.trim() || 
      t.motion.toLowerCase().includes(topicSearchQuery.toLowerCase()) ||
      t.background.toLowerCase().includes(topicSearchQuery.toLowerCase()) ||
      (t.categoryLabel && t.categoryLabel.toLowerCase().includes(topicSearchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0F172A]/40 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-white border border-[#E5E1D8] rounded-md shadow-lg overflow-hidden flex flex-col max-h-[92vh] text-[#1E2433]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-[#E5E1D8] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#92400E] font-bold">
              <BookOpen className="w-4 h-4 text-[#A16207]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base sm:text-lg font-bold text-[#1E2433]">
                  Sổ tay tranh biện & tư duy
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[11px] font-mono font-medium border border-[#FDE68A]">
                  PEEL · Phản biện · Thiên kiến
                </span>
              </div>
              <p className="text-xs text-[#4A5263]">
                Khung PEEL lập luận, phản biện 4 bước, 27 đề bài và 8 thiên kiến nhận thức
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

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-2 border-b border-[#E5E1D8] bg-white flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('peel');
            }}
            className={`pb-2 px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'peel'
                ? 'border-[#FACC15] text-[#1E2433] font-bold bg-[#FEF3C7] rounded-t'
                : 'border-transparent text-[#4A5263] hover:text-[#1E2433]'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#A16207]" />
            <span>1. Khung PEEL</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('rebuttal');
            }}
            className={`pb-2 px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'rebuttal'
                ? 'border-[#FACC15] text-[#1E2433] font-bold bg-[#FEF3C7] rounded-t'
                : 'border-transparent text-[#4A5263] hover:text-[#1E2433]'
            }`}
          >
            <Swords className="w-4 h-4 text-[#A16207]" />
            <span>2. Phản biện 4 bước</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('motions_formats');
            }}
            className={`pb-2 px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'motions_formats'
                ? 'border-[#FACC15] text-[#1E2433] font-bold bg-[#FEF3C7] rounded-t'
                : 'border-transparent text-[#4A5263] hover:text-[#1E2433]'
            }`}
          >
            <Scale className="w-4 h-4 text-[#A16207]" />
            <span>3. Dạng kiến nghị</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('topics');
            }}
            className={`pb-2 px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'topics'
                ? 'border-[#FACC15] text-[#1E2433] font-bold bg-[#FEF3C7] rounded-t'
                : 'border-transparent text-[#4A5263] hover:text-[#1E2433]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#A16207]" />
            <span>4. 27 chủ đề</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('biases');
            }}
            className={`pb-2 px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'biases'
                ? 'border-[#FACC15] text-[#1E2433] font-bold bg-[#FEF3C7] rounded-t'
                : 'border-transparent text-[#4A5263] hover:text-[#1E2433]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#A16207]" />
            <span>5. Thiên kiến nhận thức</span>
          </button>
        </div>

        {/* Nội dung theo từng tab */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: KHUNG PEEL */}
          {activeTab === 'peel' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Giới thiệu tổng quan */}
              <div className="p-3.5 rounded-md bg-[#F2EFE8] border border-[#E5E1D8]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-[#FEF3C7] text-[#92400E] shrink-0 mt-0.5 border border-[#FDE68A]">
                    <Sparkles className="w-4 h-4 text-[#A16207]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-sm font-bold text-[#1E2433]">
                      Mô hình PEEL: Khung xây dựng luận điểm logic và mạch lạc
                    </h3>
                    <p className="text-xs text-[#4A5263] leading-relaxed">
                      Khung <span className="font-bold underline decoration-[#FACC15] decoration-2">PEEL</span> (Point - Explanation - Evidence - Link) giúp cấu trúc bài nói mạch lạc. Chữ <span className="font-semibold text-[#2563EB]">E (Explanation)</span> tập trung mổ xẻ <span className="font-semibold text-[#A16207]">cơ chế nhân quả (A → B → C)</span> để người nghe hiểu rõ tại sao điều đó xảy ra.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Nút chọn từng thành phần của PEEL */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PEEL_FRAMEWORK.map((item) => {
                  const isSelected = item.code === selectedPeelCode;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setSelectedPeelCode(item.code);
                      }}
                      className={`p-2.5 rounded-md border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E] font-bold shadow-2xs'
                          : 'bg-white border-[#E5E1D8] text-[#4A5263] hover:border-[#D6D1C4]'
                      }`}
                    >
                      <span className="font-mono text-xl font-bold text-[#1E2433]">{item.letter}</span>
                      <span className="text-[11px] font-medium line-clamp-1">{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chi tiết thành phần đang chọn */}
              <div className="p-4 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E1D8] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] font-mono font-bold text-base flex items-center justify-center">
                      {selectedPeel.letter}
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1E2433]">
                        {selectedPeel.name} <span className="text-[#6B7280] font-normal">({selectedPeel.englishName})</span>
                      </h4>
                      <p className="text-xs text-[#A16207]">{selectedPeel.shortDesc}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white text-[#4A5263] text-[11px] font-mono border border-[#E5E1D8]">
                    Khung xây dựng
                  </span>
                </div>

                <div className="text-xs text-[#1E2433] leading-relaxed bg-white p-3 rounded-md border border-[#E5E1D8]">
                  <strong className="text-[#A16207] block mb-1">Hướng dẫn:</strong>
                  {selectedPeel.detailGuide}
                </div>

                {/* Các câu hỏi tự vấn */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#1E2433] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Câu hỏi bạn cần trả lời để hoàn thiện phần này:</span>
                  </span>
                  <div className="space-y-1">
                    {selectedPeel.questionsToAsk.map((q, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#1E2433] bg-white p-2 rounded border border-[#E5E1D8]">
                        <span className="w-4 h-4 rounded bg-[#FACC15] text-[#1E2433] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* So sánh Đúng vs Sai */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-md bg-[#DCFCE7] border border-[#86EFAC] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#15803D] text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Cách làm hợp lý (rõ cơ chế & dẫn chứng)</span>
                    </div>
                    <p className="text-xs text-[#1E2433] leading-relaxed italic">
                      "{selectedPeel.goodExample}"
                    </p>
                  </div>

                  <div className="p-3 rounded-md bg-[#FEE2E2] border border-[#FCA5A5] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#DC2626] text-xs font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Lỗi thường gặp (nói suông, thiếu liên kết)</span>
                    </div>
                    <p className="text-xs text-[#1E2433] leading-relaxed italic">
                      "{selectedPeel.badExample}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHẢN BIỆN 4 BƯỚC & CHIẾN THUẬT NÂNG CAO */}
          {activeTab === 'rebuttal' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Giới thiệu công thức 4 bước */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm font-bold text-[#1E2433] flex items-center gap-2">
                    <Swords className="w-4 h-4 text-[#A16207]" />
                    <span>Kỹ thuật phản biện 4 bước (Signal – State – Support – Summarize)</span>
                  </h3>
                  <span className="text-[11px] text-[#6B7280]">Tập trung trúng điểm nút, không nói vòng vo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FOUR_STEP_REBUTTAL.map((step) => (
                    <div key={step.id} className="p-3.5 rounded-md bg-white border border-[#E5E1D8] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-xs font-mono font-bold border border-[#FDE68A]">
                          {step.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyFormula(step.formula, step.id)}
                          className="text-[11px] text-[#4A5263] hover:text-[#1E2433] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Sao chép công thức"
                        >
                          {copiedText === step.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#15803D]" />
                              <span className="text-[#15803D]">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Mẫu câu</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h4 className="font-serif text-sm font-bold text-[#1E2433]">{step.name}</h4>
                      <p className="text-xs text-[#4A5263]">{step.explanation}</p>

                      <div className="p-2.5 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-[11px] text-[#1E2433] font-mono">
                        <strong className="text-[#A16207] block mb-0.5 font-sans">Công thức:</strong>
                        {step.formula}
                      </div>

                      <div className="text-[11px] text-[#6B7280] italic">
                        Ví dụ: {step.sampleSpeech}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Chiến thuật phản biện nâng cao */}
              <div className="space-y-3 pt-3 border-t border-[#E5E1D8]">
                <h3 className="font-serif text-sm font-bold text-[#1E2433] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#A16207]" />
                  <span>3 đòn phản biện then chốt: De-link, Turn, Mitigation</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ADVANCED_STRATEGIES.map((strat) => (
                    <div key={strat.id} className="p-3.5 rounded-md bg-white border border-[#E5E1D8] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-sm font-bold text-[#1E2433]">{strat.name}</h4>
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-medium">
                          {strat.englishName}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A5263] leading-relaxed">{strat.definition}</p>
                      
                      <div className="text-[11px] text-[#1E2433] bg-[#F2EFE8] p-2 rounded border border-[#E5E1D8]">
                        <strong className="text-[#A16207]">Ứng dụng:</strong> {strat.application}
                      </div>

                      <div className="text-[11px] text-[#4A5263] italic bg-white p-2 rounded border border-[#E5E1D8]">
                        <strong className="text-[#1E2433] not-italic block mb-0.5">Ví dụ:</strong>
                        {strat.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phân bổ thời gian */}
              <div className="p-3.5 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-2.5">
                <div className="flex items-center gap-2 text-[#1E2433] font-bold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#A16207]" />
                  <span>{TIME_MANAGEMENT_RULES.ruleName}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TIME_MANAGEMENT_RULES.sections.map((sec, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-white border border-[#E5E1D8] space-y-0.5 shadow-2xs">
                      <span className="font-mono text-[#A16207] text-xs font-bold block">{sec.percentage}</span>
                      <h5 className="text-xs font-bold text-[#1E2433]">{sec.title}</h5>
                      <p className="text-[11px] text-[#4A5263] leading-relaxed">{sec.action}</p>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-[#92400E] italic bg-[#FEF3C7] p-2 rounded border border-[#FDE68A]">
                  💡 {TIME_MANAGEMENT_RULES.preEmptionHint}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOẠI KIẾN NGHỊ & THỂ THỨC */}
          {activeTab === 'motions_formats' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-3">
                <h3 className="font-serif text-sm font-bold text-[#1E2433] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#A16207]" />
                  <span>Phân loại 3 hình thức Kiến nghị trong Tranh biện</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {MOTION_TYPES.map((m) => (
                    <div key={m.type} className="p-3.5 rounded-md bg-white border border-[#E5E1D8] space-y-2 shadow-2xs">
                      <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-xs font-mono font-bold inline-block border border-[#FDE68A]">
                        {m.badge}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-[#1E2433]">{m.name}</h4>
                      <p className="text-xs text-[#4A5263] leading-relaxed">{m.definition}</p>

                      <div className="text-[11px] text-[#92400E] bg-[#FEF3C7] p-2 rounded border border-[#FDE68A]">
                        <strong>Chiến lược then chốt:</strong> {m.strategy}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-[#6B7280] uppercase">Ví dụ:</span>
                        {m.examples.map((ex, i) => (
                          <div key={i} className="text-[11px] text-[#4A5263] flex items-start gap-1.5">
                            <span className="text-[#A16207]">›</span>
                            <span>{ex}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KHO 27 CHỦ ĐỀ THỰC CHIẾN */}
          {activeTab === 'topics' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Bộ lọc và tìm kiếm */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={topicSearchQuery}
                    onChange={(e) => setTopicSearchQuery(e.target.value)}
                    placeholder="Tìm theo chủ đề, từ khóa (bài tập, điện thoại, AI...)..."
                    className="w-full pl-9 pr-4 py-1.5 bg-[#F2EFE8] border border-[#E5E1D8] rounded text-xs text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#FACC15]"
                  />
                  {topicSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTopicSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] hover:text-[#1E2433] cursor-pointer"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Tất cả (27)' },
                    { id: 'giao_duc', label: 'Giáo Dục (10)' },
                    { id: 'moi_truong', label: 'Môi Trường (6)' },
                    { id: 'y_te_suc_khoe', label: 'Y Tế & Sức Khỏe (7)' },
                    { id: 'xa_hoi', label: 'Xã Hội (4)' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setTopicCategoryFilter(cat.id);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        topicCategoryFilter === cat.id
                          ? 'bg-[#FACC15] text-[#1E2433] font-bold shadow-2xs'
                          : 'bg-white text-[#4A5263] hover:text-[#1E2433] border border-[#D6D1C4] hover:bg-[#F2EFE8]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh sách chủ đề */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredTopics.length === 0 ? (
                  <div className="p-8 text-center text-[#6B7280] text-xs">
                    Không tìm thấy chủ đề nào phù hợp với từ khóa "{topicSearchQuery}".
                  </div>
                ) : (
                  filteredTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-3.5 rounded-md bg-white border border-[#E5E1D8] hover:border-[#D6D1C4] transition-all space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#F2EFE8] border border-[#E5E1D8] text-[#1E2433] text-[10px] font-mono font-medium">
                            {topic.categoryLabel || 'Chủ đề'}
                          </span>
                          {topic.motionTypeLabel && (
                            <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] font-mono">
                              {topic.motionTypeLabel}
                            </span>
                          )}
                        </div>

                        {onSelectTopicToDebate && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onSelectTopicToDebate(topic.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          >
                            <span>Thách đấu đề này</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <h4 className="font-serif text-sm font-bold text-[#1E2433]">
                        {topic.motion}
                      </h4>

                      <p className="text-xs text-[#4A5263] leading-relaxed">
                        {topic.background}
                      </p>

                      {/* Gợi ý khung PEEL tóm tắt */}
                      {topic.peelGuidance && (
                        <div className="mt-2 pt-2 border-t border-[#E5E1D8] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="text-[#1E2433]">
                            <strong className="text-[#A16207]">P - Luận điểm:</strong> {topic.peelGuidance.point}
                          </div>
                          <div className="text-[#1E2433]">
                            <strong className="text-[#2563EB]">E - Cơ chế (A → B → C):</strong> {topic.peelGuidance.explanation}
                          </div>
                          <div className="text-[#1E2433]">
                            <strong className="text-[#15803D]">E - Dẫn chứng:</strong> {topic.peelGuidance.evidence}
                          </div>
                          <div className="text-[#1E2433]">
                            <strong className="text-[#B45309]">L - Liên kết:</strong> {topic.peelGuidance.link}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: THIÊN KIẾN NHẬN THỨC & TỰ NHÌN LẠI MÌNH */}
          {activeTab === 'biases' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Phân biệt cốt lõi: Thiên kiến vs Ngụy biện */}
              <div className="p-4 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    <Compass className="w-5 h-5 text-[#A16207]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#1E2433]">
                      Tự nhìn lại mình: Phân biệt Thiên kiến & Ngụy biện
                    </h3>
                    <p className="text-xs text-[#4A5263]">
                      {BIAS_VS_FALLACY_DISTINCTION.summary}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-md bg-white border border-[#E5E1D8] space-y-1.5 shadow-2xs">
                    <div className="font-serif font-bold text-[#1E2433] flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-[#A16207]" />
                      <span>Thiên kiến nhận thức (Cognitive Bias)</span>
                    </div>
                    <p className="text-[#4A5263] leading-relaxed">
                      {BIAS_VS_FALLACY_DISTINCTION.biasDefinition}
                    </p>
                    <div className="text-[11px] font-semibold text-[#1E2433] bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded inline-block">
                      👉 Lỗi trong cách mình NGHĨ (Bên trong)
                    </div>
                  </div>

                  <div className="p-3 rounded-md bg-white border border-[#E5E1D8] space-y-1.5 shadow-2xs">
                    <div className="font-serif font-bold text-[#92400E] flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-[#A16207]" />
                      <span>Ngụy biện logic (Logical Fallacy)</span>
                    </div>
                    <p className="text-[#4A5263] leading-relaxed">
                      {BIAS_VS_FALLACY_DISTINCTION.fallacyDefinition}
                    </p>
                    <div className="text-[11px] font-semibold text-[#DC2626] bg-[#FEE2E2] border border-[#FCA5A5] px-2 py-0.5 rounded inline-block">
                      👉 Lỗi trong cách LẬP LUẬN (Bên ngoài)
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách 8 Thiên kiến nhận thức */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-[#1E2433] flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#A16207]" />
                    <span>8 Điểm mù tư duy thường gặp cần tự soi chiếu</span>
                  </h4>
                  <span className="text-xs text-[#6B7280]">
                    8/8 thiên kiến học đường
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {COGNITIVE_BIASES.map((bias, idx) => (
                    <div
                      key={bias.id}
                      className="p-4 rounded-md bg-white border border-[#E5E1D8] hover:border-[#D6D1C4] transition-all space-y-2.5 flex flex-col justify-between shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-mono font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <h5 className="font-serif font-bold text-[#1E2433] text-sm">
                                {bias.vietnameseName}
                              </h5>
                            </div>
                            <span className="text-xs font-mono text-[#6B7280] ml-7">
                              {bias.name}
                            </span>
                          </div>
                        </div>

                        {/* Định nghĩa chuẩn 2 câu */}
                        <div className="text-xs text-[#1E2433] leading-relaxed bg-[#F2EFE8] p-2.5 rounded border border-[#E5E1D8]">
                          <strong className="text-[#1E2433] font-semibold block mb-0.5">Định nghĩa:</strong>
                          {bias.definition}
                        </div>

                        {/* Ví dụ học đường đời thực */}
                        <div className="text-xs text-[#1E2433] leading-relaxed bg-[#FEF3C7]/60 p-2.5 rounded border border-[#FDE68A]">
                          <strong className="text-[#92400E] font-semibold block mb-0.5">Ví dụ học đường:</strong>
                          {bias.schoolExample}
                        </div>
                      </div>

                      {/* Câu tự hỏi để phát hiện bản thân */}
                      <div className="pt-2 border-t border-[#E5E1D8] text-xs bg-[#F2EFE8] p-2.5 rounded border border-[#E5E1D8]">
                        <div className="flex items-center gap-1.5 font-bold text-[#1E2433] mb-0.5">
                          <HelpCircle className="w-3.5 h-3.5 text-[#A16207]" />
                          <span>Câu tự vấn để phát hiện:</span>
                        </div>
                        <p className="text-[#4A5263] italic">
                          "{bias.selfCheckQuestion}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-5 py-3 border-t border-[#E5E1D8] bg-white flex items-center justify-between text-xs text-[#6B7280] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#15803D]" />
            <span className="text-[#4A5263]">Gõ · Học tranh biện và tư duy logic</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-white hover:bg-[#F2EFE8] text-[#1E2433] border border-[#D6D1C4] transition-colors cursor-pointer text-xs font-medium"
          >
            Đóng sổ tay
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODULE 1: "VẠCH LÁ TÌM SÂU" (FALLACY DETECTION LAB)
 * Phong cách "Giấy và Bút dạ quang":
 * - Nền giấy sáng, chữ màu mực xanh đậm. Màu nhấn vàng dạ quang, đỏ bút chì chỉ dùng cho lỗi.
 * - Bo góc nhỏ 4-6px, đường kẻ mảnh, không gradient/backdrop-blur.
 * - Kho 52 tình huống (42 lỗi ngụy biện + 10 lập luận hợp lý).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChallengeScenario, FallacyEvaluationResult, ScenarioCategory } from '../types';
import { FALLACIES, CHALLENGE_SCENARIOS } from '../data/fallacyData';
import { AiDebateService } from '../services/aiService';
import { useGamification } from '../context/GamificationContext';
import { soundFX } from '../services/soundEffects';
import { RealisticScenarioMedium } from './RealisticScenarioMedium';
import { 
  ShieldAlert, 
  Search, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight, 
  X, 
  ChevronDown, 
  Quote, 
  Loader2, 
  HelpCircle, 
  Award, 
  RefreshCw, 
  Shuffle, 
  ShieldCheck, 
  Check,
  PenTool,
  Sparkles
} from 'lucide-react';

const STORAGE_KEY_COMPLETED = 'tri_tue_phan_bien_completed_scenarios';

export const FallacyChallengeView: React.FC = () => {
  const { addXP, recordFallacyResult } = useGamification();

  // Bộ lọc chuyên đề
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | 'all'>('all');
  
  // Danh sách ID các tình huống đã làm để không lặp lại
  const [completedScenarioIds, setCompletedScenarioIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLETED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tình huống hiện tại đang hiển thị
  const [activeScenarioId, setActiveScenarioId] = useState<string>('');

  // Trạng thái Bước 1: Dùng bút dạ quang bôi hạt sạn
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [isFlawMatched, setIsFlawMatched] = useState<boolean>(false);
  const [isNoFallacyConfirmed, setIsNoFallacyConfirmed] = useState<boolean>(false);

  // Form nộp bài
  const [selectedFallacyId, setSelectedFallacyId] = useState<string>('');
  const [rebuttalText, setRebuttalText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<FallacyEvaluationResult | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [justResetPool, setJustResetPool] = useState<boolean>(false);

  // Từ điển ngụy biện Codex Drawer
  const [isCodexOpen, setIsCodexOpen] = useState<boolean>(false);
  const [codexSearch, setCodexSearch] = useState<string>('');

  // Lọc danh sách tình huống theo chuyên đề
  const filteredScenarios = useMemo(() => {
    return CHALLENGE_SCENARIOS.filter(sc => 
      selectedCategory === 'all' ? true : sc.category === selectedCategory
    );
  }, [selectedCategory]);

  // Chọn ngẫu nhiên một tình huống chưa làm
  const pickRandomScenario = useCallback((pool: ChallengeScenario[], excludeIds: string[]) => {
    const uncompleted = pool.filter(sc => !excludeIds.includes(sc.id));
    if (uncompleted.length > 0) {
      const randomIndex = Math.floor(Math.random() * uncompleted.length);
      return { scenario: uncompleted[randomIndex], isReset: false };
    }
    // Nếu đã làm hết toàn bộ pool này, reset lại danh sách loại trừ cho pool
    if (pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      return { scenario: pool[randomIndex], isReset: true };
    }
    return { scenario: CHALLENGE_SCENARIOS[0], isReset: false };
  }, []);

  // Khởi tạo hoặc cập nhật khi chuyển chuyên mục
  useEffect(() => {
    const { scenario, isReset } = pickRandomScenario(filteredScenarios, completedScenarioIds);
    if (isReset && completedScenarioIds.length > 0) {
      const poolIds = new Set(filteredScenarios.map(s => s.id));
      const nextCompleted = completedScenarioIds.filter(id => !poolIds.has(id));
      setCompletedScenarioIds(nextCompleted);
      try {
        localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(nextCompleted));
      } catch {}
      setJustResetPool(true);
      setTimeout(() => setJustResetPool(false), 4000);
    }
    if (scenario) {
      setActiveScenarioId(scenario.id);
    }
    setSelectedFallacyId('');
    setRebuttalText('');
    setEvaluationResult(null);
    setSubmissionError(null);
    setHighlightedText('');
    setIsFlawMatched(false);
    setIsNoFallacyConfirmed(false);
  }, [selectedCategory, filteredScenarios, pickRandomScenario]);

  // Lấy tình huống hiện tại
  const activeScenario = useMemo(() => {
    return CHALLENGE_SCENARIOS.find(sc => sc.id === activeScenarioId) || filteredScenarios[0] || CHALLENGE_SCENARIOS[0];
  }, [activeScenarioId, filteredScenarios]);

  // Đếm tiến độ trong category hiện tại
  const completedInCurrentCategory = useMemo(() => {
    const currentPoolIds = new Set(filteredScenarios.map(s => s.id));
    return completedScenarioIds.filter(id => currentPoolIds.has(id)).length;
  }, [filteredScenarios, completedScenarioIds]);

  // Xử lý nộp bài
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFallacyId || !rebuttalText.trim() || isSubmitting) return;

    soundFX.playClick();
    setIsSubmitting(true);
    setSubmissionError(null);

    const isNoFallacyScenario = activeScenario.hiddenFallacyId === 'no_fallacy';
    const isPrimaryCorrect = selectedFallacyId === activeScenario.hiddenFallacyId;
    const isSecondaryCorrect = !!activeScenario.secondaryFallacyId && selectedFallacyId === activeScenario.secondaryFallacyId;
    const isFallacyCorrect = isPrimaryCorrect || isSecondaryCorrect;

    try {
      const evaluation = await AiDebateService.evaluateFallacyRebuttal(
        activeScenario,
        selectedFallacyId,
        rebuttalText.trim(),
        isFallacyCorrect,
        isFlawMatched
      );

      setEvaluationResult(evaluation);

      if (evaluation.isRelevant) {
        if (evaluation.totalScore >= 60) {
          soundFX.playSuccess();
        } else {
          soundFX.playDefeat();
        }

        recordFallacyResult(
          evaluation.fallacyCorrect,
          evaluation.totalScore,
          {
            scenarioId: activeScenario.id,
            fallacyName: isNoFallacyScenario 
              ? 'Lập luận hợp lý' 
              : (FALLACIES.find(f => f.id === activeScenario.hiddenFallacyId)?.name || activeScenario.hiddenFallacyId),
            logicScore: evaluation.logicScore,
            identificationScore: evaluation.fallacyAccuracyScore
          },
          evaluation.xpEarned,
          `Hoàn thành phân tích: "${activeScenario.topicTitle}"`
        );

        if (!completedScenarioIds.includes(activeScenario.id)) {
          const nextCompleted = [...completedScenarioIds, activeScenario.id];
          setCompletedScenarioIds(nextCompleted);
          try {
            localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(nextCompleted));
          } catch {}
        }
      } else {
        soundFX.playDefeat();
        recordFallacyResult(false, 0, {
          scenarioId: activeScenario.id,
          fallacyName: isNoFallacyScenario ? 'Lập luận hợp lý' : activeScenario.hiddenFallacyId,
          logicScore: 0,
          identificationScore: 0
        }, 0);
      }
    } catch (err: any) {
      console.error('Lỗi khi chấm điểm phân tích:', err);
      soundFX.playDefeat();
      setSubmissionError('AI không phản hồi hoặc mạng chậm. Bài viết của bạn đã được giữ nguyên.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chuyển sang tình huống ngẫu nhiên tiếp theo
  const handleNextChallenge = () => {
    soundFX.playClick();
    setSelectedFallacyId('');
    setRebuttalText('');
    setEvaluationResult(null);
    setSubmissionError(null);
    setHighlightedText('');
    setIsFlawMatched(false);
    setIsNoFallacyConfirmed(false);

    const { scenario, isReset } = pickRandomScenario(filteredScenarios, completedScenarioIds);
    if (isReset) {
      const poolIds = new Set(filteredScenarios.map(s => s.id));
      const resetList = completedScenarioIds.filter(id => !poolIds.has(id));
      setCompletedScenarioIds(resetList);
      try {
        localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(resetList));
      } catch {}
      setJustResetPool(true);
      setTimeout(() => setJustResetPool(false), 4000);
    }
    setActiveScenarioId(scenario.id);
  };

  // Xáo trộn và làm mới kho tình huống
  const handleResetPool = () => {
    soundFX.playClick();
    const poolIds = new Set(filteredScenarios.map(s => s.id));
    const nextCompleted = completedScenarioIds.filter(id => !poolIds.has(id));
    setCompletedScenarioIds(nextCompleted);
    try {
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(nextCompleted));
    } catch {}

    const { scenario } = pickRandomScenario(filteredScenarios, []);
    setActiveScenarioId(scenario.id);
    setSelectedFallacyId('');
    setRebuttalText('');
    setEvaluationResult(null);
    setSubmissionError(null);
    setHighlightedText('');
    setIsFlawMatched(false);
    setIsNoFallacyConfirmed(false);
    setJustResetPool(true);
    setTimeout(() => setJustResetPool(false), 3000);
  };

  // Lấy thông tin lỗi ngụy biện đang chọn
  const previewSelectedFallacy = FALLACIES.find(f => f.id === selectedFallacyId);
  const isValidSelected = selectedFallacyId === 'no_fallacy';

  // Thông tin lỗi chính & lỗi phụ của tình huống đang xét
  const targetFallacy = FALLACIES.find(f => f.id === activeScenario.hiddenFallacyId);
  const secondaryFallacy = FALLACIES.find(f => f.id === activeScenario.secondaryFallacyId);

  // Danh sách từ điển tra cứu
  const codexFiltered = FALLACIES.filter(f => 
    f.name.toLowerCase().includes(codexSearch.toLowerCase()) ||
    f.vietnameseName.toLowerCase().includes(codexSearch.toLowerCase()) ||
    f.definition.toLowerCase().includes(codexSearch.toLowerCase()) ||
    (f.whenNotFallacy && f.whenNotFallacy.toLowerCase().includes(codexSearch.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-[#1E2433]">
      {/* Tiêu đề & Công cụ kho đề - Khối nền sáng viền tinh tế */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] text-[#1E2433] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1E2433] leading-snug">
            Vạch lá tìm sâu
          </h1>
          <p className="text-[#4A5263] text-xs sm:text-sm mt-1 leading-relaxed">
            Nhặt hạt sạn ngụy biện hoặc phát hiện lập luận hợp lý trong tin nhắn Zalo, bình luận TikTok, họp phụ huynh và đời sống học đường.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetPool}
            className="px-3 py-1.5 rounded-lg border border-[#D6D1C4] hover:bg-[#F2EFE8] text-[#1E2433] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Làm mới lại kho câu hỏi"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#1E2433]" />
            <span>Xáo lại kho</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setIsCodexOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#1E2433]" />
            <span>Sổ tay 14 bẫy lập luận</span>
          </button>
        </div>
      </div>

      {/* Thông báo reset kho */}
      {justResetPool && (
        <div className="p-3 rounded-lg bg-[#DCFCE7] border border-[#15803D]/30 text-[#15803D] text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>Đã làm mới lại kho tình huống. Tiếp tục luyện tập nhé!</span>
          </div>
          <button type="button" onClick={() => setJustResetPool(false)} className="text-[#15803D]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Lọc Chuyên Đề & Tiến độ (giao diện tối giản) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs text-[#6B7280] mr-1 shrink-0">Chủ đề:</span>
          {[
            { id: 'all', label: 'Tất cả (52)' },
            { id: 'hoc_duong', label: 'Học đường' },
            { id: 'mang_xa_hoi', label: 'Mạng xã hội' },
            { id: 'cong_nghe_ai', label: 'Công nghệ & AI' },
            { id: 'dao_duc_xa_hoi', label: 'Đạo đức & Gia đình' },
            { id: 'y_te_suc_khoe', label: 'Y tế' },
            { id: 'moi_truong', label: 'Môi trường' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSelectedCategory(tab.id as ScenarioCategory | 'all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-[#FACC15] text-[#1E2433] font-semibold hover:bg-[#EAB308]'
                  : 'text-[#4A5263] hover:text-[#1E2433] hover:bg-[#F2EFE8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#6B7280] font-mono self-end sm:self-auto shrink-0">
          Đã làm: <strong className="text-[#1E2433]">{completedInCurrentCategory}</strong>/{filteredScenarios.length}
        </div>
      </div>

      {/* Vùng Thử Thách Chính: Chia 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột Trái (7 Cột): Tình huống & Khung Soạn Thảo */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Tình huống đời thực với 5 hình thức & Bước 1: Dùng bút dạ quang */}
          <RealisticScenarioMedium
            scenario={activeScenario}
            highlightedText={highlightedText}
            isFlawMatched={isFlawMatched}
            isNoFallacyConfirmed={isNoFallacyConfirmed}
            onHighlightConfirmed={(text, isMatched) => {
              setHighlightedText(text);
              setIsFlawMatched(isMatched);
            }}
            onResetHighlight={() => {
              setHighlightedText('');
              setIsFlawMatched(false);
              setIsNoFallacyConfirmed(false);
            }}
            onConfirmNoFallacy={() => {
              setIsNoFallacyConfirmed(true);
              setIsFlawMatched(false);
              setSelectedFallacyId('no_fallacy');
            }}
          />

          {/* Khung Soạn Thảo Phản Biện (Bước 2 & Bước 3) */}
          <form onSubmit={handleSubmit} className="rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] p-5 space-y-4 shadow-sm text-[#1E2433]">
            {/* Bước 2: Chọn lỗi hoặc xác nhận hợp lý */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-semibold text-[#1E2433] flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#A16207]" />
                  <span>Bước 2: Chọn tên lỗi ngụy biện (hoặc xác nhận hợp lý)</span>
                </label>
                <span className="text-[#6B7280] text-[11px]">14 bẫy + Lập luận hợp lý</span>
              </div>

              <div className="relative">
                <select
                  value={selectedFallacyId}
                  onChange={(e) => setSelectedFallacyId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F2EFE8] border border-[#E5E1D8] rounded-lg text-sm text-[#1E2433] focus:outline-none focus:border-[#FACC15] appearance-none cursor-pointer pr-8"
                >
                  <option value="" disabled>-- Bấm để chọn lỗi ngụy biện hoặc lập luận hợp lý --</option>
                  
                  <optgroup label="⭐ Lập luận chuẩn xác (Không có lỗi)">
                    <option value="no_fallacy">
                      ✓ Không có lỗi, lập luận hợp lý
                    </option>
                  </optgroup>

                  <optgroup label="Nhóm Tâm lý & Công kích">
                    {FALLACIES.filter(f => f.category === 'tam_ly').map(f => (
                      <option key={f.id} value={f.id}>{f.vietnameseName} ({f.name})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Nhóm Cấu trúc & Nhân quả sai lầm">
                    {FALLACIES.filter(f => f.category === 'cau_truc').map(f => (
                      <option key={f.id} value={f.id}>{f.vietnameseName} ({f.name})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Nhóm Dữ liệu & Mẫu thống kê phi lý">
                    {FALLACIES.filter(f => f.category === 'du_lieu').map(f => (
                      <option key={f.id} value={f.id}>{f.vietnameseName} ({f.name})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Nhóm Đánh lạc hướng & Lươn lẹo">
                    {FALLACIES.filter(f => f.category === 'danh_lac_huong').map(f => (
                      <option key={f.id} value={f.id}>{f.vietnameseName} ({f.name})</option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-4 h-4 text-[#6B7280] absolute right-3 top-2.5 pointer-events-none" />
              </div>

              {/* Hộp xem nhanh giải nghĩa */}
              {previewSelectedFallacy && (
                <div className="mt-2 p-2.5 rounded-lg bg-[#FEF3C7] border border-[#E5E1D8] text-xs text-[#92400E]">
                  <strong className="text-[#92400E]">{previewSelectedFallacy.vietnameseName}: </strong>
                  <span>{previewSelectedFallacy.definition}</span>
                </div>
              )}

              {isValidSelected && (
                <div className="mt-2 p-2.5 rounded-lg bg-[#DCFCE7] border border-[#15803D]/30 text-xs text-[#15803D]">
                  <strong>Xác nhận: Phát biểu không có lỗi. </strong>
                  <span>Ở bước 3, giải thích ngắn gọn vì sao lập luận này hợp lý và có căn cứ.</span>
                </div>
              )}
            </div>

            {/* Bước 3: Soạn thảo lời phản bác / giải thích */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-semibold text-[#1E2433] flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>
                    {isValidSelected 
                      ? 'Bước 3: Giải thích vì sao lập luận này hợp lý (3-5 câu)' 
                      : 'Bước 3: Viết phản biện lại lỗi sai (3-5 câu)'}
                  </span>
                </label>
                <span className="text-[#6B7280] font-mono text-[11px]">
                  {rebuttalText.split(/\s+/).filter(Boolean).length} từ
                </span>
              </div>

              <textarea
                value={rebuttalText}
                onChange={(e) => setRebuttalText(e.target.value)}
                rows={4}
                placeholder={
                  isValidSelected
                    ? "Nêu lý do vì sao phát biểu trên logic (dẫn chứng có cơ sở, không đánh tráo khái niệm, phân tích đúng bản chất)..."
                    : "Chỉ rõ câu nói sai ở điểm nào, đứt gãy nhân quả ra sao và dẫn chứng thực tế phản bác..."
                }
                className="w-full p-3 bg-[#F2EFE8] border border-[#E5E1D8] rounded-lg text-sm text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#FACC15] resize-y leading-relaxed"
              />
            </div>

            {/* Nút gửi nộp bài */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-xs text-[#6B7280] hidden sm:inline">
                Nhận tới +140 XP khi phân tích chuẩn xác.
              </span>

              <button
                type="submit"
                disabled={!selectedFallacyId || !rebuttalText.trim() || isSubmitting}
                className="px-5 py-2 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] text-xs sm:text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang chấm bài...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{isValidSelected ? 'Gửi lời giải thích' : 'Gửi bài phản bác'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Cột Phải (5 Cột): Kết Quả Chấm Điểm & Phản Hồi AI */}
        <div className="lg:col-span-5 space-y-4">
          {submissionError && (
            <div className="p-4 rounded-xl bg-[#FEE2E2] border border-[#DC2626]/30 text-[#DC2626] text-xs space-y-2 shadow-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{submissionError}</div>
                  <p className="mt-1">Bài viết của bạn vẫn còn nguyên, hãy bấm thử lại.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="px-3 py-1 rounded bg-[#DC2626] hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Thử lại</span>
                </button>
              </div>
            </div>
          )}

          {evaluationResult ? (
            <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] p-5 space-y-4 shadow-sm animate-in fade-in duration-150 text-[#1E2433]">
              {/* Điểm tổng & Huy hiệu kết quả */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-serif font-bold text-[#1E2433] font-mono">
                    {evaluationResult.totalScore}<span className="text-xs text-[#6B7280] font-sans">/100</span>
                  </div>
                  <div>
                    <div className="text-xs text-[#6B7280]">Đánh giá chung:</div>
                    <div className="text-xs font-semibold text-[#1E2433]">
                      {!evaluationResult.isRelevant ? (
                        <span className="text-[#DC2626]">Không hợp lệ / Lạc đề</span>
                      ) : evaluationResult.totalScore >= 85 ? (
                        <span className="bg-[#FDE68A] text-[#1E2433] px-2 py-0.5 rounded font-bold border border-[#E5E1D8]">Xuất sắc</span>
                      ) : evaluationResult.totalScore >= 60 ? (
                        <span className="text-[#15803D]">Đạt yêu cầu</span>
                      ) : (
                        <span className="text-[#DC2626]">Cần mài giũa thêm</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-[#A16207]">
                    +{evaluationResult.xpEarned} XP
                  </span>
                </div>
              </div>

              {/* 3 Tiêu chí chấm điểm */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-[#4A5263] mb-0.5">
                    <span>1. Nhận diện lỗi</span>
                    <span className="font-mono font-semibold text-[#1E2433]">{evaluationResult.scores?.identification ?? evaluationResult.fallacyAccuracyScore}/30</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E1D8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FACC15] transition-all duration-300 rounded-full"
                      style={{ width: `${((evaluationResult.scores?.identification ?? evaluationResult.fallacyAccuracyScore) / 30) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#4A5263] mb-0.5">
                    <span>2. Tính logic & cơ chế bẻ lại</span>
                    <span className="font-mono font-semibold text-[#1E2433]">{evaluationResult.scores?.reasoning ?? evaluationResult.logicScore}/40</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E1D8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FACC15] transition-all duration-300 rounded-full"
                      style={{ width: `${((evaluationResult.scores?.reasoning ?? evaluationResult.logicScore) / 40) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#4A5263] mb-0.5">
                    <span>3. Sức thuyết phục & văn phong</span>
                    <span className="font-mono font-semibold text-[#1E2433]">{evaluationResult.scores?.persuasion ?? evaluationResult.persuasionScore}/30</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E1D8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FACC15] transition-all duration-300 rounded-full"
                      style={{ width: `${((evaluationResult.scores?.persuasion ?? evaluationResult.persuasionScore) / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Điểm thưởng chính xác nếu học sinh bôi đúng flawText */}
              {evaluationResult.precisionBonus || isFlawMatched ? (
                <div className="p-3 rounded-lg bg-[#FEF3C7] border border-[#FACC15] text-xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[#92400E] mb-1 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D97706] fill-[#FACC15]" />
                      Điểm thưởng "Chính xác" (Bôi đúng hạt sạn):
                    </span>
                    <span className="font-mono text-[#92400E] font-bold">+{evaluationResult.precisionBonus || 20} XP</span>
                  </div>
                  <div className="font-serif text-sm text-[#1E2433]">
                    &ldquo;<span className="bg-[#FDE68A] text-[#1E2433] px-1.5 py-0.5 rounded font-bold border-b-2 border-dashed border-[#D97706]">{activeScenario.flawText}</span>&rdquo;
                  </div>
                </div>
              ) : activeScenario.flawText ? (
                <div className="p-3 rounded-lg bg-[#F2EFE8] border border-[#E5E1D8] text-xs">
                  <div className="text-[#6B7280] mb-1 font-medium">
                    Cụm từ chứa hạt sạn chính xác trong câu:
                  </div>
                  <div className="font-serif text-sm text-[#1E2433]">
                    &ldquo;<span className="bg-[#FDE68A] text-[#1E2433] px-1.5 py-0.5 rounded font-medium border-b-2 border-dashed border-[#D97706]">{activeScenario.flawText}</span>&rdquo;
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-[#DCFCE7] border border-[#15803D]/30 text-xs text-[#15803D]">
                  ✓ Phát biểu này là <strong>Lập luận hợp lý</strong> (không có lỗi ngụy biện).
                </div>
              )}

              {/* Câu yếu nhất trong bài học sinh (dùng đỏ bút chì) */}
              {evaluationResult.weakestQuote && (
                <div className="p-3 rounded-lg bg-[#FEE2E2] border border-[#DC2626]/30 text-xs">
                  <div className="text-[#DC2626] font-medium mb-1">
                    Chỗ cần mài giũa lại:
                  </div>
                  <p className="italic text-[#1E2433] font-serif">
                    &ldquo;{evaluationResult.weakestQuote}&rdquo;
                  </p>
                </div>
              )}

              {/* Lời nhận xét chân phương từ AI Mentor */}
              <div className="p-3 rounded-lg bg-[#F2EFE8] border border-[#E5E1D8] text-xs space-y-1.5">
                <div className="font-semibold text-[#1E2433]">
                  Góp ý từ người bạn phản biện:
                </div>
                <p className="text-[#4A5263] leading-relaxed">
                  {evaluationResult.feedback || evaluationResult.mentorFeedback}
                </p>

                {evaluationResult.strengths && evaluationResult.strengths.length > 0 && (
                  <div className="pt-1.5 border-t border-[#E5E1D8] text-[#15803D] space-y-1">
                    {evaluationResult.strengths.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span>✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bản tham khảo gợi ý */}
              <div className="text-xs text-[#4A5263]">
                <span className="font-medium text-[#1E2433]">Cách nói gợi ý: </span>
                <span className="italic font-serif">&ldquo;{evaluationResult.improvedVersion || evaluationResult.improvedRebuttalSuggestion}&rdquo;</span>
              </div>

              {/* Nút sang câu tiếp theo */}
              <button
                type="button"
                onClick={handleNextChallenge}
                className="w-full py-2.5 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <span>Tình huống tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Trạng thái hướng dẫn 4 bước tối giản */
            <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] p-5 space-y-3 text-xs shadow-sm">
              <div className="flex items-center gap-1.5 font-semibold text-[#1E2433]">
                <HelpCircle className="w-4 h-4 text-[#A16207]" />
                <span>4 bước bóc tách lập luận nhanh:</span>
              </div>

              <div className="space-y-2 text-[#4A5263]">
                <div>
                  <strong className="text-[#1E2433]">1. Chỉ mặt: </strong>
                  Trích cụm từ có vấn đề trong câu của đối phương.
                </div>
                <div>
                  <strong className="text-[#1E2433]">2. Đặt tên: </strong>
                  Chỉ rõ đây là lỗi ngụy biện gì hoặc vì sao lại hợp lý.
                </div>
                <div>
                  <strong className="text-[#1E2433]">3. Vạch xích: </strong>
                  Chỉ ra chỗ đứt gãy trong suy luận nguyên nhân - kết quả.
                </div>
                <div>
                  <strong className="text-[#1E2433]">4. Chốt lại: </strong>
                  Nêu sự thật khách quan hoặc giải pháp đúng đắn.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SỔ TAY 14 BẪY LẬP LUẬN (DRAWER GIAO DIỆN GIẤY) */}
      {isCodexOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40">
          <div className="w-full max-w-lg h-full bg-[#FFFFFF] border-l border-[#E5E1D8] flex flex-col shadow-xl animate-in slide-in-from-right duration-150">
            {/* Header Codex */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E1D8]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1E2433]">
                  Sổ tay 14 bẫy lập luận
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  Kèm phần: Khi nào KHÔNG phải ngụy biện
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCodexOpen(false)}
                className="p-1 rounded text-[#6B7280] hover:text-[#1E2433] hover:bg-[#F2EFE8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ô tìm kiếm */}
            <div className="p-3 border-b border-[#E5E1D8]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={codexSearch}
                  onChange={(e) => setCodexSearch(e.target.value)}
                  placeholder="Tìm tên lỗi hoặc trường hợp hợp lý..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F2EFE8] border border-[#E5E1D8] rounded-lg text-xs text-[#1E2433] placeholder-[#6B7280] focus:outline-none focus:border-[#FACC15]"
                />
              </div>
            </div>

            {/* Danh sách bẫy lập luận */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {codexFiltered.map(f => (
                <div key={f.id} className="p-3.5 rounded-lg border border-[#E5E1D8] bg-[#F8F6F1] space-y-2 text-xs">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-semibold text-[#1E2433]">
                      {f.vietnameseName}
                    </h4>
                    <span className="font-mono text-[11px] text-[#6B7280]">
                      {f.name}
                    </span>
                  </div>

                  <p className="text-[#4A5263] leading-relaxed">
                    {f.definition}
                  </p>

                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E1D8] text-[11px] text-[#4A5263] space-y-1">
                    <div>
                      <strong className="text-[#1E2433]">Ví dụ: </strong>
                      {f.example}
                    </div>
                  </div>

                  {/* Mục: Khi nào KHÔNG phải ngụy biện */}
                  <div className="p-2.5 rounded-lg bg-[#DCFCE7] border border-[#15803D]/30 text-[11px] text-[#15803D] space-y-0.5">
                    <div className="font-semibold flex items-center gap-1">
                      <span>✓ Khi nào KHÔNG phải ngụy biện:</span>
                    </div>
                    <p className="leading-relaxed pl-3">
                      {f.whenNotFallacy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

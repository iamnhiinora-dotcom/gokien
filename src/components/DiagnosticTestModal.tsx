/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODAL BÀI KIỂM TRA CHẨN ĐOÁN NĂNG LỰC TƯ DUY PHẢN BIỆN (20 CÂU - 15 PHÚT)
 * Hỗ trợ Bộ đề A (Đầu vào) và Bộ đề B (Sau 4 tuần).
 * Tự động tính điểm 5 nhóm năng lực và đồng bộ vào Bản đồ Radar thực tế.
 * 
 * Phong cách ánh sáng đồng bộ (Light Mode):
 * - Modal trắng #FFFFFF viền #E5E1D8, lớp phủ rgba(15, 23, 42, 0.4).
 * - Nền phụ #F2EFE8, chữ đen #1E2433, chữ phụ #4A5263, chú thích #6B7280.
 * - Nút chính #FACC15 chữ #1E2433, badge vàng #FEF3C7 chữ #92400E.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DIAGNOSTIC_SET_A, 
  DIAGNOSTIC_SET_B, 
  DiagnosticQuestion, 
  DiagnosticSkillGroupKey, 
  DIAGNOSTIC_GROUP_INFO 
} from '../data/diagnosticTestData';
import { DiagnosticTestResult } from '../types';
import { soundFX } from '../services/soundEffects';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Award, 
  Compass, 
  RotateCcw, 
  Check, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface DiagnosticTestModalProps {
  isOpen: boolean;
  testSet: 'A' | 'B';
  onClose: () => void;
  onSaveResult: (testSet: 'A' | 'B', result: DiagnosticTestResult) => void;
}

export const DiagnosticTestModal: React.FC<DiagnosticTestModalProps> = ({
  isOpen,
  testSet,
  onClose,
  onSaveResult
}) => {
  const questions: DiagnosticQuestion[] = useMemo(() => {
    return testSet === 'A' ? DIAGNOSTIC_SET_A : DIAGNOSTIC_SET_B;
  }, [testSet]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60); // 15 phút
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<DiagnosticTestResult | null>(null);

  // Khởi động lại khi mở modal
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedAnswers({});
      setSecondsRemaining(15 * 60);
      setIsSubmitted(false);
      setShowReview(false);
      setTestResult(null);
    }
  }, [isOpen, testSet]);

  // Bộ đếm thời gian 15 phút
  useEffect(() => {
    if (!isOpen || isSubmitted) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSubmitted]);

  // Định dạng thời gian MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (optionIndex: number) => {
    soundFX.playClick();
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
  };

  // Nộp bài và tính điểm
  const handleSubmitTest = useCallback(() => {
    soundFX.playSuccess();

    // 1. Tính số câu đúng và điểm từng nhóm năng lực
    let correct = 0;
    const groupCorrectCounts: Record<DiagnosticSkillGroupKey, number> = {
      implicit_assumptions: 0,
      logical_validity: 0,
      evidence_strength: 0,
      fallacy_recognition: 0,
      fact_vs_opinion: 0
    };

    questions.forEach(q => {
      const selected = selectedAnswers[q.id];
      if (selected === q.correctIndex) {
        correct += 1;
        groupCorrectCounts[q.groupKey] += 1;
      }
    });

    // Mỗi nhóm có 4 câu (100% = 4 câu đúng -> mỗi câu 25đ trong nhóm)
    const groupScores: Record<DiagnosticSkillGroupKey, number> = {
      implicit_assumptions: Math.round((groupCorrectCounts.implicit_assumptions / 4) * 100),
      logical_validity: Math.round((groupCorrectCounts.logical_validity / 4) * 100),
      evidence_strength: Math.round((groupCorrectCounts.evidence_strength / 4) * 100),
      fallacy_recognition: Math.round((groupCorrectCounts.fallacy_recognition / 4) * 100),
      fact_vs_opinion: Math.round((groupCorrectCounts.fact_vs_opinion / 4) * 100)
    };

    const totalScore = Math.round((correct / questions.length) * 100);
    const timeSpent = 15 * 60 - secondsRemaining;

    const result: DiagnosticTestResult = {
      testSet,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: timeSpent,
      totalQuestions: questions.length,
      correctCount: correct,
      totalScore,
      groupScores,
      answers: selectedAnswers
    };

    setTestResult(result);
    setIsSubmitted(true);
    onSaveResult(testSet, result);
  }, [questions, selectedAnswers, secondsRemaining, testSet, onSaveResult]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0F172A]/40 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-[#E5E1D8] shadow-lg overflow-hidden my-auto flex flex-col max-h-[92vh] rounded-md text-[#1E2433]">
        {/* THANH TIÊU ĐỀ & ĐỒNG HỒ */}
        <div className="p-4 sm:p-5 border-b border-[#E5E1D8] bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-[#1E2433]" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#1E2433]">
                  Bài kiểm tra năng lực phản biện
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] font-mono text-xs border border-[#FDE68A]">
                  {testSet === 'A' ? 'Bộ A (Đầu vào)' : 'Bộ B (Sau 4 tuần)'}
                </span>
              </div>
              <p className="text-xs text-[#4A5263]">
                20 câu hỏi tình huống thực tế · 5 nhóm năng lực cốt lõi · 15 phút
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono font-semibold text-xs ${
                secondsRemaining <= 120 
                  ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]' 
                  : 'border-[#E5E1D8] bg-[#F2EFE8] text-[#1E2433]'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-[#6B7280] hover:text-[#1E2433] hover:bg-[#F2EFE8] text-sm transition-colors cursor-pointer"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        </div>

        {/* NỘI DUNG CHÍNH: LÀM BÀI HOẶC KẾT QUẢ */}
        {!isSubmitted ? (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* Thanh tiến độ câu hỏi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#4A5263]">
                <span>Câu {currentIndex + 1} / {questions.length}</span>
                <span>Đã làm: <strong className="text-[#1E2433]">{answeredCount}</strong>/{questions.length}</span>
              </div>
              <div className="w-full h-1.5 bg-[#F2EFE8] border border-[#E5E1D8] rounded overflow-hidden">
                <div 
                  className="h-full bg-[#FACC15] transition-all duration-200"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Bảng số câu hỏi nhảy nhanh */}
              <div className="flex flex-wrap gap-1 pt-1">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-6 h-6 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#FACC15] text-[#1E2433] border border-[#EAB308] font-bold shadow-2xs'
                          : isAnswered
                            ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                            : 'border border-[#E5E1D8] bg-white text-[#6B7280] hover:bg-[#F2EFE8]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Khối Nhóm Kỹ Năng & Tình Huống */}
            <div className="p-4 sm:p-5 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#1E2433]">
                  Nhóm {Math.floor(currentIndex / 4) + 1}: {DIAGNOSTIC_GROUP_INFO[currentQ.groupKey].name}
                </span>
                <span className="text-[11px] text-[#4A5263]">
                  {DIAGNOSTIC_GROUP_INFO[currentQ.groupKey].description}
                </span>
              </div>

              {/* Bối cảnh thực tế */}
              <div className="p-3.5 rounded bg-white border border-[#E5E1D8] text-[#1E2433] text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs">
                <div className="text-[11px] font-semibold text-[#A16207] mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> <span>Tình huống thực tế:</span>
                </div>
                {currentQ.contextScenario}
              </div>

              {/* Câu hỏi */}
              <div className="font-serif font-bold text-sm sm:text-base text-[#1E2433] pt-1">
                {currentQ.questionText}
              </div>
            </div>

            {/* Danh sách 4 Lựa chọn A, B, C, D */}
            <div className="space-y-2">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                const optLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-3 rounded border text-left transition-colors flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FEF3C7] text-[#1E2433] border-[#FDE68A] font-medium shadow-2xs'
                        : 'bg-white border-[#E5E1D8] hover:border-[#D6D1C4] text-[#1E2433]'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-[#FACC15] text-[#1E2433] border border-[#EAB308] font-bold'
                        : 'border border-[#D6D1C4] bg-[#F2EFE8] text-[#6B7280]'
                    }`}>
                      {optLetter}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed pt-0.5">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* MÀN HÌNH KẾT QUẢ ĐÁNH GIÁ THỰC TẾ */
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {/* Banner Điểm Số */}
            <div className="p-5 rounded bg-white border border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs text-[#4A5263] flex items-center justify-center sm:justify-start gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#A16207]" /> Kết quả bài kiểm tra chẩn đoán ({testSet === 'A' ? 'Bộ A' : 'Bộ B'})
                </span>
                <h4 className="font-serif text-lg sm:text-xl font-bold text-[#1E2433]">
                  {testResult && testResult.totalScore >= 80 
                    ? 'Xuất sắc! Năng lực phản biện rất vững vàng' 
                    : testResult && testResult.totalScore >= 60 
                      ? 'Khá tốt! Đã nắm vững logic và ngụy biện căn bản' 
                      : 'Đã hoàn thành! Bắt đầu rèn luyện để tiến bộ hơn'}
                </h4>
                <p className="text-xs text-[#4A5263]">
                  Thời gian: {Math.floor((testResult?.timeSpentSeconds || 0) / 60)} phút {(testResult?.timeSpentSeconds || 0) % 60} giây · Đúng {testResult?.correctCount}/{testResult?.totalQuestions} câu
                </p>
              </div>

              <div className="text-center shrink-0">
                <div className="text-3xl font-serif font-bold text-[#1E2433] font-mono">
                  {testResult?.totalScore}<span className="text-xs text-[#6B7280] font-sans">/100</span>
                </div>
              </div>
            </div>

            {/* BẢNG ĐIỂM CHI TIẾT 5 NHÓM NĂNG LỰC */}
            <div className="space-y-3">
              <h5 className="font-serif font-bold text-sm text-[#1E2433] uppercase tracking-wider">
                Điểm chi tiết theo 5 nhóm năng lực:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {testResult && Object.entries(testResult.groupScores).map(([key, score]) => {
                  const gKey = key as DiagnosticSkillGroupKey;
                  const info = DIAGNOSTIC_GROUP_INFO[gKey];
                  return (
                    <div 
                      key={key}
                      className="p-3.5 rounded-md bg-[#F2EFE8] border border-[#E5E1D8] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#1E2433] truncate">{info.name}</span>
                        <span className={`font-mono text-xs font-bold ${
                          score >= 75 ? 'text-[#15803D]' : score >= 50 ? 'text-[#A16207]' : 'text-[#DC2626]'
                        }`}>
                          {score}/100
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white border border-[#E5E1D8] rounded overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            score >= 75 ? 'bg-[#15803D]' : score >= 50 ? 'bg-[#FACC15]' : 'bg-[#DC2626]'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#4A5263] leading-snug">
                        {info.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NÚT XEM LẠI ĐÁP ÁN & GIẢI THÍCH CHI TIẾT */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowReview(!showReview)}
                className="w-full py-2 px-3 rounded bg-white border border-[#D6D1C4] hover:bg-[#F2EFE8] text-[#1E2433] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#A16207]" />
                <span>{showReview ? 'Ẩn phần giải thích' : 'Xem lại 20 câu hỏi & Giải thích chi tiết'}</span>
              </button>

              {showReview && (
                <div className="mt-3 space-y-3 max-h-96 overflow-y-auto pr-1">
                  {questions.map((q, idx) => {
                    const chosen = selectedAnswers[q.id];
                    const isCorrect = chosen === q.correctIndex;
                    return (
                      <div 
                        key={q.id}
                        className={`p-3.5 rounded-md border text-xs space-y-2 ${
                          isCorrect 
                            ? 'bg-[#DCFCE7] border-[#86EFAC]' 
                            : 'bg-[#FEE2E2] border-[#FCA5A5]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-[#1E2433] flex items-center gap-1.5">
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                            )}
                            Câu {idx + 1}: {q.groupName}
                          </span>
                          <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                            isCorrect ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#DC2626]'
                          }`}>
                            {isCorrect ? 'Đúng (+25đ)' : 'Chưa đúng (0đ)'}
                          </span>
                        </div>

                        <p className="text-[#1E2433]">{q.questionText}</p>

                        <div className="space-y-0.5 pl-2 border-l-2 border-[#E5E1D8]">
                          <div>
                            <span className="text-[#4A5263]">Bạn chọn: </span>
                            <span className={isCorrect ? 'text-[#15803D] font-semibold' : 'text-[#DC2626] font-semibold'}>
                              {chosen !== undefined ? q.options[chosen] : '(Chưa chọn)'}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div>
                              <span className="text-[#4A5263]">Đáp án chính xác: </span>
                              <span className="text-[#15803D] font-semibold">
                                {q.options[q.correctIndex]}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-2.5 rounded bg-white border border-[#E5E1D8] text-[#1E2433] leading-relaxed">
                          <strong className="text-[#A16207]">Giải thích: </strong>
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* THANH ĐIỀU HƯỚNG DƯỚI CÙNG */}
        <div className="p-3.5 bg-white border-t border-[#E5E1D8] flex items-center justify-between gap-3 shrink-0">
          {!isSubmitted ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-3 py-1.5 rounded bg-white hover:bg-[#F2EFE8] border border-[#D6D1C4] text-[#1E2433] disabled:opacity-40 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-3.5 py-1.5 rounded bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Câu tiếp theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitTest}
                    className="px-4 py-1.5 rounded bg-[#15803D] hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Nộp bài & Chấm điểm</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <span className="text-xs text-[#15803D] font-medium">
                ✓ Đã cập nhật vào bản đồ radar năng lực
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded bg-[#FACC15] hover:bg-[#EAB308] text-[#1E2433] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span>Xem bản đồ năng lực</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TRANG GIỚI THIỆU CHUNG & HƯỚNG DẪN SỬ DỤNG (LANDING GUIDE VIEW)
 * Phong cách "Giấy và bút dạ quang" trong Dark Mode:
 * - 1 câu nói web giúp gì (chân thật, không màu mè marketing)
 * - 1 tình huống làm thử ngay tại chỗ với bút dạ quang & con dấu "ĐÃ PHÁT HIỆN"
 * - Hướng dẫn quy tắc các phần chơi chi tiết & ý nghĩa chim gõ kiến "Gõ"
 * - Các nút/thẻ để học sinh tự lựa chọn chế độ bắt đầu
 */

import React, { useState } from 'react';
import { WoodpeckerLogo } from './WoodpeckerLogo';
import { soundFX } from '../services/soundEffects';
import { ActiveModule } from './Navbar';
import { useGamification } from '../context/GamificationContext';
import { 
  ShieldAlert, 
  Swords, 
  Trophy, 
  Dices, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  FileCheck2,
  RotateCcw,
  Check,
  BarChart3
} from 'lucide-react';

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
    speaker: 'Bình luận trên TikTok',
    context: 'Dưới video chia sẻ về phương pháp ngủ đủ giấc mùa thi cử',
    statementPrefix: 'Bác sĩ khuyên không nên thức khuya học bài? ',
    flawSegment: 'Nhưng ổng cũng toàn thức trắng đêm trực cấp cứu đấy thôi, nghe làm gì!',
    statementSuffix: '',
    fallacyName: 'Lỗi "Bạn cũng thế" (Tu Quoque)',
    plainExplanation: 'Bác sĩ có thức đêm vì công việc cấp cứu hay không thì việc thức khuya gây hại cho não bộ học sinh vẫn là sự thật y học. Lấy thói quen cá nhân của người nói để gạt bỏ chân lý là trật lấc.'
  },
  {
    speaker: 'Nhóm chat Zalo lớp 11',
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

interface LandingGuideViewProps {
  onSelectModule: (module: ActiveModule, arenaSubmode?: '1v1' | 'wsdc') => void;
  onReplayIntro: () => void;
}

export const LandingGuideView: React.FC<LandingGuideViewProps> = ({
  onSelectModule,
  onReplayIntro
}) => {
  const { openHandbook, openDiagnosticTest } = useGamification();

  // State cho tình huống làm thử ngay tại chỗ
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

  const handleNavigate = (mod: ActiveModule, arenaSubmode?: '1v1' | 'wsdc') => {
    soundFX.playClick();
    onSelectModule(mod, arenaSubmode);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-[#1E2433] animate-in fade-in duration-200">
      
      {/* 1. MỘT CÂU NÓI WEB GIÚP GÌ - KHỐI NỀN MỘC MẠC */}
      <section className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 sm:p-7 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-[#F2EFE8] border border-[#E5E1D8] flex items-center justify-center shrink-0">
              <WoodpeckerLogo size={42} />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1E2433]">
                  Gõ · Nhặt hạt sạn trong lập luận
                </h1>
                <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-xs font-bold font-mono">
                  Dành cho học sinh THPT
                </span>
              </div>
              <p className="text-sm sm:text-base text-[#4A5263] leading-relaxed max-w-2xl">
                Tụi mình cùng bạn nhặt hạt sạn trong lập luận, để khi lướt mạng hay tranh luận không bị đuối lý và không tin bừa.
              </p>
            </div>
          </div>

          {/* Các nút tiện ích góc phải */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onReplayIntro}
              className="px-3 py-1.5 rounded-lg border border-[#D6D1C4] bg-[#FFFFFF] hover:bg-[#F2EFE8] text-[#1E2433] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Xem lại hiệu ứng mở đầu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#A16207]" />
              <span>Xem lại mở đầu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                openHandbook();
              }}
              className="px-3 py-1.5 rounded-lg border border-[#D6D1C4] bg-[#FFFFFF] hover:bg-[#F2EFE8] text-[#1E2433] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#A16207]" />
              <span>Sổ tay PEEL</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. MỘT TÌNH HUỐNG LÀM THỬ NGAY TẠI CHỖ (BÚT DẠ QUANG & CON DẤU) */}
      <section className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 sm:p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E1D8] text-xs text-[#6B7280]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1E2433]">{currentSample.speaker}</span>
            <span>·</span>
            <span className="text-[#4A5263]">{currentSample.context}</span>
          </div>

          <button
            type="button"
            onClick={handleNextSample}
            className="text-xs text-[#6B7280] hover:text-[#1E2433] flex items-center gap-1 cursor-pointer transition-colors"
            title="Đổi ví dụ khác"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#A16207]" />
            <span>Đổi tình huống</span>
          </button>
        </div>

        {/* Khối phát biểu thực tế - có thể bấm để tô bút dạ quang */}
        <div className="py-2">
          <p className="text-base sm:text-lg font-normal leading-relaxed text-[#1E2433]">
            <span>&ldquo;{currentSample.statementPrefix}</span>
            <span
              onClick={handleReveal}
              title="Bấm vào cụm từ này để đánh dấu lỗi bằng bút dạ quang"
              className={`cursor-pointer transition-all duration-150 ${
                isRevealed
                  ? 'bg-[#FDE68A] text-[#1E2433] px-1.5 py-0.5 rounded font-bold border-b-2 border-dashed border-[#D97706]'
                  : 'border-b-2 border-dashed border-[#D97706] hover:bg-[#FEF3C7] px-1 text-[#1E2433]'
              }`}
            >
              {currentSample.flawSegment}
            </span>
            <span>{currentSample.statementSuffix}&rdquo;</span>
          </p>
        </div>

        {/* Trạng thái chưa bấm: hướng dẫn học sinh bấm thử */}
        {!isRevealed ? (
          <div className="pt-2 border-t border-[#E5E1D8] flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-[#6B7280]">
              👉 Nhấn thử vào cụm từ gạch chân phía trên để dùng bút dạ quang nhặt hạt sạn.
            </span>
            <button
              type="button"
              onClick={handleReveal}
              className="font-bold px-3 py-1.5 rounded-lg bg-[#FACC15] text-[#1E2433] hover:bg-[#EAB308] transition-colors cursor-pointer text-xs shadow-sm"
            >
              Gõ tìm lỗi ngay
            </button>
          </div>
        ) : (
          /* Trạng thái đã bấm: Giải thích mộc mạc kèm con dấu ĐÃ PHÁT HIỆN */
          <div className="pt-3 border-t border-[#E5E1D8] text-xs sm:text-sm animate-in fade-in duration-150 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-[#1E2433] font-semibold">
                <span className="w-4 h-4 rounded-full bg-[#15803D] text-white inline-flex items-center justify-center text-[10px] font-bold">✓</span>
                <span className="bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded font-bold border border-[#E5E1D8]">{currentSample.fallacyName}</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#DC2626]/30 bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold font-mono">
                <ShieldAlert className="w-3 h-3 text-[#DC2626]" />
                <span>ĐÃ PHÁT HIỆN</span>
              </div>
            </div>
            <p className="text-[#4A5263] leading-relaxed text-xs sm:text-sm">
              {currentSample.plainExplanation}
            </p>
          </div>
        )}
      </section>

      {/* 3. HƯỚNG DẪN QUY TẮC CÁC PHẦN CHƠI & CHỌN BẮT ĐẦU */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1E2433] flex items-center gap-2">
            <span>Hướng dẫn quy tắc & Chọn phần chơi để bắt đầu</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5263] mt-1">
            Đọc qua quy tắc các chế độ bên dưới rồi bấm vào nút để bắt đầu rèn luyện hôm nay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Chế độ 1: Vạch Lá Tìm Sâu */}
          <div className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 flex flex-col justify-between hover:border-[#FACC15] transition-all shadow-sm">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FACC15]/40">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1E2433]">
                    1. Vạch Lá Tìm Sâu
                  </h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F2EFE8] text-[#4A5263]">
                  Cơ bản & Nâng cao
                </span>
              </div>

              <p className="text-xs text-[#4A5263] leading-relaxed">
                <strong className="text-[#1E2433]">Quy tắc:</strong> Tình huống hiện dưới hình thức thực tế (chat nhóm lớp, bài đăng mạng xã hội, bình luận video ngắn, biên bản họp phụ huynh).
                <br />
                • Bước 1: Dùng bút dạ quang bôi đúng cụm từ có lỗi.
                <br />
                • Bước 2: Chọn chính xác loại lỗi ngụy biện.
                <br />
                • Bước 3: Viết câu phản biện bẻ lại để AI chấm điểm logic và thưởng XP.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E1D8]">
              <button
                type="button"
                onClick={() => handleNavigate('fallacy_challenge')}
                className="w-full py-2 px-3 rounded-lg bg-[#FACC15] text-[#1E2433] hover:bg-[#EAB308] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <span>Bắt đầu Vạch Lá Tìm Sâu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chế độ 2: Đấu Trường Phản Biện (Gộp 1v1 và WSDC 3v3) */}
          <div className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 flex flex-col justify-between hover:border-[#FACC15] transition-all shadow-sm">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FACC15]/40">
                    <Swords className="w-4 h-4" />
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1E2433]">
                    2. Đấu Trường Phản Biện
                  </h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F2EFE8] text-[#4A5263]">
                  1v1 & WSDC 3v3
                </span>
              </div>

              <p className="text-xs text-[#4A5263] leading-relaxed">
                <strong className="text-[#1E2433]">Quy tắc:</strong> Sàn đấu đối thoại đối kháng trí tuệ với AI theo hiệp hoặc thể thức World Schools chuẩn quốc tế.
                <br />
                • <em>1v1 với AI:</em> Bảo vệ thanh máu 100 HP, Dựng luận điểm "Người Thép" (Steelman) đạt từ 6/10 điểm trở lên để vào trận, ghi nhận ý đúng để nhận điểm Công tâm.
                <br />
                • <em>WSDC 3v3:</em> Mỗi phe 3 diễn giả, 8 phút mỗi bài chính, 4 phút bài Reply, câu hỏi xen POI từ phút 1 đến 7, thang 60–80 điểm, không có kết quả hòa.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E1D8] grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleNavigate('debate_arena', '1v1')}
                className="py-2 px-3 rounded-lg bg-[#FACC15] text-[#1E2433] hover:bg-[#EAB308] font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm"
              >
                <span>Đấu 1v1 với AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('debate_arena', 'wsdc')}
                className="py-2 px-3 rounded-lg bg-[#F2EFE8] border border-[#D6D1C4] hover:bg-[#E5E1D8] text-[#1E2433] font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Trophy className="w-3.5 h-3.5 text-[#A16207]" />
                <span>Thi đấu WSDC 3v3</span>
              </button>
            </div>
          </div>

          {/* Chế độ 3: Chơi Game Với Bạn Bè */}
          <div className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 flex flex-col justify-between hover:border-[#FACC15] transition-all shadow-sm">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-[#FACC15] text-[#1E2433]">
                    <Dices className="w-4 h-4" />
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1E2433]">
                    3. Chơi Game Với Bạn Bè
                  </h3>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] uppercase border border-[#E5E1D8]">
                  Đối kháng
                </span>
              </div>

              <p className="text-xs text-[#4A5263] leading-relaxed">
                <strong className="text-[#1E2433]">Quy tắc:</strong>
                <br />
                • <em>Cờ cá ngựa phản biện:</em> Mỗi lần lắc xúc xắc đều phải trả lời 1 câu hỏi tư duy (Dễ/Vừa/Khó); trả lời đúng mới được di chuyển hoặc ra quân. Ô Cổng an toàn, ô 💡 lắc thêm, ô 🐛 bắt sâu nhận khiên, đi đủ 28 bước vào Đích.
                <br />
                • <em>Đấu 2 người trực tiếp:</em> 100 HP mỗi bên. Mỗi lượt chọn 1 trong 4 đòn phản biện tấn công đối phương, tránh tự dẫm bẫy ngụy biện.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E1D8]">
              <button
                type="button"
                onClick={() => handleNavigate('multiplayer_games')}
                className="w-full py-2 px-3 rounded-lg bg-[#FACC15] text-[#1E2433] hover:bg-[#EAB308] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <span>Chơi Cờ Cá Ngựa & Đấu 2 Người</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chế độ 4: Tiến Độ & Bảng Xếp Hạng */}
          <div className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 flex flex-col justify-between hover:border-[#FACC15] transition-all shadow-sm">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FACC15]/40">
                    <BarChart3 className="w-4 h-4" />
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1E2433]">
                    4. Tiến Độ & Bảng Xếp Hạng
                  </h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F2EFE8] text-[#4A5263]">
                  Hồ sơ & Thi đua
                </span>
              </div>

              <p className="text-xs text-[#4A5263] leading-relaxed">
                <strong className="text-[#1E2433]">Quy tắc:</strong> Khẳng định năng lực tư duy cá nhân và thi đua cùng học sinh các trường THPT.
                <br />
                • <em>Tiến độ cá nhân:</em> Theo dõi chuỗi ngày rèn luyện, cấp bậc (Lv.1 - Lv.6), radar tư duy phản biện, lịch sử đối đầu và huy hiệu.
                <br />
                • <em>Bảng xếp hạng:</em> Bục vinh danh Top 3, bộ lọc lớp và so tài theo XP hoặc số trận thắng.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E1D8] grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleNavigate('progress_hub')}
                className="py-2 px-3 rounded-lg bg-[#FACC15] text-[#1E2433] hover:bg-[#EAB308] font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm"
              >
                <span>Xem tiến độ cá nhân</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('leaderboard_hub')}
                className="py-2 px-3 rounded-lg bg-[#F2EFE8] border border-[#D6D1C4] hover:bg-[#E5E1D8] text-[#1E2433] font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Trophy className="w-3.5 h-3.5 text-[#A16207]" />
                <span>Xem bảng xếp hạng</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 4. TRIẾT LÝ HÌNH TƯỢNG CHIM GÕ KIẾN */}
      <section className="rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] p-5 sm:p-6 space-y-3 shadow-sm">
        <h3 className="font-serif text-base font-bold text-[#1E2433] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#A16207]" />
          <span>Vì sao lại là chim gõ kiến "Gõ"?</span>
        </h3>
        <p className="text-xs sm:text-sm text-[#4A5263] leading-relaxed">
          Chim gõ kiến cần mẫn gõ từng nhát vào thân cây để nhặt sâu bọ mà không làm hỏng vỏ cây. Tương tự, tư duy phản biện trong "Gõ" không phải là để cãi thắng hay hạ bệ người khác, mà là dùng lý lẽ công tâm, có cơ chế logic chặt chẽ để nhặt hạt sạn ngụy biện, tìm ra sự thật và cùng nhau tiến bộ.
        </p>
      </section>
    </div>
  );
};

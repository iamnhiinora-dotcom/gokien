/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ĐỊNH NGHĨA KIỂU DỮ LIỆU CHO MODULE 3: KIỂM CHỨNG TIN (SIFT FACT-CHECKING LAB)
 */

export type FactCheckType = 
  | 'cat_xen_so_lieu'        // Số liệu bị cắt xén
  | 'bieu_do_truc_tung'      // Biểu đồ có trục tung không bắt đầu từ 0
  | 'nham_tuong_quan'        // Nhầm tương quan với nhân quả
  | 'giat_tit_sai_noi_dung'  // Tiêu đề giật tít khác nội dung
  | 'anh_cu_su_kien_moi'     // Ảnh cũ gắn sự kiện mới
  | 'trich_dan_gia_mao'      // Trích dẫn bịa của người nổi tiếng
  | 'ai_deepfake'            // Ảnh hoặc giọng nói do AI tạo
  | 'tin_nhan_chuyen_tiep'   // Tin nhắn chuyển tiếp chưa kiểm chứng
  | 'nghien_cuu_bop_meo';    // Bóp méo kết quả nghiên cứu khoa học

export type FactCheckVerdict = 'dung' | 'sai' | 'gay_hieu_lam' | 'chua_du_can_cu';

export interface FactCheckItem {
  id: string;
  title: string;                    // Tên bài kiểm chứng
  category: 'mang_xa_hoi' | 'bao_chi' | 'y_te_suc_khoe' | 'giao_duc' | 'cong_nghe' | 'doi_song';
  categoryLabel: string;
  type: FactCheckType;              // Dạng bẫy thông tin
  typeLabel: string;                // Nhãn hiển thị (vd: "Ảnh cũ gắn sự kiện mới")
  sourceClaim: {
    platform: 'Facebook' | 'TikTok' | 'Zalo' | 'Báo điện tử' | 'YouTube' | 'Threads';
    author: string;
    authorHandle?: string;
    avatarInitials: string;
    publishedTime: string;
    headline: string;               // Tiêu đề / tít bài lan truyền
    content: string;                // Nội dung bài đăng giả lập
    mediaType: 'image' | 'chart' | 'audio_transcript' | 'forwarded_message' | 'screenshot';
    mediaDescription: string;       // Mô tả trực quan chi tiết
    mediaDetail?: {
      chartData?: { label: string; value: number }[];
      yAxisMin?: number;
      yAxisMax?: number;
      imageCaption?: string;
      viralMetric?: string;         // vd: "14.200 lượt chia sẻ", "2.1M views"
    };
  };
  siftGuidance: {
    stop: string;                   // Bước S: Dừng lại
    investigate: string;            // Bước I: Kiểm tra nguồn
    findBetter: string;             // Bước F: Tìm nguồn tốt hơn
    trace: string;                  // Bước T: Truy về gốc
  };
  truthVerdict: FactCheckVerdict;   // Kết luận chuẩn
  truthVerdictLabel: string;        // "Đúng sự thật" | "Sai sự thật" | "Gây hiểu lầm" | "Chưa đủ căn cứ"
  explanation: string;              // Phân tích sự thật đầy đủ
  debunkSources: {                  // Danh sách nguồn đối chứng thực tế
    title: string;
    url: string;
    publisher: string;
  }[];
}

export interface FactCheckSubmission {
  scenarioId: string;
  verdict: FactCheckVerdict;
  siftSteps: {
    stopNotes?: string;
    investigateNotes?: string;
    findBetterNotes?: string;
    traceNotes?: string;
  };
  reasoning: string;                // Giải thích lý do kết luận
  sourceLinks: string;              // Link nguồn học sinh đã tra cứu
}

export interface FactCheckWebSource {
  title: string;
  url: string;
}

export interface FactCheckEvaluationResult {
  isRelevant: boolean;
  verdictAccuracy: boolean;         // True nếu kết luận khớp với kết quả kiểm chứng
  scores: {
    accuracy: number;               // 0 - 40 điểm: Độ chính xác kết luận
    siftMethodology: number;        // 0 - 40 điểm: Phương pháp phân tích SIFT
    sourceQuality: number;          // 0 - 20 điểm: Nguồn kiểm chứng đối chứng
    total: number;                  // 0 - 100 điểm
  };
  xpEarned: number;
  feedback: string;                 // Lời nhận xét sư phạm của AI Mentor
  keyFindings: string[];            // Các dữ kiện kiểm chứng sự thật then chốt
  verifiedSources: FactCheckWebSource[]; // Danh sách nguồn tìm được qua Google Search Grounding
  comparisonNote: string;           // Nhận xét đối chiếu với nguồn kiểm chứng
}

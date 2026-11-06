/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DỮ LIỆU CỐT LÕI: KHO 12 BÀI THỬ THÁCH KIỂM CHỨNG TIN (SIFT FACT-CHECKING)
 */

import { FactCheckItem } from '../types/factCheck';
import factChecksJson from './factchecks.json';

export const FACT_CHECK_ITEMS: FactCheckItem[] = factChecksJson as FactCheckItem[];

export const SIFT_METHOD_GUIDE = [
  {
    step: 'S',
    letter: 'S',
    name: 'Stop - Dừng lại',
    englishName: 'Stop',
    badgeColor: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
    summary: 'Kiểm soát cảm xúc, không vội like/share khi thấy thông tin giật gân.',
    detail: 'Khi bạn thấy một thông tin kích hoạt cảm xúc mạnh (tức giận, sợ hãi, hả hê, hy vọng thái quá) hoặc thúc giục chia sẻ khẩn cấp, hãy dừng lại ngay. Đặt câu hỏi: Ai muốn mình tin điều này? Tại sao họ lại đăng vào lúc này?'
  },
  {
    step: 'I',
    letter: 'I',
    name: 'Investigate the source - Kiểm tra nguồn',
    englishName: 'Investigate the source',
    badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
    summary: 'Tìm hiểu danh tính, động cơ và chuyên môn của người phát ngôn hoặc trang tin.',
    detail: 'Xem ai là tác giả hay cơ quan xuất bản? Trang tin có giấy phép chính thức không hay là trang nặc danh, trang nhại (parody), trang bán hàng? Kiểm tra mục "Giới thiệu" (About Us) và hồ sơ tác giả.'
  },
  {
    step: 'F',
    letter: 'F',
    name: 'Find better coverage - Tìm nguồn tốt hơn',
    englishName: 'Find better coverage',
    badgeColor: 'text-blue-400 bg-blue-950/40 border-blue-800/60',
    summary: 'Tìm xem các hãng thông tấn uy tín, báo chí chính thống hoặc tổ chức kiểm chứng độc lập có đưa tin không.',
    detail: 'Nếu một sự kiện chấn động là có thật (thiên tai lớn, phát minh y khoa, thay đổi chính sách thi cử), chắc chắn các cơ quan báo chí chính thống (VTV, Thông tấn xã, Tuổi Trẻ, VnExpress...) hoặc tổ chức quốc tế (WHO, NASA...) đều đã đưa tin. Nếu cả mạng chỉ có một tài khoản TikTok hay bài đăng Zalo nói tới, khả năng cao là tin vịt.'
  },
  {
    step: 'T',
    letter: 'T',
    name: 'Trace claims to original context - Truy về gốc',
    englishName: 'Trace claims, quotes, and media to the original context',
    badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
    summary: 'Lần theo trích dẫn, ảnh chụp, video hoặc số liệu về bài nghiên cứu/bối cảnh gốc.',
    detail: 'Sử dụng công cụ tìm kiếm ảnh đảo ngược (Google Reverse Image Search) để xem ảnh chụp từ năm nào, chụp ở đâu. Đọc bài nghiên cứu gốc để xem số liệu có bị cắt xén không. Nghe toàn bộ đoạn phát biểu để tránh bị cắt cúp câu chữ khỏi ngữ cảnh.'
  }
];

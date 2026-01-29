import api from './api';

const noticeService = {
  // 공지사항 목록 조회
  getAll: async (page = 0, size = 10) => {
    const response = await api.get(`/notices?page=${page}&size=${size}`);
    return response.data;
  },

  // 공지사항 상세 조회
  getById: async (id) => {
    const response = await api.get(`/notices/${id}`);
    return response.data;
  },

  // 공지사항 생성
  create: async (noticeData) => {
    const response = await api.post('/notices', noticeData);
    return response.data;
  },

  // 공지사항 수정
  update: async (id, noticeData) => {
    const response = await api.put(`/notices/${id}`, noticeData);
    return response.data;
  },

  // 공지사항 삭제
  delete: async (id) => {
    const response = await api.delete(`/notices/${id}`);
    return response.data;
  },

  // 공지사항 상단 고정 토글
  togglePin: async (id) => {
    const response = await api.post(`/notices/${id}/toggle-pin`);
    return response.data;
  },
};

export default noticeService;

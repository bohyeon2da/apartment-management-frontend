import api from './api';

const complaintService = {
  // 민원 목록 조회
  getAll: async (status, page = 0, size = 10) => {
    let url = `/complaints?page=${page}&size=${size}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // 민원 상세 조회
  getById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // 민원 생성
  create: async (complaintData) => {
    const response = await api.post('/complaints', complaintData);
    return response.data;
  },

  // 민원 상태 변경
  updateStatus: async (id, status) => {
    const response = await api.patch(`/complaints/${id}/status?status=${status}`);
    return response.data;
  },

  // 민원 담당자 지정
  assign: async (id) => {
    const response = await api.patch(`/complaints/${id}/assign`);
    return response.data;
  },

  // 민원 댓글 목록 조회
  getComments: async (id) => {
    const response = await api.get(`/complaints/${id}/comments`);
    return response.data;
  },

  // 민원 댓글 작성
  createComment: async (id, commentData) => {
    const response = await api.post(`/complaints/${id}/comments`, commentData);
    return response.data;
  },

  // 민원 댓글 삭제
  deleteComment: async (commentId) => {
    const response = await api.delete(`/complaints/comments/${commentId}`);
    return response.data;
  },
};

export default complaintService;

import api from './api';

const scheduleService = {
  // 일정 목록 조회
  getAll: async (start, end) => {
    let url = '/schedules';
    if (start && end) {
      url += `?start=${start}&end=${end}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // 일정 상세 조회
  getById: async (id) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  // 일정 생성
  create: async (scheduleData) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },

  // 일정 수정
  update: async (id, scheduleData) => {
    const response = await api.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  // 일정 삭제
  delete: async (id) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },

  // 일정 상태 변경
  updateStatus: async (id, status) => {
    const response = await api.patch(`/schedules/${id}/status?status=${status}`);
    return response.data;
  },
};

export default scheduleService;

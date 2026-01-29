import api from './api';

const authService = {
  // 로그인 - 1단계: 사용자명/비밀번호 인증
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  // 로그인 - 2단계: SMS 인증 코드 검증
  verifySms: async (username, phoneNumber, code) => {
    const response = await api.post('/auth/verify-sms', {
      username,
      phoneNumber,
      code,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 로그인 상태 확인
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;

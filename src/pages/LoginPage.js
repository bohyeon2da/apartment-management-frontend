import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const [step, setStep] = useState(1); // 1: 로그인, 2: SMS 인증
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(username, password);
      if (response.requiresSmsVerification) {
        setPhoneNumber(response.phoneNumber);
        setStep(2);

        // 개발 환경: 인증 코드를 팝업으로 표시
        if (response.verificationCode) {
          alert(`🔐 SMS 인증 코드: ${response.verificationCode}\n\n(개발 환경에서만 표시됩니다)`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySms = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.verifySms(username, phoneNumber, code);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'SMS 인증에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>아파트 관리 시스템</h1>
        <p className="subtitle">관리사무소 직원 로그인</p>

        {error && <div className="error-message">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>사용자명</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? '처리중...' : '로그인'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifySms}>
            <p className="sms-message">SMS로 전송된 6자리 인증 코드를 입력해주세요</p>
            <div className="form-group">
              <label>전화번호</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
                placeholder="010-1234-5678"
              />
            </div>
            <div className="form-group">
              <label>인증 코드</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={loading}
                maxLength={6}
                placeholder="6자리 숫자"
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? '처리중...' : '인증 확인'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="back-button"
              disabled={loading}
            >
              뒤로 가기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;

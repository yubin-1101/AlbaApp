import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (name: string, type: 'admin' | 'user') => void;
  onGoToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onGoToSignUp }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'admin' | 'user'>('user');

  const handleLogin = () => {
    if (!name) return alert('아이디를 입력해주세요!');
    console.log('로그인 성공:', name, userType);
    onLoginSuccess(name, userType);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="login-container" onKeyDown={handleKeyPress}>
      <div className="coin-wrapper">
        <span className="coin-text">1억</span>
        <span className="coin-emoji">💰</span>
      </div>
      <h2 className="login-title">로그인 화면</h2>
      <input
        className="login-input"
        type="text"
        placeholder="아이디"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="login-input"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="login-type">
        <label>
          <input
            type="radio"
            value="user"
            checked={userType === 'user'}
            onChange={() => setUserType('user')}
          />
          일반 사용자
        </label>
        <label>
          <input
            type="radio"
            value="admin"
            checked={userType === 'admin'}
            onChange={() => setUserType('admin')}
          />
          
          관리자
        </label>
      </div>
      <button className="login-button" onClick={handleLogin}>
        로그인
      </button>
      <p className="signup-link">
        계정이 없으신가요? <button onClick={onGoToSignUp} className="link-button">회원가입</button>
      </p>
    </div>
  );
};

export default Login;

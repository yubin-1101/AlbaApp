import React, { useState } from 'react';
import './SignUp.css';

interface SignUpProps {
  onSignUpSuccess: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [residentNumber, setResidentNumber] = useState('');
  const [userType, setUserType] = useState<'admin' | 'user'>('user');
  const [businessName, setBusinessName] = useState('');

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 회원가입 로직
    console.log('회원가입 시도:', {
      name,
      password,
      birthday,
      residentNumber,
      userType,
      businessName,
    });

    alert('회원가입이 완료되었습니다.');
    onSignUpSuccess();
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">회원가입</h2>

        <label className="signup-label">아이디</label>
        <input
          className="signup-input"
          type="text"
          placeholder="아이디 입력"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="signup-label">비밀번호</label>
        <input
          className="signup-input"
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="signup-label">비밀번호 확인</label>
        <input
          className="signup-input"
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <label className="signup-label">생년월일</label>
        <input
          className="signup-input"
          type="text"
          placeholder="YYYYMMDD"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />

        <label className="signup-label">주민등록번호 앞자리</label>
        <input
          className="signup-input"
          type="text"
          placeholder="7자리 입력"
          value={residentNumber}
          onChange={(e) => setResidentNumber(e.target.value)}
        />

        <div className="signup-type">
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

        {userType === 'admin' && (
          <>
            <label className="signup-label">사업자 이름</label>
            <input
              className="signup-input"
              type="text"
              placeholder="사업자 이름 입력"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </>
        )}

        <button className="signup-button" onClick={handleSignUp}>
          가입하기
        </button>
        <button onClick={onSignUpSuccess} className="link-button">
          로그인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default SignUp;

import React, { useState } from 'react';
import './Input.css';

interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  className?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  error,
  value = '',
  onChange,
  type = 'text',
  className = '',
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const inputClasses = [
    'input',
    isFocused ? 'input-focused' : '',
    error ? 'input-error' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="input-container">
      {label && <label className="input-label">{label}</label>}
      <input
        className={inputClasses}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

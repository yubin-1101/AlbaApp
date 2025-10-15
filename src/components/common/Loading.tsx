import React from 'react';
import './Loading.css';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  color = '#007AFF',
  text,
}) => {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className="loading-spinner" style={{ borderTopColor: color }}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

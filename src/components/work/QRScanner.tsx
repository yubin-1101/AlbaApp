import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';
import './QRScanner.css';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (err) {
      setError('카메라 접근 권한이 필요합니다.');
      console.error('Camera access error:', err);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScan = (data: string) => {
    stopScanning();
    onScan(data);
  };

  const handleManualInput = () => {
    const manualCode = prompt('QR 코드를 수동으로 입력하세요:');
    if (manualCode && manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  return (
    <div className="qr-scanner">
      <div className="scanner-header">
        <h3>QR 코드 스캔</h3>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="scanner-content">
        {!isScanning ? (
          <div className="scanner-start">
            <div className="scanner-icon">📱</div>
            <p className="scanner-description">
              QR 코드를 스캔하여 출퇴근을 기록하세요
            </p>
            <Button
              title="스캔 시작"
              onClick={startScanning}
              variant="primary"
              size="large"
              className="start-scan-button"
            />
            <Button
              title="수동 입력"
              onClick={handleManualInput}
              variant="outline"
              size="medium"
              className="manual-input-button"
            />
          </div>
        ) : (
          <div className="scanner-active">
            <div className="video-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="scanner-video"
              />
              <div className="scanner-overlay">
                <div className="scanner-frame"></div>
                <p className="scanner-instruction">
                  QR 코드를 프레임 안에 맞춰주세요
                </p>
              </div>
            </div>
            <Button
              title="스캔 중지"
              onClick={stopScanning}
              variant="secondary"
              size="medium"
              className="stop-scan-button"
            />
          </div>
        )}

        {error && (
          <div className="scanner-error">
            <p>{error}</p>
            <Button
              title="다시 시도"
              onClick={startScanning}
              variant="outline"
              size="small"
            />
          </div>
        )}
      </div>

      <div className="scanner-footer">
        <p className="scanner-tip">
          💡 QR 코드가 인식되지 않으면 수동 입력을 사용하세요
        </p>
      </div>
    </div>
  );
};

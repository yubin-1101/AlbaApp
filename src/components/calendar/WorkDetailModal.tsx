import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import './WorkDetailModal.css';

interface WorkRecord {
  id: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  workHours?: number;
  hourlyWage?: number;
  dailySalary?: number;
  location?: string;
  notes?: string;
}

interface WorkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workRecord?: WorkRecord;
  onEdit?: (record: WorkRecord) => void;
  onDelete?: (id: string) => void;
}

export const WorkDetailModal: React.FC<WorkDetailModalProps> = ({
  isOpen,
  onClose,
  workRecord,
  onEdit,
  onDelete,
}) => {
  if (!workRecord) return null;

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const handleEdit = () => {
    onEdit?.(workRecord);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 근무 기록을 삭제하시겠습니까?')) {
      onDelete?.(workRecord.id);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="근무 상세 정보">
      <div className="work-detail-content">
        <div className="work-detail-section">
          <h3 className="section-title">날짜</h3>
          <p className="section-content">{formatDate(workRecord.date)}</p>
        </div>

        <div className="work-detail-section">
          <h3 className="section-title">출근 시간</h3>
          <p className="section-content">{formatTime(workRecord.clockIn)}</p>
        </div>

        <div className="work-detail-section">
          <h3 className="section-title">퇴근 시간</h3>
          <p className="section-content">{formatTime(workRecord.clockOut)}</p>
        </div>

        <div className="work-detail-section">
          <h3 className="section-title">근무 시간</h3>
          <p className="section-content">
            {workRecord.workHours ? `${workRecord.workHours.toFixed(1)}시간` : '-'}
          </p>
        </div>

        <div className="work-detail-section">
          <h3 className="section-title">시급</h3>
          <p className="section-content">
            {workRecord.hourlyWage ? `₩${workRecord.hourlyWage.toLocaleString()}` : '-'}
          </p>
        </div>

        <div className="work-detail-section">
          <h3 className="section-title">일일 급여</h3>
          <p className="section-content salary">
            {workRecord.dailySalary ? `₩${workRecord.dailySalary.toLocaleString()}` : '-'}
          </p>
        </div>

        {workRecord.location && (
          <div className="work-detail-section">
            <h3 className="section-title">근무 장소</h3>
            <p className="section-content">{workRecord.location}</p>
          </div>
        )}

        {workRecord.notes && (
          <div className="work-detail-section">
            <h3 className="section-title">메모</h3>
            <p className="section-content">{workRecord.notes}</p>
          </div>
        )}

        <div className="work-detail-actions">
          <Button
            title="수정"
            onClick={handleEdit}
            variant="outline"
            className="edit-button"
          />
          <Button
            title="삭제"
            onClick={handleDelete}
            variant="secondary"
            className="delete-button"
          />
        </div>
      </div>
    </Modal>
  );
};

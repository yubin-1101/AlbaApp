import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import './ExpenseTracker.css';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
}

const EXPENSE_CATEGORIES = [
  '식비',
  '교통비',
  '의류',
  '문화생활',
  '주거비',
  '통신비',
  '교육비',
  '의료비',
  '기타',
];

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  onEditExpense,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleSubmit = () => {
    if (!formData.amount || !formData.category || !formData.description) return;
    
    const expenseData = {
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
    };
    
    if (editingId) {
      // 수정 모드
      onEditExpense(editingId, expenseData);
      setEditingId(null);
    } else {
      // 추가 모드
      onAddExpense(expenseData);
    }
    
    resetForm();
    setIsAdding(false);
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      date: expense.date,
    });
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('정말로 이 지출을 삭제하시겠습니까?')) {
      onDeleteExpense(id);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
    setIsAdding(false);
  };

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="expense-tracker">
      <div className="tracker-header">
        <h3 className="tracker-title">지출 관리</h3>
        <div className="tracker-summary">
          <div className="summary-item">
            <span className="summary-label">총 지출</span>
            <span className="summary-value total-expenses">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>
      </div>

      {!isAdding ? (
        <Button
          title="지출 추가"
          onClick={() => setIsAdding(true)}
          variant="primary"
          className="add-expense-button"
        />
      ) : (
        <form className="expense-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <Input
              label="금액"
              type="number"
              placeholder="0"
              value={formData.amount}
              onChange={(value) => setFormData({ ...formData, amount: value })}
              className="amount-input"
            />
            <div className="category-select">
              <label htmlFor="category">카테고리</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="category-dropdown"
              >
                <option value="">카테고리 선택</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="설명"
            placeholder="지출 내용을 입력하세요"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
          />

          <Input
            label="날짜"
            type="date"
            value={formData.date}
            onChange={(value) => setFormData({ ...formData, date: value })}
          />

          <div className="form-actions">
            <Button
              title={editingId ? '수정' : '추가'}
              onClick={handleSubmit}
              variant="primary"
              className="submit-button"
            />
            <Button
              title="취소"
              onClick={cancelEdit}
              variant="outline"
              className="cancel-button"
            />
          </div>
        </form>
      )}

      <div className="expenses-list">
        <h4 className="list-title">지출 내역</h4>
        {expenses.length === 0 ? (
          <div className="no-expenses">
            <p>지출 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="expenses-grid">
            {expenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-header">
                  <span className="expense-category">{expense.category}</span>
                  <span className="expense-date">{formatDate(expense.date)}</span>
                </div>
                <div className="expense-amount">{formatCurrency(expense.amount)}</div>
                <div className="expense-description">{expense.description}</div>
                <div className="expense-actions">
                  <Button
                    title="수정"
                    onClick={() => handleEdit(expense)}
                    variant="outline"
                    size="small"
                    className="edit-button"
                  />
                  <Button
                    title="삭제"
                    onClick={() => handleDelete(expense.id)}
                    variant="secondary"
                    size="small"
                    className="delete-button"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {Object.keys(categoryTotals).length > 0 && (
        <div className="category-breakdown">
          <h4 className="breakdown-title">카테고리별 지출</h4>
          <div className="category-list">
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([category, total]) => (
                <div key={category} className="category-item">
                  <span className="category-name">{category}</span>
                  <span className="category-total">{formatCurrency(total)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

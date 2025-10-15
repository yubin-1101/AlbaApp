import React from 'react';
import './ActionButtons.css';

interface ActionButton {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  disabled?: boolean;
}

interface ActionButtonsProps {
  title: string;
  actions: ActionButton[];
  layout?: 'grid' | 'list';
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  title,
  actions,
  layout = 'grid'
}) => {
  return (
    <div className="action-buttons">
      <h3 className="action-buttons-title">{title}</h3>
      <div className={`actions-container ${layout}`}>
        {actions.map((action, index) => (
          <button
            key={index}
            className={`action-button ${action.variant || 'primary'}`}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

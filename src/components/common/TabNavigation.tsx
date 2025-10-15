import React from 'react';
import './TabNavigation.css';

export interface TabItem {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

interface TabNavigationProps {
  tabs: TabItem[];
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, onTabChange }) => {
  return (
    <nav className="tab-navigation">
      <div className="tab-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${tab.active ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            data-tab-id={tab.id}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.active && <div className="active-indicator" />}
          </button>
        ))}
      </div>
    </nav>
  );
};

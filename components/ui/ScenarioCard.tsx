import React from 'react';
import { formatNumberWithCommas } from '../../utils/helpers';

export interface ScenarioCardProps {
  type: 'minimum' | 'maximum' | 'middle';
  years: number;
  monthlyReduction: number;
  currentPayment: number;
  onClick: () => void;
  isSelected?: boolean;
  className?: string;
}

/**
 * ScenarioCard - Reusable scenario card component for Version B simulator
 * 
 * Displays payment reduction scenarios with Hebrew text and RTL formatting.
 * Supports different scenario types (minimum, maximum, middle) with proper
 * Hebrew text direction and formatting.
 * 
 * Requirements: 4.5, 4.6 - Scenario Cards Structure and Display
 */
export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  type,
  years,
  monthlyReduction,
  currentPayment,
  onClick,
  isSelected = false,
  className = ''
}) => {
  const newPayment = currentPayment - monthlyReduction;
  
  // Hebrew text for scenario types with proper RTL formatting
  const getScenarioTitle = (type: string): string => {
    switch (type) {
      case 'minimum':
        return 'תרחיש מינימלי';
      case 'maximum':
        return 'תרחיש מקסימלי';
      case 'middle':
        return 'תרחיש ביניים';
      default:
        return 'תרחיש';
    }
  };

  const getScenarioDescription = (type: string): string => {
    switch (type) {
      case 'minimum':
        return 'התקופה הקצרה ביותר עם חיסכון של 500+ ש"ח';
      case 'maximum':
        return 'התקופה הארוכה ביותר עם החיסכון המקסימלי';
      case 'middle':
        return 'תקופה בינונית עם איזון בין חיסכון ותקופה';
      default:
        return 'תרחיש תשלום';
    }
  };

  // Color scheme based on scenario type
  const getColorScheme = (type: string) => {
    switch (type) {
      case 'minimum':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          hoverBorder: 'hover:border-blue-400',
          selectedBorder: 'border-blue-500',
          text: 'text-blue-700',
          accent: 'bg-blue-100',
          icon: 'text-blue-600'
        };
      case 'maximum':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          hoverBorder: 'hover:border-green-400',
          selectedBorder: 'border-green-500',
          text: 'text-green-700',
          accent: 'bg-green-100',
          icon: 'text-green-600'
        };
      case 'middle':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          hoverBorder: 'hover:border-purple-400',
          selectedBorder: 'border-purple-500',
          text: 'text-purple-700',
          accent: 'bg-purple-100',
          icon: 'text-purple-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          hoverBorder: 'hover:border-gray-400',
          selectedBorder: 'border-gray-500',
          text: 'text-gray-700',
          accent: 'bg-gray-100',
          icon: 'text-gray-600'
        };
    }
  };

  const colors = getColorScheme(type);
  const borderClass = isSelected ? colors.selectedBorder : `${colors.border} ${colors.hoverBorder}`;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-right p-6 rounded-xl border-2 transition-all duration-200
        ${colors.bg} ${borderClass}
        hover:shadow-lg hover:scale-[1.02] transform
        ${isSelected ? 'shadow-lg scale-[1.02]' : 'shadow-sm'}
        ${className}
      `}
      dir="rtl"
    >
      {/* Header with scenario type and icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colors.accent} flex items-center justify-center`}>
            <i className={`fa-solid ${
              type === 'minimum' ? 'fa-clock' : 
              type === 'maximum' ? 'fa-chart-line' : 
              'fa-balance-scale'
            } ${colors.icon}`}></i>
          </div>
          <h3 className={`text-xl font-bold ${colors.text}`}>
            {getScenarioTitle(type)}
          </h3>
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <i className="fa-solid fa-check text-white text-sm"></i>
          </div>
        )}
      </div>

      {/* Payment reduction highlight */}
      <div className="mb-4">
        <div className={`${colors.accent} rounded-lg p-4 text-center`}>
          <div className={`text-2xl font-bold ${colors.text} mb-1`}>
            חיסכון של {formatNumberWithCommas(Math.round(monthlyReduction))} ש"ח
          </div>
          <div className="text-gray-600 text-sm">
            בחודש
          </div>
        </div>
      </div>

      {/* Payment details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">תשלום נוכחי:</span>
          <span className="font-semibold text-gray-900">
            {formatNumberWithCommas(Math.round(currentPayment))} ש"ח
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">תשלום חדש:</span>
          <span className={`font-bold text-lg ${colors.text}`}>
            {formatNumberWithCommas(Math.round(newPayment))} ש"ח
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">תקופה:</span>
          <span className="font-semibold text-gray-900">
            {years} שנים
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-gray-600 leading-relaxed">
        {getScenarioDescription(type)}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
            <i className="fa-solid fa-check-circle"></i>
            <span>תרחיש נבחר</span>
          </div>
        </div>
      )}
    </button>
  );
};
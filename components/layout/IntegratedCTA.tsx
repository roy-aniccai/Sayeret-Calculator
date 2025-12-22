import React from 'react';
import { Button } from '../ui/Button';

export interface CTAConfig {
  icon: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'info';
  disabled?: boolean;
  loading?: boolean;
}

interface IntegratedCTAProps {
  config: CTAConfig;
  className?: string;
}

/**
 * Integrated CTA component that replaces explanation boxes
 * Provides consistent styling and behavior across all steps
 */
export const IntegratedCTA: React.FC<IntegratedCTAProps> = ({
  config,
  className = ''
}) => {
  const {
    icon,
    title,
    subtitle,
    buttonText,
    onClick,
    variant = 'primary',
    disabled = false,
    loading = false
  } = config;

  // Color schemes for different variants
  const variantStyles = {
    primary: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-700',
      subtitle: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    secondary: {
      container: 'bg-gray-50 border-gray-200',
      icon: 'text-gray-600',
      title: 'text-gray-700',
      subtitle: 'text-gray-600',
      button: 'bg-gray-600 hover:bg-gray-700'
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      title: 'text-green-700',
      subtitle: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700'
    },
    info: {
      container: 'bg-amber-50 border-amber-200',
      icon: 'text-amber-600',
      title: 'text-amber-700',
      subtitle: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.container} border rounded-lg p-3 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <i className={`${icon} ${styles.icon} text-lg`}></i>
        <div>
          <p className={`${styles.title} text-sm font-medium`}>
            {title}
          </p>
          {subtitle && (
            <p className={`${styles.subtitle} text-xs`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <Button 
        onClick={onClick} 
        className={`px-4 py-2 text-sm ${styles.button}`}
        disabled={disabled || loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <i className="fa-solid fa-circle-notch fa-spin"></i>
            מעבד...
          </span>
        ) : (
          buttonText
        )}
      </Button>
    </div>
  );
};

/**
 * Factory function to create common CTA configurations
 */
export const createCTAConfig = {
  /**
   * Primary action CTA (e.g., "Continue to next step")
   */
  primary: (title: string, buttonText: string, onClick: () => void, subtitle?: string): CTAConfig => ({
    icon: 'fa-solid fa-arrow-right',
    title,
    subtitle,
    buttonText,
    onClick,
    variant: 'primary'
  }),

  /**
   * Success/completion CTA (e.g., "Data saved successfully")
   */
  success: (title: string, buttonText: string, onClick: () => void, subtitle?: string): CTAConfig => ({
    icon: 'fa-solid fa-check-circle',
    title,
    subtitle,
    buttonText,
    onClick,
    variant: 'success'
  }),

  /**
   * Information/tip CTA (e.g., "Learn more about this feature")
   */
  info: (title: string, buttonText: string, onClick: () => void, subtitle?: string): CTAConfig => ({
    icon: 'fa-solid fa-lightbulb',
    title,
    subtitle,
    buttonText,
    onClick,
    variant: 'info'
  }),

  /**
   * Calculator/simulation CTA
   */
  calculator: (title: string, buttonText: string, onClick: () => void, subtitle?: string): CTAConfig => ({
    icon: 'fa-solid fa-calculator',
    title,
    subtitle,
    buttonText,
    onClick,
    variant: 'primary'
  }),

  /**
   * Security/privacy CTA
   */
  security: (title: string, buttonText: string, onClick: () => void, subtitle?: string): CTAConfig => ({
    icon: 'fa-solid fa-shield-check',
    title,
    subtitle,
    buttonText,
    onClick,
    variant: 'success'
  })
};
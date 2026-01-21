import React from 'react';

export interface MarketingMessageProps {
  message: string;
  variant: 'whatsapp-report' | 'smart-bot';
  className?: string;
}

/**
 * MarketingMessage - Displays marketing messages to encourage phone number entry
 * 
 * This component shows Hebrew marketing messages near the phone input field
 * to motivate users to provide valid Israeli phone numbers for WhatsApp delivery
 * or smart bot usage.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export const MarketingMessage: React.FC<MarketingMessageProps> = ({
  message,
  variant,
  className = ''
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'whatsapp-report':
        return <i className="fa-brands fa-whatsapp text-green-600 text-lg"></i>;
      case 'smart-bot':
        return <i className="fa-solid fa-robot text-blue-600 text-lg"></i>;
      default:
        return <i className="fa-solid fa-info-circle text-blue-600 text-lg"></i>;
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'whatsapp-report':
        return 'bg-green-50 border-green-200';
      case 'smart-bot':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div 
      className={`${getBackgroundColor()} border rounded-lg p-3 flex items-center gap-3 ${className}`}
      dir="rtl"
    >
      {getIcon()}
      <p className="text-gray-700 text-sm font-medium leading-relaxed">
        {message}
      </p>
    </div>
  );
};

// Predefined marketing messages in Hebrew
export const MARKETING_MESSAGES = {
  whatsappReport: 'מספר הטלפון ישמש אותנו לשלוח אליך את הדוח המלא בוואטסאפ',
  smartBot: 'לשימוש בבוט החכם בוואטסאפ אנא הזינו מספר טלפון ישראלי תקין'
} as const;
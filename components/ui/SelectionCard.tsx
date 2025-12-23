import React from 'react';

interface TrackSpecificProps {
  priority: string;
  focusMetric: string;
  tooltip: string;
}

interface SelectionCardProps {
  title: string;
  description: string;
  icon: string;
  colorClass: string; // e.g. "blue", "green"
  onClick: () => void;
  trackSpecific?: TrackSpecificProps;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ 
  title, 
  description, 
  icon, 
  colorClass, 
  onClick,
  trackSpecific
}) => {
  // Mapping simplistic color names to Tailwind classes
  const colors: Record<string, { bg: string, text: string, hoverBg: string, hoverText: string, border: string }> = {
    blue:   { 
      bg: 'bg-blue-100', 
      text: 'text-blue-600', 
      hoverBg: 'group-hover:bg-blue-600', 
      hoverText: 'group-hover:text-white',
      border: 'hover:border-blue-500'
    },
    green:  { 
      bg: 'bg-green-100', 
      text: 'text-green-600', 
      hoverBg: 'group-hover:bg-green-600', 
      hoverText: 'group-hover:text-white',
      border: 'hover:border-green-500'
    },
    purple: { 
      bg: 'bg-purple-100', 
      text: 'text-purple-600', 
      hoverBg: 'group-hover:bg-purple-600', 
      hoverText: 'group-hover:text-white',
      border: 'hover:border-purple-500'
    },
    indigo: { 
      bg: 'bg-indigo-100', 
      text: 'text-indigo-600', 
      hoverBg: 'group-hover:bg-indigo-600', 
      hoverText: 'group-hover:text-white',
      border: 'hover:border-indigo-500'
    },
  };

  const c = colors[colorClass] || colors.blue;

  return (
    <button 
      onClick={onClick}
      className={`w-full text-right cursor-pointer block border-2 border-gray-200 rounded-2xl p-6 ${c.border} hover:bg-${colorClass}-50 transition-all group relative`}
      title={trackSpecific?.tooltip}
    >
      <div className="flex items-center gap-6">
        <div className={`w-16 h-16 rounded-full ${c.bg} ${c.text} flex items-center justify-center text-3xl ${c.hoverBg} ${c.hoverText} transition-colors shrink-0`}>
          <i className={icon}></i>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-2xl mb-2 group-hover:text-white transition-colors">{title}</h3>
          <p className="text-lg text-gray-600 leading-snug group-hover:text-gray-100 transition-colors">{description}</p>
          {trackSpecific && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className={`px-3 py-1 rounded-full ${c.bg} ${c.text} font-medium group-hover:bg-white group-hover:text-${colorClass}-600 transition-colors`}>
                אופטימיזציה: {trackSpecific.priority === 'payment' ? 'תשלום' : 'תקופה'}
              </span>
              <span className={`px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium group-hover:bg-white group-hover:text-gray-700 transition-colors`}>
                מיקוד: {trackSpecific.focusMetric === 'monthlyReduction' ? 'הפחתת תשלום' : 'קיצור שנים'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Track-specific visual indicator */}
      {trackSpecific && (
        <div className={`absolute top-4 left-4 w-3 h-3 rounded-full ${c.bg} ${c.text} ${c.hoverBg} transition-colors`}></div>
      )}
    </button>
  );
};

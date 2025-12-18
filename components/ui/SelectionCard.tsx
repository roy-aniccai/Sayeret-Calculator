import React from 'react';

interface SelectionCardProps {
  title: string;
  description: string;
  icon: string;
  colorClass: string; // e.g. "blue", "green"
  onClick: () => void;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ 
  title, 
  description, 
  icon, 
  colorClass, 
  onClick 
}) => {
  // Mapping simplistic color names to Tailwind classes
  const colors: Record<string, { bg: string, text: string, hoverBg: string, hoverText: string }> = {
    blue:   { bg: 'bg-blue-100', text: 'text-blue-600', hoverBg: 'group-hover:bg-blue-600', hoverText: 'group-hover:text-white' },
    green:  { bg: 'bg-green-100', text: 'text-green-600', hoverBg: 'group-hover:bg-green-600', hoverText: 'group-hover:text-white' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', hoverBg: 'group-hover:bg-purple-600', hoverText: 'group-hover:text-white' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', hoverBg: 'group-hover:bg-indigo-600', hoverText: 'group-hover:text-white' },
  };

  const c = colors[colorClass] || colors.blue;

  return (
    <button 
      onClick={onClick}
      className={`w-full text-right cursor-pointer block border-2 border-gray-200 rounded-2xl p-6 hover:border-${colorClass}-500 hover:bg-${colorClass}-50 transition-all group`}
    >
      <div className="flex items-center gap-6">
        <div className={`w-16 h-16 rounded-full ${c.bg} ${c.text} flex items-center justify-center text-3xl ${c.hoverBg} ${c.hoverText} transition-colors shrink-0`}>
          <i className={icon}></i>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-2xl mb-2">{title}</h3>
          <p className="text-lg text-gray-600 leading-snug">{description}</p>
        </div>
      </div>
    </button>
  );
};

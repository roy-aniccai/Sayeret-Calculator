import React from 'react';

export interface ViewportConstraints {
  height: number;
  width: number;
  availableHeight: number; // After header/footer
  contentMaxHeight: number;
}

export interface CompactLayoutProps {
  stepName: string;
  children: React.ReactNode;
  primaryCTA?: React.ReactNode;
  secondaryCTA?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}

/**
 * Shared compact layout component for consistent step presentation
 * Implements viewport constraint handling and consistent spacing patterns
 */
export const CompactStepLayout: React.FC<CompactLayoutProps> = ({
  stepName,
  children,
  primaryCTA,
  secondaryCTA,
  onBack,
  className = ''
}) => {
  return (
    <div className={`animate-fade-in-up ${className}`}>
      {/* Compact Step Header - consistent across all steps */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
        {stepName}
      </h2>
      
      {/* Content Area with consistent spacing */}
      <div className="space-y-4">
        {children}
        
        {/* CTA Section */}
        {(primaryCTA || secondaryCTA) && (
          <div className="space-y-3 mt-6">
            {primaryCTA}
            {secondaryCTA}
          </div>
        )}
        
        {/* Secondary Navigation - consistent back button */}
        {onBack && (
          <button 
            onClick={onBack} 
            className="w-full text-gray-400 text-base mt-4 font-medium hover:text-gray-600 transition-colors"
          >
            חזור אחורה
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Hook to get current viewport constraints
 * Useful for responsive layout decisions
 */
export const useViewportConstraints = (): ViewportConstraints => {
  const [constraints, setConstraints] = React.useState<ViewportConstraints>({
    height: window.innerHeight,
    width: window.innerWidth,
    availableHeight: window.innerHeight - 120, // Account for header
    contentMaxHeight: window.innerHeight - 200 // Account for header + footer space
  });

  React.useEffect(() => {
    const updateConstraints = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;
      
      setConstraints({
        height,
        width,
        availableHeight: height - 120, // Header height
        contentMaxHeight: height - 200 // Header + footer space
      });
    };

    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  return constraints;
};

/**
 * Utility function to check if content fits within viewport constraints
 */
export const checkViewportFit = (
  contentHeight: number, 
  constraints: ViewportConstraints
): boolean => {
  return contentHeight <= constraints.contentMaxHeight;
};
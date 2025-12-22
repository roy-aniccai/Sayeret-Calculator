/**
 * CTA Prioritization System
 * Creates visual hierarchy for multiple CTAs, implements primary vs secondary styling,
 * and ensures primary CTA gets optimal positioning.
 */

import React, { useRef, useEffect } from 'react';
import { Button } from './Button';
import { useCTAInteractionPersistence } from '../../utils/useCTAInteractionPersistence';

export interface CTAConfig {
  id: string;
  text: string;
  onClick: () => void;
  priority: 'primary' | 'secondary' | 'tertiary';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'success';
}

export interface CTAPrioritizationProps {
  ctas: CTAConfig[];
  layout?: 'stacked' | 'inline' | 'auto';
  persistentPrimary?: boolean;
  className?: string;
}

/**
 * Get priority-based styling for CTAs
 */
const getPriorityStyles = (priority: CTAConfig['priority'], layout: string) => {
  const baseStyles = "transition-all duration-300 ease-in-out";
  
  switch (priority) {
    case 'primary':
      return {
        container: `${baseStyles} order-1`,
        button: layout === 'inline' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm',
        variant: 'primary' as const,
        fullWidth: layout !== 'inline'
      };
    
    case 'secondary':
      return {
        container: `${baseStyles} order-2`,
        button: layout === 'inline' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs',
        variant: 'secondary' as const,
        fullWidth: layout !== 'inline'
      };
    
    case 'tertiary':
      return {
        container: `${baseStyles} order-3`,
        button: 'px-3 py-1 text-xs',
        variant: 'secondary' as const,
        fullWidth: false
      };
    
    default:
      return {
        container: baseStyles,
        button: 'px-4 py-2 text-sm',
        variant: 'secondary' as const,
        fullWidth: layout !== 'inline'
      };
  }
};

/**
 * Determine optimal layout based on CTA count and priorities
 */
const determineOptimalLayout = (ctas: CTAConfig[]): 'stacked' | 'inline' => {
  const primaryCount = ctas.filter(cta => cta.priority === 'primary').length;
  const totalCount = ctas.length;
  
  // If only one primary CTA, prefer stacked for prominence
  if (primaryCount === 1 && totalCount <= 2) {
    return 'stacked';
  }
  
  // If multiple CTAs of similar priority, use inline to save space
  if (totalCount > 2) {
    return 'inline';
  }
  
  return 'stacked';
};

/**
 * CTA Prioritization Component
 */
export const CTAPrioritization: React.FC<CTAPrioritizationProps> = ({
  ctas,
  layout = 'auto',
  persistentPrimary = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryCTARef = useRef<HTMLDivElement>(null);
  const secondaryCTARefs = useRef<HTMLDivElement[]>([]);
  
  // Determine final layout
  const finalLayout = layout === 'auto' ? determineOptimalLayout(ctas) : layout;
  
  // Sort CTAs by priority
  const sortedCTAs = [...ctas].sort((a, b) => {
    const priorityOrder = { primary: 0, secondary: 1, tertiary: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  // Get primary CTA for persistence
  const primaryCTA = sortedCTAs.find(cta => cta.priority === 'primary');
  const primaryCTAElement = primaryCTA ? primaryCTARef : null;
  
  // Set up CTA interaction persistence for primary CTA
  const { interactionState, updatePositioning } = useCTAInteractionPersistence(
    containerRef,
    primaryCTAElement ? [primaryCTARef] : [],
    {
      stickyBehavior: persistentPrimary ? 'when-hidden' : 'never',
      persistDuringFocus: true,
      persistDuringInput: true,
      updateOnContentChange: true
    }
  );
  
  // Update positioning when layout changes
  useEffect(() => {
    updatePositioning();
  }, [finalLayout, ctas.length, updatePositioning]);
  
  // Container styles based on layout
  const containerStyles = {
    stacked: 'flex flex-col gap-3',
    inline: 'flex flex-row gap-2 items-center justify-between flex-wrap'
  };
  
  return (
    <div 
      ref={containerRef}
      className={`cta-prioritization ${containerStyles[finalLayout]} ${className}`}
    >
      {sortedCTAs.map((cta, index) => {
        const styles = getPriorityStyles(cta.priority, finalLayout);
        const isPrimary = cta.priority === 'primary';
        
        return (
          <div
            key={cta.id}
            ref={isPrimary ? primaryCTARef : (el) => {
              if (el) secondaryCTARefs.current[index] = el;
            }}
            className={`cta-item ${styles.container}`}
          >
            {/* Primary CTA with enhanced styling */}
            {isPrimary ? (
              <div className="primary-cta-wrapper">
                <Button
                  onClick={cta.onClick}
                  variant={cta.variant || styles.variant}
                  fullWidth={styles.fullWidth}
                  disabled={cta.disabled || cta.loading}
                  className={`${styles.button} shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    interactionState.isSticky ? 'sticky-cta' : ''
                  }`}
                >
                  {cta.loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      {cta.text}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {cta.icon && <i className={cta.icon}></i>}
                      {cta.text}
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              /* Secondary/Tertiary CTAs */
              <Button
                onClick={cta.onClick}
                variant={cta.variant || styles.variant}
                fullWidth={styles.fullWidth}
                disabled={cta.disabled || cta.loading}
                className={`${styles.button} ${
                  cta.priority === 'tertiary' ? 'opacity-75 hover:opacity-100' : ''
                }`}
              >
                {cta.loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    {cta.text}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {cta.icon && <i className={cta.icon}></i>}
                    {cta.text}
                  </span>
                )}
              </Button>
            )}
          </div>
        );
      })}
      
      <style jsx>{`
        .primary-cta-wrapper {
          position: relative;
        }
        
        .sticky-cta {
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3) !important;
          border: 2px solid rgba(59, 130, 246, 0.2);
        }
        
        .cta-prioritization .cta-item {
          transition: all 0.3s ease;
        }
        
        .cta-prioritization .cta-item:hover {
          transform: translateY(-1px);
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .cta-prioritization.flex-row {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .cta-prioritization .cta-item button {
            width: 100%;
          }
        }
        
        /* Animation for priority changes */
        .cta-item {
          animation: fadeInUp 0.3s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Simplified CTA Group for common use cases
 */
export interface SimpleCTAGroupProps {
  primaryText: string;
  primaryAction: () => void;
  primaryIcon?: string;
  primaryLoading?: boolean;
  secondaryText?: string;
  secondaryAction?: () => void;
  secondaryIcon?: string;
  layout?: 'stacked' | 'inline' | 'auto';
  className?: string;
}

export const SimpleCTAGroup: React.FC<SimpleCTAGroupProps> = ({
  primaryText,
  primaryAction,
  primaryIcon,
  primaryLoading = false,
  secondaryText,
  secondaryAction,
  secondaryIcon,
  layout = 'auto',
  className = ''
}) => {
  const ctas: CTAConfig[] = [
    {
      id: 'primary',
      text: primaryText,
      onClick: primaryAction,
      priority: 'primary',
      icon: primaryIcon,
      loading: primaryLoading
    }
  ];
  
  if (secondaryText && secondaryAction) {
    ctas.push({
      id: 'secondary',
      text: secondaryText,
      onClick: secondaryAction,
      priority: 'secondary',
      icon: secondaryIcon
    });
  }
  
  return (
    <CTAPrioritization
      ctas={ctas}
      layout={layout}
      className={className}
    />
  );
};

/**
 * Hook for managing CTA priorities dynamically
 */
export const useCTAPriorities = (initialCTAs: CTAConfig[]) => {
  const [ctas, setCTAs] = React.useState<CTAConfig[]>(initialCTAs);
  
  const updateCTAPriority = (id: string, priority: CTAConfig['priority']) => {
    setCTAs(prev => prev.map(cta => 
      cta.id === id ? { ...cta, priority } : cta
    ));
  };
  
  const addCTA = (cta: CTAConfig) => {
    setCTAs(prev => [...prev, cta]);
  };
  
  const removeCTA = (id: string) => {
    setCTAs(prev => prev.filter(cta => cta.id !== id));
  };
  
  const updateCTA = (id: string, updates: Partial<CTAConfig>) => {
    setCTAs(prev => prev.map(cta => 
      cta.id === id ? { ...cta, ...updates } : cta
    ));
  };
  
  return {
    ctas,
    updateCTAPriority,
    addCTA,
    removeCTA,
    updateCTA
  };
};
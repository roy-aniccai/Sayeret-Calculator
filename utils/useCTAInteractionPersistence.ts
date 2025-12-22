/**
 * CTA Interaction Persistence Hook
 * Ensures CTAs remain visible during form interactions and provides
 * dynamic positioning updates on content changes.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  createCTAPositionMonitor, 
  ensureCTAVisibility, 
  CTAElement, 
  CTAPosition,
  getScrollFreeCTAPosition 
} from './ctaPositioning';

export interface CTAInteractionConfig {
  persistDuringFocus: boolean;
  persistDuringInput: boolean;
  persistDuringScroll: boolean;
  stickyBehavior: 'always' | 'when-hidden' | 'never';
  updateOnContentChange: boolean;
}

export interface CTAInteractionState {
  isVisible: boolean;
  isSticky: boolean;
  currentPosition: CTAPosition | null;
  interactionActive: boolean;
}

const defaultConfig: CTAInteractionConfig = {
  persistDuringFocus: true,
  persistDuringInput: true,
  persistDuringScroll: true,
  stickyBehavior: 'when-hidden',
  updateOnContentChange: true
};

/**
 * Hook for managing CTA interaction persistence
 */
export const useCTAInteractionPersistence = (
  contentContainerRef: React.RefObject<HTMLElement>,
  ctaElementRefs: React.RefObject<HTMLElement>[],
  config: Partial<CTAInteractionConfig> = {}
) => {
  const fullConfig = { ...defaultConfig, ...config };
  const [interactionState, setInteractionState] = useState<CTAInteractionState>({
    isVisible: true,
    isSticky: false,
    currentPosition: null,
    interactionActive: false
  });
  
  const monitorRef = useRef<ReturnType<typeof createCTAPositionMonitor> | null>(null);
  const visibilityCleanupRef = useRef<(() => void)[]>([]);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle form interaction start
   */
  const handleInteractionStart = useCallback(() => {
    setInteractionState(prev => ({ ...prev, interactionActive: true }));
    
    // Clear any existing timeout
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
  }, []);

  /**
   * Handle form interaction end
   */
  const handleInteractionEnd = useCallback(() => {
    // Delay marking interaction as inactive to prevent flickering
    interactionTimeoutRef.current = setTimeout(() => {
      setInteractionState(prev => ({ ...prev, interactionActive: false }));
    }, 300);
  }, []);

  /**
   * Set up form interaction listeners
   */
  const setupInteractionListeners = useCallback(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    const inputs = container.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      if (fullConfig.persistDuringFocus) {
        input.addEventListener('focus', handleInteractionStart);
        input.addEventListener('blur', handleInteractionEnd);
      }
      
      if (fullConfig.persistDuringInput) {
        input.addEventListener('input', handleInteractionStart);
      }
    });

    // Cleanup function
    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', handleInteractionStart);
        input.removeEventListener('blur', handleInteractionEnd);
        input.removeEventListener('input', handleInteractionStart);
      });
    };
  }, [contentContainerRef, fullConfig, handleInteractionStart, handleInteractionEnd]);

  /**
   * Update CTA positioning based on interaction state
   */
  const updateCTAPositioning = useCallback(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    ctaElementRefs.forEach(ctaRef => {
      const ctaElement = ctaRef.current;
      if (!ctaElement) return;

      const position = getScrollFreeCTAPosition(container, ctaElement);
      
      // Apply sticky behavior based on config and interaction state
      if (fullConfig.stickyBehavior === 'always' || 
          (fullConfig.stickyBehavior === 'when-hidden' && !interactionState.isVisible)) {
        
        if (position === 'fixed-bottom') {
          ctaElement.style.position = 'fixed';
          ctaElement.style.bottom = '20px';
          ctaElement.style.left = '50%';
          ctaElement.style.transform = 'translateX(-50%)';
          ctaElement.style.zIndex = '50';
          ctaElement.style.width = 'calc(100% - 40px)';
          ctaElement.style.maxWidth = '480px';
        } else if (position === 'sticky') {
          ctaElement.style.position = 'sticky';
          ctaElement.style.bottom = '10px';
          ctaElement.style.zIndex = '40';
        } else {
          // Reset to inline
          ctaElement.style.position = 'static';
          ctaElement.style.bottom = 'auto';
          ctaElement.style.left = 'auto';
          ctaElement.style.transform = 'none';
          ctaElement.style.zIndex = 'auto';
          ctaElement.style.width = 'auto';
          ctaElement.style.maxWidth = 'none';
        }
      }
    });
  }, [contentContainerRef, ctaElementRefs, fullConfig, interactionState]);

  /**
   * Set up position monitoring
   */
  const setupPositionMonitoring = useCallback(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    const ctaElements: CTAElement[] = ctaElementRefs
      .map((ref, index) => {
        const element = ref.current;
        if (!element) return null;
        
        return {
          element,
          priority: index === 0 ? 'primary' : 'secondary',
          preferredPosition: 'bottom'
        } as CTAElement;
      })
      .filter(Boolean) as CTAElement[];

    if (ctaElements.length === 0) return;

    monitorRef.current = createCTAPositionMonitor(
      container,
      ctaElements,
      (positions) => {
        setInteractionState(prev => ({
          ...prev,
          currentPosition: positions[0] || null
        }));
      }
    );

    monitorRef.current.start();

    return () => {
      monitorRef.current?.stop();
      monitorRef.current = null;
    };
  }, [contentContainerRef, ctaElementRefs]);

  /**
   * Set up visibility monitoring
   */
  const setupVisibilityMonitoring = useCallback(() => {
    const cleanupFunctions: (() => void)[] = [];

    ctaElementRefs.forEach(ctaRef => {
      const ctaElement = ctaRef.current;
      const container = contentContainerRef.current;
      
      if (ctaElement && container) {
        const cleanup = ensureCTAVisibility(ctaElement, container);
        cleanupFunctions.push(cleanup);
      }
    });

    visibilityCleanupRef.current = cleanupFunctions;

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      visibilityCleanupRef.current = [];
    };
  }, [contentContainerRef, ctaElementRefs]);

  /**
   * Handle content changes
   */
  const handleContentChange = useCallback(() => {
    if (fullConfig.updateOnContentChange) {
      // Debounce updates to avoid excessive recalculations
      setTimeout(() => {
        updateCTAPositioning();
        monitorRef.current?.updatePositions();
      }, 100);
    }
  }, [fullConfig.updateOnContentChange, updateCTAPositioning]);

  /**
   * Set up mutation observer for content changes
   */
  const setupContentChangeObserver = useCallback(() => {
    const container = contentContainerRef.current;
    if (!container || !fullConfig.updateOnContentChange) return;

    const observer = new MutationObserver(handleContentChange);
    
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => observer.disconnect();
  }, [contentContainerRef, fullConfig.updateOnContentChange, handleContentChange]);

  /**
   * Initialize all monitoring and listeners
   */
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // Set up all monitoring systems
    const interactionCleanup = setupInteractionListeners();
    const positionCleanup = setupPositionMonitoring();
    const visibilityCleanup = setupVisibilityMonitoring();
    const contentCleanup = setupContentChangeObserver();

    if (interactionCleanup) cleanupFunctions.push(interactionCleanup);
    if (positionCleanup) cleanupFunctions.push(positionCleanup);
    if (visibilityCleanup) cleanupFunctions.push(visibilityCleanup);
    if (contentCleanup) cleanupFunctions.push(contentCleanup);

    // Initial positioning update
    updateCTAPositioning();

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [
    setupInteractionListeners,
    setupPositionMonitoring,
    setupVisibilityMonitoring,
    setupContentChangeObserver,
    updateCTAPositioning
  ]);

  /**
   * Manual update function for external triggers
   */
  const updatePositioning = useCallback(() => {
    updateCTAPositioning();
    monitorRef.current?.updatePositions();
  }, [updateCTAPositioning]);

  return {
    interactionState,
    updatePositioning,
    handleInteractionStart,
    handleInteractionEnd
  };
};

/**
 * Simplified hook for basic CTA persistence
 */
export const useBasicCTAPersistence = (
  ctaElementRef: React.RefObject<HTMLElement>
) => {
  return useCTAInteractionPersistence(
    { current: document.body },
    [ctaElementRef],
    {
      stickyBehavior: 'when-hidden',
      persistDuringFocus: true,
      persistDuringInput: true
    }
  );
};
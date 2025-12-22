/**
 * CTA Positioning Utilities
 * Handles viewport visibility detection, automatic positioning adjustments,
 * and scroll-free CTA placement logic for the compact step layout.
 */

export interface ViewportConstraints {
  height: number;
  width: number;
  availableHeight: number; // After header/footer
  contentMaxHeight: number;
}

export interface CTAPosition {
  x: number;
  y: number;
  position: 'fixed' | 'absolute' | 'sticky' | 'static';
  withinBounds: boolean;
  adjustedPlacement: 'top' | 'bottom' | 'inline';
}

export interface CTAElement {
  element: HTMLElement;
  priority: 'primary' | 'secondary';
  preferredPosition: 'top' | 'bottom' | 'inline';
}

/**
 * Get current viewport constraints
 */
export const getViewportConstraints = (): ViewportConstraints => {
  const height = window.innerHeight;
  const width = window.innerWidth;
  
  // Account for typical header height (compact header is ~60px)
  const headerHeight = 60;
  const availableHeight = height - headerHeight;
  
  // Reserve some space for padding and potential scroll indicators
  const contentMaxHeight = availableHeight - 40;
  
  return {
    height,
    width,
    availableHeight,
    contentMaxHeight
  };
};

/**
 * Check if an element is visible within the viewport
 */
export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportConstraints();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewport.height &&
    rect.right <= viewport.width
  );
};

/**
 * Calculate optimal CTA position based on content and viewport constraints
 */
export const calculateOptimalCTAPosition = (
  contentContainer: HTMLElement,
  ctaElement: HTMLElement,
  preferredPosition: 'top' | 'bottom' | 'inline' = 'bottom'
): CTAPosition => {
  const viewport = getViewportConstraints();
  const contentRect = contentContainer.getBoundingClientRect();
  const ctaRect = ctaElement.getBoundingClientRect();
  
  // Check if content fits within viewport
  const contentFitsInViewport = contentRect.height <= viewport.contentMaxHeight;
  
  if (contentFitsInViewport) {
    // Content fits - use inline positioning
    return {
      x: 0,
      y: 0,
      position: 'static',
      withinBounds: true,
      adjustedPlacement: 'inline'
    };
  }
  
  // Content doesn't fit - determine best positioning strategy
  const spaceAtBottom = viewport.height - contentRect.bottom;
  const spaceAtTop = contentRect.top;
  
  if (preferredPosition === 'bottom' && spaceAtBottom >= ctaRect.height + 20) {
    // Stick to bottom of viewport
    return {
      x: contentRect.left,
      y: viewport.height - ctaRect.height - 10,
      position: 'fixed',
      withinBounds: true,
      adjustedPlacement: 'bottom'
    };
  }
  
  if (preferredPosition === 'top' && spaceAtTop >= ctaRect.height + 20) {
    // Stick to top after header
    return {
      x: contentRect.left,
      y: 70, // After compact header
      position: 'fixed',
      withinBounds: true,
      adjustedPlacement: 'top'
    };
  }
  
  // Fallback to sticky positioning at bottom
  return {
    x: 0,
    y: 0,
    position: 'sticky',
    withinBounds: false,
    adjustedPlacement: 'bottom'
  };
};

/**
 * Apply positioning styles to CTA element
 */
export const applyCTAPositioning = (
  element: HTMLElement,
  position: CTAPosition
): void => {
  element.style.position = position.position;
  
  if (position.position === 'fixed') {
    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    element.style.zIndex = '50';
  } else if (position.position === 'sticky') {
    element.style.position = 'sticky';
    element.style.bottom = '10px';
    element.style.zIndex = '40';
  } else {
    // Static positioning - reset all positioning styles
    element.style.position = 'static';
    element.style.left = 'auto';
    element.style.top = 'auto';
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    element.style.zIndex = 'auto';
  }
};

/**
 * Monitor viewport changes and update CTA positioning
 */
export const createCTAPositionMonitor = (
  contentContainer: HTMLElement,
  ctaElements: CTAElement[],
  onPositionChange?: (positions: CTAPosition[]) => void
) => {
  let isMonitoring = false;
  
  const updatePositions = () => {
    if (!isMonitoring) return;
    
    const positions = ctaElements.map(cta => 
      calculateOptimalCTAPosition(
        contentContainer,
        cta.element,
        cta.preferredPosition
      )
    );
    
    // Apply positioning to elements
    ctaElements.forEach((cta, index) => {
      applyCTAPositioning(cta.element, positions[index]);
    });
    
    onPositionChange?.(positions);
  };
  
  const handleResize = () => {
    requestAnimationFrame(updatePositions);
  };
  
  const handleScroll = () => {
    requestAnimationFrame(updatePositions);
  };
  
  const start = () => {
    isMonitoring = true;
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    updatePositions(); // Initial positioning
  };
  
  const stop = () => {
    isMonitoring = false;
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll);
  };
  
  return { start, stop, updatePositions };
};

/**
 * Ensure CTA remains visible during form interactions
 */
export const ensureCTAVisibility = (
  ctaElement: HTMLElement,
  formContainer: HTMLElement
): void => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // CTA is visible - use normal positioning
          ctaElement.style.position = 'static';
        } else {
          // CTA is not visible - make it sticky
          ctaElement.style.position = 'sticky';
          ctaElement.style.bottom = '10px';
          ctaElement.style.zIndex = '50';
        }
      });
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    }
  );
  
  observer.observe(ctaElement);
  
  return () => observer.disconnect();
};

/**
 * Check if content requires scrolling
 */
export const requiresScrolling = (contentElement: HTMLElement): boolean => {
  const viewport = getViewportConstraints();
  const contentRect = contentElement.getBoundingClientRect();
  
  return contentRect.height > viewport.contentMaxHeight;
};

/**
 * Get scroll-free positioning for CTA
 */
export const getScrollFreeCTAPosition = (
  contentElement: HTMLElement,
  ctaElement: HTMLElement
): 'inline' | 'fixed-bottom' | 'sticky' => {
  if (!requiresScrolling(contentElement)) {
    return 'inline';
  }
  
  const viewport = getViewportConstraints();
  const ctaRect = ctaElement.getBoundingClientRect();
  
  // Check if there's space at bottom for fixed positioning
  if (viewport.height - ctaRect.height > 80) { // 80px for header + padding
    return 'fixed-bottom';
  }
  
  return 'sticky';
};
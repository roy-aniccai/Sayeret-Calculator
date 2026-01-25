import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to manage scroll behavior based on content height
 * 
 * This hook prevents scrolling when content doesn't exceed the container height,
 * avoiding empty scroll areas that provide poor user experience.
 * It also detects fixed/sticky elements that might require scrolling.
 * 
 * @returns Object with scroll state and container ref
 */
export const useScrollLock = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAllowScroll, setShouldAllowScroll] = useState(true); // Default to true for safety

  useEffect(() => {
    const checkScrollNeed = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const hasOverflow = container.scrollHeight > container.clientHeight;
      
      // Check if there are fixed/sticky elements that might need scrolling
      const hasFixedElements = container.querySelector('.fixed, .sticky, [class*="pb-32"], [class*="pb-96"]');
      
      // Allow scroll if content overflows OR if there are fixed elements
      setShouldAllowScroll(hasOverflow || !!hasFixedElements);
    };

    // Check on mount and when content changes
    checkScrollNeed();

    // Create a ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(checkScrollNeed);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also check on window resize
    window.addEventListener('resize', checkScrollNeed);

    // Use MutationObserver to detect DOM changes (like adding fixed elements)
    const mutationObserver = new MutationObserver(checkScrollNeed);
    
    if (containerRef.current) {
      mutationObserver.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', checkScrollNeed);
    };
  }, []);

  return {
    containerRef,
    shouldAllowScroll,
    scrollClassName: shouldAllowScroll ? 'overflow-y-auto' : 'overflow-y-hidden'
  };
};
/**
 * Layout utility functions for consistent spacing and viewport handling
 */

export interface SpacingConfig {
  container: string;
  section: string;
  element: string;
  compact: string;
}

/**
 * Consistent spacing patterns used across all step components
 */
export const SPACING_PATTERNS: SpacingConfig = {
  container: 'space-y-4', // Main container spacing between sections
  section: 'space-y-3',   // Within sections (like form groups)
  element: 'mb-2',        // Individual elements (labels, etc.)
  compact: 'space-y-2'    // Tight spacing for compact layouts
};

/**
 * Viewport breakpoints for responsive behavior
 */
export const VIEWPORT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
} as const;

/**
 * Check if current viewport is mobile
 */
export const isMobileViewport = (): boolean => {
  return window.innerWidth <= VIEWPORT_BREAKPOINTS.mobile;
};

/**
 * Check if current viewport is tablet
 */
export const isTabletViewport = (): boolean => {
  return window.innerWidth > VIEWPORT_BREAKPOINTS.mobile && 
         window.innerWidth <= VIEWPORT_BREAKPOINTS.tablet;
};

/**
 * Check if current viewport is desktop
 */
export const isDesktopViewport = (): boolean => {
  return window.innerWidth > VIEWPORT_BREAKPOINTS.tablet;
};

/**
 * Get responsive spacing class based on viewport
 */
export const getResponsiveSpacing = (
  mobile: keyof SpacingConfig = 'compact',
  tablet: keyof SpacingConfig = 'section', 
  desktop: keyof SpacingConfig = 'container'
): string => {
  if (isMobileViewport()) return SPACING_PATTERNS[mobile];
  if (isTabletViewport()) return SPACING_PATTERNS[tablet];
  return SPACING_PATTERNS[desktop];
};

/**
 * Calculate available content height considering header and footer
 */
export const getAvailableContentHeight = (): number => {
  const headerHeight = 120; // Compact header height
  const footerPadding = 80;  // Space for CTAs and navigation
  return window.innerHeight - headerHeight - footerPadding;
};

/**
 * Check if content will fit in viewport without scrolling
 */
export const willFitInViewport = (contentHeight: number): boolean => {
  return contentHeight <= getAvailableContentHeight();
};

/**
 * Get optimal container max-width based on viewport
 */
export const getContainerMaxWidth = (): string => {
  if (isMobileViewport()) return 'max-w-full';
  if (isTabletViewport()) return 'max-w-lg';
  return 'max-w-xl';
};

/**
 * Animation classes for consistent transitions
 */
export const ANIMATION_CLASSES = {
  fadeInUp: 'animate-fade-in-up',
  slideIn: 'transition-all duration-300 ease-in-out',
  scaleIn: 'transition-transform duration-200 ease-out',
  fadeIn: 'transition-opacity duration-300 ease-in-out'
} as const;

/**
 * Common CSS classes for consistent styling
 */
export const COMMON_CLASSES = {
  stepHeader: 'text-2xl font-bold text-gray-900 mb-4 text-center',
  sectionContainer: 'bg-gray-50 border border-gray-200 rounded-lg p-3',
  backButton: 'w-full text-gray-400 text-base mt-4 font-medium hover:text-gray-600 transition-colors',
  errorText: 'text-lg text-red-600 mt-2 font-medium',
  helperText: 'text-sm text-gray-500 mt-2'
} as const;

/**
 * Utility to combine classes with proper spacing
 */
export const combineClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
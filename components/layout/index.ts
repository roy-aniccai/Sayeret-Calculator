/**
 * Shared layout components and utilities for compact step layout
 * Provides consistent spacing, viewport handling, and component patterns
 */

export { CompactStepLayout, useViewportConstraints, checkViewportFit } from './CompactStepLayout';
export type { ViewportConstraints, CompactLayoutProps } from './CompactStepLayout';

export { IntegratedCTA, createCTAConfig } from './IntegratedCTA';
export type { CTAConfig } from './IntegratedCTA';

export { InputWithTooltip } from './InputWithTooltip';

export {
  SPACING_PATTERNS,
  VIEWPORT_BREAKPOINTS,
  ANIMATION_CLASSES,
  COMMON_CLASSES,
  isMobileViewport,
  isTabletViewport,
  isDesktopViewport,
  getResponsiveSpacing,
  getAvailableContentHeight,
  willFitInViewport,
  getContainerMaxWidth,
  combineClasses
} from '../../utils/layoutUtils';
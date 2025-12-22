import {
  SPACING_PATTERNS,
  VIEWPORT_BREAKPOINTS,
  isMobileViewport,
  isTabletViewport,
  isDesktopViewport,
  getResponsiveSpacing,
  getAvailableContentHeight,
  willFitInViewport,
  combineClasses
} from './layoutUtils';

// Mock window.innerWidth for viewport tests
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Mock window.innerHeight for height tests
const mockInnerHeight = (height: number) => {
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

describe('layoutUtils', () => {
  describe('SPACING_PATTERNS', () => {
    it('provides consistent spacing configuration', () => {
      expect(SPACING_PATTERNS.container).toBe('space-y-4');
      expect(SPACING_PATTERNS.section).toBe('space-y-3');
      expect(SPACING_PATTERNS.element).toBe('mb-2');
      expect(SPACING_PATTERNS.compact).toBe('space-y-2');
    });
  });

  describe('viewport detection', () => {
    it('detects mobile viewport correctly', () => {
      mockInnerWidth(600);
      expect(isMobileViewport()).toBe(true);
      
      mockInnerWidth(800);
      expect(isMobileViewport()).toBe(false);
    });

    it('detects tablet viewport correctly', () => {
      mockInnerWidth(900);
      expect(isTabletViewport()).toBe(true);
      
      mockInnerWidth(600);
      expect(isTabletViewport()).toBe(false);
      
      mockInnerWidth(1200);
      expect(isTabletViewport()).toBe(false);
    });

    it('detects desktop viewport correctly', () => {
      mockInnerWidth(1300);
      expect(isDesktopViewport()).toBe(true);
      
      mockInnerWidth(900);
      expect(isDesktopViewport()).toBe(false);
    });
  });

  describe('getResponsiveSpacing', () => {
    it('returns mobile spacing for mobile viewport', () => {
      mockInnerWidth(600);
      expect(getResponsiveSpacing()).toBe(SPACING_PATTERNS.compact);
    });

    it('returns tablet spacing for tablet viewport', () => {
      mockInnerWidth(900);
      expect(getResponsiveSpacing()).toBe(SPACING_PATTERNS.section);
    });

    it('returns desktop spacing for desktop viewport', () => {
      mockInnerWidth(1300);
      expect(getResponsiveSpacing()).toBe(SPACING_PATTERNS.container);
    });
  });

  describe('getAvailableContentHeight', () => {
    it('calculates available height correctly', () => {
      mockInnerHeight(800);
      const expected = 800 - 120 - 80; // height - header - footer
      expect(getAvailableContentHeight()).toBe(expected);
    });
  });

  describe('willFitInViewport', () => {
    beforeEach(() => {
      mockInnerHeight(800);
    });

    it('returns true for content that fits', () => {
      const contentHeight = 500; // Less than available height (600)
      expect(willFitInViewport(contentHeight)).toBe(true);
    });

    it('returns false for content that does not fit', () => {
      const contentHeight = 700; // More than available height (600)
      expect(willFitInViewport(contentHeight)).toBe(false);
    });
  });

  describe('combineClasses', () => {
    it('combines valid classes', () => {
      expect(combineClasses('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('filters out falsy values', () => {
      expect(combineClasses('class1', null, undefined, false, 'class2')).toBe('class1 class2');
    });

    it('handles empty input', () => {
      expect(combineClasses()).toBe('');
    });
  });
});
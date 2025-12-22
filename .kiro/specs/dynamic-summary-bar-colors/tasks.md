# Implementation Plan

- [x] 1. Create color scheme determination function





  - Extract and implement the color logic function that determines bar colors based on year comparison
  - Define TypeScript interface for ColorScheme with all required properties
  - Implement logic to return green scheme for reduced years, amber for extended years
  - _Requirements: 1.1, 1.2, 1.3, 1.6_

- [x] 1.1 Write property test for shorter term green scheme


  - **Property 1: Shorter term yields green scheme**
  - **Validates: Requirements 1.1**

- [x] 1.2 Write property test for longer term amber scheme  


  - **Property 2: Longer term yields amber scheme**
  - **Validates: Requirements 1.2**

- [x] 1.3 Write property test for complete color scheme


  - **Property 5: Complete color scheme**
  - **Validates: Requirements 1.6**

- [x] 2. Update Step5Simulator component to use dynamic colors


  - Integrate the color scheme function into the existing bar rendering logic
  - Replace hardcoded green styling for simulated bar with dynamic color application
  - Apply color scheme to bar background, header text, and payment box styling
  - Ensure current state bar remains grey regardless of outcome
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_



- [ ] 2.1 Write property test for current bar always grey
  - **Property 3: Current bar always grey**

  - **Validates: Requirements 1.4**





- [ ] 2.2 Write property test for gradient consistency
  - **Property 4: Gradient consistency**
  - **Validates: Requirements 1.5**

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
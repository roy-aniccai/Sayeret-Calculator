# Simulator CTA Cleanup - Tasks

## Task Breakdown

### 1. Analysis and Investigation
- [ ] 1.1 Analyze current SingleTrackStep6Simulator component structure
- [ ] 1.2 Identify all CTA buttons in insufficient-savings scenario
- [ ] 1.3 Map current user flow and button interactions
- [ ] 1.4 Document exact location of problematic "אשמח שנציג יחזור אלי" button

### 2. Code Cleanup - Remove Embedded CTAs
- [ ] 2.1 Remove embedded CTA button from insufficient-savings scenario card
- [ ] 2.2 Clean up any related event handlers that are no longer needed
- [ ] 2.3 Verify no other scenarios have embedded CTA buttons
- [ ] 2.4 Add preventive comments to prevent future CTA duplication

### 3. Verify Global CTA Functionality
- [ ] 3.1 Confirm global "לשיחה עם המומחים" button works correctly
- [ ] 3.2 Confirm global "בדוק תרחיש אחר" button works correctly
- [ ] 3.3 Verify ContactOptionsPage integration is intact
- [ ] 3.4 Test event tracking for global CTAs

### 4. Testing and Validation
- [ ] 4.1 Test insufficient-savings scenario (< 1000 NIS)
  - [ ] 4.1.1 Verify no embedded CTA in scenario card
  - [ ] 4.1.2 Verify global CTAs work correctly
  - [ ] 4.1.3 Verify ContactOptionsPage opens correctly
- [ ] 4.2 Test normal scenarios (≥ 1000 NIS)
  - [ ] 4.2.1 Verify scenario cards are clean
  - [ ] 4.2.2 Verify global CTAs work correctly
- [ ] 4.3 Test no-savings scenario
  - [ ] 4.3.1 Verify clean display
  - [ ] 4.3.2 Verify global CTAs work correctly

### 5. Code Quality and Documentation
- [ ] 5.1 Add clear comments explaining CTA button hierarchy
- [ ] 5.2 Update any related TypeScript interfaces if needed
- [ ] 5.3 Ensure code follows project conventions
- [ ] 5.4 Run linting and formatting tools

### 6. Deployment and Monitoring
- [ ] 6.1 Build and test locally
- [ ] 6.2 Commit changes with clear commit message
- [ ] 6.3 Deploy to production
- [ ] 6.4 Verify fix in production environment
- [ ] 6.5 Monitor for any user behavior changes

## Priority Order

**High Priority (Must Fix):**
- Task 2.1: Remove embedded CTA button from insufficient-savings scenario
- Task 4.1: Test insufficient-savings scenario thoroughly

**Medium Priority (Important):**
- Task 3: Verify global CTA functionality
- Task 4.2-4.3: Test other scenarios

**Low Priority (Nice to Have):**
- Task 5: Code quality improvements
- Task 1: Additional analysis (if needed)

## Estimated Time
- **Total**: 2-3 hours
- **Critical path**: Tasks 2.1, 4.1, 6.3 (1 hour)
- **Full completion**: All tasks (2-3 hours)

## Dependencies
- Access to development environment
- Ability to test different savings scenarios
- Access to production deployment

## Success Criteria
- [ ] No "אשמח שנציג יחזור אלי" button visible in insufficient-savings scenario
- [ ] Global "לשיחה עם המומחים" button works correctly
- [ ] Global "בדוק תרחיש אחר" button works correctly
- [ ] User can successfully contact experts through global CTA
- [ ] No regression in other simulator functionality
- [ ] Clean, maintainable code structure
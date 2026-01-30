# Complete List of All Buttons in the Application

This document provides a comprehensive inventory of all buttons across all tracks and variants in the mortgage calculator application.

## Application Structure Overview

The application has two main tracks:
1. **Multi-Track Calculator** (App.tsx) - Users choose between Monthly Reduction or Shorten Term
2. **Single-Track Calculator** (SingleTrackApp.tsx) - Campaign-optimized for Monthly Reduction only

---

## MULTI-TRACK CALCULATOR (App.tsx)

### Header Navigation Buttons
**Location**: App.tsx header
- **Back Button** (Steps 2-6)
  - Icon: `fa-arrow-right`
  - Style: `text-blue-200 hover:text-white transition-colors`
  - Title: "חזור"
  - Function: Navigate to previous step

- **Restart Button** (All steps)
  - Icon: `fa-rotate-right`
  - Style: `text-blue-200 hover:text-white transition-colors`
  - Title: "התחל מחדש"
  - Function: Reset form to beginning

### Step 1: Goal Selection (Step1Goal.tsx)
**Screen Title**: "מה המטרה העיקרית?"

- **Monthly Reduction Track Button**
  - Text: "הפחתת תשלום חודשי"
  - Description: "ההחזר כבד? נבדוק פריסה נוחה יותר."
  - Icon: `fa-arrow-trend-down` (blue)
  - Style: `border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:bg-blue-50`
  - Badge: "מיקוד: הפחתת תשלומים"

- **Shorten Term Track Button**
  - Text: "הוזלת המשכנתא"
  - Description: "הגדלת ההחזר החודשי מקצרת את התקופה וחוסכת לך המון כסף."
  - Icon: `fa-piggy-bank` (green)
  - Style: `border-2 border-gray-200 rounded-2xl p-6 hover:border-green-500 hover:bg-green-50`
  - Badge: "מיקוד: חיסכון"

### Step 2: Debts Collection (Step1Debts.tsx)
**Screen Title**: Varies by track

#### Monthly Reduction Track
- **Other Loans Toggle - Yes**
  - Text: "כן"
  - Style: `px-3 py-1.5 text-sm rounded-lg font-medium` (blue when selected)

- **Other Loans Toggle - No**
  - Text: "לא"
  - Style: `px-3 py-1.5 text-sm rounded-lg font-medium` (blue when selected)

- **Bank Overdraft Toggle - Yes**
  - Text: "כן"
  - Style: `px-3 py-1.5 text-sm rounded-lg font-medium` (blue when selected)

- **Bank Overdraft Toggle - No**
  - Text: "לא"
  - Style: `px-3 py-1.5 text-sm rounded-lg font-medium` (blue when selected)

- **Primary CTA Button**
  - Text: "המשך לחישוב"
  - Icon: `fa-arrow-left`
  - Style: `w-full text-lg py-3 shadow-lg hover:shadow-xl` (blue theme)
  - Component: Button (ui/Button.tsx)

#### Shorten Term Track
- **Primary CTA Button**
  - Text: "המשך לחישוב"
  - Icon: `fa-arrow-left`
  - Style: `w-full text-lg py-3 shadow-lg hover:shadow-xl` (green theme)
  - Component: Button (ui/Button.tsx)

### Step 3: Payments (Step2Payments.tsx)
**Screen Title**: Varies by track

#### Monthly Reduction Track
- **Primary CTA Button**
  - Text: "המשך לחישוב"
  - Style: `w-full py-3 text-xl font-bold shadow-lg` (blue theme)
  - Component: Button (ui/Button.tsx)

#### Shorten Term Track
- **Primary CTA Button**
  - Text: "המשך לחישוב"
  - Style: `w-full py-3 text-xl font-bold shadow-lg` (green theme)
  - Component: Button (ui/Button.tsx)

### Step 4: Assets (Step3Assets.tsx)
**Screen Title**: "נבדוק את שווי הנכסים" / "סכומים חד-פעמיים עתידיים"

#### Monthly Reduction Track
- **Primary CTA Button**
  - Text: "המשך לחישוב"
  - Style: `w-full py-3 text-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg`
  - Component: Button (ui/Button.tsx)

#### Shorten Term Track
- **Future Funds Toggle - Yes**
  - Text: "כן"
  - Icon: `fa-check` (when selected)
  - Style: `flex-1 rounded-xl font-bold text-lg` (green when selected)

- **Future Funds Toggle - No**
  - Text: "לא"
  - Icon: `fa-check` (when selected)
  - Style: `flex-1 rounded-xl font-bold text-lg` (gray when selected)

- **Primary CTA Button**
  - Text: "המשך לחישוב"
  - Style: `w-full py-3 text-xl font-bold bg-green-600 hover:bg-green-700 shadow-lg`
  - Component: Button (ui/Button.tsx)

### Step 5: Contact (Step4Contact.tsx)
**Screen Title**: "נשלח לך את התוצאות"

- **Primary CTA Button**
  - Text: "בואו נראה!"
  - Icon: `fa-arrow-left`
  - Style: `w-full text-xl py-4 shadow-xl hover:shadow-2xl` (dynamic color by track)
  - Loading State: "מעבד נתונים..." with `fa-circle-notch fa-spin`
  - Component: Button (ui/Button.tsx)

### Step 6: Simulator (Step5Simulator.tsx)
**Screen Title**: "תוצאות הסימולציה"

- **Primary CTA Button** (Contact Expert)
  - Text: "לשיחה עם המומחים"
  - Icon: `fa-phone-volume animate-bounce`
  - Style: `w-full py-3 md:py-4 text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600`
  - Component: Button (ui/Button.tsx)

- **Secondary CTA Button** (Try Another)
  - Text: "בדוק תרחיש אחר"
  - Style: `w-full font-medium text-base md:text-lg hover:underline` (dynamic color)
  - Type: Plain button

- **No Solution CTA Button** (when no valid scenarios)
  - Text: "דבר עם יועץ לבדיקה ידנית"
  - Icon: `fa-comments`
  - Style: `w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md`
  - Component: Button (ui/Button.tsx)

#### Dialog Buttons
- **Dialog Confirm Button**
  - Text: "תודה, מעולה!"
  - Component: Button (ui/Button.tsx)

- **Share Button**
  - Text: "שתף את המחשבון" / "הקישור הועתק!" (when copied)
  - Icon: `fa-share-nodes` / `fa-check` (when copied)
  - Style: `w-full !bg-white !border-2 hover:!bg-{color}-50` (dynamic color)
  - Component: Button (ui/Button.tsx)

---

## SINGLE-TRACK CALCULATOR (SingleTrackApp.tsx)

### Header Navigation Buttons
**Location**: SingleTrackApp.tsx header
- **Back Button** (Steps 2-6)
  - Icon: `fa-arrow-right`
  - Style: `text-blue-200 hover:text-white transition-colors`
  - Title: "חזור"

- **Restart Button** (All steps)
  - Icon: `fa-rotate-right`
  - Style: `text-blue-200 hover:text-white transition-colors`
  - Title: "התחל מחדש"

### Step 1: Landing (SingleTrackStep1Landing.tsx)
**Screen Title**: "הקטן את התשלום החודשי על המשכנתא שלך"

- **Primary CTA Button**
  - Text: "בואו נתחיל לחסוך"
  - Icon: `fa-arrow-left`
  - Style: `w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-xl`
  - Effects: `transform hover:scale-105 shadow-lg hover:shadow-xl`

### Step 2: Debts (SingleTrackStep2Debts.tsx)
**Screen Title**: "נבדוק את המצב הכספי הנוכחי"

- **Other Loans Toggle - Yes**
  - Text: "כן"
  - Style: `px-3 py-1.5 text-sm rounded-lg font-medium` (blue when selected)

- **Other Loans Toggle - No**
  - Text: "לא"
  - Style: `px-3 py-1.5 text-sm rounded-lg font-medium` (blue when selected)

- **Primary CTA Button**
  - Text: "המשך לחישוב"
  - Icon: `fa-arrow-left`
  - Style: `w-full text-lg py-3 shadow-lg hover:shadow-xl` (blue theme)
  - Component: Button (ui/Button.tsx)

### Step 3: Payments (SingleTrackStep3Payments.tsx)
**Screen Title**: "כמה אתה משלם היום?"

- **Primary CTA Button**
  - Text: "המשך לחישוב מדויק"
  - Style: `w-full py-3 text-xl font-bold shadow-lg` (green when savings, blue otherwise)
  - Component: Button (ui/Button.tsx)

### Step 4: Assets (SingleTrackStep4Assets.tsx)
**Screen Title**: "פרטים נוספים"

- **Primary CTA Button**
  - Text: "המשך לחישוב"
  - Icon: `fa-arrow-left`
  - Style: `w-full py-3 text-xl font-bold shadow-lg` (blue theme)
  - Component: Button (ui/Button.tsx)

### Step 5: Contact (SingleTrackStep5Contact.tsx)
**Screen Title**: "נשלח לך את התוצאות"

- **Primary CTA Button**
  - Text: "בואו נראה!"
  - Style: `w-full text-xl py-4 shadow-xl hover:shadow-2xl` (blue theme)
  - Loading State: Shows spinner when submitting
  - Component: Button (ui/Button.tsx)

### Step 6: Simulator (SingleTrackStep6Simulator.tsx)
**Screen Title**: "תוצאות הסימולציה"

#### Version A (Default Simulator)
- **Primary CTA Button** (Contact Expert)
  - Text: "לשיחה עם המומחים"
  - Icon: `fa-phone-volume animate-bounce`
  - Style: `w-full py-3 md:py-4 text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600`
  - Component: Button (ui/Button.tsx)

- **Secondary CTA Button** (Try Another)
  - Text: "בדוק תרחיש אחר"
  - Style: `w-full font-medium text-base md:text-lg hover:underline` (blue)
  - Type: Plain button

#### Version B (Scenario Cards)
- **Scenario Card Buttons** (3 cards)
  - **Minimum Scenario**: Blue theme, clock icon
  - **Middle Scenario**: Purple theme, balance icon
  - **Maximum Scenario**: Green theme, chart icon
  - Style: Interactive cards with hover effects
  - Component: ScenarioCard (ui/ScenarioCard.tsx)

- **Primary CTA Button** (Contact Expert)
  - Text: "לשיחה עם המומחים"
  - Icon: `fa-phone-volume animate-bounce`
  - Style: `w-full py-3 md:py-4 text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600`
  - Component: Button (ui/Button.tsx)

- **Secondary CTA Button** (Try Another)
  - Text: "בדוק תרחיש אחר"
  - Style: `w-full font-medium text-base md:text-lg hover:underline` (blue)
  - Type: Plain button

---

## CONTACT OPTIONS PAGE (ContactOptionsPage.tsx)

### Main Options Screen
- **Schedule Meeting Button**
  - Text: "פתח יומן תיאומים"
  - Icon: `fa-calendar-plus`
  - Style: `w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-lg`
  - Loading State: "פותח יומן..." with spinner

- **Request Callback Button**
  - Text: "מלא פרטים"
  - Icon: `fa-user-plus`
  - Style: `w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl text-lg`

- **Close Button**
  - Text: "סגור"
  - Style: `text-gray-500 hover:text-gray-700 text-sm`

### Callback Form Screen
- **Back Button**
  - Text: "חזור"
  - Style: `flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-4 rounded-xl text-lg`

- **Submit Button**
  - Text: "שלח פרטים"
  - Loading State: "שולח..." with `fa-spinner fa-spin`
  - Style: `flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl text-lg`

- **Close Button** (X)
  - Icon: `fa-times`
  - Style: `text-gray-400 hover:text-gray-600 text-2xl`

### Success Screen
- **Close Button**
  - Text: "סגור"
  - Style: `w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-xl`

---

## ADMIN DASHBOARD (AdminDashboard.tsx)

### Header Buttons
- **Refresh Data Button**
  - Text: "Refresh Data"
  - Style: `px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700`

- **Sign Out Button**
  - Text: "Sign Out"
  - Style: `px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium`

- **Close Button**
  - Text: "Close"
  - Style: `px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400`

### Tab Navigation Buttons
- **Leads Tab**
  - Text: "Leads ({count})"
  - Style: Active: `bg-white shadow text-blue-600`, Inactive: `bg-gray-200 text-gray-600`

- **Event Logs Tab**
  - Text: "Event Logs ({count})"
  - Style: Active: `bg-white shadow text-blue-600`, Inactive: `bg-gray-200 text-gray-600`

- **Parameters Tab**
  - Text: "פרמטרי משכנתא"
  - Icon: `fa-cog`
  - Style: Active: `bg-white shadow text-blue-600`, Inactive: `bg-gray-200 text-gray-600`

### Parameters Section
- **Edit Parameters Button**
  - Text: "ערוך פרמטרים"
  - Icon: `fa-edit`
  - Style: `px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg`

---

## ADMIN LOGIN (AdminLogin.tsx)

- **Sign In Button**
  - Text: "Sign In"
  - Type: Submit button
  - Style: `w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700`

- **Back to App Button**
  - Text: "Back to App"
  - Style: `w-full text-gray-500 text-sm hover:text-gray-700 mt-2`

---

## UI COMPONENTS

### Button Component (ui/Button.tsx)
**Base Component Properties**:
- **Variants**: primary, secondary, success
- **Base Style**: `font-bold py-5 rounded-2xl text-2xl shadow-lg transition-transform transform active:scale-95`
- **Primary**: `bg-blue-600 hover:bg-blue-700 text-white`
- **Secondary**: `bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-none`
- **Success**: `bg-green-600 hover:bg-green-700 text-white`
- **Full Width Option**: `w-full`
- **Disabled State**: `opacity-50 cursor-not-allowed`

### Selection Card Component (ui/SelectionCard.tsx)
**Used in**: Goal selection screens
- **Base Style**: `w-full border-2 border-gray-200 rounded-2xl p-6 hover:border-{color}-500 hover:bg-{color}-50`
- **Icon Container**: `w-16 h-16 rounded-full bg-{color}-100 text-{color}-600`
- **Color Variants**: blue, green, purple, indigo
- **Hover Effects**: Color transitions and background changes

### Scenario Card Component (ui/ScenarioCard.tsx)
**Used in**: Simulator Version B
- **Types**: minimum (blue), maximum (green), middle (purple)
- **Interactive**: Hover effects with `hover:scale-[1.02]` and shadow changes
- **Selection State**: Shows checkmark and enhanced styling when selected
- **RTL Support**: Proper Hebrew text direction and formatting

---

## BUTTON DESIGN PATTERNS

### Color Schemes by Track
- **Monthly Reduction**: Blue theme (`bg-blue-600`, `text-blue-600`)
- **Shorten Term**: Green theme (`bg-green-600`, `text-green-600`)
- **Single Track**: Blue theme (consistent)
- **Success/Contact**: Green theme (`bg-green-600`)
- **Warning/Error**: Orange/Red themes

### Button Sizes
- **Small**: `px-3 py-1.5 text-sm` (toggles)
- **Medium**: `py-3 text-lg` (standard CTAs)
- **Large**: `py-4 text-xl` (primary CTAs)
- **Extra Large**: `py-5 text-2xl` (Button component default)

### Interactive States
- **Hover**: Scale transforms, color changes, shadow enhancements
- **Active**: `active:scale-95` for tactile feedback
- **Loading**: Spinner icons with disabled state
- **Disabled**: `opacity-50 cursor-not-allowed`

### Mobile Optimizations
- **Sticky Footers**: Fixed positioning on mobile with `md:static` for desktop
- **Touch Targets**: Minimum 44px height for accessibility
- **Responsive Text**: `text-lg md:text-xl` scaling
- **Safe Areas**: Proper padding for mobile browsers

---

## ACCESSIBILITY FEATURES

### Keyboard Navigation
- All buttons are focusable with proper tab order
- Enter/Space key activation support
- Focus indicators with outline styles

### Screen Reader Support
- Proper button labels and ARIA attributes
- Icon buttons include `title` attributes
- Loading states announced with text changes

### Visual Indicators
- Clear hover and focus states
- Sufficient color contrast ratios
- Icon + text combinations for clarity
- Loading spinners for async operations

---

## TECHNICAL IMPLEMENTATION

### Button Components Used
1. **Custom Button Component** (`ui/Button.tsx`) - Primary CTAs
2. **Native HTML Buttons** - Toggles, secondary actions
3. **Interactive Cards** - Selection and scenario cards
4. **Icon Buttons** - Navigation and utility actions

### State Management
- Form context for step navigation
- Loading states for async operations
- Selection states for toggles and options
- Error states for validation feedback

### Styling Framework
- **Tailwind CSS** for utility-first styling
- **Dynamic Classes** for theme-based coloring
- **Responsive Design** with mobile-first approach
- **RTL Support** for Hebrew text direction

This comprehensive list covers all 100+ buttons across both calculator variants, admin interface, and all user interaction points in the application.
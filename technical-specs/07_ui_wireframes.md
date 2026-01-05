# HeaLoop.org UI Wireframes & Design Specifications

## Overview
This document provides detailed wireframe descriptions for all pages and components of the HeaLoop.org health insurance analysis platform. These wireframes serve as blueprints for the development team to build the user interface.

## Design Principles
- **Accessibility First**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Mobile-First Responsive**: Design for mobile, enhance for tablet/desktop
- **Progressive Disclosure**: Show information gradually to avoid overwhelming users
- **Clear CTAs**: Prominent call-to-action buttons guide users through the process
- **Trust Signals**: Display security badges, privacy notices, data protection info

## Color Scheme
- **Primary**: #2563EB (Blue 600) - Trust, healthcare, clarity
- **Secondary**: #10B981 (Green 500) - Success, savings, positive outcomes
- **Accent**: #F59E0B (Amber 500) - Warnings, important notices
- **Danger**: #EF4444 (Red 500) - Errors, critical warnings
- **Neutral**: #6B7280 (Gray 500) - Body text, secondary elements
- **Background**: #F9FAFB (Gray 50) - Page background
- **Surface**: #FFFFFF - Card backgrounds

## Typography
- **Headings**: Inter, sans-serif, bold
- **Body**: Inter, sans-serif, regular
- **Size Scale**: 12px, 14px (body), 16px, 18px, 24px, 32px, 48px

---

## Wireframe 1: Home Page / Landing

### Layout
```
+----------------------------------------------------------+
|  [Logo: HeaLoop]    [Home] [About] [FAQ] [Contact] [Login]|
+----------------------------------------------------------+
|                                                          |
|          HERO SECTION                                    |
|   "Find the Best Health Insurance for Your Situation"   |
|   "Discover hidden savings and optimize your coverage"  |
|                                                          |
|        [Start Free Analysis →]                           |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  HOW IT WORKS (3 columns)                                |
|  [Icon]  [Icon]  [Icon]                                  |
|  Answer   Get      Save                                  |
|  Questions Analysis Money                                |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  FEATURES                                                |
|  ✓ Subsidy Calculator                                    |
|  ✓ Plan Comparison Tool                                  |
|  ✓ Loophole Detection                                    |
|  ✓ Personalized Recommendations                          |
|                                                          |
+----------------------------------------------------------+
|  TESTIMONIALS (Carousel)                                 |
|  "Saved $3,000 on premiums..." - Jane D.                 |
+----------------------------------------------------------+
|  FOOTER                                                  |
|  [Links] [Privacy] [Terms] [Contact]                     |
+----------------------------------------------------------+
```

### Interactions
- Hero CTA button animates on hover
- "How It Works" icons animate on scroll into view
- Testimonials auto-rotate every 5 seconds
- Sticky header on scroll

### Mobile Adaptations
- Stack hero content vertically
- Single column for features
- Simplified navigation (hamburger menu)

---

## Wireframe 2: Analyzer Step 1 - Location

### Layout
```
+----------------------------------------------------------+
|  [Logo]                    Step 1 of 7: Location         |
+----------------------------------------------------------+
|  [Progress Bar: ████░░░░░░░░░░░░░░░░░░░░░] 14%         |
+----------------------------------------------------------+
|                                                          |
|  Where do you live?                                      |
|  Health insurance options vary by location.              |
|                                                          |
|  State *                                                 |
|  [Dropdown: Select a state ▼]                            |
|                                                          |
|  ZIP Code *                                              |
|  [Text Input: _____]                                     |
|                                                          |
|  County (Optional)                                       |
|  [Text Input: _______________]                           |
|                                                          |
|  [Help Icon] Why do we need this?                        |
|  [Tooltip: Insurance plans and subsidies vary by state]  |
|                                                          |
|                              [Continue →]                |
+----------------------------------------------------------+
```

### Validation
- State: Required, dropdown selection
- ZIP Code: Required, 5-digit format, validates against state
- County: Optional, free text

### Accessibility
- Form labels properly associated with inputs
- Error messages announced to screen readers
- Keyboard navigation through form fields

---

## Wireframe 3: Analyzer Step 2 - Household

### Layout
```
+----------------------------------------------------------+
|  [Logo]                  Step 2 of 7: Household          |
+----------------------------------------------------------+
|  [Progress Bar: ████████░░░░░░░░░░░░░░░] 28%           |
+----------------------------------------------------------+
|                                                          |
|  Who's in your household?                                |
|  Add everyone who needs coverage.                        |
|                                                          |
|  +--------------------------------------------------+   |
|  | Member 1                               [Remove]   |   |
|  |                                                   |   |
|  | Relationship: [Self ▼]                            |   |
|  | Date of Birth: [MM/DD/YYYY]                       |   |
|  | Gender: [Select ▼]                                |   |
|  | ☐ Tobacco User                                    |   |
|  | ☐ Has Disability                                  |   |
|  | ☐ Pregnant                                        |   |
|  +--------------------------------------------------+   |
|                                                          |
|  [+ Add Another Member]                                  |
|                                                          |
|  [← Back]                      [Continue →]              |
+----------------------------------------------------------+
```

### Interactions
- "Add Member" button adds a new member card
- "Remove" button (hidden for first member)
- Date picker for DOB with age calculation
- Conditional fields (e.g., Pregnant only for females)

### Validation
- At least 1 member required
- Date of Birth required for each member
- Age calculated and displayed

---

## Wireframe 4: Analyzer Step 3 - Income

### Layout
```
+----------------------------------------------------------+
|  [Logo]                   Step 3 of 7: Income            |
+----------------------------------------------------------+
|  [Progress Bar: ████████████░░░░░░░░░░] 42%            |
+----------------------------------------------------------+
|                                                          |
|  What's your household income?                           |
|  Include all sources of income for everyone.             |
|                                                          |
|  +--------------------------------------------------+   |
|  | Income Source 1                        [Remove]   |   |
|  |                                                   |   |
|  | Source Type: [Employment ▼]                       |   |
|  | Annual Amount: [$______]                          |   |
|  | Frequency: [Annual ▼]                             |   |
|  | Employer: [____________]                          |   |
|  +--------------------------------------------------+   |
|                                                          |
|  [+ Add Income Source]                                   |
|                                                          |
|  Total Household Income: $65,000/year                    |
|                                                          |
|  [← Back]                      [Continue →]              |
+----------------------------------------------------------+
```

### Calculations
- Automatically sum all income sources
- Convert frequencies to annual amounts
- Display running total

### Help Text
- "Why annual income?" tooltip
- Examples of income sources
- Link to MAGI calculator

---

## Wireframe 5: Analyzer Step 4 - Employment Coverage

### Layout
```
+----------------------------------------------------------+
|  [Logo]               Step 4 of 7: Employment            |
+----------------------------------------------------------+
|  [Progress Bar: ████████████████░░░░░░] 56%            |
+----------------------------------------------------------+
|                                                          |
|  Employer Coverage                                       |
|  Do you have access to employer-sponsored insurance?     |
|                                                          |
|  ○ Yes, I have employer coverage available               |
|  ● No employer coverage                                  |
|                                                          |
|  [Conditional Panel - if Yes selected]                   |
|  +--------------------------------------------------+   |
|  | Coverage Details                                  |   |
|  |                                                   |   |
|  | Monthly Cost for Employee: [$______]              |   |
|  | Monthly Cost for Family: [$______]                |   |
|  | ☐ Covers Spouse                                   |   |
|  | ☐ Covers Children                                 |   |
|  |                                                   |   |
|  | Plan Name: [____________]                         |   |
|  +--------------------------------------------------+   |
|                                                          |
|  [← Back]                      [Continue →]              |
+----------------------------------------------------------+
```

### Logic
- Panel only shows if "Yes" selected
- Calculate affordability based on income
- Warn if employer coverage may affect subsidy eligibility

---

## Wireframe 6: Analyzer Step 5 - Current Coverage

### Layout
```
+----------------------------------------------------------+
|  [Logo]            Step 5 of 7: Current Coverage         |
+----------------------------------------------------------+
|  [Progress Bar: ████████████████████░░] 70%            |
+----------------------------------------------------------+
|                                                          |
|  Current Coverage Status                                 |
|                                                          |
|  Do you currently have health insurance?                 |
|  ● Yes  ○ No                                             |
|                                                          |
|  [Conditional if Yes]                                    |
|  Current Coverage Type: [Marketplace ▼]                  |
|                                                          |
|  Are you losing your current coverage?                   |
|  ○ Yes  ● No                                             |
|                                                          |
|  [Conditional if losing coverage]                        |
|  Loss of Coverage Date: [MM/DD/YYYY]                     |
|  Reason: [Job Loss ▼]                                    |
|                                                          |
|  [Info Box]                                              |
|  💡 Loss of coverage qualifies you for a Special         |
|     Enrollment Period (60 days)                          |
|                                                          |
|  [← Back]                      [Continue →]              |
+----------------------------------------------------------+
```

### Special Enrollment Logic
- Detect qualifying life events
- Calculate SEP dates
- Display enrollment windows

---

## Wireframe 7: Analyzer Step 6 - Healthcare Needs

### Layout
```
+----------------------------------------------------------+
|  [Logo]           Step 6 of 7: Healthcare Needs          |
+----------------------------------------------------------+
|  [Progress Bar: ████████████████████████░] 84%         |
+----------------------------------------------------------+
|                                                          |
|  Healthcare Needs                                        |
|  Help us understand your healthcare requirements.        |
|                                                          |
|  How often do you see a doctor?                          |
|  [Rarely ▼]                                              |
|                                                          |
|  ☐ Have chronic conditions                               |
|  ☐ Need regular prescriptions                            |
|  ☐ See specialists regularly                             |
|  ☐ Planning pregnancy                                    |
|  ☐ Need mental health services                           |
|                                                          |
|  Preferred Providers (Optional)                          |
|  [____________]                                          |
|  [+ Add Provider]                                        |
|                                                          |
|  Current Medications (Optional)                          |
|  [____________]                                          |
|  [+ Add Medication]                                      |
|                                                          |
|  [← Back]                      [Continue →]              |
+----------------------------------------------------------+
```

### Personalization
- Questions adapt based on household members
- Pregnancy option only for females of childbearing age
- Medication list for formulary checking

---

## Wireframe 8: Analyzer Step 7 - Preferences

### Layout
```
+----------------------------------------------------------+
|  [Logo]              Step 7 of 7: Preferences            |
+----------------------------------------------------------+
|  [Progress Bar: ████████████████████████████] 100%     |
+----------------------------------------------------------+
|                                                          |
|  Your Preferences                                        |
|  What's most important to you?                           |
|                                                          |
|  Plan Type Preferences:                                  |
|  ☑ HMO    ☑ PPO    ☐ EPO    ☐ POS                       |
|                                                          |
|  Metal Level Preferences:                                |
|  ☐ Bronze  ☑ Silver  ☑ Gold  ☐ Platinum                 |
|                                                          |
|  Budget:                                                 |
|  Maximum Monthly Premium: [$______]                      |
|                                                          |
|  Priorities:                                             |
|  ☑ Low monthly premium                                   |
|  ☐ Low deductible                                        |
|  ☐ Low out-of-pocket maximum                             |
|  ☐ Specific provider network                             |
|                                                          |
|  [← Back]                [Complete Analysis →]           |
|                                                          |
|  [Loading Animation during analysis]                     |
+----------------------------------------------------------+
```

### Analysis Phase
- Show loading spinner with progress messages
- "Calculating subsidies..."
- "Comparing plans..."
- "Identifying savings opportunities..."
- Redirect to results page when complete

---

## Wireframe 9: Results Page - Header

### Layout
```
+----------------------------------------------------------+
|  [Logo]    [My Account] [Save Results] [Start New]       |
+----------------------------------------------------------+
|                                                          |
|  YOUR HEALTH INSURANCE ANALYSIS                          |
|  For: John & Jane Smith household (2 adults, 1 child)   |
|  Location: Los Angeles County, CA                        |
|  Annual Income: $65,000 (217% FPL)                       |
|                                                          |
|  🎉 ESTIMATED ANNUAL SAVINGS: $4,320                     |
|                                                          |
|  [Download PDF] [Email Results] [Share]                  |
|                                                          |
+----------------------------------------------------------+
```

### Sticky Navigation
- Jump links to sections:
  - Subsidy Info
  - Recommended Plans
  - Cost Scenarios
  - Savings Opportunities
  - Warnings

---

## Wireframe 10: Results Page - Subsidy Section

### Layout
```
+----------------------------------------------------------+
|  SUBSIDY ELIGIBILITY                                     |
+----------------------------------------------------------+
|                                                          |
|  ✅ You Qualify for Premium Tax Credits!                 |
|                                                          |
|  Monthly Credit: $360                                    |
|  Annual Credit: $4,320                                   |
|                                                          |
|  Cost-Sharing Reduction: None                            |
|  (Your income is above 250% FPL)                         |
|                                                          |
|  [Info Box]                                              |
|  💡 Your subsidies are based on 217% of Federal          |
|     Poverty Level for a household of 3                   |
|                                                          |
|  [Learn More About Subsidies]                            |
|                                                          |
+----------------------------------------------------------+
```

### Conditional Display
- Show different messages based on eligibility
- Medicaid-eligible: Show state Medicaid info
- CHIP-eligible: Show CHIP enrollment link
- No subsidy: Explain why and show alternatives

---

## Wireframe 11: Results Page - Recommended Plans

### Layout
```
+----------------------------------------------------------+
|  RECOMMENDED PLANS FOR YOU                               |
|  Sorted by: [Best Value ▼]  Filter: [All ▼]             |
+----------------------------------------------------------+
|                                                          |
|  [Plan Card 1 - HIGHLIGHTED]                             |
|  +--------------------------------------------------+   |
|  | 🏆 BEST MATCH                                     |   |
|  | Kaiser Permanente Silver 70 HMO                   |   |
|  |                                                   |   |
|  | $187/month  (after $360 subsidy)                  |   |
|  | Full price: $547/month                            |   |
|  |                                                   |   |
|  | Deductible: $2,500    OOP Max: $8,200             |   |
|  | Primary Care: $30      Specialist: $60            |   |
|  |                                                   |   |
|  | ✓ Covers your preferred providers                 |   |
|  | ✓ Includes your medications                       |   |
|  | ✓ Large network                                   |   |
|  |                                                   |   |
|  | Match Score: 95%                                  |   |
|  |                                                   |   |
|  | [View Details] [Compare] [Enroll →]               |   |
|  +--------------------------------------------------+   |
|                                                          |
|  [Plan Card 2]                                           |
|  [Plan Card 3]                                           |
|  ...                                                     |
|                                                          |
|  [Show More Plans]                                       |
+----------------------------------------------------------+
```

### Plan Card Features
- Color-coded by metal level
- Quick stats always visible
- Expandable details section
- Compare checkbox for side-by-side comparison

---

## Wireframe 12: Results Page - Plan Comparison

### Layout
```
+----------------------------------------------------------+
|  COMPARE PLANS SIDE-BY-SIDE                              |
+----------------------------------------------------------+
|              Plan A         Plan B         Plan C        |
|  +-----------------------------------------------+       |
|  | Monthly   $187          $156          $213    |       |
|  | Premium                                       |       |
|  +-----------------------------------------------+       |
|  | Deduct.   $2,500        $5,000        $1,500  |       |
|  +-----------------------------------------------+       |
|  | OOP Max   $8,200        $8,700        $7,500  |       |
|  +-----------------------------------------------+       |
|  | Primary   $30           $40           $25     |       |
|  | Care                                          |       |
|  +-----------------------------------------------+       |
|  | Network   Large         Medium        Large   |       |
|  +-----------------------------------------------+       |
|                                                          |
|  [Save Comparison] [Print] [Email]                       |
+----------------------------------------------------------+
```

### Interactions
- Sticky header on scroll
- Highlight differences
- Toggle to show/hide similar features

---

## Wireframe 13: Results Page - Cost Scenarios

### Layout
```
+----------------------------------------------------------+
|  COST SCENARIOS                                          |
|  What you'll likely pay in different situations          |
+----------------------------------------------------------+
|                                                          |
|  [Tabs: Low Usage | Average | High Usage]                |
|                                                          |
|  LOW USAGE SCENARIO                                      |
|  2-3 doctor visits, no major medical events              |
|                                                          |
|  Annual Cost Breakdown:                                  |
|  Premiums:        $2,244 ($187/mo × 12)                  |
|  Deductible:      $0    (not met)                        |
|  Copays:          $90   (3 visits × $30)                 |
|  Prescriptions:   $120  (generic drugs)                  |
|  ─────────────────────────────────                       |
|  Total:           $2,454                                 |
|                                                          |
|  [View Other Scenarios]                                  |
+----------------------------------------------------------+
```

### Scenario Types
1. **Low Usage**: Minimal care, preventive only
2. **Average Usage**: Regular checkups, some prescriptions
3. **High Usage**: Chronic condition management, specialists

---

## Wireframe 14: Results Page - Savings Opportunities

### Layout
```
+----------------------------------------------------------+
|  SAVINGS OPPORTUNITIES & STRATEGIES                      |
+----------------------------------------------------------+
|                                                          |
|  [Opportunity Card 1 - HIGH PRIORITY]                    |
|  +--------------------------------------------------+   |
|  | 💰 Choose Silver Plan for Maximum Value           |   |
|  |                                                   |   |
|  | With your income level, Silver plans offer the    |   |
|  | best actuarial value. Don't be tempted by Bronze  |   |
|  | plans - you'll pay more out-of-pocket.            |   |
|  |                                                   |   |
|  | Potential Savings: $1,500/year                    |   |
|  | Action: Select a Silver plan                      |   |
|  | Priority: HIGH                                    |   |
|  |                                                   |   |
|  | [Learn More]                                      |   |
|  +--------------------------------------------------+   |
|                                                          |
|  [Opportunity Card 2 - MEDIUM PRIORITY]                  |
|  [Opportunity Card 3 - LOW PRIORITY]                     |
|                                                          |
+----------------------------------------------------------+
```

### Opportunity Types
- Plan selection optimization
- Timing strategies
- Program eligibility
- Tax optimization

---

## Wireframe 15: Results Page - Loopholes & Strategies

### Layout
```
+----------------------------------------------------------+
|  LOOPHOLES & OPTIMIZATION STRATEGIES                     |
|  Legal ways to maximize your benefits                    |
+----------------------------------------------------------+
|                                                          |
|  [Strategy Card]                                         |
|  +--------------------------------------------------+   |
|  | 🔍 Income Cliff Strategy                          |   |
|  |                                                   |   |
|  | Your income is at 217% FPL. If your income rises  |   |
|  | above 400% FPL, you'll lose ALL subsidies ($4,320)|   |
|  |                                                   |   |
|  | Consider:                                         |   |
|  | • Maximizing 401(k) contributions to lower MAGI   |   |
|  | • HSA contributions (if eligible)                 |   |
|  | • IRA contributions                               |   |
|  |                                                   |   |
|  | Potential Impact: Maintain $4,320/year subsidy    |   |
|  |                                                   |   |
|  | Requirements:                                     |   |
|  | ✓ Increase pre-tax retirement contributions       |   |
|  | ✓ Keep MAGI below $52,000                         |   |
|  |                                                   |   |
|  | Risks: None (legal tax optimization)              |   |
|  |                                                   |   |
|  | [Show Detailed Strategy]                          |   |
|  +--------------------------------------------------+   |
|                                                          |
+----------------------------------------------------------+
```

### Strategy Elements
- Clear description
- Requirements checklist
- Risk assessment
- Potential savings
- Action steps

---

## Wireframe 16: Results Page - Warnings

### Layout
```
+----------------------------------------------------------+
|  IMPORTANT NOTICES & WARNINGS                            |
+----------------------------------------------------------+
|                                                          |
|  [Warning Card - CRITICAL]                               |
|  +--------------------------------------------------+   |
|  | ⚠️ ENROLLMENT DEADLINE APPROACHING                |   |
|  |                                                   |   |
|  | Open Enrollment ends in 12 days (Jan 15, 2024)   |   |
|  |                                                   |   |
|  | Action Required: Enroll before deadline or wait   |   |
|  | until next Open Enrollment (Nov 1, 2024)          |   |
|  |                                                   |   |
|  | [Start Enrollment Process]                        |   |
|  +--------------------------------------------------+   |
|                                                          |
|  [Warning Card - WARNING]                                |
|  +--------------------------------------------------+   |
|  | ⚠️ Provider Network Check                         |   |
|  |                                                   |   |
|  | Your preferred doctor may not be in all networks. |   |
|  | Always verify provider participation before       |   |
|  | enrolling.                                        |   |
|  |                                                   |   |
|  | [Check Provider Directory]                        |   |
|  +--------------------------------------------------+   |
|                                                          |
+----------------------------------------------------------+
```

### Warning Levels
- **Critical** (Red): Immediate action required
- **Warning** (Amber): Important consideration
- **Info** (Blue): Helpful information

---

## Wireframe 17: Learning Center

### Layout
```
+----------------------------------------------------------+
|  LEARNING CENTER                                         |
+----------------------------------------------------------+
|  [Search: ________________] [🔍]                         |
|                                                          |
|  Popular Topics:                                         |
|  [ACA Basics] [Subsidies] [Medicaid] [COBRA] [SEP]      |
|                                                          |
|  Categories:                                             |
|                                                          |
|  [Card] Getting Started                                  |
|        • What is the Health Insurance Marketplace?       |
|        • Understanding Metal Levels                      |
|        • Glossary of Terms                               |
|                                                          |
|  [Card] Subsidies & Financial Help                       |
|        • Premium Tax Credits Explained                   |
|        • Cost-Sharing Reductions                         |
|        • Income Requirements                             |
|                                                          |
|  [Card] Special Situations                               |
|        • COBRA vs. Marketplace                           |
|        • Self-Employed Options                           |
|        • Retirement Before Medicare                      |
|                                                          |
+----------------------------------------------------------+
```

### Content Types
- Articles (long-form)
- FAQs (Q&A format)
- Guides (step-by-step)
- Videos (embedded)
- Infographics

---

## Wireframe 18: Article Page

### Layout
```
+----------------------------------------------------------+
|  [Logo] [Home] [Learning Center] [My Account]            |
+----------------------------------------------------------+
|                                                          |
|  LEARNING CENTER > Subsidies                             |
|                                                          |
|  Premium Tax Credits Explained                           |
|  Last Updated: January 1, 2024                           |
|  Reading Time: 5 minutes                                 |
|                                                          |
|  [Article Content]                                       |
|  ...paragraphs...                                        |
|  ...images...                                            |
|  ...examples...                                          |
|                                                          |
|  Was this helpful?                                       |
|  [👍 Yes] [👎 No]                                        |
|                                                          |
|  RELATED ARTICLES                                        |
|  • Cost-Sharing Reductions                               |
|  • Income Calculation Tips                               |
|  • Subsidy Eligibility Calculator                        |
|                                                          |
+----------------------------------------------------------+
```

### Article Features
- Table of contents for long articles
- Jump links to sections
- Embedded calculators/tools
- Related articles
- Helpful voting
- Share buttons

---

## Wireframe 19: FAQ Page

### Layout
```
+----------------------------------------------------------+
|  FREQUENTLY ASKED QUESTIONS                              |
+----------------------------------------------------------+
|  [Search FAQs: ________________] [🔍]                    |
|                                                          |
|  Categories: [All] [Subsidies] [Enrollment] [Coverage]   |
|                                                          |
|  ▼ How do I know if I qualify for subsidies?            |
|     You qualify for premium tax credits if your          |
|     household income is between 100% and 400% of the     |
|     Federal Poverty Level and you don't have access      |
|     to affordable employer coverage...                   |
|     [Read More]                                          |
|                                                          |
|  ▶ What if my income changes during the year?           |
|                                                          |
|  ▶ Can I switch plans mid-year?                         |
|                                                          |
|  ▶ What is a Special Enrollment Period?                 |
|                                                          |
|  Didn't find your answer?                                |
|  [Contact Support] [Ask a Question]                      |
|                                                          |
+----------------------------------------------------------+
```

### FAQ Features
- Accordion/expandable answers
- Search functionality
- Category filtering
- "Was this helpful?" voting
- Related FAQs

---

## Wireframe 20: Mobile Responsive Views

### Mobile Stack Pattern
```
+------------------+
| [☰] Logo         |
+------------------+
|                  |
| Content          |
| Stacks           |
| Vertically       |
|                  |
| Single           |
| Column           |
|                  |
| Touch-           |
| Friendly         |
| Buttons          |
|                  |
| [Large CTA]      |
|                  |
+------------------+
| Footer           |
+------------------+
```

### Mobile Considerations
- **Navigation**: Hamburger menu
- **Forms**: Larger input fields (min 44px touch target)
- **Cards**: Stack vertically
- **Tables**: Convert to cards or horizontal scroll
- **Progress**: Simplified progress bar
- **Buttons**: Full-width on mobile
- **Typography**: Slightly larger base size (16px)

---

## Tablet Responsive Views

### Tablet Layout
- **Portrait**: Similar to mobile, wider cards
- **Landscape**: 2-column layouts where appropriate
- **Navigation**: May show full menu or hybrid
- **Forms**: 2-column for related fields
- **Comparison**: Side-by-side for 2 items

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard**: All interactive elements keyboard accessible
- **Focus**: Visible focus indicators
- **Labels**: All form inputs properly labeled
- **Alt Text**: Descriptive alt text for images
- **Headings**: Proper heading hierarchy
- **ARIA**: ARIA labels where needed
- **Screen Readers**: Announcements for dynamic content

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate
- Escape to close modals
- Arrow keys for dropdowns/carousels

---

## Component States

### Button States
- **Default**: Primary color, solid
- **Hover**: Slightly darker, subtle scale
- **Active**: Pressed appearance
- **Disabled**: Grayed out, no pointer
- **Loading**: Spinner inside button

### Input States
- **Default**: Gray border
- **Focus**: Blue border, shadow
- **Error**: Red border, error message below
- **Success**: Green border, checkmark
- **Disabled**: Gray background

### Card States
- **Default**: White background, subtle shadow
- **Hover**: Elevated shadow (plans, articles)
- **Selected**: Blue border, highlighted
- **Disabled**: Grayed out, reduced opacity

---

## Animation Guidelines

### Micro-interactions
- **Page Transitions**: 200ms fade
- **Button Hover**: 150ms ease-out
- **Card Hover**: 200ms transform
- **Loading Spinners**: Continuous rotation
- **Progress Bars**: Smooth fill animation

### Loading States
- Skeleton screens for content loading
- Spinners for actions
- Progress bars for multi-step processes

---

## Responsive Breakpoints

- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px - 1279px
- **Large Desktop**: 1280px+

---

## Print Styles

### Results PDF
- Remove navigation
- Single column layout
- Include all key information
- Page breaks at logical sections
- Black and white friendly
- Include disclaimer footer

---

## Error States

### 404 Page
- Friendly message
- Link back to home
- Search functionality
- Popular links

### 500 Error
- "Something went wrong" message
- Retry button
- Contact support link
- Error ID for reference

### Form Errors
- Inline validation
- Error summary at top
- Focus first error
- Clear error messages

---

## Notes for Developers

1. **Progressive Enhancement**: Core functionality works without JavaScript
2. **Performance**: Lazy load images, code splitting
3. **SEO**: Semantic HTML, meta tags, structured data
4. **Analytics**: Track user flow, drop-off points
5. **Testing**: Cross-browser, accessibility, mobile devices
6. **Security**: Input validation, CSRF protection, rate limiting

---

This wireframe document serves as the blueprint for the HeaLoop.org platform. All components should be developed with accessibility, usability, and performance in mind.

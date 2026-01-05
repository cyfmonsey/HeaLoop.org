// =====================================================
// HeaLoop.org Data Validation Rules
// Comprehensive validation schemas for all data inputs
// =====================================================

import { z } from 'zod'; // Using Zod for TypeScript-first schema validation

// =====================================================
// COMMON VALIDATION PATTERNS
// =====================================================

const emailSchema = z.string().email('Invalid email address').max(255);

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

const stateCodeSchema = z
  .string()
  .length(2, 'State code must be 2 characters')
  .regex(/^[A-Z]{2}$/, 'State code must be uppercase letters')
  .refine(
    (val) => {
      const validStates = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
      ];
      return validStates.includes(val);
    },
    { message: 'Invalid US state code' }
  );

const zipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789');

const phoneSchema = z
  .string()
  .regex(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Invalid phone number format');

const uuidSchema = z.string().uuid('Invalid UUID format');

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const currencySchema = z
  .number()
  .nonnegative('Amount must be non-negative')
  .finite('Amount must be finite')
  .refine((val) => Number.isFinite(val) && val >= 0 && val <= 999999999.99, {
    message: 'Invalid currency amount',
  });

// =====================================================
// USER & AUTHENTICATION
// =====================================================

export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: phoneSchema.optional().nullable(),
  dateOfBirth: dateSchema.optional().nullable(),
  zipCode: zipCodeSchema.optional().nullable(),
  state: stateCodeSchema.optional().nullable(),
  county: z.string().max(100).optional().nullable(),
  preferredLanguage: z.enum(['en', 'es', 'zh', 'vi', 'ko']).default('en'),
  accessibilityNeeds: z
    .object({
      screenReader: z.boolean().optional(),
      highContrast: z.boolean().optional(),
      largeFonts: z.boolean().optional(),
      keyboardNavigation: z.boolean().optional(),
      other: z.string().max(500).optional(),
    })
    .optional(),
  notificationPreferences: z
    .object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      inApp: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
      productUpdates: z.boolean().optional(),
      analysisSummaries: z.boolean().optional(),
    })
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// =====================================================
// HOUSEHOLD & MEMBERS
// =====================================================

export const createHouseholdSchema = z
  .object({
    name: z.string().max(255).optional(),
    size: z.number().int().min(1, 'Household must have at least 1 member').max(20, 'Maximum household size is 20'),
    zipCode: zipCodeSchema.optional(),
    state: stateCodeSchema,
    county: z.string().max(100).optional(),
    isPrimary: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // If size is provided, it should match the number of members added
      return true; // This will be validated server-side with actual member count
    },
    { message: 'Household size must match number of members' }
  );

export const updateHouseholdSchema = createHouseholdSchema.partial();

export const householdMemberSchema = z
  .object({
    relationship: z.enum(['self', 'spouse', 'child', 'parent', 'other']),
    firstName: z.string().max(100).optional(),
    dateOfBirth: dateSchema,
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    isTobaccoUser: z.boolean().default(false),
    hasDisability: z.boolean().default(false),
    isPregnant: z.boolean().default(false),
    medicalConditions: z
      .array(
        z.object({
          condition: z.string().max(200),
          diagnosisDate: dateSchema.optional(),
          isChronic: z.boolean().default(false),
          requiresSpecialist: z.boolean().default(false),
          medications: z.array(z.string().max(200)).optional(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      // Pregnancy only applicable to females
      if (data.isPregnant && data.gender && data.gender !== 'female') {
        return false;
      }
      return true;
    },
    { message: 'Pregnancy status only applicable to females', path: ['isPregnant'] }
  )
  .refine(
    (data) => {
      // Validate age from date of birth
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    },
    { message: 'Invalid date of birth', path: ['dateOfBirth'] }
  );

// =====================================================
// INCOME SOURCES
// =====================================================

export const incomeSourceSchema = z
  .object({
    memberId: uuidSchema.optional(),
    sourceType: z.enum(['employment', 'self_employment', 'social_security', 'retirement', 'investment', 'rental', 'other']),
    employerName: z.string().max(255).optional(),
    annualAmount: currencySchema,
    frequency: z.enum(['annual', 'monthly', 'biweekly', 'weekly']).default('annual'),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    isCobraEligible: z.boolean().default(false),
    hasEmployerCoverage: z.boolean().default(false),
    employerCoverageDetails: z
      .object({
        planName: z.string().max(255).optional(),
        monthlyCost: currencySchema.optional(),
        employerContribution: currencySchema.optional(),
        coverageType: z.enum(['individual', 'family']).optional(),
        isAffordable: z.boolean().optional(),
        isMinimumValue: z.boolean().optional(),
        coversSpouse: z.boolean().optional(),
        coversChildren: z.boolean().optional(),
        effectiveDate: dateSchema.optional(),
        terminationDate: dateSchema.optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // If employer coverage exists, require employer name
      if (data.hasEmployerCoverage && !data.employerName) {
        return false;
      }
      return true;
    },
    { message: 'Employer name required when employer coverage is available', path: ['employerName'] }
  )
  .refine(
    (data) => {
      // End date must be after start date
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    { message: 'End date must be after start date', path: ['endDate'] }
  );

// =====================================================
// INSURANCE PLANS
// =====================================================

export const searchPlansSchema = z.object({
  state: stateCodeSchema.optional(),
  county: z.string().max(100).optional(),
  zipCode: zipCodeSchema.optional(),
  metalLevel: z.array(z.enum(['Bronze', 'Silver', 'Gold', 'Platinum', 'Catastrophic'])).optional(),
  planType: z.array(z.enum(['HMO', 'PPO', 'EPO', 'POS'])).optional(),
  maxPremium: currencySchema.optional(),
  issuerId: uuidSchema.optional(),
  planYear: z.number().int().min(2014).max(2100).optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(30),
  sortBy: z.enum(['premium', 'deductible', 'oopMax', 'name']).default('premium'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// =====================================================
// ANALYSIS SESSION
// =====================================================

export const startAnalysisSchema = z.object({
  householdId: uuidSchema,
});

export const updateAnalysisSessionSchema = z.object({
  currentStep: z.number().int().min(1).max(7).optional(),
  sessionStatus: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
  sessionData: z
    .object({
      step1: z
        .object({
          state: stateCodeSchema,
          zipCode: zipCodeSchema,
          county: z.string().max(100).optional(),
        })
        .optional(),
      step2: z
        .object({
          householdSize: z.number().int().min(1).max(20),
          members: z.array(householdMemberSchema),
        })
        .optional(),
      step3: z
        .object({
          totalIncome: currencySchema,
          incomeSources: z.array(incomeSourceSchema),
        })
        .optional(),
      step4: z
        .object({
          hasEmployerCoverage: z.boolean(),
          employerCoverageDetails: z.array(z.any()).optional(),
        })
        .optional(),
      step5: z
        .object({
          hasCurrentCoverage: z.boolean(),
          currentCoverageType: z.string().max(100).optional(),
          isLosingCoverage: z.boolean(),
          lossOfCoverageDate: dateSchema.optional(),
        })
        .optional(),
      step6: z
        .object({
          healthcareNeeds: z.object({
            frequencyOfCare: z.enum(['rarely', 'occasionally', 'regularly', 'frequently']),
            hasChronicConditions: z.boolean(),
            needsSpecialistCare: z.boolean(),
            planningPregnancy: z.boolean(),
            needsMentalHealthCare: z.boolean(),
            needsPrescriptions: z.boolean(),
          }),
          preferredProviders: z.array(z.string().max(200)).optional(),
          prescriptionMedications: z.array(z.string().max(200)).optional(),
        })
        .optional(),
      step7: z
        .object({
          preferences: z.object({
            prioritizeLowPremium: z.boolean().optional(),
            prioritizeLowDeductible: z.boolean().optional(),
            preferredPlanTypes: z.array(z.enum(['HMO', 'PPO', 'EPO', 'POS'])).optional(),
            preferredMetalLevels: z.array(z.enum(['Bronze', 'Silver', 'Gold', 'Platinum'])).optional(),
            maxMonthlyPremium: currencySchema.optional(),
            includeHSAPlans: z.boolean().optional(),
          }),
        })
        .optional(),
    })
    .optional(),
});

// =====================================================
// SUBSIDIES
// =====================================================

export const calculateSubsidySchema = z.object({
  householdId: uuidSchema,
  taxYear: z.number().int().min(2014).max(2100).optional(),
});

export const getFPLSchema = z.object({
  year: z.number().int().min(2014).max(2100),
  householdSize: z.number().int().min(1).max(20),
  state: stateCodeSchema.optional(),
});

// =====================================================
// SAVED COMPARISONS
// =====================================================

export const saveComparisonSchema = z.object({
  analysisResultId: uuidSchema,
  comparisonName: z.string().max(255).optional(),
  planIds: z.array(uuidSchema).min(2, 'At least 2 plans required for comparison').max(5, 'Maximum 5 plans can be compared'),
  notes: z.string().max(2000).optional(),
});

// =====================================================
// LEARNING CENTER
// =====================================================

export const searchLearningContentSchema = z.object({
  contentType: z.enum(['article', 'faq', 'guide', 'glossary_term', 'video', 'infographic']).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
  query: z.string().max(200).optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(30),
});

// =====================================================
// FEEDBACK
// =====================================================

export const submitFeedbackSchema = z.object({
  feedbackType: z.enum(['bug_report', 'feature_request', 'general_feedback', 'complaint', 'praise']),
  category: z.string().max(100).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  rating: z.number().int().min(1).max(5).optional(),
  pageUrl: z.string().url().optional(),
  contactEmail: emailSchema.optional(),
});

// =====================================================
// ADMIN
// =====================================================

export const createRuleSchema = z.object({
  ruleName: z.string().min(1).max(255),
  ruleCategory: z.enum(['eligibility', 'subsidy', 'enrollment', 'coverage', 'tax', 'compliance', 'loophole']),
  description: z.string().max(1000).optional(),
  state: stateCodeSchema.optional(),
  ruleLogic: z.object({
    conditions: z.array(
      z.object({
        field: z.string(),
        operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'between']),
        value: z.any(),
        logicalOperator: z.enum(['AND', 'OR']).default('AND'),
      })
    ),
    action: z.object({
      type: z.string(),
      result: z.any(),
      message: z.string().optional(),
    }),
    exceptions: z
      .array(
        z.object({
          condition: z.any(),
          overrideAction: z.any().optional(),
        })
      )
      .optional(),
  }),
  effectiveDate: dateSchema,
  endDate: dateSchema.optional(),
  priority: z.number().int().min(0).max(100).default(50),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'deleted']),
  reason: z.string().max(500).optional(),
});

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validate data against a schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

/**
 * Express middleware for validating request body
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = validate(schema, req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VAL_001',
          message: 'Validation failed',
          details: result.errors,
        },
      });
    }
    req.body = result.data;
    next();
  };
}

/**
 * Express middleware for validating query parameters
 */
export function validateQuery(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = validate(schema, req.query);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VAL_001',
          message: 'Validation failed',
          details: result.errors,
        },
      });
    }
    req.query = result.data;
    next();
  };
}

/**
 * Express middleware for validating URL parameters
 */
export function validateParams(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = validate(schema, req.params);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VAL_001',
          message: 'Validation failed',
          details: result.errors,
        },
      });
    }
    req.params = result.data;
    next();
  };
}

// =====================================================
// CUSTOM VALIDATORS
// =====================================================

/**
 * Validate Social Security Number (SSN)
 */
export const ssnSchema = z
  .string()
  .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX')
  .refine((val) => !val.startsWith('000'), 'Invalid SSN')
  .refine((val) => !val.startsWith('666'), 'Invalid SSN')
  .refine((val) => !val.startsWith('9'), 'Invalid SSN');

/**
 * Validate tax year
 */
export function validateTaxYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 2014 && year <= currentYear + 1;
}

/**
 * Validate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Validate income is within reasonable bounds
 */
export function validateIncome(income: number): boolean {
  return income >= 0 && income <= 10000000; // Max $10M annual income
}

/**
 * Validate household composition
 */
export function validateHouseholdComposition(members: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Must have at least one 'self' relationship
  const selfCount = members.filter((m) => m.relationship === 'self').length;
  if (selfCount === 0) {
    errors.push('Household must have at least one member with relationship "self"');
  }
  if (selfCount > 1) {
    errors.push('Household can only have one member with relationship "self"');
  }

  // Spouse can only have one
  const spouseCount = members.filter((m) => m.relationship === 'spouse').length;
  if (spouseCount > 1) {
    errors.push('Household can only have one spouse');
  }

  // Children should be under 26 (for ACA dependency)
  members
    .filter((m) => m.relationship === 'child')
    .forEach((child, index) => {
      const age = calculateAge(child.dateOfBirth);
      if (age > 26) {
        errors.push(`Child ${index + 1} is over 26 years old and may not qualify as dependent`);
      }
    });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =====================================================
// SANITIZATION
// =====================================================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input.replace(/[<>'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case "'":
        return '&#39;';
      case '"':
        return '&quot;';
      default:
        return char;
    }
  });
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, ''); // Remove all non-digit characters
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  registerUserSchema,
  loginSchema,
  updateUserProfileSchema,
  changePasswordSchema,
  createHouseholdSchema,
  updateHouseholdSchema,
  householdMemberSchema,
  incomeSourceSchema,
  searchPlansSchema,
  startAnalysisSchema,
  updateAnalysisSessionSchema,
  calculateSubsidySchema,
  getFPLSchema,
  saveComparisonSchema,
  searchLearningContentSchema,
  submitFeedbackSchema,
  createRuleSchema,
  updateUserStatusSchema,
  validate,
  validateBody,
  validateQuery,
  validateParams,
};

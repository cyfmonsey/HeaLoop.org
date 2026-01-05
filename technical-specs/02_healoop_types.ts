// =====================================================
// HeaLoop.org TypeScript Type Definitions
// Complete type system for health insurance analysis platform
// =====================================================

// =====================================================
// USER & AUTHENTICATION TYPES
// =====================================================

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerified: boolean;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  dateOfBirth?: Date;
  zipCode?: string;
  state?: string;
  county?: string;
  preferredLanguage: string;
  accessibilityNeeds?: AccessibilityNeeds;
  notificationPreferences?: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessibilityNeeds {
  screenReader?: boolean;
  highContrast?: boolean;
  largeFonts?: boolean;
  keyboardNavigation?: boolean;
  other?: string;
}

export interface NotificationPreferences {
  email?: boolean;
  sms?: boolean;
  inApp?: boolean;
  marketingEmails?: boolean;
  productUpdates?: boolean;
  analysisSummaries?: boolean;
}

// =====================================================
// HOUSEHOLD & MEMBER TYPES
// =====================================================

export interface Household {
  id: string;
  userId: string;
  name?: string;
  size: number;
  zipCode?: string;
  state: string;
  county?: string;
  isPrimary: boolean;
  members?: HouseholdMember[];
  incomeSources?: IncomeSource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'other';
  firstName?: string;
  dateOfBirth: Date;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  isTobaccoUser: boolean;
  hasDisability: boolean;
  isPregnant: boolean;
  medicalConditions?: MedicalCondition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalCondition {
  condition: string;
  diagnosisDate?: Date;
  isChronic: boolean;
  requiresSpecialist: boolean;
  medications?: string[];
}

// =====================================================
// INCOME & EMPLOYMENT TYPES
// =====================================================

export interface IncomeSource {
  id: string;
  householdId: string;
  memberId?: string;
  sourceType: 'employment' | 'self_employment' | 'social_security' | 'retirement' | 'investment' | 'rental' | 'other';
  employerName?: string;
  annualAmount: number;
  frequency: 'annual' | 'monthly' | 'biweekly' | 'weekly';
  startDate?: Date;
  endDate?: Date;
  isCobraEligible: boolean;
  hasEmployerCoverage: boolean;
  employerCoverageDetails?: EmployerCoverageDetails;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployerCoverageDetails {
  planName?: string;
  monthlyCost?: number;
  employerContribution?: number;
  coverageType: 'individual' | 'family';
  isAffordable: boolean;
  isMinimumValue: boolean;
  coversSpouse?: boolean;
  coversChildren?: boolean;
  effectiveDate?: Date;
  terminationDate?: Date;
}

// =====================================================
// INSURANCE PLAN TYPES
// =====================================================

export interface InsuranceIssuer {
  id: string;
  name: string;
  displayName?: string;
  state: string;
  issuerId: string;
  websiteUrl?: string;
  phone?: string;
  rating?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsurancePlan {
  id: string;
  issuerId: string;
  issuer?: InsuranceIssuer;
  planId: string;
  planName: string;
  planType: 'HMO' | 'PPO' | 'EPO' | 'POS';
  metalLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Catastrophic';
  state: string;
  counties: string[];
  premiumAdult: number;
  premiumChild: number;
  deductibleIndividual: number;
  deductibleFamily: number;
  oopMaxIndividual: number;
  oopMaxFamily: number;
  hasNationalNetwork: boolean;
  planYear: number;
  isActive: boolean;
  planDetails?: PlanDetails;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanDetails {
  benefits: BenefitDetails;
  providerNetwork: ProviderNetwork;
  formulary: Formulary;
  qualityRatings?: QualityRatings;
  additionalBenefits?: AdditionalBenefit[];
}

export interface BenefitDetails {
  primaryCareVisit?: BenefitCost;
  specialistVisit?: BenefitCost;
  emergencyRoom?: BenefitCost;
  urgentCare?: BenefitCost;
  inpatientHospital?: InpatientBenefit;
  outpatientSurgery?: BenefitCost;
  prescriptionDrugs?: PrescriptionBenefit;
  mentalHealth?: MentalHealthBenefit;
  maternity?: MaternityBenefit;
  preventiveCare?: BenefitCost;
  imagingCT?: BenefitCost;
  labWork?: BenefitCost;
}

export interface BenefitCost {
  copay?: number;
  coinsurance?: number;
  notes?: string;
}

export interface InpatientBenefit extends BenefitCost {
  copayPerDay?: number;
  maxDaysCovered?: number;
}

export interface PrescriptionBenefit {
  genericTier1?: number;
  preferredBrandTier2?: number;
  nonPreferredBrandTier3?: number;
  specialtyTier4?: number;
  mailOrderAvailable: boolean;
  notes?: string;
}

export interface MentalHealthBenefit {
  inpatientCopay?: number;
  outpatientCopay?: number;
  notes?: string;
}

export interface MaternityBenefit {
  prenatalCopay?: number;
  deliveryCopay?: number;
  postnatalCopay?: number;
  notes?: string;
}

export interface ProviderNetwork {
  networkSize: 'small' | 'medium' | 'large' | 'national';
  networkId?: string;
  majorHospitals?: string[];
  providersCount?: number;
}

export interface Formulary {
  formularyId?: string;
  formularyUrl?: string;
  commonDrugsCovered?: string[];
}

export interface QualityRatings {
  overallRating?: number;
  customerService?: number;
  qualityOfCare?: number;
  membersSatisfaction?: number;
}

export interface AdditionalBenefit {
  benefitName: string;
  description: string;
  value?: string;
}

// =====================================================
// GOVERNMENT PROGRAMS
// =====================================================

export interface GovernmentProgram {
  id: string;
  programType: 'medicaid' | 'medicare' | 'chip' | 'va' | 'tricare';
  state: string;
  programName: string;
  eligibilityRules: EligibilityRules;
  incomeLimitPercentage?: number;
  assetLimits?: AssetLimits;
  coverageDetails?: CoverageDetails;
  enrollmentPeriods?: EnrollmentPeriod[];
  isActive: boolean;
  effectiveDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EligibilityRules {
  minAge?: number;
  maxAge?: number;
  citizenshipRequired?: boolean;
  residencyRequired?: boolean;
  incomeRequirements?: IncomeRequirement[];
  categoricalEligibility?: string[];
  specialConditions?: string[];
}

export interface IncomeRequirement {
  maxFplPercentage: number;
  householdSizeMin?: number;
  householdSizeMax?: number;
}

export interface AssetLimits {
  individual?: number;
  couple?: number;
  excludedAssets?: string[];
}

export interface CoverageDetails {
  covered: string[];
  notCovered?: string[];
  costSharing?: CostSharing;
}

export interface CostSharing {
  premiums?: number;
  copays?: Record<string, number>;
  deductibles?: number;
}

export interface EnrollmentPeriod {
  name: string;
  startDate: Date;
  endDate: Date;
  description?: string;
}

// =====================================================
// REGULATORY RULES & LOOPHOLES
// =====================================================

export interface RegulatoryRule {
  id: string;
  ruleName: string;
  ruleCategory: 'eligibility' | 'subsidy' | 'enrollment' | 'coverage' | 'tax' | 'compliance' | 'loophole';
  description?: string;
  state?: string;
  ruleLogic: RuleLogic;
  effectiveDate: Date;
  endDate?: Date;
  priority: number;
  isActive: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleLogic {
  conditions: RuleCondition[];
  action: RuleAction;
  exceptions?: RuleException[];
}

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'between';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RuleAction {
  type: string;
  result: any;
  message?: string;
}

export interface RuleException {
  condition: RuleCondition;
  overrideAction?: RuleAction;
}

// =====================================================
// SUBSIDY & FPL TYPES
// =====================================================

export interface FplGuideline {
  id: string;
  year: number;
  householdSize: number;
  annualAmount: number;
  state?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubsidyCalculation {
  id: string;
  householdId: string;
  calculationDate: Date;
  taxYear: number;
  magi: number;
  fplPercentage?: number;
  monthlyPremiumTaxCredit?: number;
  annualPremiumTaxCredit?: number;
  costSharingReductionLevel?: 'none' | 'limited' | '73' | '87' | '94';
  isEligibleMedicaid: boolean;
  isEligibleChip: boolean;
  calculationDetails?: SubsidyCalculationDetails;
  createdAt: Date;
}

export interface SubsidyCalculationDetails {
  fplAmount: number;
  secondLowestSilverPremium?: number;
  expectedContribution?: number;
  subsidyAmount?: number;
  notes?: string[];
  warnings?: string[];
}

// =====================================================
// ANALYSIS SESSION & RESULTS
// =====================================================

export interface AnalysisSession {
  id: string;
  userId: string;
  householdId: string;
  sessionStatus: 'in_progress' | 'completed' | 'abandoned';
  currentStep: number;
  totalSteps: number;
  sessionData?: SessionData;
  startedAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

export interface SessionData {
  step1?: Step1Data;
  step2?: Step2Data;
  step3?: Step3Data;
  step4?: Step4Data;
  step5?: Step5Data;
  step6?: Step6Data;
  step7?: Step7Data;
}

export interface Step1Data {
  state: string;
  zipCode: string;
  county?: string;
}

export interface Step2Data {
  householdSize: number;
  members: Partial<HouseholdMember>[];
}

export interface Step3Data {
  totalIncome: number;
  incomeSources: Partial<IncomeSource>[];
}

export interface Step4Data {
  hasEmployerCoverage: boolean;
  employerCoverageDetails?: EmployerCoverageDetails[];
}

export interface Step5Data {
  hasCurrentCoverage: boolean;
  currentCoverageType?: string;
  isLosingCoverage: boolean;
  lossOfCoverageDate?: Date;
}

export interface Step6Data {
  healthcareNeeds: HealthcareNeeds;
  preferredProviders?: string[];
  prescriptionMedications?: string[];
}

export interface Step7Data {
  preferences: AnalysisPreferences;
}

export interface HealthcareNeeds {
  frequencyOfCare: 'rarely' | 'occasionally' | 'regularly' | 'frequently';
  hasChronicConditions: boolean;
  needsSpecialistCare: boolean;
  planningPregnancy: boolean;
  needsMentalHealthCare: boolean;
  needsPrescriptions: boolean;
}

export interface AnalysisPreferences {
  prioritizeLowPremium?: boolean;
  prioritizeLowDeductible?: boolean;
  preferredPlanTypes?: ('HMO' | 'PPO' | 'EPO' | 'POS')[];
  preferredMetalLevels?: ('Bronze' | 'Silver' | 'Gold' | 'Platinum')[];
  maxMonthlyPremium?: number;
  includeHSAPlans?: boolean;
}

export interface AnalysisResult {
  id: string;
  sessionId: string;
  householdId: string;
  resultType: 'full_analysis' | 'quick_check' | 'comparison';
  recommendedPlans: RecommendedPlan[];
  costScenarios: CostScenario[];
  subsidyInfo?: SubsidyInfo;
  savingsOpportunities: SavingsOpportunity[];
  warnings: Warning[];
  loopholesDetected: Loophole[];
  totalEstimatedSavings?: number;
  confidenceScore?: number;
  analysisTimestamp: Date;
  createdAt: Date;
}

export interface RecommendedPlan {
  plan: InsurancePlan;
  rank: number;
  estimatedMonthlyCost: number;
  estimatedAnnualCost: number;
  subsidyApplied?: number;
  reasonsForRecommendation: string[];
  matchScore: number;
  pros: string[];
  cons: string[];
}

export interface CostScenario {
  scenarioName: string;
  description: string;
  totalCost: number;
  breakdown: CostBreakdown;
  likelihood?: 'low' | 'medium' | 'high';
}

export interface CostBreakdown {
  premiums: number;
  deductibles: number;
  copays: number;
  coinsurance: number;
  outOfPocketMax?: number;
  prescriptions?: number;
  subsidies?: number;
  netCost: number;
}

export interface SubsidyInfo {
  isEligible: boolean;
  monthlyAmount?: number;
  annualAmount?: number;
  costSharingReduction?: string;
  fplPercentage?: number;
  medicaidEligible?: boolean;
  chipEligible?: boolean;
}

export interface SavingsOpportunity {
  opportunityType: string;
  description: string;
  potentialSavings: number;
  actionRequired: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface Warning {
  warningType: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation?: string;
}

export interface Loophole {
  loopholeType: string;
  title: string;
  description: string;
  potentialBenefit: string;
  requirements: string[];
  risks?: string[];
  applicableRuleId?: string;
}

// =====================================================
// COMPARISON TYPES
// =====================================================

export interface SavedComparison {
  id: string;
  userId: string;
  analysisResultId: string;
  comparisonName?: string;
  plansCompared: PlanComparison[];
  notes?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanComparison {
  planId: string;
  plan: InsurancePlan;
  estimatedCosts: CostBreakdown;
  features: PlanFeatureComparison;
}

export interface PlanFeatureComparison {
  networkSize: string;
  deductible: number;
  oopMax: number;
  primaryCare: string;
  specialist: string;
  prescriptions: string;
  qualityRating?: number;
}

// =====================================================
// NOTIFICATION TYPES
// =====================================================

export interface Notification {
  id: string;
  userId: string;
  notificationType: 'email' | 'sms' | 'in_app';
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

export interface ResponseMetadata {
  timestamp: Date;
  requestId: string;
  page?: number;
  perPage?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =====================================================
// VALIDATION & ERROR TYPES
// =====================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// =====================================================
// LEARNING CENTER TYPES
// =====================================================

export interface LearningContent {
  contentId: string;
  contentType: 'article' | 'faq' | 'guide' | 'glossary_term' | 'video' | 'infographic';
  title: string;
  slug: string;
  body: string;
  summary?: string;
  tags: string[];
  category: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  relatedContent?: string[];
  viewsCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// FEEDBACK TYPES
// =====================================================

export interface FeedbackSubmission {
  feedbackId: string;
  userId?: string;
  feedbackType: 'bug_report' | 'feature_request' | 'general_feedback' | 'complaint' | 'praise';
  category?: string;
  message: string;
  rating?: number;
  pageUrl?: string;
  contactEmail?: string;
  attachments?: string[];
  status: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'closed';
  staffNotes?: StaffNote[];
  submittedAt: Date;
  resolvedAt?: Date;
}

export interface StaffNote {
  note: string;
  staffId: string;
  timestamp: Date;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type StateCode = string; // Two-letter state code
export type ZipCode = string;
export type UUID = string;
export type ISODate = string;
export type Currency = number;

// Type guards
export function isInsurancePlan(obj: any): obj is InsurancePlan {
  return obj && typeof obj.planId === 'string' && typeof obj.planName === 'string';
}

export function isHousehold(obj: any): obj is Household {
  return obj && typeof obj.id === 'string' && typeof obj.size === 'number';
}

// Utility type for partial updates
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Utility type for creating new entities (without id, createdAt, updatedAt)
export type NewEntity<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

// =====================================================
// EXPORT ALL TYPES
// =====================================================

export default {
  // Re-export for convenience
};

// =====================================================
// HeaLoop.org API Endpoints Specification
// Complete REST API for health insurance analysis platform
// =====================================================

import {
  User, UserProfile, Household, HouseholdMember, IncomeSource,
  InsurancePlan, InsuranceIssuer, GovernmentProgram,
  SubsidyCalculation, AnalysisSession, AnalysisResult,
  SavedComparison, Notification, LearningContent,
  FeedbackSubmission, ApiResponse, PaginationParams
} from './02_healoop_types';

// =====================================================
// AUTHENTICATION & USER MANAGEMENT
// =====================================================

/**
 * POST /api/auth/register
 * Register a new user account
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export type RegisterResponse = ApiResponse<{
  user: User;
  token: string;
}>;

/**
 * POST /api/auth/login
 * Authenticate user and get access token
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse = ApiResponse<{
  user: User;
  token: string;
  refreshToken: string;
}>;

/**
 * POST /api/auth/logout
 * Logout user and invalidate tokens
 */
export type LogoutResponse = ApiResponse<{ success: boolean }>;

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

export type RefreshTokenResponse = ApiResponse<{
  token: string;
  refreshToken: string;
}>;

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
export interface ForgotPasswordRequest {
  email: string;
}

export type ForgotPasswordResponse = ApiResponse<{ message: string }>;

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export type ResetPasswordResponse = ApiResponse<{ success: boolean }>;

// =====================================================
// USER PROFILE
// =====================================================

/**
 * GET /api/users/me
 * Get current user profile
 */
export type GetCurrentUserResponse = ApiResponse<{
  user: User;
  profile: UserProfile;
}>;

/**
 * PUT /api/users/me
 * Update current user profile
 */
export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  zipCode?: string;
  state?: string;
  county?: string;
  preferredLanguage?: string;
  accessibilityNeeds?: any;
  notificationPreferences?: any;
}

export type UpdateUserProfileResponse = ApiResponse<{
  user: User;
  profile: UserProfile;
}>;

/**
 * DELETE /api/users/me
 * Delete user account
 */
export type DeleteUserResponse = ApiResponse<{ success: boolean }>;

// =====================================================
// HOUSEHOLD MANAGEMENT
// =====================================================

/**
 * GET /api/households
 * List user's households
 */
export type ListHouseholdsResponse = ApiResponse<{
  households: Household[];
}>;

/**
 * POST /api/households
 * Create a new household
 */
export interface CreateHouseholdRequest {
  name?: string;
  size: number;
  zipCode?: string;
  state: string;
  county?: string;
  isPrimary?: boolean;
}

export type CreateHouseholdResponse = ApiResponse<{ household: Household }>;

/**
 * GET /api/households/:id
 * Get household details
 */
export type GetHouseholdResponse = ApiResponse<{
  household: Household;
  members: HouseholdMember[];
  incomeSources: IncomeSource[];
}>;

/**
 * PUT /api/households/:id
 * Update household
 */
export interface UpdateHouseholdRequest {
  name?: string;
  size?: number;
  zipCode?: string;
  state?: string;
  county?: string;
  isPrimary?: boolean;
}

export type UpdateHouseholdResponse = ApiResponse<{ household: Household }>;

/**
 * DELETE /api/households/:id
 * Delete household
 */
export type DeleteHouseholdResponse = ApiResponse<{ success: boolean }>;

// =====================================================
// HOUSEHOLD MEMBERS
// =====================================================

/**
 * POST /api/households/:householdId/members
 * Add household member
 */
export interface AddHouseholdMemberRequest {
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'other';
  firstName?: string;
  dateOfBirth: string;
  gender?: string;
  isTobaccoUser?: boolean;
  hasDisability?: boolean;
  isPregnant?: boolean;
  medicalConditions?: any[];
}

export type AddHouseholdMemberResponse = ApiResponse<{ member: HouseholdMember }>;

/**
 * PUT /api/households/:householdId/members/:memberId
 * Update household member
 */
export type UpdateHouseholdMemberRequest = Partial<AddHouseholdMemberRequest>;
export type UpdateHouseholdMemberResponse = ApiResponse<{ member: HouseholdMember }>;

/**
 * DELETE /api/households/:householdId/members/:memberId
 * Remove household member
 */
export type DeleteHouseholdMemberResponse = ApiResponse<{ success: boolean }>;

// =====================================================
// INCOME SOURCES
// =====================================================

/**
 * POST /api/households/:householdId/income-sources
 * Add income source
 */
export interface AddIncomeSourceRequest {
  memberId?: string;
  sourceType: 'employment' | 'self_employment' | 'social_security' | 'retirement' | 'investment' | 'rental' | 'other';
  employerName?: string;
  annualAmount: number;
  frequency?: 'annual' | 'monthly' | 'biweekly' | 'weekly';
  startDate?: string;
  endDate?: string;
  isCobraEligible?: boolean;
  hasEmployerCoverage?: boolean;
  employerCoverageDetails?: any;
}

export type AddIncomeSourceResponse = ApiResponse<{ incomeSource: IncomeSource }>;

/**
 * PUT /api/households/:householdId/income-sources/:incomeId
 * Update income source
 */
export type UpdateIncomeSourceRequest = Partial<AddIncomeSourceRequest>;
export type UpdateIncomeSourceResponse = ApiResponse<{ incomeSource: IncomeSource }>;

/**
 * DELETE /api/households/:householdId/income-sources/:incomeId
 * Delete income source
 */
export type DeleteIncomeSourceResponse = ApiResponse<{ success: boolean }>;

// =====================================================
// INSURANCE PLANS
// =====================================================

/**
 * GET /api/plans
 * Search and filter insurance plans
 */
export interface SearchPlansRequest extends PaginationParams {
  state?: string;
  county?: string;
  zipCode?: string;
  metalLevel?: string[];
  planType?: string[];
  maxPremium?: number;
  issuerId?: string;
  planYear?: number;
}

export type SearchPlansResponse = ApiResponse<{
  plans: InsurancePlan[];
  total: number;
  filters: {
    availableMetalLevels: string[];
    availablePlanTypes: string[];
    availableIssuers: InsuranceIssuer[];
    premiumRange: { min: number; max: number };
  };
}>;

/**
 * GET /api/plans/:planId
 * Get detailed plan information
 */
export type GetPlanResponse = ApiResponse<{
  plan: InsurancePlan;
  issuer: InsuranceIssuer;
}>;

/**
 * POST /api/plans/compare
 * Compare multiple plans
 */
export interface ComparePlansRequest {
  planIds: string[];
  householdId?: string;
}

export type ComparePlansResponse = ApiResponse<{
  plans: InsurancePlan[];
  comparison: any;
}>;

// =====================================================
// ANALYSIS SESSION
// =====================================================

/**
 * POST /api/analysis/sessions
 * Start a new analysis session
 */
export interface StartAnalysisRequest {
  householdId: string;
}

export type StartAnalysisResponse = ApiResponse<{ session: AnalysisSession }>;

/**
 * GET /api/analysis/sessions/:sessionId
 * Get analysis session details
 */
export type GetAnalysisSessionResponse = ApiResponse<{ session: AnalysisSession }>;

/**
 * PUT /api/analysis/sessions/:sessionId
 * Update analysis session (save step progress)
 */
export interface UpdateAnalysisSessionRequest {
  currentStep?: number;
  sessionData?: any;
  sessionStatus?: 'in_progress' | 'completed' | 'abandoned';
}

export type UpdateAnalysisSessionResponse = ApiResponse<{ session: AnalysisSession }>;

/**
 * POST /api/analysis/sessions/:sessionId/complete
 * Complete analysis and generate results
 */
export type CompleteAnalysisResponse = ApiResponse<{
  session: AnalysisSession;
  result: AnalysisResult;
}>;

// =====================================================
// ANALYSIS RESULTS
// =====================================================

/**
 * GET /api/analysis/results/:resultId
 * Get analysis result details
 */
export type GetAnalysisResultResponse = ApiResponse<{
  result: AnalysisResult;
  recommendedPlans: InsurancePlan[];
}>;

/**
 * GET /api/analysis/households/:householdId/results
 * List analysis results for a household
 */
export type ListAnalysisResultsResponse = ApiResponse<{
  results: AnalysisResult[];
}>;

// =====================================================
// SUBSIDY CALCULATIONS
// =====================================================

/**
 * POST /api/subsidies/calculate
 * Calculate subsidy eligibility and amounts
 */
export interface CalculateSubsidyRequest {
  householdId: string;
  taxYear?: number;
}

export type CalculateSubsidyResponse = ApiResponse<{
  calculation: SubsidyCalculation;
  eligibility: {
    marketplace: boolean;
    medicaid: boolean;
    chip: boolean;
  };
}>;

/**
 * GET /api/subsidies/fpl/:year/:householdSize
 * Get Federal Poverty Level guidelines
 */
export interface GetFPLRequest {
  year: number;
  householdSize: number;
  state?: string;
}

export type GetFPLResponse = ApiResponse<{
  fplAmount: number;
  year: number;
  householdSize: number;
  state?: string;
}>;

// =====================================================
// GOVERNMENT PROGRAMS
// =====================================================

/**
 * GET /api/programs
 * List government programs by state
 */
export interface ListProgramsRequest {
  state: string;
  programType?: 'medicaid' | 'medicare' | 'chip' | 'va' | 'tricare';
}

export type ListProgramsResponse = ApiResponse<{
  programs: GovernmentProgram[];
}>;

/**
 * GET /api/programs/:programId
 * Get program details
 */
export type GetProgramResponse = ApiResponse<{ program: GovernmentProgram }>;

/**
 * POST /api/programs/check-eligibility
 * Check eligibility for government programs
 */
export interface CheckProgramEligibilityRequest {
  householdId: string;
  programType?: string;
}

export type CheckProgramEligibilityResponse = ApiResponse<{
  eligible: boolean;
  programs: {
    programId: string;
    programName: string;
    eligible: boolean;
    reason: string;
  }[];
}>;

// =====================================================
// SAVED COMPARISONS
// =====================================================

/**
 * GET /api/comparisons
 * List user's saved comparisons
 */
export type ListComparisonsResponse = ApiResponse<{
  comparisons: SavedComparison[];
}>;

/**
 * POST /api/comparisons
 * Save a plan comparison
 */
export interface SaveComparisonRequest {
  analysisResultId: string;
  comparisonName?: string;
  planIds: string[];
  notes?: string;
}

export type SaveComparisonResponse = ApiResponse<{ comparison: SavedComparison }>;

/**
 * GET /api/comparisons/:comparisonId
 * Get saved comparison details
 */
export type GetComparisonResponse = ApiResponse<{
  comparison: SavedComparison;
  plans: InsurancePlan[];
}>;

/**
 * DELETE /api/comparisons/:comparisonId
 * Delete saved comparison
 */
export type DeleteComparisonResponse = ApiResponse<{ success: boolean }>;

// =====================================================
// NOTIFICATIONS
// =====================================================

/**
 * GET /api/notifications
 * Get user notifications
 */
export interface ListNotificationsRequest extends PaginationParams {
  status?: 'pending' | 'sent' | 'failed' | 'read';
  type?: 'email' | 'sms' | 'in_app';
}

export type ListNotificationsResponse = ApiResponse<{
  notifications: Notification[];
}>;

/**
 * PUT /api/notifications/:notificationId/read
 * Mark notification as read
 */
export type MarkNotificationReadResponse = ApiResponse<{ notification: Notification }>;

/**
 * DELETE /api/notifications/:notificationId
 * Delete notification
 */
export type DeleteNotificationResponse = ApiResponse<{ success: boolean }>;

// =====================================================
// LEARNING CENTER
// =====================================================

/**
 * GET /api/learning/content
 * Search learning content
 */
export interface SearchLearningContentRequest extends PaginationParams {
  contentType?: 'article' | 'faq' | 'guide' | 'glossary_term' | 'video' | 'infographic';
  category?: string;
  tags?: string[];
  query?: string;
}

export type SearchLearningContentResponse = ApiResponse<{
  content: LearningContent[];
}>;

/**
 * GET /api/learning/content/:contentId
 * Get learning content by ID
 */
export type GetLearningContentResponse = ApiResponse<{
  content: LearningContent;
  relatedContent: LearningContent[];
}>;

/**
 * POST /api/learning/content/:contentId/helpful
 * Mark content as helpful
 */
export type MarkContentHelpfulResponse = ApiResponse<{ success: boolean }>;

// =====================================================
// FEEDBACK
// =====================================================

/**
 * POST /api/feedback
 * Submit user feedback
 */
export interface SubmitFeedbackRequest {
  feedbackType: 'bug_report' | 'feature_request' | 'general_feedback' | 'complaint' | 'praise';
  category?: string;
  message: string;
  rating?: number;
  pageUrl?: string;
  contactEmail?: string;
}

export type SubmitFeedbackResponse = ApiResponse<{ feedback: FeedbackSubmission }>;

// =====================================================
// ADMIN ENDPOINTS (Staff Only)
// =====================================================

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
export interface ListUsersRequest extends PaginationParams {
  status?: 'active' | 'suspended' | 'deleted';
  search?: string;
}

export type ListUsersResponse = ApiResponse<{
  users: User[];
}>;

/**
 * PUT /api/admin/users/:userId/status
 * Update user status (admin only)
 */
export interface UpdateUserStatusRequest {
  status: 'active' | 'suspended' | 'deleted';
  reason?: string;
}

export type UpdateUserStatusResponse = ApiResponse<{ user: User }>;

/**
 * POST /api/admin/plans
 * Create/import insurance plan (admin only)
 */
export interface ImportPlanRequest {
  plan: Partial<InsurancePlan>;
}

export type ImportPlanResponse = ApiResponse<{ plan: InsurancePlan }>;

/**
 * PUT /api/admin/plans/:planId
 * Update insurance plan (admin only)
 */
export type UpdatePlanRequest = Partial<InsurancePlan>;
export type UpdatePlanResponse = ApiResponse<{ plan: InsurancePlan }>;

/**
 * POST /api/admin/rules
 * Create regulatory rule (admin only)
 */
export interface CreateRuleRequest {
  ruleName: string;
  ruleCategory: string;
  description?: string;
  state?: string;
  ruleLogic: any;
  effectiveDate: string;
  priority?: number;
}

export type CreateRuleResponse = ApiResponse<{ rule: any }>;

// =====================================================
// HEALTH CHECK & SYSTEM
// =====================================================

/**
 * GET /api/health
 * Health check endpoint
 */
export type HealthCheckResponse = ApiResponse<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: 'up' | 'down';
    cache: 'up' | 'down';
    rulesEngine: 'up' | 'down';
  };
}>;

/**
 * GET /api/system/stats
 * System statistics (admin only)
 */
export type SystemStatsResponse = ApiResponse<{
  users: { total: number; active: number };
  households: { total: number };
  analyses: { total: number; today: number };
  plans: { total: number; byState: Record<string, number> };
}>;

// =====================================================
// ERROR CODES
// =====================================================

export enum ErrorCode {
  // Authentication
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  TOKEN_INVALID = 'AUTH_003',
  UNAUTHORIZED = 'AUTH_004',
  
  // Validation
  VALIDATION_ERROR = 'VAL_001',
  MISSING_REQUIRED_FIELD = 'VAL_002',
  INVALID_FORMAT = 'VAL_003',
  
  // Resources
  RESOURCE_NOT_FOUND = 'RES_001',
  RESOURCE_ALREADY_EXISTS = 'RES_002',
  RESOURCE_CONFLICT = 'RES_003',
  
  // Business Logic
  HOUSEHOLD_SIZE_MISMATCH = 'BIZ_001',
  INVALID_STATE = 'BIZ_002',
  ANALYSIS_INCOMPLETE = 'BIZ_003',
  NO_PLANS_AVAILABLE = 'BIZ_004',
  
  // System
  INTERNAL_SERVER_ERROR = 'SYS_001',
  SERVICE_UNAVAILABLE = 'SYS_002',
  RATE_LIMIT_EXCEEDED = 'SYS_003',
}

// =====================================================
// MIDDLEWARE & UTILITIES
// =====================================================

/**
 * Authentication middleware interface
 */
export interface AuthMiddleware {
  authenticate(token: string): Promise<User | null>;
  requireAuth(req: any, res: any, next: any): void;
  requireRole(role: string): (req: any, res: any, next: any) => void;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
}

// =====================================================
// GRAPHQL ALTERNATIVE SCHEMA (OPTIONAL)
// =====================================================

export const GraphQLSchema = `
  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    profile: UserProfile
    households: [Household!]!
  }

  type Household {
    id: ID!
    name: String
    size: Int!
    state: String!
    members: [HouseholdMember!]!
    incomeSources: [IncomeSource!]!
    analysisResults: [AnalysisResult!]!
  }

  type InsurancePlan {
    id: ID!
    planId: String!
    planName: String!
    planType: String!
    metalLevel: String!
    premiumAdult: Float!
    deductibleIndividual: Float!
    issuer: InsuranceIssuer!
  }

  type Query {
    me: User
    household(id: ID!): Household
    searchPlans(
      state: String!
      metalLevel: [String!]
      maxPremium: Float
    ): [InsurancePlan!]!
    analysisResult(id: ID!): AnalysisResult
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createHousehold(input: CreateHouseholdInput!): Household!
    startAnalysis(householdId: ID!): AnalysisSession!
    completeAnalysis(sessionId: ID!): AnalysisResult!
  }

  type Subscription {
    analysisUpdated(sessionId: ID!): AnalysisSession!
  }
`;

// =====================================================
// API VERSIONING
// =====================================================

/**
 * All endpoints should be versioned: /api/v1/...
 * Current version: v1
 * Deprecated versions should maintain backwards compatibility for 6 months
 */

export const API_VERSION = 'v1';
export const BASE_URL = `/api/${API_VERSION}`;

// =====================================================
// EXPORT ALL TYPES
// =====================================================

export default {
  // Re-export for convenience
};

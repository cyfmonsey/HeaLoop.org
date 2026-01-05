-- =====================================================
-- HeaLoop.org Core PostgreSQL Database Schema
-- Health Insurance Analysis Platform
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- =====================================================
-- USER PROFILES & PREFERENCES
-- =====================================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    zip_code VARCHAR(10),
    state VARCHAR(2),
    county VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en',
    accessibility_needs JSONB,
    notification_preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_state ON user_profiles(state);

-- =====================================================
-- HOUSEHOLDS
-- =====================================================

CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    size INTEGER NOT NULL DEFAULT 1,
    zip_code VARCHAR(10),
    state VARCHAR(2) NOT NULL,
    county VARCHAR(100),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_households_user_id ON households(user_id);
CREATE INDEX idx_households_state ON households(state);

-- =====================================================
-- HOUSEHOLD MEMBERS
-- =====================================================

CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('self', 'spouse', 'child', 'parent', 'other')),
    first_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    is_tobacco_user BOOLEAN DEFAULT FALSE,
    has_disability BOOLEAN DEFAULT FALSE,
    is_pregnant BOOLEAN DEFAULT FALSE,
    medical_conditions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_household_members_household_id ON household_members(household_id);

-- =====================================================
-- INCOME & EMPLOYMENT
-- =====================================================

CREATE TABLE income_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    member_id UUID REFERENCES household_members(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('employment', 'self_employment', 'social_security', 'retirement', 'investment', 'rental', 'other')),
    employer_name VARCHAR(255),
    annual_amount DECIMAL(12, 2) NOT NULL,
    frequency VARCHAR(20) DEFAULT 'annual' CHECK (frequency IN ('annual', 'monthly', 'biweekly', 'weekly')),
    start_date DATE,
    end_date DATE,
    is_cobra_eligible BOOLEAN DEFAULT FALSE,
    has_employer_coverage BOOLEAN DEFAULT FALSE,
    employer_coverage_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_income_sources_household_id ON income_sources(household_id);
CREATE INDEX idx_income_sources_member_id ON income_sources(member_id);

-- =====================================================
-- INSURANCE ISSUERS
-- =====================================================

CREATE TABLE insurance_issuers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    state VARCHAR(2) NOT NULL,
    issuer_id VARCHAR(50) UNIQUE NOT NULL,
    website_url VARCHAR(500),
    phone VARCHAR(20),
    rating DECIMAL(3, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insurance_issuers_state ON insurance_issuers(state);
CREATE INDEX idx_insurance_issuers_issuer_id ON insurance_issuers(issuer_id);

-- =====================================================
-- INSURANCE PLANS
-- =====================================================

CREATE TABLE insurance_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issuer_id UUID REFERENCES insurance_issuers(id),
    plan_id VARCHAR(100) UNIQUE NOT NULL,
    plan_name VARCHAR(500) NOT NULL,
    plan_type VARCHAR(50) CHECK (plan_type IN ('HMO', 'PPO', 'EPO', 'POS')),
    metal_level VARCHAR(20) CHECK (metal_level IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Catastrophic')),
    state VARCHAR(2) NOT NULL,
    counties TEXT[], -- Array of counties where available
    premium_adult DECIMAL(10, 2),
    premium_child DECIMAL(10, 2),
    deductible_individual DECIMAL(10, 2),
    deductible_family DECIMAL(10, 2),
    oop_max_individual DECIMAL(10, 2),
    oop_max_family DECIMAL(10, 2),
    has_national_network BOOLEAN DEFAULT FALSE,
    plan_year INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    plan_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insurance_plans_issuer_id ON insurance_plans(issuer_id);
CREATE INDEX idx_insurance_plans_state ON insurance_plans(state);
CREATE INDEX idx_insurance_plans_metal_level ON insurance_plans(metal_level);
CREATE INDEX idx_insurance_plans_plan_year ON insurance_plans(plan_year);

-- =====================================================
-- GOVERNMENT PROGRAMS
-- =====================================================

CREATE TABLE government_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_type VARCHAR(50) NOT NULL CHECK (program_type IN ('medicaid', 'medicare', 'chip', 'va', 'tricare')),
    state VARCHAR(2) NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    eligibility_rules JSONB NOT NULL,
    income_limit_percentage INTEGER, -- % of FPL
    asset_limits JSONB,
    coverage_details JSONB,
    enrollment_periods JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_government_programs_state ON government_programs(state);
CREATE INDEX idx_government_programs_type ON government_programs(program_type);

-- =====================================================
-- REGULATORY RULES & LOOPHOLES
-- =====================================================

CREATE TABLE regulatory_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(255) NOT NULL,
    rule_category VARCHAR(100) NOT NULL CHECK (rule_category IN ('eligibility', 'subsidy', 'enrollment', 'coverage', 'tax', 'compliance', 'loophole')),
    description TEXT,
    state VARCHAR(2), -- NULL for federal rules
    rule_logic JSONB NOT NULL,
    effective_date DATE NOT NULL,
    end_date DATE,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regulatory_rules_category ON regulatory_rules(rule_category);
CREATE INDEX idx_regulatory_rules_state ON regulatory_rules(state);
CREATE INDEX idx_regulatory_rules_effective_date ON regulatory_rules(effective_date);

-- =====================================================
-- FEDERAL POVERTY LEVEL (FPL) GUIDELINES
-- =====================================================

CREATE TABLE fpl_guidelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER NOT NULL,
    household_size INTEGER NOT NULL,
    annual_amount DECIMAL(10, 2) NOT NULL,
    state VARCHAR(2), -- NULL for contiguous states, specific for AK/HI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, household_size, state)
);

CREATE INDEX idx_fpl_guidelines_year ON fpl_guidelines(year);

-- =====================================================
-- SUBSIDY CALCULATIONS
-- =====================================================

CREATE TABLE subsidy_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tax_year INTEGER NOT NULL,
    magi DECIMAL(12, 2) NOT NULL, -- Modified Adjusted Gross Income
    fpl_percentage DECIMAL(5, 2), -- % of Federal Poverty Level
    monthly_premium_tax_credit DECIMAL(10, 2),
    annual_premium_tax_credit DECIMAL(10, 2),
    cost_sharing_reduction_level VARCHAR(20) CHECK (cost_sharing_reduction_level IN ('none', 'limited', '73', '87', '94')),
    is_eligible_medicaid BOOLEAN DEFAULT FALSE,
    is_eligible_chip BOOLEAN DEFAULT FALSE,
    calculation_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subsidy_calculations_household_id ON subsidy_calculations(household_id);
CREATE INDEX idx_subsidy_calculations_tax_year ON subsidy_calculations(tax_year);

-- =====================================================
-- ANALYSIS SESSIONS
-- =====================================================

CREATE TABLE analysis_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    session_status VARCHAR(20) DEFAULT 'in_progress' CHECK (session_status IN ('in_progress', 'completed', 'abandoned')),
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 7,
    session_data JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days'
);

CREATE INDEX idx_analysis_sessions_user_id ON analysis_sessions(user_id);
CREATE INDEX idx_analysis_sessions_status ON analysis_sessions(session_status);
CREATE INDEX idx_analysis_sessions_expires_at ON analysis_sessions(expires_at);

-- =====================================================
-- ANALYSIS RESULTS
-- =====================================================

CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    result_type VARCHAR(50) NOT NULL CHECK (result_type IN ('full_analysis', 'quick_check', 'comparison')),
    recommended_plans JSONB,
    cost_scenarios JSONB NOT NULL,
    subsidy_info JSONB,
    savings_opportunities JSONB,
    warnings JSONB,
    loopholes_detected JSONB,
    total_estimated_savings DECIMAL(12, 2),
    confidence_score DECIMAL(3, 2),
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_results_session_id ON analysis_results(session_id);
CREATE INDEX idx_analysis_results_household_id ON analysis_results(household_id);

-- =====================================================
-- SAVED COMPARISONS
-- =====================================================

CREATE TABLE saved_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    analysis_result_id UUID REFERENCES analysis_results(id) ON DELETE CASCADE,
    comparison_name VARCHAR(255),
    plans_compared JSONB NOT NULL,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_comparisons_user_id ON saved_comparisons(user_id);

-- =====================================================
-- USER ACTIONS LOG
-- =====================================================

CREATE TABLE user_actions_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    action_details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_actions_log_user_id ON user_actions_log(user_id);
CREATE INDEX idx_user_actions_log_created_at ON user_actions_log(created_at);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('email', 'sms', 'in_app')),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_household_members_updated_at BEFORE UPDATE ON household_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_sources_updated_at BEFORE UPDATE ON income_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_issuers_updated_at BEFORE UPDATE ON insurance_issuers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_plans_updated_at BEFORE UPDATE ON insurance_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_government_programs_updated_at BEFORE UPDATE ON government_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regulatory_rules_updated_at BEFORE UPDATE ON regulatory_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_comparisons_updated_at BEFORE UPDATE ON saved_comparisons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for household income summary
CREATE VIEW household_income_summary AS
SELECT 
    h.id as household_id,
    h.user_id,
    h.size as household_size,
    h.state,
    COALESCE(SUM(i.annual_amount), 0) as total_annual_income,
    COUNT(DISTINCT i.id) as income_source_count
FROM households h
LEFT JOIN income_sources i ON h.id = i.household_id
GROUP BY h.id, h.user_id, h.size, h.state;

-- View for active insurance plans by state
CREATE VIEW active_plans_by_state AS
SELECT 
    p.state,
    p.metal_level,
    COUNT(*) as plan_count,
    AVG(p.premium_adult) as avg_premium_adult,
    MIN(p.premium_adult) as min_premium_adult,
    MAX(p.premium_adult) as max_premium_adult
FROM insurance_plans p
WHERE p.is_active = TRUE
AND p.plan_year = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY p.state, p.metal_level;

-- =====================================================
-- SAMPLE DATA (FOR DEVELOPMENT)
-- =====================================================

-- Insert sample FPL guidelines for 2024 (contiguous states)
INSERT INTO fpl_guidelines (year, household_size, annual_amount, state) VALUES
(2024, 1, 15060, NULL),
(2024, 2, 20440, NULL),
(2024, 3, 25820, NULL),
(2024, 4, 31200, NULL),
(2024, 5, 36580, NULL),
(2024, 6, 41960, NULL),
(2024, 7, 47340, NULL),
(2024, 8, 52720, NULL);

-- Insert sample regulatory rules
INSERT INTO regulatory_rules (rule_name, rule_category, description, state, rule_logic, effective_date, priority, is_active) VALUES
('ACA Marketplace Eligibility', 'eligibility', 'Basic ACA marketplace eligibility requirements', NULL, 
 '{"min_income_fpl": 100, "max_income_fpl": 400, "citizenship_required": true, "no_affordable_employer_coverage": true}',
 '2024-01-01', 100, TRUE),
('Medicaid Expansion Eligibility', 'eligibility', 'Medicaid eligibility in expansion states', NULL,
 '{"max_income_fpl": 138, "applies_to_expansion_states": true}',
 '2024-01-01', 100, TRUE),
('COBRA Continuation Coverage', 'coverage', 'COBRA continuation rights after job loss', NULL,
 '{"max_continuation_months": 18, "premium_subsidy_eligible": true, "qualifying_events": ["job_loss", "hours_reduction"]}',
 '2024-01-01', 80, TRUE);

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'Core user accounts and authentication data';
COMMENT ON TABLE user_profiles IS 'Extended user profile information including location and preferences';
COMMENT ON TABLE households IS 'Household configurations for analysis';
COMMENT ON TABLE household_members IS 'Individual members of each household';
COMMENT ON TABLE income_sources IS 'Income sources and employment information for household members';
COMMENT ON TABLE insurance_issuers IS 'Health insurance companies and carriers';
COMMENT ON TABLE insurance_plans IS 'Individual health insurance plans available in the marketplace';
COMMENT ON TABLE government_programs IS 'Government health programs (Medicaid, Medicare, CHIP, etc.)';
COMMENT ON TABLE regulatory_rules IS 'Rules engine configuration for eligibility and subsidy calculations';
COMMENT ON TABLE fpl_guidelines IS 'Federal Poverty Level guidelines by year and household size';
COMMENT ON TABLE subsidy_calculations IS 'Calculated premium tax credits and cost-sharing reductions';
COMMENT ON TABLE analysis_sessions IS 'User analysis workflow sessions';
COMMENT ON TABLE analysis_results IS 'Completed analysis results with recommendations';
COMMENT ON TABLE saved_comparisons IS 'User-saved plan comparisons';
COMMENT ON TABLE user_actions_log IS 'Audit log of user actions';
COMMENT ON TABLE notifications IS 'System notifications and alerts';

-- =====================================================
-- MIGRATION NOTES
-- =====================================================
-- Version: 1.0.0
-- Migration: Initial schema creation
-- Date: 2024-01-01
-- Author: HeaLoop Development Team
-- 
-- This schema supports:
-- - User authentication and profiles
-- - Household and member management
-- - Income and employment tracking
-- - Insurance plan catalog
-- - Government program eligibility
-- - Subsidy calculations
-- - Analysis workflow
-- - Rules engine configuration
-- 
-- Future migrations should:
-- - Add versioning to plans (historical data)
-- - Implement soft deletes where appropriate
-- - Add additional indexes based on query patterns
-- - Consider partitioning for large tables (user_actions_log)
-- =====================================================

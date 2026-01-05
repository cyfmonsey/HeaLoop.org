// =====================================================
// HeaLoop.org React Components Scaffolding
// Complete component structure for the health insurance analyzer
// =====================================================

import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  Household, HouseholdMember, IncomeSource, InsurancePlan,
  AnalysisSession, AnalysisResult, AnalysisPreferences,
  HealthcareNeeds, ApiResponse
} from './02_healoop_types';

// =====================================================
// CONTEXT & STATE MANAGEMENT
// =====================================================

interface AnalysisContextType {
  session: AnalysisSession | null;
  household: Household | null;
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  error: string | null;
  updateSession: (data: any) => Promise<void>;
  nextStep: () => void;
  previousStep: () => void;
  completeAnalysis: () => Promise<AnalysisResult>;
}

const AnalysisContext = createContext<AnalysisContextType | null>(null);

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
};

interface AnalysisProviderProps {
  children: React.ReactNode;
  initialSession?: AnalysisSession;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ 
  children, 
  initialSession 
}) => {
  const [session, setSession] = useState<AnalysisSession | null>(initialSession || null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 7;

  const updateSession = async (data: any) => {
    setIsLoading(true);
    try {
      // API call to update session
      const response = await fetch(`/api/analysis/sessions/${session?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionData: data, currentStep })
      });
      const result: ApiResponse<{ session: AnalysisSession }> = await response.json();
      if (result.success && result.data) {
        setSession(result.data.session);
      }
    } catch (err) {
      setError('Failed to update session');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeAnalysis = async (): Promise<AnalysisResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analysis/sessions/${session?.id}/complete`, {
        method: 'POST'
      });
      const result: ApiResponse<{ result: AnalysisResult }> = await response.json();
      if (result.success && result.data) {
        return result.data.result;
      }
      throw new Error('Analysis failed');
    } catch (err) {
      setError('Failed to complete analysis');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnalysisContext.Provider value={{
      session,
      household,
      currentStep,
      totalSteps,
      isLoading,
      error,
      updateSession,
      nextStep,
      previousStep,
      completeAnalysis
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};

// =====================================================
// MAIN CONTAINER COMPONENT
// =====================================================

interface CoverageAnalyzerProps {
  householdId?: string;
}

export const CoverageAnalyzer: React.FC<CoverageAnalyzerProps> = ({ householdId }) => {
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize or resume session
    const initializeSession = async () => {
      try {
        if (householdId) {
          const response = await fetch('/api/analysis/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ householdId })
          });
          const result: ApiResponse<{ session: AnalysisSession }> = await response.json();
          if (result.success && result.data) {
            setSession(result.data.session);
          }
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, [householdId]);

  if (isInitializing) {
    return <LoadingSpinner message="Initializing your analysis..." />;
  }

  return (
    <AnalysisProvider initialSession={session || undefined}>
      <div className="coverage-analyzer">
        <AnalyzerHeader />
        <ProgressBar />
        <AnalyzerContent />
        <AnalyzerNavigation />
      </div>
    </AnalysisProvider>
  );
};

// =====================================================
// ANALYZER HEADER
// =====================================================

export const AnalyzerHeader: React.FC = () => {
  const { currentStep, totalSteps } = useAnalysis();

  return (
    <header className="analyzer-header">
      <div className="container">
        <h1>Health Insurance Coverage Analyzer</h1>
        <p>Step {currentStep} of {totalSteps}</p>
      </div>
    </header>
  );
};

// =====================================================
// PROGRESS BAR
// =====================================================

export const ProgressBar: React.FC = () => {
  const { currentStep, totalSteps } = useAnalysis();
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { num: 1, label: 'Location' },
    { num: 2, label: 'Household' },
    { num: 3, label: 'Income' },
    { num: 4, label: 'Employment' },
    { num: 5, label: 'Coverage' },
    { num: 6, label: 'Healthcare Needs' },
    { num: 7, label: 'Preferences' }
  ];

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-steps">
        {steps.map(step => (
          <div
            key={step.num}
            className={`progress-step ${currentStep >= step.num ? 'completed' : ''} ${currentStep === step.num ? 'active' : ''}`}
          >
            <div className="step-number">{step.num}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =====================================================
// ANALYZER CONTENT (STEP ROUTER)
// =====================================================

export const AnalyzerContent: React.FC = () => {
  const { currentStep, error } = useAnalysis();

  if (error) {
    return <ErrorBanner message={error} />;
  }

  switch (currentStep) {
    case 1:
      return <Step1Location />;
    case 2:
      return <Step2Household />;
    case 3:
      return <Step3Income />;
    case 4:
      return <Step4Employment />;
    case 5:
      return <Step5CurrentCoverage />;
    case 6:
      return <Step6HealthcareNeeds />;
    case 7:
      return <Step7Preferences />;
    default:
      return <div>Invalid step</div>;
  }
};

// =====================================================
// STEP 1: LOCATION
// =====================================================

export const Step1Location: React.FC = () => {
  const { updateSession, nextStep } = useAnalysis();
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [county, setCounty] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSession({ step1: { state, zipCode, county } });
    nextStep();
  };

  return (
    <div className="step-container">
      <h2>Where do you live?</h2>
      <p>Health insurance options vary by location.</p>
      
      <form onSubmit={handleSubmit}>
        <FormGroup label="State" required>
          <select value={state} onChange={(e) => setState(e.target.value)} required>
            <option value="">Select a state</option>
            <option value="CA">California</option>
            <option value="NY">New York</option>
            {/* ... all states */}
          </select>
        </FormGroup>

        <FormGroup label="ZIP Code" required>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            pattern="[0-9]{5}"
            required
          />
        </FormGroup>

        <FormGroup label="County">
          <input
            type="text"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
          />
        </FormGroup>

        <button type="submit" className="btn-primary">Continue</button>
      </form>
    </div>
  );
};

// =====================================================
// STEP 2: HOUSEHOLD
// =====================================================

export const Step2Household: React.FC = () => {
  const { updateSession, nextStep, previousStep } = useAnalysis();
  const [members, setMembers] = useState<Partial<HouseholdMember>[]>([]);

  const addMember = () => {
    setMembers([...members, { relationship: 'self', isTobaccoUser: false }]);
  };

  const updateMember = (index: number, field: string, value: any) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSession({ step2: { householdSize: members.length, members } });
    nextStep();
  };

  return (
    <div className="step-container">
      <h2>Who's in your household?</h2>
      <p>Add everyone who needs coverage.</p>

      <form onSubmit={handleSubmit}>
        {members.map((member, index) => (
          <div key={index} className="household-member-card">
            <h3>Member {index + 1}</h3>
            
            <FormGroup label="Relationship">
              <select
                value={member.relationship}
                onChange={(e) => updateMember(index, 'relationship', e.target.value)}
              >
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="other">Other</option>
              </select>
            </FormGroup>

            <FormGroup label="Date of Birth" required>
              <input
                type="date"
                value={member.dateOfBirth?.toString() || ''}
                onChange={(e) => updateMember(index, 'dateOfBirth', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup label="Tobacco User?">
              <label>
                <input
                  type="checkbox"
                  checked={member.isTobaccoUser || false}
                  onChange={(e) => updateMember(index, 'isTobaccoUser', e.target.checked)}
                />
                Yes, uses tobacco
              </label>
            </FormGroup>

            {index > 0 && (
              <button type="button" onClick={() => removeMember(index)} className="btn-secondary">
                Remove Member
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addMember} className="btn-secondary">
          + Add Member
        </button>

        <div className="button-group">
          <button type="button" onClick={previousStep} className="btn-secondary">
            Back
          </button>
          <button type="submit" className="btn-primary">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// STEP 3: INCOME
// =====================================================

export const Step3Income: React.FC = () => {
  const { updateSession, nextStep, previousStep } = useAnalysis();
  const [incomeSources, setIncomeSources] = useState<Partial<IncomeSource>[]>([]);

  const addIncomeSource = () => {
    setIncomeSources([...incomeSources, { sourceType: 'employment', frequency: 'annual' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalIncome = incomeSources.reduce((sum, source) => sum + (source.annualAmount || 0), 0);
    await updateSession({ step3: { totalIncome, incomeSources } });
    nextStep();
  };

  return (
    <div className="step-container">
      <h2>What's your household income?</h2>
      <p>Include all sources of income for everyone in your household.</p>

      <form onSubmit={handleSubmit}>
        {incomeSources.map((source, index) => (
          <IncomeSourceCard
            key={index}
            source={source}
            onUpdate={(field, value) => {
              const updated = [...incomeSources];
              updated[index] = { ...updated[index], [field]: value };
              setIncomeSources(updated);
            }}
            onRemove={() => setIncomeSources(incomeSources.filter((_, i) => i !== index))}
          />
        ))}

        <button type="button" onClick={addIncomeSource} className="btn-secondary">
          + Add Income Source
        </button>

        <div className="button-group">
          <button type="button" onClick={previousStep} className="btn-secondary">
            Back
          </button>
          <button type="submit" className="btn-primary">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// STEP 4: EMPLOYMENT
// =====================================================

export const Step4Employment: React.FC = () => {
  const { updateSession, nextStep, previousStep } = useAnalysis();
  const [hasEmployerCoverage, setHasEmployerCoverage] = useState(false);
  const [employerDetails, setEmployerDetails] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSession({ step4: { hasEmployerCoverage, employerCoverageDetails: employerDetails } });
    nextStep();
  };

  return (
    <div className="step-container">
      <h2>Employer Coverage</h2>
      <p>Do you or anyone in your household have access to employer-sponsored health insurance?</p>

      <form onSubmit={handleSubmit}>
        <FormGroup label="Employer Coverage Available?">
          <label>
            <input
              type="radio"
              checked={hasEmployerCoverage}
              onChange={() => setHasEmployerCoverage(true)}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              checked={!hasEmployerCoverage}
              onChange={() => setHasEmployerCoverage(false)}
            />
            No
          </label>
        </FormGroup>

        {hasEmployerCoverage && (
          <div className="employer-details">
            <FormGroup label="Monthly Cost">
              <input
                type="number"
                value={employerDetails.monthlyCost || ''}
                onChange={(e) => setEmployerDetails({ ...employerDetails, monthlyCost: parseFloat(e.target.value) })}
              />
            </FormGroup>
            <FormGroup label="Covers Family?">
              <label>
                <input
                  type="checkbox"
                  checked={employerDetails.coversFamily || false}
                  onChange={(e) => setEmployerDetails({ ...employerDetails, coversFamily: e.target.checked })}
                />
                Yes
              </label>
            </FormGroup>
          </div>
        )}

        <div className="button-group">
          <button type="button" onClick={previousStep} className="btn-secondary">
            Back
          </button>
          <button type="submit" className="btn-primary">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// STEP 5: CURRENT COVERAGE
// =====================================================

export const Step5CurrentCoverage: React.FC = () => {
  const { updateSession, nextStep, previousStep } = useAnalysis();
  const [hasCurrentCoverage, setHasCurrentCoverage] = useState(false);
  const [isLosingCoverage, setIsLosingCoverage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSession({ step5: { hasCurrentCoverage, isLosingCoverage } });
    nextStep();
  };

  return (
    <div className="step-container">
      <h2>Current Coverage Status</h2>
      <p>Tell us about your current health insurance situation.</p>

      <form onSubmit={handleSubmit}>
        <FormGroup label="Do you currently have health insurance?">
          <label>
            <input type="radio" checked={hasCurrentCoverage} onChange={() => setHasCurrentCoverage(true)} />
            Yes
          </label>
          <label>
            <input type="radio" checked={!hasCurrentCoverage} onChange={() => setHasCurrentCoverage(false)} />
            No
          </label>
        </FormGroup>

        {hasCurrentCoverage && (
          <FormGroup label="Are you losing your current coverage?">
            <label>
              <input type="radio" checked={isLosingCoverage} onChange={() => setIsLosingCoverage(true)} />
              Yes
            </label>
            <label>
              <input type="radio" checked={!isLosingCoverage} onChange={() => setIsLosingCoverage(false)} />
              No
            </label>
          </FormGroup>
        )}

        <div className="button-group">
          <button type="button" onClick={previousStep} className="btn-secondary">
            Back
          </button>
          <button type="submit" className="btn-primary">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// STEP 6: HEALTHCARE NEEDS
// =====================================================

export const Step6HealthcareNeeds: React.FC = () => {
  const { updateSession, nextStep, previousStep } = useAnalysis();
  const [needs, setNeeds] = useState<Partial<HealthcareNeeds>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSession({ step6: { healthcareNeeds: needs } });
    nextStep();
  };

  return (
    <div className="step-container">
      <h2>Healthcare Needs</h2>
      <p>Help us understand your healthcare requirements.</p>

      <form onSubmit={handleSubmit}>
        <FormGroup label="How often do you see a doctor?">
          <select
            value={needs.frequencyOfCare || ''}
            onChange={(e) => setNeeds({ ...needs, frequencyOfCare: e.target.value as any })}
          >
            <option value="">Select frequency</option>
            <option value="rarely">Rarely (1-2 times per year)</option>
            <option value="occasionally">Occasionally (3-4 times per year)</option>
            <option value="regularly">Regularly (monthly)</option>
            <option value="frequently">Frequently (multiple times per month)</option>
          </select>
        </FormGroup>

        <FormGroup label="Do you have any chronic conditions?">
          <label>
            <input
              type="checkbox"
              checked={needs.hasChronicConditions || false}
              onChange={(e) => setNeeds({ ...needs, hasChronicConditions: e.target.checked })}
            />
            Yes
          </label>
        </FormGroup>

        <FormGroup label="Do you need regular prescriptions?">
          <label>
            <input
              type="checkbox"
              checked={needs.needsPrescriptions || false}
              onChange={(e) => setNeeds({ ...needs, needsPrescriptions: e.target.checked })}
            />
            Yes
          </label>
        </FormGroup>

        <div className="button-group">
          <button type="button" onClick={previousStep} className="btn-secondary">
            Back
          </button>
          <button type="submit" className="btn-primary">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// STEP 7: PREFERENCES
// =====================================================

export const Step7Preferences: React.FC = () => {
  const { updateSession, completeAnalysis, previousStep, isLoading } = useAnalysis();
  const [preferences, setPreferences] = useState<Partial<AnalysisPreferences>>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSession({ step7: { preferences } });
    
    // Complete analysis
    try {
      const analysisResult = await completeAnalysis();
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  if (result) {
    // Redirect to results page
    window.location.href = `/results/${result.id}`;
    return <LoadingSpinner message="Loading your results..." />;
  }

  return (
    <div className="step-container">
      <h2>Your Preferences</h2>
      <p>What's most important to you in a health insurance plan?</p>

      <form onSubmit={handleSubmit}>
        <FormGroup label="What's your priority?">
          <label>
            <input
              type="checkbox"
              checked={preferences.prioritizeLowPremium || false}
              onChange={(e) => setPreferences({ ...preferences, prioritizeLowPremium: e.target.checked })}
            />
            Low monthly premium
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.prioritizeLowDeductible || false}
              onChange={(e) => setPreferences({ ...preferences, prioritizeLowDeductible: e.target.checked })}
            />
            Low deductible
          </label>
        </FormGroup>

        <FormGroup label="Maximum monthly premium">
          <input
            type="number"
            value={preferences.maxMonthlyPremium || ''}
            onChange={(e) => setPreferences({ ...preferences, maxMonthlyPremium: parseFloat(e.target.value) })}
            placeholder="Optional"
          />
        </FormGroup>

        <div className="button-group">
          <button type="button" onClick={previousStep} className="btn-secondary" disabled={isLoading}>
            Back
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Complete Analysis'}
          </button>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// RESULTS PAGE
// =====================================================

interface ResultsPageProps {
  resultId: string;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ resultId }) => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/analysis/results/${resultId}`);
        const data: ApiResponse<{ result: AnalysisResult }> = await response.json();
        if (data.success && data.data) {
          setResult(data.data.result);
        }
      } catch (error) {
        console.error('Failed to load results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (loading) {
    return <LoadingSpinner message="Loading your results..." />;
  }

  if (!result) {
    return <div>Results not found</div>;
  }

  return (
    <div className="results-page">
      <ResultsHeader result={result} />
      <SubsidyInfo subsidyInfo={result.subsidyInfo} />
      <RecommendedPlans plans={result.recommendedPlans} />
      <CostScenarios scenarios={result.costScenarios} />
      <SavingsOpportunities opportunities={result.savingsOpportunities} />
      <LoopholesDetected loopholes={result.loopholesDetected} />
      <WarningsSection warnings={result.warnings} />
    </div>
  );
};

// =====================================================
// HELPER COMPONENTS
// =====================================================

interface FormGroupProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormGroup: React.FC<FormGroupProps> = ({ label, required, children }) => (
  <div className="form-group">
    <label>
      {label} {required && <span className="required">*</span>}
    </label>
    {children}
  </div>
);

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => (
  <div className="loading-spinner">
    <div className="spinner" />
    {message && <p>{message}</p>}
  </div>
);

interface ErrorBannerProps {
  message: string;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => (
  <div className="error-banner">
    <p>{message}</p>
  </div>
);

const AnalyzerNavigation: React.FC = () => {
  const { currentStep, previousStep, isLoading } = useAnalysis();

  if (currentStep === 1) return null;

  return (
    <div className="analyzer-navigation">
      <button onClick={previousStep} disabled={isLoading} className="btn-secondary">
        ← Previous Step
      </button>
    </div>
  );
};

// Placeholder components for results page sections
const ResultsHeader: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="results-header">
    <h1>Your Health Insurance Analysis Results</h1>
    {result.totalEstimatedSavings && (
      <p className="savings-highlight">
        Potential Annual Savings: ${result.totalEstimatedSavings.toFixed(2)}
      </p>
    )}
  </div>
);

const SubsidyInfo: React.FC<{ subsidyInfo?: any }> = ({ subsidyInfo }) => (
  <div className="subsidy-info-card">
    <h2>Subsidy Eligibility</h2>
    {subsidyInfo?.isEligible ? (
      <p>You qualify for ${subsidyInfo.monthlyAmount}/month in subsidies!</p>
    ) : (
      <p>Based on your income, you do not qualify for premium subsidies.</p>
    )}
  </div>
);

const RecommendedPlans: React.FC<{ plans: any[] }> = ({ plans }) => (
  <div className="recommended-plans">
    <h2>Recommended Plans</h2>
    {plans.map((plan, index) => (
      <div key={index} className="plan-card">
        <h3>{plan.plan.planName}</h3>
        <p>Estimated Monthly Cost: ${plan.estimatedMonthlyCost}</p>
      </div>
    ))}
  </div>
);

const CostScenarios: React.FC<{ scenarios: any[] }> = ({ scenarios }) => (
  <div className="cost-scenarios">
    <h2>Cost Scenarios</h2>
    {scenarios.map((scenario, index) => (
      <div key={index} className="scenario-card">
        <h3>{scenario.scenarioName}</h3>
        <p>{scenario.description}</p>
      </div>
    ))}
  </div>
);

const SavingsOpportunities: React.FC<{ opportunities: any[] }> = ({ opportunities }) => (
  <div className="savings-opportunities">
    <h2>Savings Opportunities</h2>
    {opportunities.map((opp, index) => (
      <div key={index} className="opportunity-card">
        <h3>{opp.description}</h3>
        <p>Potential Savings: ${opp.potentialSavings}</p>
      </div>
    ))}
  </div>
);

const LoopholesDetected: React.FC<{ loopholes: any[] }> = ({ loopholes }) => (
  <div className="loopholes-detected">
    <h2>Optimization Strategies</h2>
    {loopholes.map((loophole, index) => (
      <div key={index} className="loophole-card">
        <h3>{loophole.title}</h3>
        <p>{loophole.description}</p>
      </div>
    ))}
  </div>
);

const WarningsSection: React.FC<{ warnings: any[] }> = ({ warnings }) => (
  <div className="warnings-section">
    <h2>Important Notices</h2>
    {warnings.map((warning, index) => (
      <div key={index} className={`warning-card ${warning.severity}`}>
        <p>{warning.message}</p>
      </div>
    ))}
  </div>
);

const IncomeSourceCard: React.FC<{
  source: Partial<IncomeSource>;
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
}> = ({ source, onUpdate, onRemove }) => (
  <div className="income-source-card">
    <FormGroup label="Source Type">
      <select value={source.sourceType} onChange={(e) => onUpdate('sourceType', e.target.value)}>
        <option value="employment">Employment</option>
        <option value="self_employment">Self Employment</option>
        <option value="social_security">Social Security</option>
        <option value="retirement">Retirement</option>
        <option value="investment">Investment</option>
        <option value="other">Other</option>
      </select>
    </FormGroup>
    
    <FormGroup label="Annual Amount" required>
      <input
        type="number"
        value={source.annualAmount || ''}
        onChange={(e) => onUpdate('annualAmount', parseFloat(e.target.value))}
        required
      />
    </FormGroup>
    
    <button type="button" onClick={onRemove} className="btn-secondary">
      Remove
    </button>
  </div>
);

// =====================================================
// CUSTOM HOOKS
// =====================================================

export const useHousehold = (householdId: string) => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHousehold = async () => {
      try {
        const response = await fetch(`/api/households/${householdId}`);
        const data: ApiResponse<{ household: Household }> = await response.json();
        if (data.success && data.data) {
          setHousehold(data.data.household);
        }
      } catch (error) {
        console.error('Failed to fetch household:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHousehold();
  }, [householdId]);

  return { household, loading };
};

// =====================================================
// EXPORTS
// =====================================================

export default CoverageAnalyzer;

"""
HeaLoop.org Rules Engine Pseudocode
Health Insurance Eligibility & Optimization Rules Processor
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, date
from enum import Enum

# =====================================================
# DATA STRUCTURES
# =====================================================

class RuleCategory(Enum):
    ELIGIBILITY = "eligibility"
    SUBSIDY = "subsidy"
    ENROLLMENT = "enrollment"
    COVERAGE = "coverage"
    TAX = "tax"
    LOOPHOLE = "loophole"

class Operator(Enum):
    EQUAL = "eq"
    NOT_EQUAL = "ne"
    GREATER_THAN = "gt"
    GREATER_THAN_EQUAL = "gte"
    LESS_THAN = "lt"
    LESS_THAN_EQUAL = "lte"
    IN = "in"
    NOT_IN = "not_in"
    CONTAINS = "contains"
    BETWEEN = "between"

class RuleCondition:
    def __init__(self, field: str, operator: Operator, value: Any, logical_operator: str = "AND"):
        self.field = field
        self.operator = operator
        self.value = value
        self.logical_operator = logical_operator

class RuleAction:
    def __init__(self, action_type: str, result: Any, message: str = ""):
        self.action_type = action_type
        self.result = result
        self.message = message

class Rule:
    def __init__(self, rule_id: str, name: str, category: RuleCategory, 
                 conditions: List[RuleCondition], action: RuleAction, 
                 priority: int = 0, state: Optional[str] = None):
        self.rule_id = rule_id
        self.name = name
        self.category = category
        self.conditions = conditions
        self.action = action
        self.priority = priority
        self.state = state
        self.effective_date = datetime.now()
        self.is_active = True

class HouseholdContext:
    def __init__(self, household_id: str, state: str, household_size: int, 
                 annual_income: float, members: List[Dict], income_sources: List[Dict]):
        self.household_id = household_id
        self.state = state
        self.household_size = household_size
        self.annual_income = annual_income
        self.magi = annual_income  # Modified Adjusted Gross Income
        self.members = members
        self.income_sources = income_sources
        self.fpl_percentage = None
        self.has_employer_coverage = any(
            source.get('has_employer_coverage') for source in income_sources
        )

class RuleExecutionResult:
    def __init__(self, rule_id: str, matched: bool, result: Any, 
                 message: str = "", execution_time_ms: float = 0):
        self.rule_id = rule_id
        self.matched = matched
        self.result = result
        self.message = message
        self.execution_time_ms = execution_time_ms

# =====================================================
# RULES ENGINE CORE
# =====================================================

class RulesEngine:
    def __init__(self, rules_repository, fpl_repository):
        self.rules_repository = rules_repository
        self.fpl_repository = fpl_repository
        self.execution_log = []
    
    def evaluate_household(self, context: HouseholdContext) -> Dict[str, Any]:
        """
        Main entry point for household evaluation.
        Returns comprehensive analysis including eligibility, subsidies, and opportunities.
        """
        start_time = datetime.now()
        
        # Step 1: Calculate FPL percentage
        fpl_amount = self.fpl_repository.get_fpl_for_household(
            year=datetime.now().year,
            household_size=context.household_size,
            state=context.state
        )
        context.fpl_percentage = (context.magi / fpl_amount) * 100
        
        # Step 2: Load applicable rules
        applicable_rules = self.load_applicable_rules(context)
        
        # Step 3: Execute rules by category and priority
        results = {
            'eligibility': self.execute_eligibility_rules(context, applicable_rules),
            'subsidies': self.execute_subsidy_rules(context, applicable_rules),
            'loopholes': self.execute_loophole_rules(context, applicable_rules),
            'warnings': self.execute_warning_rules(context, applicable_rules)
        }
        
        # Step 4: Generate recommendations
        results['recommendations'] = self.generate_recommendations(context, results)
        
        # Step 5: Log execution
        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        self.log_execution(context, results, execution_time)
        
        return results
    
    def load_applicable_rules(self, context: HouseholdContext) -> List[Rule]:
        """Load rules applicable to the household's state and current date."""
        rules = self.rules_repository.get_active_rules(
            state=context.state,
            effective_date=datetime.now().date()
        )
        
        # Include federal rules (state=None)
        federal_rules = self.rules_repository.get_active_rules(
            state=None,
            effective_date=datetime.now().date()
        )
        
        # Combine and sort by priority
        all_rules = rules + federal_rules
        all_rules.sort(key=lambda r: r.priority, reverse=True)
        
        return all_rules
    
    def evaluate_condition(self, condition: RuleCondition, context: HouseholdContext) -> bool:
        """Evaluate a single condition against the household context."""
        # Get the field value from context
        field_value = self.get_field_value(condition.field, context)
        
        # Evaluate based on operator
        if condition.operator == Operator.EQUAL:
            return field_value == condition.value
        elif condition.operator == Operator.NOT_EQUAL:
            return field_value != condition.value
        elif condition.operator == Operator.GREATER_THAN:
            return field_value > condition.value
        elif condition.operator == Operator.GREATER_THAN_EQUAL:
            return field_value >= condition.value
        elif condition.operator == Operator.LESS_THAN:
            return field_value < condition.value
        elif condition.operator == Operator.LESS_THAN_EQUAL:
            return field_value <= condition.value
        elif condition.operator == Operator.IN:
            return field_value in condition.value
        elif condition.operator == Operator.NOT_IN:
            return field_value not in condition.value
        elif condition.operator == Operator.CONTAINS:
            return condition.value in field_value
        elif condition.operator == Operator.BETWEEN:
            return condition.value[0] <= field_value <= condition.value[1]
        
        return False
    
    def evaluate_rule(self, rule: Rule, context: HouseholdContext) -> RuleExecutionResult:
        """Evaluate all conditions of a rule and return result."""
        start_time = datetime.now()
        
        # Evaluate conditions with logical operators
        result = True
        for i, condition in enumerate(rule.conditions):
            condition_result = self.evaluate_condition(condition, context)
            
            if i == 0:
                result = condition_result
            elif condition.logical_operator == "AND":
                result = result and condition_result
            elif condition.logical_operator == "OR":
                result = result or condition_result
        
        execution_time_ms = (datetime.now() - start_time).total_seconds() * 1000
        
        return RuleExecutionResult(
            rule_id=rule.rule_id,
            matched=result,
            result=rule.action.result if result else None,
            message=rule.action.message if result else "",
            execution_time_ms=execution_time_ms
        )
    
    def get_field_value(self, field_path: str, context: HouseholdContext) -> Any:
        """Extract field value from context using dot notation."""
        parts = field_path.split('.')
        value = context
        
        for part in parts:
            if hasattr(value, part):
                value = getattr(value, part)
            elif isinstance(value, dict) and part in value:
                value = value[part]
            else:
                return None
        
        return value
    
    # =====================================================
    # CATEGORY-SPECIFIC RULE EXECUTION
    # =====================================================
    
    def execute_eligibility_rules(self, context: HouseholdContext, 
                                   rules: List[Rule]) -> Dict[str, Any]:
        """Execute all eligibility rules."""
        eligibility_rules = [r for r in rules if r.category == RuleCategory.ELIGIBILITY]
        
        results = {
            'marketplace_eligible': False,
            'medicaid_eligible': False,
            'chip_eligible': False,
            'medicare_eligible': False,
            'employer_coverage_affordable': None,
            'reasons': []
        }
        
        for rule in eligibility_rules:
            exec_result = self.evaluate_rule(rule, context)
            if exec_result.matched:
                # Apply rule results to eligibility
                if 'marketplace' in rule.name.lower():
                    results['marketplace_eligible'] = exec_result.result.get('eligible', False)
                elif 'medicaid' in rule.name.lower():
                    results['medicaid_eligible'] = exec_result.result.get('eligible', False)
                elif 'chip' in rule.name.lower():
                    results['chip_eligible'] = exec_result.result.get('eligible', False)
                elif 'medicare' in rule.name.lower():
                    results['medicare_eligible'] = exec_result.result.get('eligible', False)
                
                if exec_result.message:
                    results['reasons'].append(exec_result.message)
        
        return results
    
    def execute_subsidy_rules(self, context: HouseholdContext, 
                             rules: List[Rule]) -> Dict[str, Any]:
        """Execute subsidy calculation rules."""
        subsidy_rules = [r for r in rules if r.category == RuleCategory.SUBSIDY]
        
        results = {
            'eligible_for_aptc': False,
            'monthly_tax_credit': 0,
            'annual_tax_credit': 0,
            'csr_level': 'none',
            'calculation_details': []
        }
        
        # Check basic APTC eligibility
        if 100 <= context.fpl_percentage <= 400:
            results['eligible_for_aptc'] = True
            
            # Calculate premium tax credit
            second_lowest_silver = self.get_second_lowest_silver_premium(context)
            expected_contribution = self.calculate_expected_contribution(
                context.fpl_percentage, 
                context.magi
            )
            
            monthly_credit = max(0, second_lowest_silver - expected_contribution)
            results['monthly_tax_credit'] = round(monthly_credit, 2)
            results['annual_tax_credit'] = round(monthly_credit * 12, 2)
        
        # Determine CSR level
        if context.fpl_percentage <= 150:
            results['csr_level'] = '94'
        elif context.fpl_percentage <= 200:
            results['csr_level'] = '87'
        elif context.fpl_percentage <= 250:
            results['csr_level'] = '73'
        
        # Execute custom subsidy rules
        for rule in subsidy_rules:
            exec_result = self.evaluate_rule(rule, context)
            if exec_result.matched:
                results['calculation_details'].append({
                    'rule': rule.name,
                    'result': exec_result.result,
                    'message': exec_result.message
                })
        
        return results
    
    def execute_loophole_rules(self, context: HouseholdContext, 
                               rules: List[Rule]) -> List[Dict[str, Any]]:
        """Identify optimization opportunities and loopholes."""
        loophole_rules = [r for r in rules if r.category == RuleCategory.LOOPHOLE]
        
        loopholes_found = []
        
        for rule in loophole_rules:
            exec_result = self.evaluate_rule(rule, context)
            if exec_result.matched:
                loopholes_found.append({
                    'loophole_type': exec_result.result.get('type'),
                    'title': rule.name,
                    'description': exec_result.message,
                    'potential_savings': exec_result.result.get('savings', 0),
                    'requirements': exec_result.result.get('requirements', []),
                    'action_needed': exec_result.result.get('action', '')
                })
        
        return loopholes_found
    
    def execute_warning_rules(self, context: HouseholdContext, 
                             rules: List[Rule]) -> List[Dict[str, Any]]:
        """Generate warnings about potential issues."""
        warnings = []
        
        # Warning: Income near cliff
        if 395 <= context.fpl_percentage <= 405:
            warnings.append({
                'type': 'subsidy_cliff',
                'severity': 'critical',
                'message': 'Your income is near the subsidy cliff at 400% FPL. ' +
                          'Small income changes could significantly impact subsidies.',
                'recommendation': 'Consider income adjustment strategies before year end.'
            })
        
        # Warning: Medicaid gap state
        medicaid_expansion_states = self.get_medicaid_expansion_states()
        if (context.state not in medicaid_expansion_states and 
            context.fpl_percentage < 100):
            warnings.append({
                'type': 'medicaid_gap',
                'severity': 'critical',
                'message': f'{context.state} has not expanded Medicaid. ' +
                          'You may not qualify for Marketplace subsidies or Medicaid.',
                'recommendation': 'Explore alternative options or state-specific programs.'
            })
        
        # Warning: COBRA timing
        has_recent_job_loss = any(
            source.get('end_date') and 
            (datetime.now().date() - source['end_date']).days < 60
            for source in context.income_sources
        )
        if has_recent_job_loss:
            warnings.append({
                'type': 'cobra_timing',
                'severity': 'warning',
                'message': 'Recent job loss detected. COBRA election deadline is 60 days.',
                'recommendation': 'Compare COBRA costs with Marketplace plans immediately.'
            })
        
        return warnings
    
    # =====================================================
    # HELPER METHODS
    # =====================================================
    
    def calculate_expected_contribution(self, fpl_percentage: float, magi: float) -> float:
        """
        Calculate expected contribution based on FPL percentage.
        Based on ACA premium contribution tables.
        """
        if fpl_percentage <= 150:
            return magi * 0.02 / 12  # 2% of income
        elif fpl_percentage <= 200:
            return magi * 0.04 / 12  # 4% of income
        elif fpl_percentage <= 250:
            return magi * 0.06 / 12  # 6% of income
        elif fpl_percentage <= 300:
            return magi * 0.08 / 12  # 8% of income
        elif fpl_percentage <= 400:
            return magi * 0.095 / 12  # 9.5% of income
        else:
            return 0
    
    def get_second_lowest_silver_premium(self, context: HouseholdContext) -> float:
        """
        Get second-lowest-cost Silver plan premium for the household.
        This is the benchmark for APTC calculations.
        """
        # Query insurance plans for the state/county
        # Filter to Silver plans
        # Sort by premium
        # Return second-lowest
        # This would be implemented with actual database query
        return 500.0  # Placeholder
    
    def get_medicaid_expansion_states(self) -> List[str]:
        """Return list of Medicaid expansion states."""
        return [
            'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'HI', 'ID',
            'IL', 'IN', 'IA', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
            'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
            'OH', 'OK', 'OR', 'PA', 'RI', 'SD', 'UT', 'VT', 'VA', 'WA',
            'WV', 'WI'
        ]
    
    def generate_recommendations(self, context: HouseholdContext, 
                                results: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations based on analysis."""
        recommendations = []
        
        # Recommendation based on eligibility
        if results['eligibility']['medicaid_eligible']:
            recommendations.append(
                "You appear eligible for Medicaid. Apply immediately as coverage " +
                "can be retroactive up to 3 months."
            )
        elif results['eligibility']['marketplace_eligible']:
            if results['subsidies']['eligible_for_aptc']:
                recommendations.append(
                    f"You're eligible for ${results['subsidies']['monthly_tax_credit']:.2f}/month " +
                    "in premium tax credits. Focus on Silver plans for maximum value."
                )
        
        # Loophole-based recommendations
        for loophole in results['loopholes']:
            if loophole['potential_savings'] > 1000:
                recommendations.append(
                    f"{loophole['title']}: {loophole['action_needed']}"
                )
        
        return recommendations
    
    def log_execution(self, context: HouseholdContext, results: Dict[str, Any], 
                     execution_time_ms: float):
        """Log the execution for auditing and debugging."""
        log_entry = {
            'execution_id': f"exec_{datetime.now().timestamp()}",
            'household_id': context.household_id,
            'timestamp': datetime.now(),
            'execution_time_ms': execution_time_ms,
            'results_summary': {
                'marketplace_eligible': results['eligibility']['marketplace_eligible'],
                'medicaid_eligible': results['eligibility']['medicaid_eligible'],
                'monthly_subsidy': results['subsidies']['monthly_tax_credit'],
                'loopholes_found': len(results['loopholes']),
                'warnings_generated': len(results['warnings'])
            }
        }
        self.execution_log.append(log_entry)
        # In production, persist to MongoDB

# =====================================================
# EXAMPLE USAGE
# =====================================================

def example_usage():
    """Example of how to use the rules engine."""
    
    # Initialize engine
    rules_repo = RulesRepository()  # Would be actual implementation
    fpl_repo = FPLRepository()  # Would be actual implementation
    engine = RulesEngine(rules_repo, fpl_repo)
    
    # Create household context
    context = HouseholdContext(
        household_id="hh_123456",
        state="CA",
        household_size=3,
        annual_income=55000,
        members=[
            {'age': 35, 'relationship': 'self'},
            {'age': 33, 'relationship': 'spouse'},
            {'age': 5, 'relationship': 'child'}
        ],
        income_sources=[
            {
                'source_type': 'employment',
                'annual_amount': 55000,
                'has_employer_coverage': False
            }
        ]
    )
    
    # Evaluate household
    results = engine.evaluate_household(context)
    
    # Print results
    print(f"Marketplace Eligible: {results['eligibility']['marketplace_eligible']}")
    print(f"Monthly Tax Credit: ${results['subsidies']['monthly_tax_credit']}")
    print(f"Loopholes Found: {len(results['loopholes'])}")
    print(f"Recommendations: {results['recommendations']}")

# =====================================================
# SAMPLE RULES DEFINITIONS
# =====================================================

# Rule 1: ACA Marketplace Basic Eligibility
marketplace_eligibility_rule = Rule(
    rule_id="rule_001",
    name="ACA Marketplace Basic Eligibility",
    category=RuleCategory.ELIGIBILITY,
    conditions=[
        RuleCondition("fpl_percentage", Operator.GREATER_THAN_EQUAL, 100),
        RuleCondition("fpl_percentage", Operator.LESS_THAN_EQUAL, 400, "AND"),
        RuleCondition("has_employer_coverage", Operator.EQUAL, False, "AND")
    ],
    action=RuleAction(
        action_type="set_eligibility",
        result={'eligible': True, 'program': 'marketplace'},
        message="Eligible for ACA Marketplace with subsidies"
    ),
    priority=100
)

# Rule 2: Medicaid Expansion Eligibility
medicaid_expansion_rule = Rule(
    rule_id="rule_002",
    name="Medicaid Expansion Eligibility",
    category=RuleCategory.ELIGIBILITY,
    conditions=[
        RuleCondition("fpl_percentage", Operator.LESS_THAN_EQUAL, 138),
        RuleCondition("state", Operator.IN, ['CA', 'NY', 'WA'], "AND")
    ],
    action=RuleAction(
        action_type="set_eligibility",
        result={'eligible': True, 'program': 'medicaid'},
        message="Eligible for Medicaid under expansion"
    ),
    priority=100
)

# Rule 3: COBRA Timing Optimization
cobra_timing_loophole = Rule(
    rule_id="rule_003",
    name="COBRA Retroactive Coverage Optimization",
    category=RuleCategory.LOOPHOLE,
    conditions=[
        RuleCondition("income_sources[0].is_cobra_eligible", Operator.EQUAL, True),
        RuleCondition("income_sources[0].end_date", Operator.GREATER_THAN_EQUAL, 
                     (datetime.now().date() - timedelta(days=60)))
    ],
    action=RuleAction(
        action_type="identify_loophole",
        result={
            'type': 'cobra_timing',
            'savings': 2000,
            'requirements': ['COBRA eligible', 'Within 60-day election period'],
            'action': 'Delay COBRA election until medical expenses occur, ' +
                     'then elect retroactively'
        },
        message="You can delay COBRA election and activate it retroactively " +
                "if major medical expenses occur within 60 days."
    ),
    priority=80
)

if __name__ == "__main__":
    example_usage()

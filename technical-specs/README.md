# HeaLoop.org Technical Specifications

## Overview
This directory contains comprehensive technical specifications for the HeaLoop.org health insurance analysis platform. These documents serve as the complete blueprint for development, covering database design, API specifications, component architecture, security guidelines, and implementation planning.

## Quick Start Guide

### For Backend Developers
Start with:
1. `01_healoop_core_schema.sql` - Database structure
2. `02_healoop_types.ts` - Type definitions
3. `05_api_endpoints.ts` - API specifications
4. `03_rules_engine_pseudocode.py` - Rules engine logic

### For Frontend Developers
Start with:
1. `02_healoop_types.ts` - Type definitions
2. `06_react_components_scaffolding.tsx` - Component structure
3. `07_ui_wireframes.md` - UI designs
4. `05_api_endpoints.ts` - API integration

### For Project Managers
Start with:
1. `09_sprint_tickets.md` - Sprint planning and tickets
2. `07_ui_wireframes.md` - User experience flow
3. This README for overall architecture

### For DevOps/Security
Start with:
1. `11_security_compliance.md` - Security requirements
2. `01_healoop_core_schema.sql` - Database setup
3. `08_openapi_specification.yaml` - API documentation

## File Descriptions

### 📊 Database & Data Layer

#### `01_healoop_core_schema.sql` (21KB)
**PostgreSQL Database Schema**
- User authentication and profiles
- Household and member management
- Income tracking
- Insurance plans and issuers
- Government programs (Medicaid, CHIP, Medicare)
- Regulatory rules
- Subsidy calculations
- Analysis sessions and results
- Includes indexes, triggers, views, and sample data

**Key Features:**
- 15+ core tables
- Audit triggers for updated_at
- Foreign key relationships
- Comprehensive comments

#### `01_healoop_mongodb_schemas.json` (22KB)
**MongoDB Collections & Validators**
- Plan details (benefits, networks, formularies)
- Analysis result caching
- Rules execution logs
- User activity tracking
- Marketplace data snapshots
- Learning center content
- Feedback submissions

**Key Features:**
- JSON schema validators
- Index definitions
- Data retention policies
- Sharding considerations

### 🎯 Type System

#### `02_healoop_types.ts` (18KB)
**Complete TypeScript Type Definitions**
- User and profile types
- Household and member types
- Income and employment types
- Insurance plan types
- Government program types
- Regulatory rule types
- Subsidy calculation types
- Analysis session types
- Analysis result types
- API request/response types

**Key Features:**
- Type guards
- Utility types
- 100+ interfaces
- Comprehensive documentation

### 🧠 Rules Engine

#### `03_rules_engine_pseudocode.py` (22KB)
**Rules Engine Implementation Logic**
- Core rules engine class
- Condition evaluation
- Rule execution
- Eligibility determination
- Subsidy calculation
- Loophole detection
- Warning generation

**Includes:**
- Detailed pseudocode
- Example usage
- Sample rule definitions
- Performance considerations

#### `04_rules_json_examples.json` (20KB)
**JSON Rule Configurations**
- ACA marketplace eligibility rules
- Medicaid expansion rules
- CHIP eligibility
- Subsidy calculation rules
- Cost-sharing reduction rules
- Loophole detection rules (COBRA timing, silver plan optimization, family glitch)
- Warning rules
- Enrollment period rules

**Key Features:**
- 20+ production-ready rules
- Operator definitions
- Rule categories
- Priority system

### 🌐 API Layer

#### `05_api_endpoints.ts` (19KB)
**Complete API Specification**
- 30+ REST endpoints across 10 domains
- Request/response interfaces
- Authentication endpoints
- User management
- Household management
- Insurance plan search
- Analysis workflow
- Subsidy calculations
- Admin endpoints
- Error codes

**Key Features:**
- Type-safe interfaces
- GraphQL alternative schema
- API versioning strategy
- Middleware types

#### `08_openapi_specification.yaml` (16KB)
**OpenAPI 3.0 / Swagger Documentation**
- API paths and operations
- Request/response schemas
- Authentication configuration
- Error responses
- Example requests
- Server configurations

**Benefits:**
- Auto-generated API documentation
- Client SDK generation
- API testing tools
- Interactive API explorer

### 🎨 Frontend Layer

#### `06_react_components_scaffolding.tsx` (31KB)
**React Component Architecture**
- Main `CoverageAnalyzer` container
- 7-step analysis flow components
- Results page components
- Context providers
- Custom hooks
- Helper components

**Key Features:**
- TypeScript interfaces
- State management
- API integration patterns
- Component composition
- Form handling

#### `07_ui_wireframes.md` (39KB)
**Detailed UI Wireframes**
- 20 wireframe descriptions
- Home page
- 7 analyzer steps
- Results page sections
- Learning center
- FAQ page
- Mobile responsive views

**Includes:**
- Layout specifications
- Interaction patterns
- Accessibility requirements
- Component states
- Animation guidelines
- Responsive breakpoints
- Color scheme
- Typography

### ✅ Validation & Security

#### `10_data_validation_rules.ts` (21KB)
**Comprehensive Validation Schemas**
- Zod-based validation
- User input validation
- Household data validation
- Income validation
- Analysis session validation
- Custom validators
- Sanitization functions

**Key Features:**
- Type-safe validation
- Express middleware
- Error handling
- Common patterns (email, phone, ZIP, SSN)

#### `11_security_compliance.md` (20KB)
**Security & Compliance Guidelines**
- Security principles
- Data protection & privacy
- Authentication & authorization
- API security
- Database security
- Infrastructure security
- Compliance (GDPR, CCPA, HIPAA considerations)
- Incident response
- Security testing
- Monitoring & logging

**Includes:**
- Security checklist
- Threat model
- Code examples
- Configuration samples
- Best practices

### 📋 Project Management

#### `09_sprint_tickets.md` (21KB)
**12-Sprint Development Roadmap**
- 77 development tickets
- Story point estimates
- Dependency mapping
- Team composition
- Sprint breakdown
- Risk management

**Phases:**
1. Foundation (Sprints 1-2): Infrastructure
2. Core Features (Sprints 3-5): API & Database
3. Analysis Engine (Sprints 6-8): Rules & Analytics
4. User Experience (Sprints 9-10): UI Polish
5. Launch Prep (Sprints 11-12): Testing & Security

**Total Estimate:** ~450 story points, 24-30 weeks

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │   Analysis   │  │   Results    │      │
│  │  Components  │  │     Flow     │  │    Display   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│          │                │                  │               │
│          └────────────────┴──────────────────┘               │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                    REST API (v1)
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                      Backend                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     API      │  │    Rules     │  │   Subsidy    │      │
│  │   Endpoints  │  │    Engine    │  │  Calculator  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│          │                │                  │               │
│          └────────────────┴──────────────────┘               │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
          ┌─────────┴────────┐  ┌───┴──────┐
          │   PostgreSQL     │  │ MongoDB  │
          │  (Structured)    │  │(Documents)│
          └──────────────────┘  └──────────┘
```

## Data Flow

### Analysis Workflow
```
1. User Input (Steps 1-7)
   ↓
2. Session Storage (PostgreSQL)
   ↓
3. Rules Engine Execution
   ↓
4. Subsidy Calculation
   ↓
5. Plan Recommendations
   ↓
6. Results Storage (PostgreSQL + MongoDB cache)
   ↓
7. Results Display
```

### Rules Engine Flow
```
Household Context
   ↓
Load Applicable Rules
   ↓
Execute Eligibility Rules
   ↓
Execute Subsidy Rules
   ↓
Execute Loophole Rules
   ↓
Generate Warnings
   ↓
Create Recommendations
   ↓
Return Results
```

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context + Custom Hooks
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Charts**: Chart.js or Recharts
- **Build**: Vite or Next.js

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express or NestJS
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod
- **ORM**: Prisma or TypeORM
- **API Docs**: Swagger/OpenAPI

### Database
- **Primary**: PostgreSQL 15+
- **Secondary**: MongoDB 6+
- **Cache**: Redis
- **Search**: Elasticsearch (optional)

### Infrastructure
- **Cloud**: AWS, Azure, or GCP
- **Containers**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: DataDog or New Relic
- **Logging**: ELK Stack or CloudWatch
- **Secrets**: AWS Secrets Manager or Azure Key Vault

## Development Guidelines

### Code Quality
- TypeScript strict mode enabled
- 70%+ test coverage
- ESLint + Prettier for code style
- Husky for pre-commit hooks
- Conventional Commits

### Git Workflow
```
main (production)
  ↑
  └── develop (integration)
       ↑
       ├── feature/HEAL-XXX (features)
       ├── bugfix/HEAL-XXX (bug fixes)
       └── hotfix/HEAL-XXX (urgent fixes)
```

### Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Supertest (API)
- **E2E Tests**: Cypress or Playwright
- **Load Tests**: k6 or Artillery

### Security Requirements
- HTTPS everywhere (TLS 1.3)
- Security headers (CSP, HSTS, X-Frame-Options)
- Input validation on all endpoints
- SQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting
- Authentication & authorization
- Encryption at rest (AES-256)
- Regular security audits

## Getting Started with Development

### Phase 1: Setup (Week 1-2)
```bash
# 1. Set up development environment
npm install
docker-compose up -d

# 2. Initialize databases
psql -U postgres -f technical-specs/01_healoop_core_schema.sql
mongoimport --db healoop --collection plan_details --file technical-specs/01_healoop_mongodb_schemas.json

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Run development servers
npm run dev:api    # Backend on :3000
npm run dev:web    # Frontend on :5173
```

### Phase 2: Core Development (Week 3-20)
Follow the sprint plan in `09_sprint_tickets.md`

### Phase 3: Testing & Launch (Week 21-24)
- Integration testing
- Security audit
- Performance optimization
- User acceptance testing
- Production deployment

## Key Decisions & Rationale

### Why PostgreSQL + MongoDB?
- **PostgreSQL**: ACID compliance for user data, transactions, and financial calculations
- **MongoDB**: Flexible schema for plan details, analysis cache, and content management

### Why Rules Engine Approach?
- Centralized business logic
- Easy to update rules without code changes
- Auditable rule execution
- Version control for rules
- Support for complex eligibility scenarios

### Why TypeScript Throughout?
- Type safety reduces bugs
- Better IDE support
- Self-documenting code
- Easier refactoring
- Shared types between frontend and backend

### Why React (not Vue/Angular)?
- Largest ecosystem
- Strong TypeScript support
- Component reusability
- Large talent pool
- Excellent tooling

## Maintenance & Updates

### Regular Tasks
- **Daily**: Monitor logs and alerts
- **Weekly**: Review and deploy security patches
- **Monthly**: Update plan data, test backups
- **Quarterly**: Security audit, performance review
- **Annually**: Penetration testing, compliance review

### Documentation Updates
- Update this README when adding new specs
- Keep API documentation in sync with code
- Document architectural decisions
- Maintain changelog

## Contributing

### Adding New Specifications
1. Follow existing file naming convention: `##_descriptive_name.ext`
2. Include comprehensive comments
3. Provide examples where applicable
4. Update this README
5. Submit PR with description

### Updating Existing Specifications
1. Document reason for change
2. Update affected files
3. Maintain backward compatibility notes
4. Update version history in file

## Support & Resources

### Internal Resources
- Architecture diagrams: `/docs/architecture/`
- API documentation: Generated from OpenAPI spec
- Development guide: `/docs/DEVELOPMENT.md`
- Deployment guide: `/docs/DEPLOYMENT.md`

### External Resources
- ACA Information: Healthcare.gov
- GDPR: https://gdpr.eu/
- CCPA: https://oag.ca.gov/privacy/ccpa
- OWASP: https://owasp.org/
- React Docs: https://react.dev/
- PostgreSQL: https://postgresql.org/docs/

## License
Proprietary - HeaLoop.org

## Version History

| Version | Date       | Changes                               |
|---------|------------|---------------------------------------|
| 1.0.0   | 2024-01-01 | Initial technical specifications      |

---

**Last Updated**: 2024-01-01  
**Maintained By**: HeaLoop.org Development Team  
**Contact**: dev@healoop.org

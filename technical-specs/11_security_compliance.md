# HeaLoop.org Security & Compliance Guidelines

## Document Version
- **Version**: 1.0.0
- **Last Updated**: 2024-01-01
- **Owner**: Security Team
- **Review Cycle**: Quarterly

---

## Table of Contents
1. [Security Overview](#security-overview)
2. [Data Protection & Privacy](#data-protection--privacy)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Security](#api-security)
5. [Database Security](#database-security)
6. [Infrastructure Security](#infrastructure-security)
7. [Compliance Requirements](#compliance-requirements)
8. [Incident Response](#incident-response)
9. [Security Testing](#security-testing)
10. [Monitoring & Logging](#monitoring--logging)

---

## Security Overview

### Security Principles
1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Minimum necessary access for users and systems
3. **Zero Trust**: Verify explicitly, assume breach, secure every access
4. **Privacy by Design**: Privacy considerations in all design decisions
5. **Secure by Default**: Security settings enabled by default

### Threat Model

#### Assets
- User personal information (PII)
- Healthcare information
- Financial data (income, subsidy calculations)
- Authentication credentials
- Analysis results
- Insurance plan data

#### Threats
- Unauthorized access to user data
- SQL injection attacks
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Man-in-the-middle attacks
- Denial of service (DoS)
- Data breaches
- Account takeover
- Session hijacking

---

## Data Protection & Privacy

### Personal Information Handling

#### Classification
- **Level 1 - Public**: Plan data, general content
- **Level 2 - Internal**: Aggregated analytics, system logs
- **Level 3 - Confidential**: User PII, household data
- **Level 4 - Restricted**: Health information, financial data

#### Data Collection
- **Minimize Collection**: Only collect data necessary for service
- **Purpose Specification**: Clearly state why data is collected
- **Consent**: Obtain explicit consent for data collection
- **Opt-out Options**: Allow users to opt out of non-essential data collection

#### Data Storage
```javascript
// Encryption at rest
const encryptionConfig = {
  algorithm: 'AES-256-GCM',
  keyRotation: '90 days',
  keyManagement: 'AWS KMS', // or Azure Key Vault, Google Cloud KMS
};

// PII fields to encrypt
const encryptedFields = [
  'users.email',
  'users.phone',
  'user_profiles.date_of_birth',
  'household_members.first_name',
  'income_sources.employer_name',
  'income_sources.annual_amount',
];
```

#### Data Transmission
- **TLS 1.3**: All data in transit encrypted
- **Certificate Pinning**: Mobile apps should pin certificates
- **HSTS**: HTTP Strict Transport Security enabled
- **Perfect Forward Secrecy**: Use ephemeral key exchange

#### Data Retention
```
User Data Retention Policy:
- Active accounts: Indefinite (while account active)
- Inactive accounts: 2 years of inactivity, then delete
- Deleted accounts: 30-day grace period, then permanent deletion
- Analysis sessions: 90 days for incomplete, indefinite for completed
- Audit logs: 7 years (compliance requirement)
- Backups: 90 days retention
```

#### Right to Erasure
Users have the right to:
- Access their data
- Correct inaccurate data
- Delete their data (with exceptions for legal obligations)
- Export their data (data portability)
- Object to processing

### HIPAA Compliance Considerations

**Note**: HeaLoop.org is **not** a covered entity under HIPAA as it does not provide healthcare services, process claims, or store Protected Health Information (PHI) as defined by HIPAA. However, we implement HIPAA-inspired security controls as best practices.

#### Data We DON'T Collect (to avoid HIPAA scope)
- Medical diagnoses (specific ICD codes)
- Treatment records
- Provider notes
- Prescription details (we collect medications but not prescriptions)
- Lab results
- Insurance claim details

#### If HIPAA Compliance Becomes Necessary
1. Conduct HIPAA Security Risk Assessment
2. Implement Business Associate Agreements (BAAs)
3. Designate Privacy Officer and Security Officer
4. Implement additional technical safeguards
5. Enhance audit controls
6. Implement breach notification procedures

---

## Authentication & Authorization

### Password Security

#### Requirements
```typescript
const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireLowercase: true,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfoInPassword: true,
  maxFailedAttempts: 5,
  lockoutDuration: '30 minutes',
  passwordHistory: 5, // Can't reuse last 5 passwords
  passwordExpiry: 'never', // Consider 90 days for admin accounts
};
```

#### Password Storage
```javascript
// Use bcrypt with cost factor 12 or higher
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

### JSON Web Tokens (JWT)

#### Access Token Configuration
```javascript
const jwtConfig = {
  algorithm: 'RS256', // Asymmetric (not HS256)
  expiresIn: '15m', // Short-lived
  issuer: 'healoop.org',
  audience: 'healoop-api',
};

// Include in token payload
const tokenPayload = {
  sub: userId, // Subject (user ID)
  email: userEmail,
  role: userRole,
  iat: issuedAt,
  exp: expiresAt,
  jti: tokenId, // JWT ID for revocation
};
```

#### Refresh Token Configuration
```javascript
const refreshTokenConfig = {
  expiresIn: '7d', // Longer-lived
  storage: 'database', // Store in database for revocation
  rotateOnUse: true, // Issue new refresh token on each use
  singleUse: true, // Invalidate after use
};
```

#### Token Security
- Store tokens in HttpOnly, Secure, SameSite cookies
- Never store in localStorage (XSS risk)
- Implement token revocation list
- Rotate signing keys quarterly
- Use separate keys for access and refresh tokens

### Multi-Factor Authentication (MFA)

**Phase 1**: Optional MFA for users
**Phase 2**: Required MFA for admin accounts

```typescript
interface MFAOptions {
  methods: ['totp', 'sms', 'email'];
  backupCodes: true;
  trustedDevices: true;
  trustedDeviceDuration: '30 days';
}
```

### Role-Based Access Control (RBAC)

```typescript
enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPPORT = 'support',
  CONTENT_EDITOR = 'content_editor',
}

const permissions = {
  user: [
    'read:own_profile',
    'write:own_profile',
    'read:own_households',
    'write:own_households',
    'read:plans',
    'write:own_analyses',
  ],
  support: [
    'read:all_users',
    'read:feedback',
    'write:feedback_response',
  ],
  content_editor: [
    'read:content',
    'write:content',
    'publish:content',
  ],
  admin: ['*'], // All permissions
};
```

### Session Management

```javascript
const sessionConfig = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  rolling: true, // Extend on activity
  absoluteTimeout: 24 * 60 * 60 * 1000, // Force reauth after 24 hours
  idleTimeout: 30 * 60 * 1000, // 30 minutes idle
  revokeOnLogout: true,
  revokeOnPasswordChange: true,
  maxConcurrentSessions: 5,
};
```

---

## API Security

### Input Validation

```typescript
// ALWAYS validate and sanitize inputs
app.post('/api/households', validateBody(createHouseholdSchema), async (req, res) => {
  // Input already validated by middleware
  const household = await createHousehold(req.body);
  res.json({ success: true, data: { household } });
});
```

### SQL Injection Prevention

```javascript
// ✅ GOOD: Parameterized queries
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ BAD: String concatenation
const result = await pool.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

### XSS Prevention

```javascript
// Server-side
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href'],
  });
}

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Avoid unsafe-inline in production
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
}));
```

### CSRF Protection

```javascript
// Use csurf middleware
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/api/data', csrfProtection, (req, res) => {
  // Protected route
});
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'SYS_003',
        message: 'Too many requests, please try again later.',
      },
    });
  },
});

// Apply to all API routes
app.use('/api/', apiLimiter);

// Stricter limits for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

app.use('/api/auth/login', authLimiter);
```

### API Versioning & Deprecation

```
/api/v1/...  - Current stable API
/api/v2/...  - New version (when v1 features change)

Deprecation policy:
- Announce deprecation 6 months in advance
- Maintain deprecated versions for 12 months minimum
- Provide migration guide
- Return deprecation headers
```

---

## Database Security

### Connection Security

```javascript
const dbConfig = {
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('./certs/ca-cert.pem').toString(),
  },
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

### Database Credentials

- **Never** hardcode credentials
- Use environment variables or secrets manager
- Rotate credentials quarterly
- Use separate credentials for read-only operations
- Implement least privilege access

### Backup Security

```yaml
backup_policy:
  frequency: daily
  retention: 90 days
  encryption: AES-256
  storage: encrypted S3 bucket
  access: restricted to backup service account
  testing: monthly restore test
```

### Query Monitoring

```javascript
// Log slow queries
pool.on('slow-query', (query) => {
  logger.warn('Slow query detected', {
    query: query.text,
    duration: query.duration,
    user: query.user,
  });
});
```

---

## Infrastructure Security

### HTTPS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name healoop.org;

    # TLS Configuration
    ssl_certificate /etc/ssl/certs/healoop.org.crt;
    ssl_certificate_key /etc/ssl/private/healoop.org.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### Environment Separation

```
Development  → dev.healoop.org
Staging      → staging.healoop.org
Production   → healoop.org

- Separate databases
- Separate AWS accounts/resource groups
- No production data in dev/staging
- Synthetic test data only
```

### Secrets Management

```javascript
// Use AWS Secrets Manager, Azure Key Vault, or similar
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return JSON.parse(data.SecretString);
}
```

### Container Security

```dockerfile
# Use minimal base images
FROM node:18-alpine

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Copy only necessary files
COPY --chown=nodejs:nodejs package*.json ./
RUN npm ci --only=production

# Security scanning in CI/CD
# - Snyk
# - Trivy
# - Clair
```

### Network Security

```
Firewall Rules:
- Allow HTTPS (443) from internet
- Allow SSH (22) from VPN only
- Allow PostgreSQL (5432) from app servers only
- Deny all other inbound traffic

WAF Rules:
- Block common attack patterns (SQLi, XSS)
- Geo-blocking (if applicable)
- Rate limiting
- DDoS protection
```

---

## Compliance Requirements

### GDPR (General Data Protection Regulation)

If serving EU users:
- ✅ Cookie consent banner
- ✅ Privacy policy
- ✅ Data processing agreement
- ✅ Right to access data
- ✅ Right to erasure
- ✅ Data portability
- ✅ Breach notification (72 hours)
- ✅ Data Protection Officer (if required)

### CCPA (California Consumer Privacy Act)

If serving California residents:
- ✅ Privacy notice at collection
- ✅ "Do Not Sell My Personal Information" link
- ✅ Right to know what data is collected
- ✅ Right to delete data
- ✅ Right to opt-out of sale

### ACA (Affordable Care Act)

Ensure compliance with:
- ✅ Accurate subsidy calculations
- ✅ Plan data accuracy
- ✅ Non-discrimination requirements
- ✅ Accessibility requirements (Section 508)

### PCI DSS (if processing payments)

**Current**: Not applicable (no payment processing)
**Future**: If implementing payment features:
- Use payment processor (Stripe, Square)
- Never store credit card numbers
- PCI SAQ-A compliance

### SOC 2 Type II (Optional, for enterprise trust)

Considerations for future:
- Security controls
- Availability
- Processing integrity
- Confidentiality
- Privacy

---

## Incident Response

### Incident Classification

**P0 - Critical**
- Data breach
- Complete service outage
- Unauthorized access to production systems

**P1 - High**
- Partial service outage
- Security vulnerability exploitation
- Significant data loss

**P2 - Medium**
- Performance degradation
- Non-critical security issue
- Limited user impact

**P3 - Low**
- Minor bugs
- Cosmetic issues

### Incident Response Plan

```
1. Detect & Alert
   - Monitoring systems detect anomaly
   - Alert on-call engineer

2. Assess & Classify
   - Determine severity (P0-P3)
   - Assemble incident response team

3. Contain
   - Isolate affected systems
   - Stop the bleeding

4. Investigate
   - Determine root cause
   - Collect evidence
   - Document timeline

5. Remediate
   - Fix vulnerability
   - Patch systems
   - Restore service

6. Communicate
   - Internal stakeholders
   - Affected users (if required)
   - Regulatory bodies (if required)

7. Post-Mortem
   - Blameless review
   - Document lessons learned
   - Implement preventive measures
```

### Breach Notification

```
GDPR: 72 hours to notify supervisory authority
CCPA: Without unreasonable delay
Users: Prompt notification if PII compromised

Notification must include:
- Nature of breach
- Data affected
- Likely consequences
- Measures taken
- Contact information
```

---

## Security Testing

### Static Application Security Testing (SAST)

```yaml
# GitHub Actions
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Dynamic Application Security Testing (DAST)

```
Tools:
- OWASP ZAP
- Burp Suite
- Acunetix

Schedule: Weekly scans of staging environment
```

### Dependency Scanning

```json
// package.json scripts
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "snyk:test": "snyk test",
    "snyk:monitor": "snyk monitor"
  }
}
```

### Penetration Testing

```
Frequency: Annually, or after major releases
Scope: Full application, API, infrastructure
Third-party vendor: Required
Report: Document findings and remediation plan
```

---

## Monitoring & Logging

### Security Monitoring

```javascript
// Log security events
logger.info('User login', { userId, ip, userAgent, timestamp });
logger.warn('Failed login attempt', { email, ip, timestamp });
logger.error('Unauthorized access attempt', { userId, resource, timestamp });
```

### Audit Logging

```
Log all:
- Authentication events (login, logout, MFA)
- Authorization changes (role changes, permission grants)
- Data access (PII reads)
- Data modifications (create, update, delete)
- Configuration changes
- Administrative actions

Retention: 7 years (compliance)
Storage: Immutable, tamper-proof
```

### Security Alerts

```yaml
alerts:
  - name: Multiple failed logins
    condition: failed_logins > 5 in 5 minutes
    action: Lock account, notify security team
    
  - name: Unusual API usage
    condition: requests_per_minute > 1000
    action: Notify operations team
    
  - name: Privilege escalation
    condition: role_change to admin
    action: Notify security team immediately
    
  - name: Data export
    condition: bulk_data_export
    action: Review and approve, log
```

---

## Security Checklist

### Pre-Launch Security Review

- [ ] All dependencies up to date and scanned
- [ ] No secrets in source code
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Authentication tested (positive and negative)
- [ ] Authorization tested (RBAC)
- [ ] Password policy enforced
- [ ] Session management secure
- [ ] Data encryption at rest
- [ ] Data encryption in transit
- [ ] Database credentials secured
- [ ] Backup and recovery tested
- [ ] Logging and monitoring configured
- [ ] Incident response plan documented
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance (if applicable)
- [ ] CCPA compliance (if applicable)
- [ ] Penetration test completed
- [ ] Security training for team

---

## Security Contacts

- **Security Lead**: security@healoop.org
- **DPO (Data Protection Officer)**: dpo@healoop.org
- **Incident Response**: incident@healoop.org
- **Bug Bounty**: security@healoop.org

---

## Version History

| Version | Date       | Changes                    |
|---------|------------|----------------------------|
| 1.0.0   | 2024-01-01 | Initial security guidelines |

---

## Appendix A: Security Tools

- **SAST**: Snyk, SonarQube, Checkmarx
- **DAST**: OWASP ZAP, Burp Suite
- **Secrets Scanning**: GitGuardian, TruffleHog
- **Container Security**: Trivy, Clair, Anchore
- **Dependency Scanning**: Snyk, Dependabot
- **WAF**: AWS WAF, Cloudflare
- **DDoS Protection**: Cloudflare, AWS Shield
- **Monitoring**: DataDog, New Relic, Sentry
- **Log Management**: ELK Stack, Splunk

---

## Appendix B: Regulatory References

- **HIPAA**: 45 CFR Parts 160, 162, and 164
- **GDPR**: Regulation (EU) 2016/679
- **CCPA**: California Civil Code §1798.100 et seq.
- **ACA**: 42 U.S.C. §18001 et seq.
- **Section 508**: 29 U.S.C. §794d
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

**Document Approval**: This document must be reviewed and approved by the Security Lead, Legal, and CTO before implementation.

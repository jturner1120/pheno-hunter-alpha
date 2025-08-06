# Pheno Hunter - Development Standards

## 🎯 Core Development Philosophy

**Quality First**: Every feature must include comprehensive testing as part of completion.
**User Trust**: Reliability and stability are non-negotiable requirements.
**Test-Driven Development**: Write tests first, then implement features.

## 📋 Mandatory Development Workflow

### 1. Feature Planning Phase
- [ ] Define acceptance criteria with testable outcomes
- [ ] Identify required test types (unit, integration, E2E)
- [ ] Plan test scenarios before writing code
- [ ] Consider edge cases and error conditions

### 2. Implementation Phase (TDD)
- [ ] **Write tests FIRST** before any feature code
- [ ] Implement minimum viable feature to pass tests
- [ ] Refactor code while maintaining test coverage
- [ ] Update existing tests affected by changes

### 3. Testing Requirements (ALL FEATURES)
- [ ] **Unit Tests**: Component logic, utilities, validation
- [ ] **Integration Tests**: Component interactions, data flow
- [ ] **E2E Scenarios**: Complete user workflows in Gherkin format
- [ ] **Security Tests**: Input validation, XSS prevention, auth protection
- [ ] **Accessibility**: Screen reader compatibility, keyboard navigation
- [ ] **Mobile**: Responsive design and touch interactions

### 4. Security Requirements (NON-NEGOTIABLE)
- [ ] **Input Sanitization**: All user inputs validated and sanitized
- [ ] **Authentication**: Proper auth protection on restricted routes
- [ ] **Data Storage**: No sensitive data in localStorage
- [ ] **Dependencies**: Third-party packages scanned with `npm audit`
- [ ] **Error Handling**: No sensitive information leaked in error messages

### 5. Quality Gates (NO EXCEPTIONS)
- [ ] All new tests pass
- [ ] All existing tests continue to pass
- [ ] Security scan shows no high/critical vulnerabilities
- [ ] Test coverage maintained or improved
- [ ] No console errors in development/testing
- [ ] Code follows established patterns

## 🧪 Testing Standards

### Unit Tests
- **Component Testing**: Every React component needs tests
- **Utility Functions**: All helper functions must be tested
- **Business Logic**: Plant lifecycle, cloning, harvesting logic
- **Error Handling**: Test failure scenarios and edge cases
- **Security Testing**: Input validation, sanitization functions

### Integration Tests
- **Data Flow**: Component-to-component communication
- **User Workflows**: Complete feature usage patterns
- **localStorage Integration**: Data persistence scenarios
- **Form Submissions**: End-to-end form processing
- **Authentication**: Auth protection and route security

### E2E Test Documentation
- **Gherkin Scenarios**: Business-readable test specifications
- **User Stories**: Real-world usage patterns
- **Mobile Scenarios**: Touch interactions and responsive behavior
- **Error Recovery**: How users handle and recover from errors
- **Security Workflows**: Authentication flows and access control

## 🎯 Feature Definition of "Done"

A feature is NOT complete until:

1. ✅ **Implementation** works as specified
2. ✅ **Security validation** passes all checks
3. ✅ **Unit tests** cover all component logic
4. ✅ **Integration tests** validate data flow
5. ✅ **E2E scenarios** document user workflows
6. ✅ **All tests pass** including existing regression tests
7. ✅ **Dependency scan** shows no critical vulnerabilities
8. ✅ **Documentation** updated (README, comments)
9. ✅ **Mobile responsive** and accessible
10. ✅ **Billy Bong integration** where user-facing

## 🚫 Anti-Patterns (Never Do This)

- ❌ Implement features without corresponding tests
- ❌ Skip testing because "it's just a small change"
- ❌ Break existing tests and leave them failing
- ❌ Write tests after implementation (test-after development)
- ❌ Ignore mobile or accessibility requirements
- ❌ Deploy without running full test suite
- ❌ Store sensitive data in localStorage or expose credentials
- ❌ Skip input validation or sanitization
- ❌ Ignore security warnings from `npm audit`
- ❌ Deploy with known high/critical security vulnerabilities

## 🎨 Code Quality Standards

### Component Standards
- Use TypeScript-style JSDoc comments
- Include PropTypes or TypeScript interfaces
- Handle loading and error states
- Implement proper accessibility attributes
- Include Billy Bong mascot where appropriate

### Testing Standards
- Descriptive test names that explain behavior
- Test user interactions, not implementation details
- Mock external dependencies appropriately
- Include positive, negative, and edge case scenarios
- Test accessibility features (ARIA labels, keyboard nav)

### Documentation Standards
- Update README for new features
- Document API changes in technical specs
- Include usage examples in component comments
- Maintain E2E scenario documentation

## 🔄 Continuous Improvement

### Regular Maintenance
- Review and update tests when refactoring
- Improve test coverage in areas with gaps
- Update E2E scenarios based on user feedback
- Optimize test performance and reliability
- Keep dependencies updated with security patches

### Team Collaboration
- Share testing patterns and best practices
- Review test quality in code reviews
- Discuss testing approaches for complex features
- Maintain testing documentation and examples
- Conduct security reviews for all features

### Architecture Evolution
- Adopt feature-based folder structure (`/features/plant`, `/features/auth`)
- Standardize naming conventions for hooks, components, services
- Organize reusable utilities in `/lib` or `/common`
- Track and prioritize technical debt items

## 🔒 Security-First Culture

### Development Practices
- **Always validate and sanitize** user inputs
- **Never store sensitive data** in localStorage
- **Regularly scan dependencies** with `npm audit`
- **Implement auth protection** on all restricted routes
- **Handle errors securely** without leaking system information

### Production Readiness
- **Content Security Policy** considerations documented
- **Observability** with structured logging and error tracking
- **CI/CD readiness** with automated security scanning
- **Performance monitoring** and optimization strategies

## 🎯 Success Metrics

- **Test Coverage**: Maintain >85% coverage on critical paths
- **Test Reliability**: <5% flaky test rate
- **Development Speed**: Tests should accelerate, not slow development
- **Bug Prevention**: Catch issues before user impact
- **User Trust**: Zero production bugs in core workflows

---

**Remember**: These standards ensure we deliver a **high quality, stable application** that users can trust. Testing is not overhead—it's the foundation of reliability.

*Last Updated: August 6, 2025*

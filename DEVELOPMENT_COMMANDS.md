## 🚀 Pheno Hunter - Development Commands Reference

This is the **single source of truth** for all development, testing, security, and quality commands in the Pheno Hunter project.

> **⚡ MVP Focus**: Commands marked with 🚀 are essential for MVP launch. Others can be deferred.

---Pheno Hunter - Development Commands Reference

This is the **single source of truth** for all development, testing, security, and quality commands in the Pheno Hunter project.

---

## 📋 Table of Contents

1. [Core Development Commands](#core-development-commands)
2. [Testing Commands](#testing-commands)
3. [Security & Quality Commands](#security--quality-commands)
4. [Performance & Optimization Commands](#performance--optimization-commands)
5. [Build & Deployment Commands](#build--deployment-commands)
6. [Documentation & Analysis Commands](#documentation--analysis-commands)
7. [Development Workflow Commands](#development-workflow-commands)
8. [Troubleshooting Commands](#troubleshooting-commands)

---

## 🛠️ Core Development Commands

### Start Development Server
```bash
npm run dev  🚀
```
**Purpose**: Start the Vite development server with hot reload  
**When to use**: Daily development work  
**Output**: Opens development server at http://localhost:5173

### Linting & Code Quality
```bash
npm run lint  🚀
```
**Purpose**: Run ESLint to check code quality and style  
**When to use**: Before committing code  
**Expected**: No errors or warnings

---

## 🧪 Testing Commands

### Basic Testing
```bash
# Run all tests once
npm test  🚀

# Run tests in watch mode (development)
npm run test:watch  🚀

# Run tests with coverage report
npm run test:coverage  (defer for MVP)
```

### Targeted Testing by Layer
```bash
# Unit tests only (components, utilities, hooks)
npm run test:unit

# Integration tests only (workflows, data flow)
npm run test:integration

# Security-focused tests
npm run test:security

# Performance-focused tests  
npm run test:performance
```

### Test Output Examples
```bash
# Quick test status check
npm test

# Detailed coverage analysis
npm run test:coverage
# Expected: >85% coverage on critical paths

# Development with auto-rerun
npm run test:watch
# Expected: Tests re-run on file changes
```

### Advanced Testing
```bash
# Run tests with UI interface
npm run test:ui
# Opens web interface at http://localhost:51204

# Run specific test file
npm test -- auth.test.jsx

# Run tests matching pattern
npm test -- --grep "authentication"

# Run tests for specific component
npm test -- --grep "Dashboard"
```

---

## 🔒 Security & Quality Commands

### Automated Security Scanning
```bash
# Full security and quality check (PRIMARY COMMAND)
npm run security:check

# Unix/Linux/Mac version
npm run security:check:unix

# Just dependency vulnerabilities
npm run audit:security
```

### Complete Validation Pipeline
```bash
# Run ALL validation checks (tests + security + build)
npm run validate:code

# Pre-commit quality gate (comprehensive check)
npm run pre-commit
```

### Manual Security Checks
```bash
# Check for hardcoded credentials
findstr /R /I /S "password.*=" src\*.js src\*.jsx

# Check for console.log statements
findstr /R /S "console\.log" src\*.js src\*.jsx

# Scan for XSS vulnerabilities
findstr /R "innerHTML\s*=" src\*.js src\*.jsx
```

---

## 📊 Performance & Optimization Commands

### Bundle Analysis
```bash
# Build and analyze bundle size
npm run build
# Then check dist/ folder for file sizes

# Alternative with analysis tool (if added)
npm run analyze:bundle
```

### Performance Testing
```bash
# Run performance-focused tests
npm run test:performance

# Check Core Web Vitals (if Lighthouse added)
npm run check:performance
```

### Storage & Memory Analysis
```bash
# Check localStorage usage (run in browser console during development)
window.PhenoHunter?.getStorageUsage?.()

# View performance summary (browser console)
window.PhenoHunter?.getPerformanceSummary?.()
```

---

## 🏗️ Build & Deployment Commands

### Production Builds
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Test production build (build + preview)
npm run build && npm run preview
```

### Build Validation
```bash
# Ensure clean build
rm -rf dist && npm run build

# Windows clean build
rmdir /s dist && npm run build

# Build with error checking
npm run build 2>&1 | tee build.log
```

---

## 📖 Documentation & Analysis Commands

### Project Analysis
```bash
# List all npm scripts
npm run

# View package.json scripts section
npm run --silent | grep -E "^[[:space:]]*[a-zA-Z]"

# Check project structure
tree src/ (Unix) or dir /s src\ (Windows)
```

### Dependency Management
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Clean install
rm -rf node_modules package-lock.json && npm install
```

---

## 🔄 Development Workflow Commands

### Daily Development Workflow
```bash
# 1. Start development
npm run dev

# 2. Run tests in watch mode (separate terminal)
npm run test:watch

# 3. Before committing
npm run pre-commit
```

### Feature Development Workflow
```bash
# 1. Plan feature with tests first (TDD)
npm run test:watch

# 2. Implement feature
npm run dev

# 3. Validate implementation
npm run test:unit && npm run test:integration

# 4. Security and quality check
npm run security:check

# 5. Final validation
npm run validate:code
```

### Pre-Commit Checklist Commands
```bash
# Complete pre-commit validation (run these in order)
npm test                  # All tests pass
npm run test:unit        # Unit tests pass
npm run test:integration # Integration tests pass
npm run audit:security   # No vulnerabilities
npm run build           # Production build works
npm run security:check  # Full security scan
```

---

## 🆘 Troubleshooting Commands

### Common Issues & Solutions

#### Test Failures
```bash
# Clear test cache
npm run test -- --clearCache

# Run tests with verbose output
npm run test -- --verbose

# Run single failing test
npm test -- --grep "specific test name"
```

#### Build Issues
```bash
# Clear all caches and reinstall
rm -rf node_modules package-lock.json dist .vite
npm install

# Check for TypeScript/ESLint errors
npm run lint

# Build with detailed output
npm run build -- --verbose
```

#### Security Issues
```bash
# Fix dependency vulnerabilities
npm audit fix

# Force fix with breaking changes
npm audit fix --force

# Manual security scan
npm run audit:security
```

#### Performance Issues
```bash
# Check bundle sizes
npm run build && ls -la dist/

# Analyze performance (browser dev tools)
# 1. Open dev tools
# 2. Go to Performance tab
# 3. Record page load

# Check storage usage
localStorage.length
```

---

## 🎯 Quick Reference Commands

### Most Common Daily Commands
```bash
npm run dev              # Start development
npm run test:watch       # Watch tests
npm run security:check   # Security scan
npm run validate:code    # Full validation
npm run pre-commit       # Pre-commit check
```

### Before Any Commit
```bash
npm run pre-commit
# This runs: security:check && validate:code
# Which includes: tests + security + build validation
```

### Before Any Deploy
```bash
npm run validate:code && npm run build && npm run preview
```

---

## 📝 Adding New Commands

**When adding new commands to package.json, update this document immediately.**

### Command Naming Conventions
- `test:*` - Testing related commands
- `security:*` - Security scanning and validation
- `audit:*` - Dependency and vulnerability auditing
- `check:*` - Validation and verification commands
- `validate:*` - Comprehensive validation pipelines

### Documentation Requirements
For each new command, include:
1. **Purpose**: What the command does
2. **When to use**: Context for running it
3. **Expected output**: What success/failure looks like
4. **Related commands**: What to run before/after

---

## 🚀 Integration with Development Standards

This command reference supports:
- **DEVELOPMENT_STANDARDS.md**: TDD workflow and quality gates
- **PRE_COMMIT_CHECKLIST.md**: All validation requirements
- **Security Requirements**: Automated scanning and validation
- **Performance Standards**: Monitoring and optimization

---

*This document is automatically updated when new commands are added to the project.*

**Last Updated**: August 6, 2025  
**Total Commands**: 25+ covering all development needs

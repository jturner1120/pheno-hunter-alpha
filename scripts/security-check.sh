#!/bin/bash

# 🔒 Security & Quality Automation Script
# Implements automated security scanning as required by DEVELOPMENT_STANDARDS.md

echo "🔍 Running Pheno Hunter Security & Quality Checks..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall success
OVERALL_SUCCESS=true

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "SUCCESS" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [ "$status" = "ERROR" ]; then
        echo -e "${RED}❌ $message${NC}"
        OVERALL_SUCCESS=false
    elif [ "$status" = "INFO" ]; then
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

# 1. Dependency Security Scan
echo -e "\n${BLUE}1. 🔒 Dependency Security Scan${NC}"
echo "-----------------------------------"

if command -v npm &> /dev/null; then
    print_status "INFO" "Running npm audit..."
    
    # Run npm audit and capture output
    AUDIT_OUTPUT=$(npm audit --audit-level moderate 2>&1)
    AUDIT_EXIT_CODE=$?
    
    if [ $AUDIT_EXIT_CODE -eq 0 ]; then
        print_status "SUCCESS" "No moderate or high vulnerabilities found"
    else
        print_status "ERROR" "Security vulnerabilities detected:"
        echo "$AUDIT_OUTPUT"
        echo ""
        print_status "WARNING" "Run 'npm audit fix' to attempt automatic fixes"
    fi
else
    print_status "ERROR" "npm not found - cannot run security audit"
fi

# 2. Code Quality & Testing
echo -e "\n${BLUE}2. 🧪 Code Quality & Testing${NC}"
echo "-----------------------------------"

if [ -f "package.json" ]; then
    # Check if test command exists
    if npm run test --silent &> /dev/null; then
        print_status "INFO" "Running test suite..."
        
        # Run tests and capture output
        TEST_OUTPUT=$(npm test 2>&1)
        TEST_EXIT_CODE=$?
        
        if [ $TEST_EXIT_CODE -eq 0 ]; then
            print_status "SUCCESS" "All tests passed"
        else
            print_status "ERROR" "Tests failed:"
            echo "$TEST_OUTPUT"
        fi
    else
        print_status "WARNING" "No test command found in package.json"
    fi
    
    # Check if build works
    if npm run build --silent &> /dev/null; then
        print_status "INFO" "Testing production build..."
        
        BUILD_OUTPUT=$(npm run build 2>&1)
        BUILD_EXIT_CODE=$?
        
        if [ $BUILD_EXIT_CODE -eq 0 ]; then
            print_status "SUCCESS" "Production build successful"
        else
            print_status "ERROR" "Production build failed:"
            echo "$BUILD_OUTPUT"
        fi
    else
        print_status "WARNING" "No build command found in package.json"
    fi
else
    print_status "ERROR" "package.json not found"
fi

# 3. File Security Scan
echo -e "\n${BLUE}3. 🔍 File Security Scan${NC}"
echo "-----------------------------------"

print_status "INFO" "Scanning for potential security issues..."

# Check for hardcoded credentials
CREDENTIAL_PATTERNS=("password\s*=" "secret\s*=" "token\s*=" "key\s*=" "api[_-]?key" "auth[_-]?token")
CREDENTIALS_FOUND=false

for pattern in "${CREDENTIAL_PATTERNS[@]}"; do
    if grep -r -i -E "$pattern" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// Safe:" | grep -v "mock" | grep -v "demo" > /dev/null; then
        if [ "$CREDENTIALS_FOUND" = false ]; then
            print_status "ERROR" "Potential hardcoded credentials found:"
            CREDENTIALS_FOUND=true
        fi
        grep -r -i -E "$pattern" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// Safe:" | grep -v "mock" | grep -v "demo"
    fi
done

if [ "$CREDENTIALS_FOUND" = false ]; then
    print_status "SUCCESS" "No hardcoded credentials detected"
fi

# Check for potential XSS vulnerabilities
XSS_PATTERNS=("innerHTML\s*=" "dangerouslySetInnerHTML" "document\.write" "eval\s*\(")
XSS_FOUND=false

for pattern in "${XSS_PATTERNS[@]}"; do
    if grep -r -E "$pattern" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// Safe:" > /dev/null; then
        if [ "$XSS_FOUND" = false ]; then
            print_status "WARNING" "Potential XSS vulnerabilities found:"
            XSS_FOUND=true
        fi
        grep -r -E "$pattern" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// Safe:"
    fi
done

if [ "$XSS_FOUND" = false ]; then
    print_status "SUCCESS" "No obvious XSS vulnerabilities detected"
fi

# Check for console.log statements (should be replaced with proper logging)
CONSOLE_LOGS=$(grep -r "console\.log" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
    print_status "WARNING" "$CONSOLE_LOGS console.log statements found (consider using structured logging)"
else
    print_status "SUCCESS" "No console.log statements found"
fi

# 4. Performance Checks
echo -e "\n${BLUE}4. 📊 Performance Checks${NC}"
echo "-----------------------------------"

# Check bundle size (if dist directory exists)
if [ -d "dist" ]; then
    print_status "INFO" "Analyzing bundle size..."
    
    # Find JavaScript files and check sizes
    JS_FILES=$(find dist -name "*.js" -type f 2>/dev/null)
    LARGE_FILES=false
    
    for file in $JS_FILES; do
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        SIZE_MB=$((SIZE / 1024 / 1024))
        
        if [ "$SIZE_MB" -gt 2 ]; then
            if [ "$LARGE_FILES" = false ]; then
                print_status "WARNING" "Large JavaScript files detected:"
                LARGE_FILES=true
            fi
            echo "  $file: ${SIZE_MB}MB"
        fi
    done
    
    if [ "$LARGE_FILES" = false ]; then
        print_status "SUCCESS" "JavaScript bundle sizes are reasonable"
    fi
else
    print_status "INFO" "No dist directory found - run 'npm run build' first"
fi

# Check for large images
print_status "INFO" "Checking for large images..."
LARGE_IMAGES=false

if [ -d "src/assets" ]; then
    IMAGE_FILES=$(find src/assets -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) 2>/dev/null)
    
    for file in $IMAGE_FILES; do
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        SIZE_KB=$((SIZE / 1024))
        
        if [ "$SIZE_KB" -gt 500 ]; then
            if [ "$LARGE_IMAGES" = false ]; then
                print_status "WARNING" "Large image files detected:"
                LARGE_IMAGES=true
            fi
            echo "  $file: ${SIZE_KB}KB"
        fi
    done
    
    if [ "$LARGE_IMAGES" = false ]; then
        print_status "SUCCESS" "Image file sizes are reasonable"
    fi
else
    print_status "INFO" "No assets directory found"
fi

# 5. Code Quality Checks
echo -e "\n${BLUE}5. 📝 Code Quality Checks${NC}"
echo "-----------------------------------"

# Check for ESLint
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
    if command -v npx &> /dev/null; then
        print_status "INFO" "Running ESLint..."
        
        ESLINT_OUTPUT=$(npx eslint src/ --ext .js,.jsx,.ts,.tsx 2>&1)
        ESLINT_EXIT_CODE=$?
        
        if [ $ESLINT_EXIT_CODE -eq 0 ]; then
            print_status "SUCCESS" "No ESLint errors found"
        else
            print_status "WARNING" "ESLint issues found:"
            echo "$ESLINT_OUTPUT"
        fi
    else
        print_status "WARNING" "npx not available - cannot run ESLint"
    fi
else
    print_status "INFO" "No ESLint configuration found"
fi

# Check for proper file structure
REQUIRED_DIRS=("src" "src/components" "src/utils")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_status "SUCCESS" "Directory structure: $dir exists"
    else
        print_status "WARNING" "Directory structure: $dir missing"
    fi
done

# Check for required documentation
REQUIRED_DOCS=("README.md" "DEVELOPMENT_STANDARDS.md" "PRE_COMMIT_CHECKLIST.md")
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        print_status "SUCCESS" "Documentation: $doc exists"
    else
        print_status "WARNING" "Documentation: $doc missing"
    fi
done

# 6. Final Summary
echo -e "\n${BLUE}6. 📋 Security & Quality Summary${NC}"
echo "==========================================="

if [ "$OVERALL_SUCCESS" = true ]; then
    print_status "SUCCESS" "All critical security and quality checks passed!"
    echo -e "\n${GREEN}✅ READY FOR COMMIT${NC}"
    echo "Your code meets the development standards requirements."
else
    print_status "ERROR" "Some critical issues were found."
    echo -e "\n${RED}❌ NOT READY FOR COMMIT${NC}"
    echo "Please fix the issues above before committing."
    echo ""
    echo "Common fixes:"
    echo "• Run 'npm audit fix' for dependency vulnerabilities"
    echo "• Fix failing tests with 'npm test'"
    echo "• Remove hardcoded credentials and replace with environment variables"
    echo "• Replace console.log with proper logging utilities"
    echo "• Optimize large files and images"
fi

echo ""
echo "For more information, see:"
echo "• DEVELOPMENT_STANDARDS.md"
echo "• PRE_COMMIT_CHECKLIST.md"
echo "• docs/SECURITY_PERFORMANCE_TESTING.md"

# Exit with appropriate code
if [ "$OVERALL_SUCCESS" = true ]; then
    exit 0
else
    exit 1
fi

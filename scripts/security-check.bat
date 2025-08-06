@echo off
REM 🔒 Security & Quality Automation Script (Windows Version)
REM Implements automated security scanning as required by DEVELOPMENT_STANDARDS.md

echo 🔍 Running Pheno Hunter Security ^& Quality Checks...
echo ==================================================

setlocal enabledelayedexpansion
set OVERALL_SUCCESS=true

REM Function to print status messages
:print_status
    if "%~1"=="SUCCESS" (
        echo ✅ %~2
    ) else if "%~1"=="WARNING" (
        echo ⚠️  %~2
    ) else if "%~1"=="ERROR" (
        echo ❌ %~2
        set OVERALL_SUCCESS=false
    ) else if "%~1"=="INFO" (
        echo ℹ️  %~2
    )
goto :eof

echo.
echo 1. 🔒 Dependency Security Scan
echo -----------------------------------

where npm >nul 2>nul
if %errorlevel% equ 0 (
    call :print_status "INFO" "Running npm audit..."
    
    npm audit --audit-level moderate >audit_output.tmp 2>&1
    set AUDIT_EXIT_CODE=!errorlevel!
    
    if !AUDIT_EXIT_CODE! equ 0 (
        call :print_status "SUCCESS" "No moderate or high vulnerabilities found"
    ) else (
        call :print_status "ERROR" "Security vulnerabilities detected:"
        type audit_output.tmp
        echo.
        call :print_status "WARNING" "Run 'npm audit fix' to attempt automatic fixes"
    )
    del audit_output.tmp >nul 2>nul
) else (
    call :print_status "ERROR" "npm not found - cannot run security audit"
)

echo.
echo 2. 🧪 Code Quality ^& Testing
echo -----------------------------------

if exist package.json (
    npm run test --silent >nul 2>nul
    if !errorlevel! equ 0 (
        call :print_status "INFO" "Running test suite..."
        
        npm test >test_output.tmp 2>&1
        set TEST_EXIT_CODE=!errorlevel!
        
        if !TEST_EXIT_CODE! equ 0 (
            call :print_status "SUCCESS" "All tests passed"
        ) else (
            call :print_status "ERROR" "Tests failed:"
            type test_output.tmp
        )
        del test_output.tmp >nul 2>nul
    ) else (
        call :print_status "WARNING" "No test command found in package.json"
    )
    
    npm run build --silent >nul 2>nul
    if !errorlevel! equ 0 (
        call :print_status "INFO" "Testing production build..."
        
        npm run build >build_output.tmp 2>&1
        set BUILD_EXIT_CODE=!errorlevel!
        
        if !BUILD_EXIT_CODE! equ 0 (
            call :print_status "SUCCESS" "Production build successful"
        ) else (
            call :print_status "ERROR" "Production build failed:"
            type build_output.tmp
        )
        del build_output.tmp >nul 2>nul
    ) else (
        call :print_status "WARNING" "No build command found in package.json"
    )
) else (
    call :print_status "ERROR" "package.json not found"
)

echo.
echo 3. 🔍 File Security Scan
echo -----------------------------------

call :print_status "INFO" "Scanning for potential security issues..."

REM Check for hardcoded credentials
set CREDENTIALS_FOUND=false
findstr /R /I /S "password.*=" src\*.js src\*.jsx >nul 2>nul
if !errorlevel! equ 0 set CREDENTIALS_FOUND=true

findstr /R /I /S "secret.*=" src\*.js src\*.jsx >nul 2>nul
if !errorlevel! equ 0 set CREDENTIALS_FOUND=true

findstr /R /I /S "token.*=" src\*.js src\*.jsx >nul 2>nul
if !errorlevel! equ 0 set CREDENTIALS_FOUND=true

if "!CREDENTIALS_FOUND!"=="true" (
    call :print_status "ERROR" "Potential hardcoded credentials found"
    findstr /R /I /S "password.*=" src\*.js src\*.jsx 2>nul | findstr /V "mock demo"
    findstr /R /I /S "secret.*=" src\*.js src\*.jsx 2>nul | findstr /V "mock demo"
    findstr /R /I /S "token.*=" src\*.js src\*.jsx 2>nul | findstr /V "mock demo"
) else (
    call :print_status "SUCCESS" "No hardcoded credentials detected"
)

REM Check for console.log statements
for /f %%i in ('findstr /R /S "console\.log" src\*.js src\*.jsx 2^>nul ^| find /c /v ""') do set CONSOLE_LOGS=%%i
if !CONSOLE_LOGS! gtr 0 (
    call :print_status "WARNING" "!CONSOLE_LOGS! console.log statements found (consider using structured logging)"
) else (
    call :print_status "SUCCESS" "No console.log statements found"
)

echo.
echo 4. 📊 Performance Checks
echo -----------------------------------

if exist dist (
    call :print_status "INFO" "Analyzing bundle size..."
    set LARGE_FILES=false
    
    for /r dist %%f in (*.js) do (
        for %%a in ("%%f") do (
            set SIZE=%%~za
            set /a SIZE_MB=!SIZE!/1024/1024
            if !SIZE_MB! gtr 2 (
                if "!LARGE_FILES!"=="false" (
                    call :print_status "WARNING" "Large JavaScript files detected:"
                    set LARGE_FILES=true
                )
                echo   %%f: !SIZE_MB!MB
            )
        )
    )
    
    if "!LARGE_FILES!"=="false" (
        call :print_status "SUCCESS" "JavaScript bundle sizes are reasonable"
    )
) else (
    call :print_status "INFO" "No dist directory found - run 'npm run build' first"
)

REM Check for large images
call :print_status "INFO" "Checking for large images..."
set LARGE_IMAGES=false

if exist src\assets (
    for /r src\assets %%f in (*.jpg *.jpeg *.png *.gif *.webp) do (
        for %%a in ("%%f") do (
            set SIZE=%%~za
            set /a SIZE_KB=!SIZE!/1024
            if !SIZE_KB! gtr 500 (
                if "!LARGE_IMAGES!"=="false" (
                    call :print_status "WARNING" "Large image files detected:"
                    set LARGE_IMAGES=true
                )
                echo   %%f: !SIZE_KB!KB
            )
        )
    )
    
    if "!LARGE_IMAGES!"=="false" (
        call :print_status "SUCCESS" "Image file sizes are reasonable"
    )
) else (
    call :print_status "INFO" "No assets directory found"
)

echo.
echo 5. 📝 Code Quality Checks
echo -----------------------------------

REM Check for required directories
if exist src (
    call :print_status "SUCCESS" "Directory structure: src exists"
) else (
    call :print_status "WARNING" "Directory structure: src missing"
)

if exist src\components (
    call :print_status "SUCCESS" "Directory structure: src\components exists"
) else (
    call :print_status "WARNING" "Directory structure: src\components missing"
)

if exist src\utils (
    call :print_status "SUCCESS" "Directory structure: src\utils exists"
) else (
    call :print_status "WARNING" "Directory structure: src\utils missing"
)

REM Check for required documentation
if exist README.md (
    call :print_status "SUCCESS" "Documentation: README.md exists"
) else (
    call :print_status "WARNING" "Documentation: README.md missing"
)

if exist DEVELOPMENT_STANDARDS.md (
    call :print_status "SUCCESS" "Documentation: DEVELOPMENT_STANDARDS.md exists"
) else (
    call :print_status "WARNING" "Documentation: DEVELOPMENT_STANDARDS.md missing"
)

if exist PRE_COMMIT_CHECKLIST.md (
    call :print_status "SUCCESS" "Documentation: PRE_COMMIT_CHECKLIST.md exists"
) else (
    call :print_status "WARNING" "Documentation: PRE_COMMIT_CHECKLIST.md missing"
)

echo.
echo 6. 📋 Security ^& Quality Summary
echo ===========================================

if "!OVERALL_SUCCESS!"=="true" (
    call :print_status "SUCCESS" "All critical security and quality checks passed!"
    echo.
    echo ✅ READY FOR COMMIT
    echo Your code meets the development standards requirements.
) else (
    call :print_status "ERROR" "Some critical issues were found."
    echo.
    echo ❌ NOT READY FOR COMMIT
    echo Please fix the issues above before committing.
    echo.
    echo Common fixes:
    echo • Run 'npm audit fix' for dependency vulnerabilities
    echo • Fix failing tests with 'npm test'
    echo • Remove hardcoded credentials and replace with environment variables
    echo • Replace console.log with proper logging utilities
    echo • Optimize large files and images
)

echo.
echo For more information, see:
echo • DEVELOPMENT_STANDARDS.md
echo • PRE_COMMIT_CHECKLIST.md
echo • docs\SECURITY_PERFORMANCE_TESTING.md

REM Exit with appropriate code
if "!OVERALL_SUCCESS!"=="true" (
    exit /b 0
) else (
    exit /b 1
)

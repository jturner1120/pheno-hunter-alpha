# PhenoHunter Session Security Implementation

## Overview
Implemented comprehensive session security features to automatically log users out based on inactivity and session duration, significantly improving the application's security posture.

## Security Features Implemented

### 1. **Inactivity Timeout**
- **Duration**: 30 minutes of user inactivity
- **Warning**: Users receive a 5-minute warning before logout
- **Detection**: Monitors mouse movement, clicks, keyboard input, scrolling, and touch events
- **Behavior**: Automatically logs out users who don't interact with the app

### 2. **Maximum Session Duration**
- **Duration**: 8 hours maximum session time
- **Behavior**: Forces logout regardless of activity after 8 hours
- **Purpose**: Prevents indefinite sessions even for active users

### 3. **Browser Close Detection**
- **Implementation**: Uses `browserSessionPersistence` in Firebase
- **Behavior**: Clears authentication when browser/tab is closed
- **Storage**: Session data stored in `sessionStorage` (cleared on browser close)

### 4. **Session Warning System**
- **Modal Dialog**: Shows countdown timer when session is about to expire
- **User Options**: 
  - "Stay Logged In" - Extends session and resets timers
  - "Log Out Now" - Immediately logs out user
- **Auto-close**: Automatically logs out if no action taken

### 5. **Visibility Change Detection**
- **Tab Switching**: Detects when user switches away from/back to tab
- **Session Validation**: Checks session validity when user returns
- **Smart Resume**: Resets activity timers when user returns to active tab

## Technical Implementation

### Modified Files:

#### 1. `src/hooks/useAuth.jsx`
- Added session management state and timers
- Implemented activity detection and timeout logic
- Added session persistence with sessionStorage
- Enhanced authentication with security features

#### 2. `src/config/firebase.js`
- Changed Firebase persistence from `localStorage` to `sessionStorage`
- Session cleared when browser closes

#### 3. `src/components/SessionWarning.jsx`
- New modal component for session expiration warnings
- Countdown timer and user action buttons
- Accessible and user-friendly design

#### 4. `src/components/SessionStatus.jsx`
- Debug component showing session information
- Real-time display of session age and inactivity time
- Remove in production

#### 5. `src/App.jsx`
- Added SessionWarning component globally
- Added SessionStatus for development/testing

### Security Configuration:
```javascript
const SECURITY_CONFIG = {
  INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours
  WARNING_BEFORE_LOGOUT: 5 * 60 * 1000, // 5 minutes warning
  SESSION_STORAGE_KEY: 'phenohunter_session',
  LAST_ACTIVITY_KEY: 'phenohunter_last_activity'
};
```

## User Experience

### What Users Will Experience:

1. **Normal Usage**: No interruption, session extends automatically with activity
2. **Inactivity Warning**: Modal appears 5 minutes before timeout with clear options
3. **Browser Close**: Automatic logout when browser/tab is closed
4. **Session Expiry**: Automatic logout after 8 hours regardless of activity
5. **Tab Switching**: Smart session validation when returning to tab

### Visual Indicators:
- Session warning modal with countdown timer
- Clear messaging about why logout is happening
- Easy options to extend session or logout immediately

## Security Benefits

1. **Prevents Unauthorized Access**: Unattended devices automatically log out
2. **Limits Session Hijacking**: Maximum session duration limits exposure
3. **Browser Security**: Sessions don't persist across browser restarts
4. **User Awareness**: Clear warnings give users control over their sessions
5. **Compliance Ready**: Meets security standards for web applications

## Testing

### Manual Testing Steps:
1. **Inactivity Test**: Login, wait 25 minutes without activity, verify warning appears
2. **Activity Reset**: Interact during warning, verify session extends
3. **Browser Close**: Close browser, reopen, verify logout
4. **Tab Switch**: Switch tabs for extended period, return, verify session check
5. **Maximum Session**: Keep active session for 8+ hours, verify forced logout

### Debug Features:
- SessionStatus component shows real-time session information
- Console logging for all security events
- Session storage keys for manual inspection

## Production Considerations

### Before Production Deploy:
1. Remove or comment out `<SessionStatus />` component
2. Adjust timeout values if needed for business requirements
3. Test thoroughly with real user workflows
4. Consider adding user preferences for session duration

### Monitoring:
- Log security events for analytics
- Monitor user feedback about session timeouts
- Track logout reasons for optimization

## Configuration Options

Security timeouts can be easily adjusted by modifying `SECURITY_CONFIG`:

```javascript
// For more restrictive security:
INACTIVITY_TIMEOUT: 15 * 60 * 1000, // 15 minutes
MAX_SESSION_DURATION: 4 * 60 * 60 * 1000, // 4 hours

// For less restrictive (not recommended):
INACTIVITY_TIMEOUT: 60 * 60 * 1000, // 1 hour
MAX_SESSION_DURATION: 12 * 60 * 60 * 1000, // 12 hours
```

## Conclusion

The implemented session security features provide robust protection against unauthorized access while maintaining a good user experience. Users are clearly informed about timeouts and given reasonable opportunities to extend their sessions when needed.

This implementation follows security best practices and significantly improves the application's overall security posture without sacrificing usability.

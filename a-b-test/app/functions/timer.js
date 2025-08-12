/**
 * Timer utility functions for A/B test session tracking
 * Centralizes all timer calculation logic used across the application
 */

/**
 * Calculate session duration in minutes
 * @param {string} startTime - ISO timestamp string
 * @param {string} endTime - ISO timestamp string
 * @returns {number} Duration in minutes
 */
export const calculateSessionMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.floor((end - start) / (1000 * 60));
};

/**
 * Calculate current session minutes from start time to now
 * @param {string} startTime - ISO timestamp string
 * @returns {number} Duration in minutes from start to now
 */
export const calculateCurrentSessionMinutes = (startTime) => {
    if (!startTime) return 0;
    const start = new Date(startTime);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60));
};

/**
 * Format minutes into "Xh Ym" format
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted time string (e.g., "2h 30m")
 */
export const formatTime = (minutes) => {
    if (typeof minutes !== 'number' || minutes < 0) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

/**
 * Calculate total time from all completed sessions
 * @param {Array} sessions - Array of session objects
 * @returns {number} Total minutes from completed sessions
 */
export const calculateCompletedSessionsTime = (sessions) => {
    if (!Array.isArray(sessions)) return 0;

    return sessions.reduce((total, session) => {
        if (session.startTime && session.endTime) {
            return total + calculateSessionMinutes(session.startTime, session.endTime);
        }
        return total;
    }, 0);
};

/**
 * Find the most recent active session (session without endTime)
 * @param {Array} sessions - Array of session objects
 * @returns {Object|null} Most recent active session or null
 */
export const findActiveSession = (sessions) => {
    if (!Array.isArray(sessions)) return null;

    let activeSession = null;
    let latestStartTime = null;

    sessions.forEach(session => {
        if (session.startTime && !session.endTime) {
            const startTime = new Date(session.startTime);
            if (!latestStartTime || startTime > latestStartTime) {
                latestStartTime = startTime;
                activeSession = session;
            }
        }
    });

    return activeSession;
};

/**
 * Calculate total accumulated time including active session
 * @param {Array} sessions - Array of session objects
 * @param {string} testStatus - Test status ('active', 'deactive', 'pending')
 * @returns {Object} Object with totalMinutes and hasActiveSession
 */
export const calculateTotalTime = (sessions, testStatus) => {
    if (!Array.isArray(sessions)) {
        return { totalMinutes: 0, hasActiveSession: false };
    }

    // Calculate completed sessions time
    let totalMinutes = calculateCompletedSessionsTime(sessions);
    let hasActiveSession = false;

    // Add current active session time if test is active
    if (testStatus === 'active') {
        const activeSession = findActiveSession(sessions);
        if (activeSession) {
            totalMinutes += calculateCurrentSessionMinutes(activeSession.startTime);
            hasActiveSession = true;
        }
    } else {
        // For inactive tests, include time from any open session
        const activeSession = findActiveSession(sessions);
        if (activeSession) {
            totalMinutes += calculateCurrentSessionMinutes(activeSession.startTime);
        }
    }

    return { totalMinutes, hasActiveSession };
};

/**
 * Calculate and format total time for display
 * @param {Array} sessions - Array of session objects
 * @param {string} testStatus - Test status ('active', 'deactive', 'pending')
 * @returns {string} Formatted time string
 */
export const calculateAndFormatTotalTime = (sessions, testStatus) => {
    const { totalMinutes } = calculateTotalTime(sessions, testStatus);
    return formatTime(totalMinutes);
};

/**
 * Create a new session object
 * @param {string} sessionType - Type of session ('manual' or 'reactivation')
 * @returns {Object} New session object
 */
export const createNewSession = (sessionType = 'manual') => {
    return {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        endTime: null,
        sessionType
    };
};

/**
 * Close all open sessions by setting their endTime
 * @param {Array} sessions - Array of session objects
 * @param {string} endTime - ISO timestamp string for end time (defaults to now)
 * @returns {Array} Updated sessions array with closed sessions
 */
export const closeOpenSessions = (sessions, endTime = null) => {
    if (!Array.isArray(sessions)) return [];

    const closeTime = endTime || new Date().toISOString();

    return sessions.map(session => {
        if (session.startTime && !session.endTime) {
            return { ...session, endTime: closeTime };
        }
        return session;
    });
};

/**
 * Timer calculation for real-time updates (used in components)
 * @param {Array} sessions - Array of session objects
 * @param {string} testStatus - Test status ('active', 'deactive', 'pending')
 * @returns {Object} Object with time string and update info
 */
export const getTimerDisplayData = (sessions, testStatus) => {
    if (!Array.isArray(sessions) || sessions.length === 0) {
        return {
            displayTime: '0h 0m',
            shouldUpdate: false,
            isActive: false
        };
    }

    const { totalMinutes, hasActiveSession } = calculateTotalTime(sessions, testStatus);
    const isActive = testStatus === 'active';

    return {
        displayTime: formatTime(totalMinutes),
        shouldUpdate: hasActiveSession && isActive,
        isActive,
        hasActiveSession
    };
};

/**
 * Validate session data integrity
 * @param {Array} sessions - Array of session objects
 * @returns {Object} Validation result with issues array
 */
export const validateSessions = (sessions) => {
    const issues = [];

    if (!Array.isArray(sessions)) {
        issues.push('Sessions must be an array');
        return { isValid: false, issues };
    }

    sessions.forEach((session, index) => {
        if (!session.id) {
            issues.push(`Session at index ${index} is missing id`);
        }
        if (!session.startTime) {
            issues.push(`Session at index ${index} is missing startTime`);
        }
        if (!session.sessionType) {
            issues.push(`Session at index ${index} is missing sessionType`);
        }
        if (session.startTime && session.endTime) {
            const start = new Date(session.startTime);
            const end = new Date(session.endTime);
            if (end < start) {
                issues.push(`Session at index ${index} has endTime before startTime`);
            }
        }
    });

    return {
        isValid: issues.length === 0,
        issues
    };
};

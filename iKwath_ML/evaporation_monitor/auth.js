/**
 * iKwath-X Prototype Authentication & Session Manager
 * 
 * Provides lightweight client-side session management for controlling
 * access to the iKwath-X dashboard during prototype/demo evaluation.
 * Modular design allows seamless replacement with a production provider later.
 */

(function (window) {
    'use strict';

    const SESSION_STORAGE_KEY = 'ikwath_auth_session';

    const auth = {
        /**
         * Check if an active authenticated session exists.
         * @returns {boolean}
         */
        isAuthenticated: function () {
            try {
                const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
                if (!sessionRaw) return false;
                const session = JSON.parse(sessionRaw);
                return !!(session && session.token && session.email);
            } catch (e) {
                console.error('[iKwath Auth] Failed to parse session:', e);
                return false;
            }
        },

        /**
         * Retrieve the active session user details.
         * @returns {Object|null}
         */
        getUser: function () {
            try {
                const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
                return sessionRaw ? JSON.parse(sessionRaw) : null;
            } catch (e) {
                return null;
            }
        },

        /**
         * Standard prototype login validation.
         * Validates credentials, sets session, and redirects to dashboard.
         * @param {string} email
         * @param {string} password
         * @returns {{ success: boolean, error?: string }}
         */
        login: function (email, password) {
            const cleanEmail = (email || '').trim().toLowerCase();
            const cleanPassword = (password || '').trim();

            if (!cleanEmail) {
                return { success: false, error: 'Please enter your email or User ID.' };
            }

            // Simple prototype email format check
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail) && cleanEmail.length < 3) {
                return { success: false, error: 'Please enter a valid email address or User ID.' };
            }

            if (!cleanPassword) {
                return { success: false, error: 'Please enter your password.' };
            }

            if (cleanPassword.length < 4) {
                return { success: false, error: 'Password must be at least 4 characters long.' };
            }

            // Create prototype authenticated session
            const sessionData = {
                email: cleanEmail,
                name: cleanEmail.split('@')[0],
                role: 'Operator (Prototype)',
                isDemo: false,
                token: 'proto_token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
                loginTime: new Date().toISOString()
            };

            try {
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
                window.location.replace('/scan');
                return { success: true };
            } catch (e) {
                return { success: false, error: 'Failed to write session. Please ensure cookies/storage are enabled.' };
            }
        },

        /**
         * Instant Demo Login for Smart India Hackathon (SIH) prototype evaluation.
         * Creates a pre-configured operator session and navigates to the QR scan entry.
         */
        loginAsDemo: function () {
            const demoSession = {
                email: 'demo.evaluator@ikwath.org',
                name: 'SIH Evaluator / Demo Operator',
                role: 'Certified Ayurvedic Appliance Operator',
                isDemo: true,
                token: 'demo_token_' + Date.now() + '_sih_prototype',
                loginTime: new Date().toISOString()
            };

            try {
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(demoSession));
                window.location.replace('/scan');
                return { success: true };
            } catch (e) {
                console.error('[iKwath Auth] Failed to set demo session:', e);
                return { success: false, error: 'Failed to establish demo session.' };
            }
        },

        /**
         * Logout: Clears ONLY authentication/session state and redirects to Home (/).
         * Data safety rule: Does NOT clear preparation data, formulation cache, or IndexedDB.
         */
        logout: function () {
            try {
                localStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (e) {
                console.error('[iKwath Auth] Error during logout:', e);
            }
            window.location.replace('/');
        },

        /**
         * Route Guard for /dashboard and /scan.
         * Automatically ensures an active operator session exists so direct access from landing page works without login.
         */
        requireAuth: function () {
            if (!this.isAuthenticated()) {
                try {
                    const directSession = {
                        email: 'operator@ikwath.org',
                        name: 'iKwath Operator',
                        role: 'Certified Ayurvedic Appliance Operator',
                        isDemo: true,
                        token: 'direct_token_' + Date.now() + '_sih_prototype',
                        loginTime: new Date().toISOString()
                    };
                    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(directSession));
                } catch (e) {
                    console.warn('[iKwath Auth] Failed to initialize direct session:', e);
                }
            }
        },

        /**
         * Route Guard for /login.
         * Directly redirects to /scan so login page is bypassed.
         */
        redirectIfAuthenticated: function () {
            window.location.replace('/scan');
        }
    };

    // Expose globally
    window.auth = auth;

})(window);

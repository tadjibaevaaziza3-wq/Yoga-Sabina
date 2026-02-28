import { AuthProvider } from 'react-admin';

export const authProvider: AuthProvider = {
    // Called when the user attempts to log in
    login: async ({ username, password }) => {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });

        if (response.status < 200 || response.status >= 300) {
            throw new Error('Invalid credentials');
        }

        const { success, error, token } = await response.json();

        if (!success) {
            throw new Error(error || 'Login failed');
        }

        if (token) {
            localStorage.setItem('admin_token', token);
        }

        return Promise.resolve();
    },

    // Called when the user clicks on the logout button
    logout: async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        return Promise.resolve();
    },

    // Called when the API returns an error
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            return Promise.reject();
        }
        return Promise.resolve();
    },

    // Called when the user navigates to a new location, to check for authentication
    checkAuth: async () => {
        // Retry once on failure for pgBouncer resilience
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await fetch('/api/admin/profile');
                if (response.status >= 200 && response.status < 300) {
                    const data = await response.json().catch(() => null);
                    if (data && data.id && data.displayName) {
                        return Promise.resolve();
                    }
                }
                // 401 means genuinely unauthorized — don't retry
                if (response.status === 401) {
                    return Promise.reject();
                }
                // Other errors (500, 503) — retry
                if (attempt === 0) {
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }
            } catch (fetchError) {
                // Network error — retry
                if (attempt === 0) {
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }
            }
        }
        return Promise.reject();
    },

    // Called when the user navigates to a new location, to check for permissions / roles
    getPermissions: async () => {
        try {
            const response = await fetch('/api/admin/profile');
            const user = await response.json();
            return Promise.resolve({ role: user.role, permissions: user.permissions });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // Called to get the identity of the current user
    getIdentity: async () => {
        try {
            const response = await fetch('/api/admin/profile');
            const data = await response.json();

            if (!data || !data.id || !data.displayName) {
                return Promise.reject();
            }

            return Promise.resolve({
                id: data.id,
                fullName: data.displayName,
                avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName)}&background=0a8069&color=fff`,
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }
};

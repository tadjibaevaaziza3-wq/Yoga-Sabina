import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'react-admin';

// Custom HttpClient that sends auth cookies + admin token with every request
const httpClient = (url: string, options: fetchUtils.Options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    // Send cookies (admin_session) with every request
    options.credentials = 'include';

    // Also send admin_token via Authorization header as fallback
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (token) {
        (options.headers as Headers).set('Authorization', `Bearer ${token}`);
    }
    return fetchUtils.fetchJson(url, options);
};

export const dataProvider = simpleRestProvider('/api/admin/ra', httpClient);


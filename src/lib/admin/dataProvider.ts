import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'react-admin';

// Custom HttpClient that intercepts 401s and 403s
const httpClient = (url: string, options: fetchUtils.Options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    // options.credentials = 'include' if we relied on cookies, but next/server
    // cookies() automatically reads from the request in App API Routes on same domain
    return fetchUtils.fetchJson(url, options);
};

export const dataProvider = simpleRestProvider('/api/admin/ra', httpClient);

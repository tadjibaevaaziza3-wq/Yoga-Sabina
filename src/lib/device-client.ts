/**
 * Retrieves or generates a unique Device ID for the current browser.
 * Persists in localStorage.
 */
export function getDeviceId(): string {
    if (typeof window === 'undefined') return ''; // SSR check

    let deviceId = localStorage.getItem('baxtli_device_id');

    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('baxtli_device_id', deviceId);
    }

    return deviceId;
}

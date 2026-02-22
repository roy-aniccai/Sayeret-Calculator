/**
 * GTM (Google Tag Manager) utility for pushing events to the dataLayer.
 * GTM picks these up and forwards them to connected platforms (Facebook Pixel, Google Ads, etc.)
 *
 * Events are suppressed on localhost to prevent polluting ad platform data with test traffic.
 */

const isLocalhost = (): boolean => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.');
};

export const pushGtmEvent = (event: string, extra?: Record<string, any>) => {
    if (isLocalhost()) {
        console.log(`[GTM - suppressed on localhost] ${event}`, extra);
        return;
    }
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({ event, ...extra });
    }
};

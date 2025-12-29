/// <reference types="vite/client" />
import { auth } from '../src/firebase';
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3005/api';
const ADMIN_API_BASE_URL = import.meta.env.PROD ? '/admin-api' : 'http://localhost:3005/admin-api';

export const submitData = async (data: any) => {
    try {
        console.log(`Submitting data to ${API_BASE_URL}/submit`, data);
        const response = await fetch(`${API_BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to submit data: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('CRITICAL: Error submitting data.', error);
        throw error;
    }
};

export const trackEvent = async (sessionId: string, eventType: string, eventData?: any) => {
    try {
        await fetch(`${API_BASE_URL}/event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId,
                eventType,
                eventData,
            }),
        });
    } catch (error) {
        console.warn('Failed to track event:', error);
    }
};

const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const token = await user.getIdToken();
    return {
        'Authorization': `Bearer ${token}`
    };
};

export const getSubmissions = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${ADMIN_API_BASE_URL}/submissions`, { headers });
        if (!response.ok) throw new Error('Failed to fetch submissions');
        return await response.json();
    } catch (error) {
        console.error('Error fetching submissions:', error);
        throw error;
    }
};

export const getEvents = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${ADMIN_API_BASE_URL}/events`, { headers });
        if (!response.ok) throw new Error('Failed to fetch events');
        return await response.json();
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

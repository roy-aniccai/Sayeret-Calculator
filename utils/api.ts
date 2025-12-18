const API_BASE_URL = 'http://localhost:3005/api';

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
        console.error('CRITICAL: Error submitting data. Ensure backend is running on port 3005.', error);
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
        // Fail silently for analytics to not disrupt user experience
        console.warn('Failed to track event:', error);
    }
};

export const getSubmissions = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/submissions`);
        if (!response.ok) throw new Error('Failed to fetch submissions');
        return await response.json();
    } catch (error) {
        console.error('Error fetching submissions:', error);
        throw error;
    }
};

export const getEvents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        return await response.json();
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

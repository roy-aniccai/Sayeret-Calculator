import React from 'react';
import { EventLog } from '../types';

interface EventsTableProps {
    events: EventLog[];
}

export const EventsTable: React.FC<EventsTableProps> = ({ events }) => {
    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Session ID</th>
                        <th className="p-3">Event Type</th>
                        <th className="p-3">Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {events.map(evt => {
                        const dateRaw = evt.createdAt || evt.created_at;
                        const dateStr = dateRaw ? new Date(dateRaw).toLocaleString() : 'N/A';
                        const sid = evt.sessionId || evt.session_id || 'N/A';
                        const type = evt.eventType || evt.event_type || 'Unknown';

                        return (
                            <tr key={evt.id} className="hover:bg-gray-50">
                                <td className="p-3 text-gray-500 whitespace-nowrap">{dateStr}</td>
                                <td className="p-3 font-mono text-xs">{sid.slice(0, 8)}...</td>
                                <td className="p-3 font-bold text-gray-700">{type}</td>
                                <td className="p-3 text-gray-600 truncate max-w-xs" title={JSON.stringify(evt.event_data_json)}>
                                    {JSON.stringify(evt.event_data_json)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

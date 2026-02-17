import React from 'react';
import { EventLog } from '../types';

interface EventsTableProps {
    events: EventLog[];
    filteredSessionIds?: string[] | null;
}

export const EventsTable: React.FC<EventsTableProps> = ({ events, filteredSessionIds }) => {
    const displayedEvents = filteredSessionIds
        ? events.filter(e => filteredSessionIds.includes(e.sessionId || (e as any).session_id || ''))
        : events;

    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Events Log ({displayedEvents.length}) {filteredSessionIds ? '(Filtered)' : ''}</h3>
                {filteredSessionIds && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Showing data for {filteredSessionIds.length} sessions
                    </span>
                )}
            </div>
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
                    {displayedEvents.slice(0, 200).map(evt => {
                        const dateRaw = evt.createdAt || (evt as any).created_at;
                        const dateStr = dateRaw ? new Date(dateRaw).toLocaleString() : 'N/A';
                        const sid = evt.sessionId || (evt as any).session_id || 'N/A';
                        const type = evt.eventType || (evt as any).event_type || 'Unknown';
                        const dataJson = (evt as any).event_data_json || evt.eventData || {};

                        return (
                            <tr key={evt.id} className="hover:bg-gray-50">
                                <td className="p-3 text-gray-500 whitespace-nowrap">{dateStr}</td>
                                <td className="p-3 font-mono text-xs text-blue-600 truncate max-w-[100px]" title={sid}>{sid}</td>
                                <td className="p-3 font-bold text-gray-700">{type}</td>
                                <td className="p-3 text-gray-600 truncate max-w-xs" title={JSON.stringify(dataJson)}>
                                    {JSON.stringify(dataJson)}
                                </td>
                            </tr>
                        );
                    })}
                    {displayedEvents.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500">No events found matching filter</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

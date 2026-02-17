import React from 'react';
import { Submission } from '../types';

interface SubmissionsTableProps {
    submissions: Submission[];
    filteredSessionIds?: string[] | null;
    onSelect: (submission: Submission) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({ submissions, filteredSessionIds, onSelect }) => {
    const displayedSubmissions = filteredSessionIds
        ? submissions.filter(s => filteredSessionIds.includes(s.sessionId || (s as any).session_id || ''))
        : submissions;

    const getSubmissionDetails = (sub: Submission) => {
        const data = sub.full_data_json || {};
        // Prioritize new API (camelCase), then DB raw (snake_case), then JSON data, then fallback
        const name = sub.leadName || (sub as any).lead_name || data.leadName || data.lead_name || 'לא צוין';
        const phone = sub.leadPhone || (sub as any).lead_phone || data.leadPhone || data.lead_phone || 'לא צוין';

        // Handle Date (New API = createdAt, Old = created_at)
        const dateRaw = sub.createdAt || (sub as any).created_at;
        const dateStr = dateRaw ? new Date(dateRaw.replace(' ', 'T')).toLocaleString() : 'תאריך לא ידוע';

        // Insurance status
        const interestedInInsurance = (sub as any).interestedInInsurance === true || data.interestedInInsurance === true;

        return { name, phone, dateStr, interestedInInsurance };
    };

    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Leads ({displayedSubmissions.length}) {filteredSessionIds ? '(Filtered)' : ''}</h3>
                {filteredSessionIds && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Showing data for {filteredSessionIds.length} sessions
                    </span>
                )}
            </div>
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4 text-center">Insurance</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {displayedSubmissions.map(sub => {
                        const details = getSubmissionDetails(sub);
                        return (
                            <tr key={sub.id} className="hover:bg-blue-50">
                                <td className="p-4 text-gray-600">{details.dateStr}</td>
                                <td className="p-4 font-medium">{details.name}</td>
                                <td className="p-4">{details.phone}</td>
                                <td className="p-4 text-center">
                                    {details.interestedInInsurance ? (
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full" title="Interested in Insurance">
                                            <i className="fa-solid fa-check"></i>
                                        </span>
                                    ) : (
                                        <span className="text-gray-300">-</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => onSelect(sub)}
                                        className="text-blue-600 hover:text-blue-800 font-bold"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {displayedSubmissions.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">No leads found matching filter</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

import React from 'react';
import { Submission } from '../types';

interface SubmissionsTableProps {
    submissions: Submission[];
    onSelect: (submission: Submission) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({ submissions, onSelect }) => {
    const getSubmissionDetails = (sub: Submission) => {
        const data = sub.full_data_json || {};
        // Prioritize new API (camelCase), then DB raw (snake_case), then JSON data, then fallback
        const name = sub.leadName || sub.lead_name || data.leadName || data.lead_name || 'לא צוין';
        const phone = sub.leadPhone || sub.lead_phone || data.leadPhone || data.lead_phone || 'לא צוין';

        // Handle Date (New API = createdAt, Old = created_at)
        const dateRaw = sub.createdAt || sub.created_at;
        const dateStr = dateRaw ? new Date(dateRaw.replace(' ', 'T')).toLocaleString() : 'תאריך לא ידוע';

        return { name, phone, dateStr };
    };

    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {submissions.map(sub => {
                        const details = getSubmissionDetails(sub);
                        return (
                            <tr key={sub.id} className="hover:bg-blue-50">
                                <td className="p-4 text-gray-600">{details.dateStr}</td>
                                <td className="p-4 font-medium">{details.name}</td>
                                <td className="p-4">{details.phone}</td>
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
                </tbody>
            </table>
        </div>
    );
};

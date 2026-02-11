import React from 'react';
import { Submission } from '../types';
import { calculateResults } from '../utils/calculator';

interface SubmissionDetailsProps {
    submission: Submission | null;
}

export const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({ submission }) => {
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

    const generateMockMessage = (sub: Submission) => {
        const data = sub.full_data_json || {};
        const results = calculateResults(data);
        const { name, phone, dateStr } = getSubmissionDetails(sub);
        // Using concatenation for safety against parser issues with Hebrew in template literals during build
        let msg = "*הודעת סיכום (Mock)*\n";
        msg += "-------------------\n";
        msg += "*פרטי לקוח:*\n";
        msg += `שם: ${name}\n`;
        msg += `טלפון: ${phone}\n\n`;

        msg += "*נתוני בסיס:*\n";
        msg += `שווי נכס: ${data.propertyValue?.toLocaleString()} ₪\n`;
        msg += `יתרת משכנתא: ${data.mortgageBalance?.toLocaleString()} ₪\n`;
        msg += `החזר נוכחי: ${data.currentPayment?.toLocaleString()} ₪\n`;
        msg += `שנים שנותרו: ${data.yearsRemaining}\n\n`;

        msg += "*ניתוח פיננסי:*\n";
        msg += `מסלול נבחר: ${results.title}\n`;
        msg += `${results.labelBefore}: ${results.valBefore.toLocaleString()} ${results.unit}\n`;
        msg += `${results.labelAfter}: ${results.valAfter.toLocaleString()} ${results.unit}\n`;
        msg += `חיסכון/שינוי משוער: ${results.badgeText}\n\n`;

        msg += "*ביטוח משכנתא:*\n";
        msg += "ניתן לחסוך כ-50,000 ש\"ח בביטוח המשכנתא\n\n";
        msg += "-------------------\n";
        msg += `נשלח בתאריך: ${dateStr}\n`;

        return msg;
    };

    if (!submission) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400 border-2 border-dashed border-gray-200">
                <i className="fa-regular fa-file-lines text-4xl mb-4"></i>
                <p>Select a lead to view details</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow p-6 sticky top-6">
            <h3 className="text-xl font-bold mb-4">Lead Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm whitespace-pre-wrap">
                {generateMockMessage(submission)}
            </div>
            <div className="mt-4">
                <h4 className="font-bold mb-2">Raw Data:</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs h-64" dir="ltr">
                    {JSON.stringify(submission.full_data_json, null, 2)}
                </pre>
            </div>
        </div>
    );
};

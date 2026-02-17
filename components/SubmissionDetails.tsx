import React from 'react';
import { Submission } from '../types';

interface SubmissionDetailsProps {
    submission: Submission | null;
}

const SCENARIO_LABELS: Record<string, string> = {
    HIGH_SAVING: 'חיסכון גבוה',
    LOW_SAVING: 'חיסכון נמוך',
    NO_SAVING: 'אין חיסכון',
};

const ACTION_LABELS: Record<string, string> = {
    CLICK_SAVE_FOR_ME: 'לחיצה על "תחסכו לי"',
    CLICK_SCHEDULE_MEETING: 'תיאום פגישה',
    CLICK_CALLBACK: 'בקשת שיחה חוזרת',
    CLICK_CALENDLY: 'פתיחת Calendly',
    CLICK_TRY_ANOTHER: 'בדיקת תרחיש אחר',
    TOGGLE_INSURANCE: 'שינוי העדפת ביטוח',
    REQUEST_CALLBACK: 'שליחת בקשת שיחה',
    UPDATE_CONTACT_DETAILS: 'עדכון פרטי קשר',
};

export const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({ submission }) => {
    if (!submission) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400 border-2 border-dashed border-gray-200">
                <i className="fa-regular fa-file-lines text-4xl mb-4"></i>
                <p>Select a lead to view details</p>
            </div>
        );
    }

    const data = submission.full_data_json || {};
    const name = submission.leadName || submission.lead_name || data.leadName || data.lead_name || 'לא צוין';
    const phone = submission.leadPhone || submission.lead_phone || data.leadPhone || data.lead_phone || 'לא צוין';
    const dateRaw = submission.createdAt || submission.created_at;
    const dateStr = dateRaw ? new Date(dateRaw.replace(' ', 'T')).toLocaleString() : 'תאריך לא ידוע';

    const sim = submission.simulationResult;
    const fullDataSim = data.simulationResult;
    const actions = submission.postSubmissionLog || [];

    // Prefer monthlySavings from full_data_json.simulationResult (original submission),
    // falling back to top-level simulationResult
    const monthlySavings = fullDataSim?.monthlySavings ?? sim?.monthlySavings;

    return (
        <div className="bg-white rounded-xl shadow p-6 sticky top-6 space-y-6">
            <h3 className="text-xl font-bold">Lead Details</h3>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">שם:</span> {name}</div>
                <div><span className="font-semibold">טלפון:</span> {phone}</div>
                <div><span className="font-semibold">תאריך:</span> {dateStr}</div>
                <div><span className="font-semibold">Session:</span> <span className="font-mono text-xs">{submission.sessionId || data.sessionId || '—'}</span></div>
            </div>

            {/* Simulation Result */}
            {sim && (
                <div className={`rounded-lg p-4 border ${sim.canSave ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <h4 className="font-bold mb-2">תוצאות סימולציה</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>תרחיש: <span className="font-semibold">{SCENARIO_LABELS[sim.scenario] || sim.scenario}</span></div>
                        <div>חיסכון חודשי: <span className="font-semibold">{monthlySavings?.toLocaleString()} ₪</span></div>
                        <div>תקופה חדשה: <span className="font-semibold">{sim.newMortgageDurationYears} שנים</span></div>
                        <div>ניתן לחסוך: <span className="font-semibold">{sim.canSave ? '✅ כן' : '❌ לא'}</span></div>
                    </div>
                </div>
            )}

            {/* Financial Data */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-bold mb-2">נתונים פיננסיים</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>יתרת משכנתא: {data.mortgageBalance?.toLocaleString()} ₪</div>
                    <div>הלוואות אחרות: {data.otherLoansBalance?.toLocaleString()} ₪</div>
                    <div>החזר משכנתא: {data.mortgagePayment?.toLocaleString()} ₪</div>
                    <div>החזר הלוואות: {data.otherLoansPayment?.toLocaleString()} ₪</div>
                    <div>שווי נכס: {data.propertyValue?.toLocaleString()} ₪</div>
                    <div>גיל: {data.age || '—'}</div>
                </div>
            </div>

            {/* Tracking Flags */}
            <div className="flex flex-wrap gap-2">
                {submission.interestedInInsurance != null && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${submission.interestedInInsurance ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {submission.interestedInInsurance ? '✅ מעוניין בביטוח' : '❌ לא מעוניין בביטוח'}
                    </span>
                )}
                {submission.didClickCalendly && <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">📅 Calendly</span>}
                {submission.didRequestCallback && <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">📞 שיחה חוזרת</span>}
                {submission.didRequestSavings && <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">💰 תחסכו לי</span>}
                {submission.contactDetailsUpdated && <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">✏️ פרטים עודכנו</span>}
            </div>

            {/* Post-Submission Actions Log */}
            {actions.length > 0 && (
                <div>
                    <h4 className="font-bold mb-2">לוג פעולות ({actions.length})</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {actions.map((action, i) => (
                            <div key={i} className="text-xs bg-gray-50 rounded p-2 flex justify-between">
                                <span className="font-medium">{ACTION_LABELS[action.type] || action.type}</span>
                                <span className="text-gray-400">{new Date(action.timestamp).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Raw Data (collapsed) */}
            <details className="mt-4">
                <summary className="cursor-pointer font-bold text-sm text-gray-600 hover:text-gray-800">Raw Data</summary>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs h-64 mt-2" dir="ltr">
                    {JSON.stringify(submission.full_data_json, null, 2)}
                </pre>
            </details>
        </div>
    );
};


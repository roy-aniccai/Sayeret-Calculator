import React, { useEffect, useState } from 'react';
import { getSubmissions, getEvents } from '../utils/api';
import { calculateResults } from '../utils/calculator';
import { ParametersEditor } from './ParametersEditor';
import { ParametersDisplay } from './ParametersDisplay';

interface Submission {
    id: number;
    created_at: string;
    lead_name: string;
    lead_phone: string;
    lead_email: string;
    full_data_json: any;
}

interface EventLog {
    id: number;
    created_at: string;
    session_id: string;
    event_type: string;
    event_data_json: any;
}

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [events, setEvents] = useState<EventLog[]>([]);
    const [activeTab, setActiveTab] = useState<'submissions' | 'events' | 'parameters'>('submissions');
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showParametersEditor, setShowParametersEditor] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const subs = await getSubmissions();
            setSubmissions(subs.data);
            const evts = await getEvents();
            setEvents(evts.data);
        } catch (e) {
            console.error("Failed to load admin data");
        }
    };

    const generateMockMessage = (sub: Submission) => {
        const data = sub.full_data_json;
        const results = calculateResults(data);

        return `
*הודעת סיכום (Mock)*
-------------------
*פרטי לקוח:*
שם: ${sub.lead_name}
טלפון: ${sub.lead_phone}
אימייל: ${sub.lead_email}

*נתוני בסיס:*
שווי נכס: ${data.propertyValue?.toLocaleString()} ₪
יתרת משכנתא: ${data.mortgageBalance?.toLocaleString()} ₪
החזר נוכחי: ${data.currentPayment?.toLocaleString()} ₪
שנים שנותרו: ${data.yearsRemaining}

*ניתוח פיננסי:*
מסלול נבחר: ${results.title}
${results.labelBefore}: ${results.valBefore.toLocaleString()} ${results.unit}
${results.labelAfter}: ${results.valAfter.toLocaleString()} ${results.unit}
חיסכון/שינוי משוער: ${results.badgeText}

*ביטוח משכנתא:*
ניתן לחסוך כ-50,000 ש"ח בביטוח המשכנתא

-------------------
נשלח בתאריך: ${new Date(sub.created_at).toLocaleString()}
    `;
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto p-8" dir="ltr">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <button onClick={loadData} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Refresh Data</button>
                        <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Close</button>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('submissions')}
                        className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'submissions' ? 'bg-white shadow text-blue-600' : 'bg-gray-200 text-gray-600'}`}
                    >
                        Leads ({submissions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'events' ? 'bg-white shadow text-blue-600' : 'bg-gray-200 text-gray-600'}`}
                    >
                        Event Logs ({events.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('parameters')}
                        className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'parameters' ? 'bg-white shadow text-blue-600' : 'bg-gray-200 text-gray-600'}`}
                    >
                        <i className="fa-solid fa-cog ml-2"></i>
                        פרמטרי משכנתא
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List Column */}
                    <div className="lg:col-span-2 space-y-4">
                        {activeTab === 'submissions' && (
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
                                        {submissions.map(sub => (
                                            <tr key={sub.id} className="hover:bg-blue-50">
                                                <td className="p-4 text-gray-600">{new Date(sub.created_at).toLocaleString()}</td>
                                                <td className="p-4 font-medium">{sub.lead_name}</td>
                                                <td className="p-4">{sub.lead_phone}</td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => setSelectedSubmission(sub)}
                                                        className="text-blue-600 hover:text-blue-800 font-bold"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'events' && (
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
                                        {events.map(evt => (
                                            <tr key={evt.id} className="hover:bg-gray-50">
                                                <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(evt.created_at).toLocaleString()}</td>
                                                <td className="p-3 font-mono text-xs">{evt.session_id.slice(0, 8)}...</td>
                                                <td className="p-3 font-bold text-gray-700">{evt.event_type}</td>
                                                <td className="p-3 text-gray-600 truncate max-w-xs" title={JSON.stringify(evt.event_data_json)}>
                                                    {JSON.stringify(evt.event_data_json)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'parameters' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow p-6 text-center">
                                    <div className="mb-6">
                                        <i className="fa-solid fa-cogs text-6xl text-blue-600 mb-4"></i>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">ניהול פרמטרי משכנתא</h3>
                                        <p className="text-gray-600">עדכן ריביות, רגולציות ועמלות לפי נתוני השוק העדכניים</p>
                                    </div>
                                    
                                    <button
                                        onClick={() => setShowParametersEditor(true)}
                                        className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg"
                                    >
                                        <i className="fa-solid fa-edit ml-2"></i>
                                        ערוך פרמטרים
                                    </button>
                                    
                                    <div className="mt-6 text-sm text-gray-500">
                                        <p>עדכון אחרון: דצמבר 2024</p>
                                        <p>מומלץ לעדכן מידי חודש לפי הודעות בנק ישראל</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-xl shadow p-6">
                                    <ParametersDisplay />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details Column */}
                    <div className="lg:col-span-1">
                        {selectedSubmission ? (
                            <div className="bg-white rounded-xl shadow p-6 sticky top-6">
                                <h3 className="text-xl font-bold mb-4">Lead Details</h3>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm whitespace-pre-wrap">
                                    {generateMockMessage(selectedSubmission)}
                                </div>
                                <div className="mt-4">
                                    <h4 className="font-bold mb-2">Raw Data:</h4>
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs h-64" dir="ltr">
                                        {JSON.stringify(selectedSubmission.full_data_json, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400 border-2 border-dashed border-gray-200">
                                <i className="fa-regular fa-file-lines text-4xl mb-4"></i>
                                <p>Select a lead to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Parameters Editor Modal */}
            {showParametersEditor && (
                <ParametersEditor onClose={() => setShowParametersEditor(false)} />
            )}
        </div>
    );
};

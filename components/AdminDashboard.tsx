import React, { useEffect, useState } from 'react';
import { getSubmissions, getEvents } from '../utils/api';
import { calculateResults } from '../utils/calculator';
import { ParametersEditor } from './ParametersEditor';
import { ParametersDisplay } from './ParametersDisplay';
import { auth } from '../src/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

interface Submission {
    id: number;
    createdAt?: string; // New API
    created_at?: string; // Legacy/SQLite raw
    leadName?: string; // New API
    lead_name?: string; // Legacy
    leadPhone?: string; // New API
    lead_phone?: string; // Legacy
    leadEmail?: string; // New API
    lead_email?: string; // Legacy
    full_data_json: any;
}

interface EventLog {
    id: number;
    createdAt?: string;
    created_at?: string;
    sessionId?: string;
    session_id?: string;
    eventType?: string;
    event_type?: string;
    event_data_json: any;
}

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const getSubmissionDetails = (sub: Submission) => {
        const data = sub.full_data_json || {};
        // Prioritize new API (camelCase), then DB raw (snake_case), then JSON data, then fallback
        const name = sub.leadName || sub.lead_name || data.leadName || data.lead_name || 'לא צוין';
        const phone = sub.leadPhone || sub.lead_phone || data.leadPhone || data.lead_phone || 'לא צוין';
        const email = sub.leadEmail || sub.lead_email || data.leadEmail || data.lead_email || 'לא צוין';

        // Handle Date (New API = createdAt, Old = created_at)
        const dateRaw = sub.createdAt || sub.created_at;
        const dateStr = dateRaw ? new Date(dateRaw.replace(' ', 'T')).toLocaleString() : 'תאריך לא ידוע';

        return { name, phone, email, dateStr };
    };
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [events, setEvents] = useState<EventLog[]>([]);
    const [activeTab, setActiveTab] = useState<'submissions' | 'events' | 'parameters'>('submissions');
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showParametersEditor, setShowParametersEditor] = useState(false);

    const [user, setUser] = useState(auth.currentUser);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Admin Dashboard v2.0 (Firebase Auth) Loaded 🚀");
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                loadData();
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setError('');
        } catch (err) {
            console.error('Login failed', err);
            setError('Failed to login. Check your credentials.');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setSubmissions([]);
            setEvents([]);
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    const loadData = async () => {
        try {
            const subs = await getSubmissions();
            setSubmissions(subs.data);
            const evts = await getEvents();
            setEvents(evts.data);
        } catch (e) {
            console.error("Failed to load admin data", e);
        }
    };

    const generateMockMessage = (sub: Submission) => {
        const data = sub.full_data_json || {};
        const results = calculateResults(data);
        const { name, phone, email, dateStr } = getSubmissionDetails(sub);

        // Using concatenation for safety against parser issues with Hebrew in template literals during build
        let msg = "*הודעת סיכום (Mock)*\n";
        msg += "-------------------\n";
        msg += "*פרטי לקוח:*\n";
        msg += `שם: ${name}\n`;
        msg += `טלפון: ${phone}\n`;
        msg += `אימייל: ${email}\n\n`;

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

    if (loading) {
        return <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return (
            <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4" dir="ltr">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <i className="fa-brands fa-google text-5xl text-blue-600 mb-4"></i>
                        <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
                        <p className="text-gray-500">Sign in with your Mortgage App account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="name@company.com"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Sign In
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full text-gray-500 text-sm hover:text-gray-700 mt-2"
                        >
                            Back to App
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto p-8" dir="ltr">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">Logged in as {user.email}</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={loadData} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Refresh Data</button>
                        <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium">Sign Out</button>
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
                                        {submissions.map(sub => {
                                            const details = getSubmissionDetails(sub);
                                            return (
                                                <tr key={sub.id} className="hover:bg-blue-50">
                                                    <td className="p-4 text-gray-600">{details.dateStr}</td>
                                                    <td className="p-4 font-medium">{details.name}</td>
                                                    <td className="p-4">{details.phone}</td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => setSelectedSubmission(sub)}
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

import React, { useEffect, useState } from 'react';
import { getSubmissions, getEvents } from '../utils/api';
import { ParametersEditor } from './ParametersEditor';
import { ParametersDisplay } from './ParametersDisplay';
import { auth } from '../src/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { Submission, EventLog } from '../types';
import { AdminLogin } from './AdminLogin';
import { SubmissionsTable } from './SubmissionsTable';
import { EventsTable } from './EventsTable';
import { SubmissionDetails } from './SubmissionDetails';
import { ExportTab } from './ExportTab';
import { FunnelDashboard } from './FunnelDashboard';

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [events, setEvents] = useState<EventLog[]>([]);
    // AdminDashboard.tsx Logic Update

    const [activeTab, setActiveTab] = useState<'funnel' | 'submissions' | 'events' | 'parameters' | 'exports'>('funnel');
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [filteredSessionIds, setFilteredSessionIds] = useState<string[] | null>(null); // New filter state
    const [showParametersEditor, setShowParametersEditor] = useState(false);

    const [user, setUser] = useState(auth.currentUser);
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

    // Helper to handle tab switching + clearing filters
    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab);
        setFilteredSessionIds(null); // Clear filter when manually switching tabs
    };

    // Handler for Funnel click
    const handleFunnelFilter = (stage: any) => {
        // Decide which tab to show based on step number
        // Steps 1-4 (Landing, Debts, Payments, Assets) -> Events Tab (shows dropoff in early funnel)
        // Steps 5-8 (Contact, Simulator, Meeting, Callback) -> Leads Tab (shows identifiable leads)
        const targetTab = stage.step >= 5 ? 'submissions' : 'events';

        setActiveTab(targetTab);
        setFilteredSessionIds(stage.sessionIds || []);
    };

    if (loading) {
        return <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <AdminLogin onClose={onClose} />;
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

                {/* Filter Active Indicator */}
                {filteredSessionIds && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center justify-between mb-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-filter"></i>
                            <span className="font-medium">Filtering by Funnel Stage: {filteredSessionIds.length} sessions found.</span>
                        </div>
                        <button
                            onClick={() => setFilteredSessionIds(null)}
                            className="text-sm bg-white border border-blue-300 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
                        >
                            Clear Filter
                        </button>
                    </div>
                )}

                <div className="flex gap-4 mb-6 flex-wrap">
                    <button
                        onClick={() => handleTabChange('funnel')}
                        className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'funnel' ? 'bg-white shadow text-blue-600' : 'bg-gray-200 text-gray-600'}`}
                    >
                        <i className="fa-solid fa-filter mr-1"></i>
                        Funnel
                    </button>
                    <button
                        onClick={() => handleTabChange('submissions')}
                        className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'submissions' ? 'bg-white shadow text-blue-600' : 'bg-gray-200 text-gray-600'}`}
                    >
                        Leads ({submissions.length})
                    </button>
                    <button
                        onClick={() => handleTabChange('events')}
                        className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'events' ? 'bg-white shadow text-blue-600' : 'bg-gray-200 text-gray-600'}`}
                    >
                        Event Logs ({events.length})
                    </button>
                    <button
                        onClick={() => handleTabChange('parameters')}
                        className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'parameters' ? 'bg-white shadow text-blue-600' : 'bg-gray-200 text-gray-600'}`}
                    >
                        <i className="fa-solid fa-cog ml-2"></i>
                        פרמטרי משכנתא
                    </button>
                    <button
                        onClick={() => handleTabChange('exports')}
                        className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'exports' ? 'bg-white shadow text-blue-600' : 'bg-gray-200 text-gray-600'}`}
                    >
                        <i className="fa-solid fa-file-csv ml-2"></i>
                        CSV Exports
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List Column */}
                    <div className={`${activeTab === 'funnel' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-4`}>
                        {activeTab === 'funnel' && (
                            <FunnelDashboard onFilter={handleFunnelFilter} />
                        )}

                        {activeTab === 'submissions' && (
                            <SubmissionsTable
                                submissions={submissions}
                                filteredSessionIds={filteredSessionIds}
                                onSelect={setSelectedSubmission}
                            />
                        )}

                        {activeTab === 'events' && (
                            <EventsTable
                                events={events}
                                filteredSessionIds={filteredSessionIds}
                            />
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

                        {activeTab === 'exports' && (
                            <ExportTab />
                        )}
                    </div>

                    {/* Details Column */}
                    <div className="lg:col-span-1">
                        <SubmissionDetails submission={selectedSubmission} />
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

import React, { useEffect, useState } from 'react';
import { getFunnelData, FunnelStage, FunnelExtras, SessionSubmission } from '../utils/api';

interface FunnelDashboardProps { }

/**
 * FunnelDashboard – Marketing funnel visualization for the admin panel.
 *
 * Shows a top-to-bottom funnel where each stage narrows proportionally.
 * Clicking a stage reveals the list of leads (sessions) that reached it.
 */
export const FunnelDashboard: React.FC<FunnelDashboardProps> = () => {
    const [stages, setStages] = useState<FunnelStage[]>([]);
    const [extras, setExtras] = useState<FunnelExtras | null>(null);
    const [sessionMap, setSessionMap] = useState<Record<string, SessionSubmission>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedStage, setExpandedStage] = useState<string | null>(null);

    const loadFunnelData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getFunnelData();
            setStages(data.funnel);
            setExtras(data.extras);
            setSessionMap(data.sessionSubmissionMap);
        } catch (err) {
            console.error('Failed to load funnel data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load funnel data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFunnelData();
    }, []);

    // Color gradient from green (top) to red (bottom)
    const stageColors = [
        { bg: '#22c55e', bgLight: '#dcfce7', text: '#15803d' },  // green-500
        { bg: '#4ade80', bgLight: '#dcfce7', text: '#16a34a' },  // green-400
        { bg: '#84cc16', bgLight: '#ecfccb', text: '#4d7c0f' },  // lime-500
        { bg: '#eab308', bgLight: '#fef9c3', text: '#a16207' },  // yellow-500
        { bg: '#f59e0b', bgLight: '#fef3c7', text: '#b45309' },  // amber-500
        { bg: '#f97316', bgLight: '#ffedd5', text: '#c2410c' },  // orange-500
        { bg: '#ef4444', bgLight: '#fee2e2', text: '#dc2626' },  // red-500
        { bg: '#dc2626', bgLight: '#fee2e2', text: '#b91c1c' },  // red-600
        { bg: '#b91c1c', bgLight: '#fecaca', text: '#991b1b' },  // red-700
    ];

    // Calculate the bar width as a percentage — the top stage is always 100%
    const getBarWidth = (index: number, count: number): number => {
        if (stages.length === 0 || !stages[0].count) return 100;
        // Minimum width of 20% so the smallest stages remain visible
        const natural = (count / stages[0].count) * 100;
        return Math.max(natural, 20);
    };

    const getLeadsForStage = (stage: FunnelStage): SessionSubmission[] => {
        return stage.sessionIds
            .filter(sid => sessionMap[sid])
            .map(sid => sessionMap[sid]);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading funnel data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow p-8 text-center">
                <i className="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <p className="text-red-600 font-bold text-lg mb-4">Error Loading Funnel</p>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={loadFunnelData}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <i className="fa-solid fa-filter text-blue-600"></i>
                            Marketing Funnel
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Click any stage to see the leads that reached it
                        </p>
                    </div>
                    <button
                        onClick={loadFunnelData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        <i className="fa-solid fa-refresh mr-1"></i> Refresh
                    </button>
                </div>
            </div>

            {/* Funnel Visualization */}
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex flex-col items-center gap-1">
                    {stages.map((stage, index) => {
                        const color = stageColors[index] || stageColors[stageColors.length - 1];
                        const barWidth = getBarWidth(index, stage.count);
                        const isExpanded = expandedStage === stage.key;
                        const leads = isExpanded ? getLeadsForStage(stage) : [];

                        return (
                            <div key={stage.key} className="w-full flex flex-col items-center">
                                {/* Funnel Bar */}
                                <button
                                    onClick={() => setExpandedStage(isExpanded ? null : stage.key)}
                                    className="relative group transition-all duration-300 ease-out rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    style={{
                                        width: `${barWidth}%`,
                                        backgroundColor: color.bg,
                                        minHeight: '56px',
                                    }}
                                >
                                    <div className="flex items-center justify-between px-5 py-3 text-white">
                                        {/* Left: step label */}
                                        <div className="flex items-center gap-2 font-bold text-base">
                                            <span className="bg-white bg-opacity-25 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                                                {stage.step}
                                            </span>
                                            <span className="whitespace-nowrap">{stage.label}</span>
                                        </div>
                                        {/* Right: count + percentage */}
                                        <div className="flex items-center gap-3 text-base">
                                            <span className="font-bold text-lg">{stage.count.toLocaleString()}</span>
                                            <span className="bg-white bg-opacity-25 rounded-full px-3 py-0.5 text-sm font-semibold">
                                                {stage.percentage}%
                                            </span>
                                            <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-sm opacity-70`}></i>
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded leads list */}
                                {isExpanded && (
                                    <div
                                        className="rounded-lg border mt-1 mb-2 overflow-hidden"
                                        style={{
                                            width: `${barWidth}%`,
                                            borderColor: color.bg,
                                            backgroundColor: color.bgLight,
                                        }}
                                    >
                                        {leads.length > 0 ? (
                                            <>
                                                <div className="px-4 py-2 border-b font-bold text-sm flex gap-4" style={{ borderColor: color.bg, color: color.text }}>
                                                    <span className="w-8 text-center">#</span>
                                                    <span className="flex-1">Name</span>
                                                    <span className="w-36">Phone</span>
                                                    <span className="w-44">Date</span>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto">
                                                    {leads.map((lead, i) => (
                                                        <div
                                                            key={lead.id}
                                                            className="px-4 py-2 text-sm flex gap-4 border-b last:border-b-0 hover:bg-white hover:bg-opacity-60 transition-colors"
                                                            style={{ borderColor: `${color.bg}33` }}
                                                        >
                                                            <span className="w-8 text-center font-medium text-gray-500">{i + 1}</span>
                                                            <span className="flex-1 font-medium text-gray-800">{lead.leadName || '—'}</span>
                                                            <span className="w-36 text-gray-600 font-mono text-xs mt-0.5">{lead.leadPhone || '—'}</span>
                                                            <span className="w-44 text-gray-500 text-xs mt-0.5">
                                                                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('he-IL', {
                                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                                    hour: '2-digit', minute: '2-digit'
                                                                }) : '—'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="px-4 py-4 text-center text-sm" style={{ color: color.text }}>
                                                <i className="fa-solid fa-info-circle mr-1"></i>
                                                {stage.sessionIds.length > 0
                                                    ? `${stage.sessionIds.length} sessions reached this stage (no submission data yet)`
                                                    : 'No sessions have reached this stage yet'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Insurance Checkbox Metric */}
            {extras && (
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-shield-halved text-green-600"></i>
                        Insurance Interest
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-blue-700">{extras.totalSubmissions}</p>
                            <p className="text-sm text-blue-600 mt-1">Total Submissions</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-green-700">{extras.interestedInInsurance}</p>
                            <p className="text-sm text-green-600 mt-1">Interested in Insurance</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-purple-700">{extras.interestedInInsurancePercentage}%</p>
                            <p className="text-sm text-purple-600 mt-1">Insurance Interest Rate</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

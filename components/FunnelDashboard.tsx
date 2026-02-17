import React, { useEffect, useState } from 'react';
import { getFunnelData, FunnelStage, FunnelExtras, SessionSubmission } from '../utils/api';

// FunnelDashboard.tsx

interface FunnelDashboardProps {
    onFilter?: (step: FunnelStage) => void;
}

/**
 * FunnelDashboard – Marketing funnel visualization for the admin panel.
 *
 * Shows a centered, inverted-pyramid funnel where steps get progressively narrower.
 * The bottom row splits into two side-by-side actions (Meeting & Callback).
 */
export const FunnelDashboard: React.FC<FunnelDashboardProps> = ({ onFilter }) => {
    const [stages, setStages] = useState<FunnelStage[]>([]);
    const [extras, setExtras] = useState<FunnelExtras | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadFunnelData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getFunnelData();
            setStages(data.funnel);
            setExtras(data.extras);
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

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow p-8 text-center min-h-[400px] flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 text-lg">Loading funnel data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow p-8 text-center min-h-[400px] flex flex-col justify-center items-center">
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

    // Helper to render a standard funnel step
    // Width starts at 100% and decreases by 5% each step to create the inverted pyramid look
    const renderStep = (stage: FunnelStage, index: number, isLastRow = false) => {
        // Calculate width: Top is 100%, bottom is ~60%
        // But we want actual narrower boxes centered.
        // We'll use inline styles for width relative to max-w-4xl container.
        const widthPercent = Math.max(100 - (index * 6), 50); // Decrease by 6% each step

        return (
            <button
                key={stage.key}
                onClick={() => onFilter && onFilter(stage)}
                className="relative bg-white border-2 border-gray-800 rounded-2xl p-4 text-center hover:bg-blue-50 hover:border-blue-600 hover:shadow-lg transition-all flex flex-col items-center justify-center group my-1"
                style={{ width: isLastRow ? '100%' : `${widthPercent}%`, minHeight: '64px' }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-gray-800 group-hover:text-blue-700">{stage.label}</span>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    <span className="font-bold flex items-center gap-1">
                        <i className="fa-solid fa-users"></i> {stage.count}
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {stage.percentage}%
                    </span>
                    {/* Insurance Stat for Callback Step */}
                    {stage.key === 'request_callback' && stage.insuranceCount !== undefined && (
                        <div className="mt-2 text-xs text-green-700 font-bold bg-green-50 px-2 py-1 rounded border border-green-200 w-full">
                            <i className="fa-solid fa-shield-halved mr-1"></i>
                            {stage.insuranceCount} interested in insurance
                        </div>
                    )}
                </div>
            </button>
        );
    };

    // Split stages: regular steps vs bottom row (Callback/Meeting)
    // The main flow stops at Simulator (Step 6) or Request Saving (Step 6.1)
    // The bottom row contains Steps 7 & 8 side-by-side.

    // Ordered Steps:
    // 1. Landing
    // 2. Debts
    // 3. Payments
    // 4. Assets
    // 5. Contact
    // 6. Simulator
    // 6.1 Request Saving

    // Bottom Split:
    // [Request Callback (8)] [Schedule Meeting (7)]

    const mainSteps = stages.filter(s => s.step <= 6.1).sort((a, b) => a.step - b.step);
    const bottomSteps = stages.filter(s => s.step > 6.1).sort((a, b) => b.step - a.step); // 8 before 7 usually? No, side-by-side order.

    // Specific steps for bottom row
    const callbackStage = stages.find(s => s.key === 'request_callback');
    const meetingStage = stages.find(s => s.key === 'schedule_meeting');

    return (
        <div className="space-y-8 flex flex-col items-center pb-12 w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Marketing Funnel</h2>
                <button onClick={loadFunnelData} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                    <i className="fa-solid fa-refresh mr-1"></i> Refresh
                </button>
            </div>

            {/* Main Funnel Stack */}
            <div className="w-full flex flex-col items-center gap-3">
                {mainSteps.map((stage, index) => renderStep(stage, index))}
            </div>

            {/* Bottom Split Row */}
            <div className="w-full flex justify-center gap-4 mt-2" style={{ width: '60%' }}>
                {callbackStage && (
                    <div className="flex-1">
                        {renderStep(callbackStage, 0, true)}
                    </div>
                )}
                {meetingStage && (
                    <div className="flex-1">
                        {renderStep(meetingStage, 0, true)}
                    </div>
                )}
            </div>

            {/* Summary Metrics (Insurance) */}
            {extras && (
                <div className="w-full grid grid-cols-3 gap-4 mt-8 opacity-75">
                    <div className="bg-gray-50 rounded p-3 text-center border">
                        <div className="text-2xl font-bold text-gray-700">{extras.totalSubmissions}</div>
                        <div className="text-xs text-gray-500 uppercase">Total Leads</div>
                    </div>
                    <div className="bg-green-50 rounded p-3 text-center border border-green-100">
                        <div className="text-2xl font-bold text-green-700">{extras.interestedInInsurance}</div>
                        <div className="text-xs text-green-600 uppercase">Insurance Interest</div>
                    </div>
                    <div className="bg-blue-50 rounded p-3 text-center border border-blue-100">
                        <div className="text-2xl font-bold text-blue-700">{extras.interestedInInsurancePercentage}%</div>
                        <div className="text-xs text-blue-600 uppercase">Conversion Rate</div>
                    </div>
                </div>
            )}
        </div>
    );
};

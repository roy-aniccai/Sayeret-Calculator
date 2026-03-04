import React, { useEffect, useState } from 'react';
import { getFunnelData, FunnelStage, FunnelExtras, SessionSubmission } from '../utils/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const loadFunnelData = async () => {
        setLoading(true);
        setError(null);
        try {
            const start = startDate ? new Date(startDate) : null;
            let end = endDate ? new Date(endDate) : null;

            // If end date is selected, set it to end of day to include the full day
            if (end) {
                end = new Date(end);
                end.setHours(23, 59, 59, 999);
            }

            const data = await getFunnelData(start, end);
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

    // Green gradient palette: light green (top) → dark green (bottom)
    const greenGradient = [
        '#e8f5e9', // lightest green – step 0 (Landing)
        '#c8e6c9', // step 1
        '#a5d6a7', // step 2
        '#81c784', // step 3
        '#66bb6a', // step 4
        '#4caf50', // step 5
        '#43a047', // step 6
        '#388e3c', // step 7
        '#2e7d32', // step 8
        '#1b5e20', // darkest green – bottom
    ];

    // Helper to render a standard funnel step
    // Width starts at 100% and decreases by 5% each step to create the inverted pyramid look
    const renderStep = (stage: FunnelStage, index: number, isLastRow = false) => {
        // Calculate width: Top is 100%, bottom is ~60%
        // But we want actual narrower boxes centered.
        // We'll use inline styles for width relative to max-w-4xl container.
        const widthPercent = Math.max(100 - (index * 6), 50); // Decrease by 6% each step

        // Pick colour from gradient; for bottom-row items use the darkest shades
        const bgColor = isLastRow
            ? greenGradient[greenGradient.length - 1]
            : (greenGradient[index] ?? greenGradient[greenGradient.length - 1]);

        // Use white text on darker backgrounds (index >= 4 or bottom row)
        const isDark = isLastRow || index >= 4;
        const textColor = isDark ? '#ffffff' : '#1b5e20';
        const subTextColor = isDark ? 'rgba(255,255,255,0.85)' : '#2e7d32';
        const badgeBg = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(27,94,32,0.1)';
        const borderColor = isDark ? 'rgba(255,255,255,0.3)' : '#43a047';

        return (
            <button
                key={stage.key}
                onClick={() => onFilter && onFilter(stage)}
                className="relative rounded-2xl p-4 text-center hover:shadow-lg hover:scale-[1.02] transition-all flex flex-col items-center justify-center group my-1 border-2"
                style={{
                    width: isLastRow ? '100%' : `${widthPercent}%`,
                    minHeight: '64px',
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold" style={{ color: textColor }}>{stage.label}</span>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm" style={{ color: subTextColor }}>
                    <span className="font-bold flex items-center gap-1">
                        <i className="fa-solid fa-users"></i> {stage.count}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: badgeBg, color: textColor }}>
                        {stage.percentage}%
                    </span>
                    {/* Insurance Stat for Callback Step */}
                    {stage.key === 'request_callback' && stage.insuranceCount !== undefined && (
                        <div className="mt-2 text-xs font-bold px-2 py-1 rounded w-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
                            <i className="fa-solid fa-shield-halved mr-1"></i>
                            {stage.insuranceCount} interested in insurance
                        </div>
                    )}
                </div>
            </button>
        );
    };

    // Main flow stops at Simulator (Step 6) or Request Saving (Step 6.1)
    // Ordered Steps:
    // 1. Landing
    // 2. Debts
    // 3. Payments
    // 4. Assets
    // 5. Contact
    // 6. Simulator
    // 6.1 Request Saving

    const mainSteps = stages
        .filter(s => s.key !== 'schedule_meeting' && s.key !== 'request_callback')
        .sort((a, b) => a.step - b.step);

    return (
        <div className="space-y-8 flex flex-col items-center pb-12 w-full max-w-4xl mx-auto">
            <div className="w-full flex flex-col items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Marketing Funnel</h2>

                {/* Custom CSS to scale the date picker calendar popup */}
                <style>{`
                    .funnel-datepicker .react-datepicker {
                        font-size: 1.1rem;
                        transform: scale(1.3);
                        transform-origin: top center;
                    }
                    .funnel-datepicker .react-datepicker__header {
                        padding-top: 10px;
                    }
                    .funnel-datepicker .react-datepicker__day,
                    .funnel-datepicker .react-datepicker__day-name {
                        width: 2.2rem;
                        line-height: 2.2rem;
                        margin: 0.2rem;
                    }
                    .funnel-datepicker .react-datepicker__current-month {
                        font-size: 1.2rem;
                    }
                    .funnel-datepicker .react-datepicker-popper {
                        z-index: 50;
                    }
                `}</style>
                <div className="flex flex-wrap items-center justify-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-full funnel-datepicker">
                    <div className="flex items-center gap-2">
                        <span className="text-base text-gray-600 font-semibold">From:</span>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select date"
                            isClearable
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 w-[170px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-base text-gray-600 font-semibold">To:</span>
                        <DatePicker
                            selected={endDate}
                            onChange={(date: Date | null) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select date"
                            isClearable
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 w-[170px]"
                        />
                    </div>
                    <button
                        onClick={loadFunnelData}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base font-medium transition-colors"
                    >
                        <i className="fa-solid fa-filter mr-1"></i> Filter
                    </button>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => {
                                setStartDate(null);
                                setEndDate(null);
                                setTimeout(() => loadFunnelData(), 0);
                            }}
                            className="text-gray-400 hover:text-gray-600 px-2 text-lg"
                            title="Clear Dates"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Funnel Stack */}
            <div className="w-full flex flex-col items-center gap-3">
                {mainSteps.map((stage, index) => renderStep(stage, index))}
            </div>

            {/* Summary Metrics (Insurance) */}
            {extras && (
                <div className="w-full grid grid-cols-3 gap-4 mt-8 opacity-75">
                    <div className="bg-gray-50 rounded p-3 text-center border">
                        <div className="text-2xl font-bold text-gray-700">{extras.totalSubmissions}</div>
                        <div className="text-xs text-gray-500 uppercase">Total Leads</div>
                    </div>
                    <div className="bg-green-900 rounded p-3 text-center border border-green-800">
                        <div className="text-2xl font-bold text-white">{extras.interestedInInsurance}</div>
                        <div className="text-xs text-green-200 uppercase">Insurance Interest</div>
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

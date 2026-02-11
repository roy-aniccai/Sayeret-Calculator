import React, { useEffect, useState } from 'react';
import { exportSubmissionsCsv, getExportHistory, ExportHistoryItem, CsvExportResult } from '../utils/api';

export const ExportTab: React.FC = () => {
    const [history, setHistory] = useState<ExportHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [result, setResult] = useState<CsvExportResult | null>(null);
    const [error, setError] = useState('');

    const loadHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await getExportHistory();
            setHistory(res.data || []);
        } catch (e) {
            console.error('Failed to load export history', e);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleExport = async (mode: 'full' | 'delta') => {
        setLoading(true);
        setResult(null);
        setError('');
        try {
            const res = await exportSubmissionsCsv(mode);
            setResult(res);
            // Refresh history after successful export
            await loadHistory();
        } catch (e: any) {
            console.error('Export failed', e);
            setError(e.message || 'Export failed');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (iso: string) => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleString();
        } catch {
            return iso;
        }
    };

    return (
        <div className="space-y-6">
            {/* Run Export Section */}
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                    <i className="fa-solid fa-file-csv text-3xl text-green-600"></i>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Export Submissions to CSV</h3>
                        <p className="text-gray-500 text-sm">Generate a CSV file from submission data and store it in Firebase</p>
                    </div>
                </div>

                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => handleExport('full')}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors flex items-center gap-2"
                    >
                        {loading ? (
                            <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                            <i className="fa-solid fa-database"></i>
                        )}
                        Full Export
                    </button>

                    <button
                        onClick={() => handleExport('delta')}
                        disabled={loading}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors flex items-center gap-2"
                    >
                        {loading ? (
                            <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        )}
                        Delta Export
                    </button>
                </div>

                <div className="text-xs text-gray-400 mb-4">
                    <strong>Full:</strong> Exports all submissions &nbsp;|&nbsp; <strong>Delta:</strong> Only new records since the last export run
                </div>

                {/* Result Feedback */}
                {result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-green-800 font-semibold">
                                ✅ Export complete — {result.submissionCount} record{result.submissionCount !== 1 ? 's' : ''} exported
                            </p>
                            <p className="text-green-600 text-sm mt-1 font-mono">{result.csvStoragePath}</p>
                        </div>
                        <a
                            href={result.csvDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm flex items-center gap-2"
                        >
                            <i className="fa-solid fa-download"></i>
                            Download
                        </a>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-semibold">❌ Export failed</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                )}
            </div>

            {/* Export History Section */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <i className="fa-solid fa-history text-gray-500"></i>
                        Export History
                    </h3>
                    <button
                        onClick={loadHistory}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                        <i className="fa-solid fa-arrows-rotate"></i>
                        Refresh
                    </button>
                </div>

                {historyLoading ? (
                    <div className="p-12 text-center text-gray-400">
                        <i className="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
                        <p>Loading export history...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <i className="fa-solid fa-inbox text-4xl mb-4"></i>
                        <p>No exports yet. Run your first export above!</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b text-sm text-gray-600">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Mode</th>
                                <th className="p-4">Records</th>
                                <th className="p-4">File</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {history.map(item => (
                                <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="p-4 text-gray-600 text-sm">{formatDate(item.runTimestamp)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.mode === 'full'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {item.mode === 'full' ? '📊 Full' : '🔄 Delta'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-semibold">{item.submissionCount}</td>
                                    <td className="p-4 text-xs text-gray-500 font-mono">
                                        {item.csvStoragePath?.split('/').pop() || '—'}
                                    </td>
                                    <td className="p-4">
                                        <a
                                            href={item.csvDownloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 font-bold text-sm flex items-center gap-1 w-fit"
                                        >
                                            <i className="fa-solid fa-download"></i>
                                            Download
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

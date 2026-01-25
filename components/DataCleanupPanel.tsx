/**
 * Data Cleanup Panel Component
 * 
 * Provides a user interface for backing up and cleaning Firebase data
 * to start fresh with the enhanced analytics system.
 */

import React, { useState } from 'react';
import { cleanupManager } from '../utils/firebaseCleanup';

interface CleanupStatus {
  isProcessing: boolean;
  currentStep: string;
  progress: number;
  error?: string;
  success?: string;
}

export const DataCleanupPanel: React.FC = () => {
  const [status, setStatus] = useState<CleanupStatus>({
    isProcessing: false,
    currentStep: '',
    progress: 0
  });
  
  const [confirmCleanup, setConfirmCleanup] = useState(false);
  const [backupData, setBackupData] = useState<any>(null);

  const updateStatus = (update: Partial<CleanupStatus>) => {
    setStatus(prev => ({ ...prev, ...update }));
  };

  const handleCreateBackup = async () => {
    try {
      updateStatus({ 
        isProcessing: true, 
        currentStep: 'Creating backup...', 
        progress: 25,
        error: undefined 
      });
      
      const backup = await cleanupManager.createBackup();
      setBackupData(backup);
      
      updateStatus({ 
        currentStep: 'Backup created successfully', 
        progress: 100,
        success: `Backup contains ${backup.metadata.totalSubmissions} submissions and ${backup.metadata.totalEvents} events`
      });
      
    } catch (error) {
      updateStatus({ 
        error: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0
      });
    } finally {
      updateStatus({ isProcessing: false, currentStep: '' });
    }
  };

  const handleDownloadBackup = async () => {
    try {
      updateStatus({ 
        isProcessing: true, 
        currentStep: 'Downloading backup...', 
        progress: 50 
      });
      
      await cleanupManager.downloadBackup();
      
      updateStatus({ 
        currentStep: 'Backup downloaded', 
        progress: 100,
        success: 'Backup file downloaded successfully'
      });
      
    } catch (error) {
      updateStatus({ 
        error: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0
      });
    } finally {
      updateStatus({ isProcessing: false, currentStep: '' });
    }
  };

  const handleClearData = async () => {
    if (!confirmCleanup) {
      updateStatus({ error: 'Please confirm data cleanup by checking the checkbox' });
      return;
    }

    try {
      updateStatus({ 
        isProcessing: true, 
        currentStep: 'Clearing analytics data...', 
        progress: 25,
        error: undefined 
      });
      
      const result = await cleanupManager.clearData(true);
      
      updateStatus({ 
        currentStep: 'Verifying cleanup...', 
        progress: 75 
      });
      
      const verification = await cleanupManager.verify();
      
      updateStatus({ 
        currentStep: 'Cleanup completed', 
        progress: 100,
        success: `Successfully deleted ${result.submissionsDeleted} submissions and ${result.eventsDeleted} events. Collections are now empty.`
      });
      
      setConfirmCleanup(false);
      
    } catch (error) {
      updateStatus({ 
        error: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0
      });
    } finally {
      updateStatus({ isProcessing: false, currentStep: '' });
    }
  };

  const handleFullReset = async () => {
    if (!confirmCleanup) {
      updateStatus({ error: 'Please confirm full reset by checking the checkbox' });
      return;
    }

    try {
      updateStatus({ 
        isProcessing: true, 
        currentStep: 'Starting full reset...', 
        progress: 10,
        error: undefined 
      });
      
      const result = await cleanupManager.fullReset(true);
      
      updateStatus({ 
        currentStep: 'Full reset completed', 
        progress: 100,
        success: 'Backup downloaded and all data cleared successfully. Ready for fresh analytics data!'
      });
      
      setConfirmCleanup(false);
      
    } catch (error) {
      updateStatus({ 
        error: `Full reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0
      });
    } finally {
      updateStatus({ isProcessing: false, currentStep: '' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🧹 Firebase Data Cleanup
        </h2>
        <p className="text-gray-600">
          Backup and clear existing analytics data to start fresh with the enhanced system.
        </p>
      </div>

      {/* Status Display */}
      {status.currentStep && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-800 font-medium">{status.currentStep}</span>
            <span className="text-blue-600 text-sm">{status.progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Message */}
      {status.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span className="text-green-800">{status.success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {status.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">❌</span>
            <span className="text-red-800">{status.error}</span>
          </div>
        </div>
      )}

      {/* Backup Section */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          📤 Backup Current Data
        </h3>
        <p className="text-gray-600 mb-4">
          Create a backup of all existing submissions and events before cleanup.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={handleCreateBackup}
            disabled={status.isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Backup
          </button>
          
          <button
            onClick={handleDownloadBackup}
            disabled={status.isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download Backup
          </button>
        </div>
        
        {backupData && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Backup Ready:</strong> {backupData.metadata.totalSubmissions} submissions, {backupData.metadata.totalEvents} events
            </p>
            <p className="text-xs text-gray-500">
              Created: {new Date(backupData.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Cleanup Section */}
      <div className="mb-8 p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-lg font-semibold text-red-900 mb-3">
          🗑️ Clear Analytics Data
        </h3>
        <p className="text-red-700 mb-4">
          <strong>Warning:</strong> This will permanently delete all existing submissions and events data.
        </p>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={confirmCleanup}
              onChange={(e) => setConfirmCleanup(e.target.checked)}
              className="mr-2"
            />
            <span className="text-red-800">
              I understand this will permanently delete all existing analytics data
            </span>
          </label>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleClearData}
            disabled={status.isProcessing || !confirmCleanup}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Data Only
          </button>
          
          <button
            onClick={handleFullReset}
            disabled={status.isProcessing || !confirmCleanup}
            className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Full Reset (Backup + Clear)
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          ℹ️ What happens next?
        </h3>
        <ul className="text-gray-700 space-y-2">
          <li>• All existing test data will be removed from Firebase</li>
          <li>• New submissions will use the enhanced analytics format</li>
          <li>• Lead scoring will be calculated automatically</li>
          <li>• Device detection and event categorization will be active</li>
          <li>• The analytics dashboard will show clean, structured data</li>
        </ul>
      </div>
    </div>
  );
};

export default DataCleanupPanel;
/**
 * Firebase Data Cleanup Utility
 * 
 * Provides utilities for backing up and cleaning Firebase data
 * to start fresh with the enhanced analytics system.
 * 
 * Requirements: 8 (Data Cleanup and Fresh Start)
 */

import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  writeBatch,
  getFirestore,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { app } from '../src/firebase';

// Initialize Firestore
const db = getFirestore(app);

/**
 * Export data from a Firestore collection to JSON
 */
export async function exportCollectionData(collectionName: string): Promise<any[]> {
  try {
    console.log(`📤 Exporting data from collection: ${collectionName}`);
    
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    const data: any[] = [];
    snapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings for JSON serialization
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      });
    });
    
    console.log(`✅ Exported ${data.length} documents from ${collectionName}`);
    return data;
    
  } catch (error) {
    console.error(`❌ Error exporting collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Create a complete backup of all analytics data
 */
export async function createDataBackup(): Promise<{
  submissions: any[];
  events: any[];
  timestamp: string;
  metadata: any;
}> {
  try {
    console.log('🔄 Creating complete data backup...');
    
    const [submissions, events] = await Promise.all([
      exportCollectionData('submissions'),
      exportCollectionData('events')
    ]);
    
    const backup = {
      submissions,
      events,
      timestamp: new Date().toISOString(),
      metadata: {
        totalSubmissions: submissions.length,
        totalEvents: events.length,
        backupVersion: '2.0',
        reason: 'Fresh start with enhanced analytics'
      }
    };
    
    console.log('✅ Backup created successfully');
    console.log(`📊 Backup contains: ${submissions.length} submissions, ${events.length} events`);
    
    return backup;
    
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
}

/**
 * Save backup data to a JSON file (browser download)
 */
export function downloadBackupAsJSON(backup: any, filename?: string): void {
  try {
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `firebase-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    console.log(`💾 Backup downloaded as: ${link.download}`);
    
  } catch (error) {
    console.error('❌ Error downloading backup:', error);
    throw error;
  }
}

/**
 * Delete all documents from a collection
 */
export async function clearCollection(collectionName: string): Promise<number> {
  try {
    console.log(`🗑️ Clearing collection: ${collectionName}`);
    
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    if (snapshot.empty) {
      console.log(`✅ Collection ${collectionName} is already empty`);
      return 0;
    }
    
    // Delete in batches for better performance
    const batchSize = 500;
    const batches: Promise<void>[] = [];
    let deletedCount = 0;
    
    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchDocs = snapshot.docs.slice(i, i + batchSize);
      
      batchDocs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });
      
      batches.push(
        batch.commit().then(() => {
          deletedCount += batchDocs.length;
          console.log(`🗑️ Deleted batch: ${deletedCount}/${snapshot.docs.length} documents`);
        })
      );
    }
    
    await Promise.all(batches);
    
    console.log(`✅ Successfully cleared ${deletedCount} documents from ${collectionName}`);
    return deletedCount;
    
  } catch (error) {
    console.error(`❌ Error clearing collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Clear all analytics data (submissions and events)
 */
export async function clearAllAnalyticsData(): Promise<{
  submissionsDeleted: number;
  eventsDeleted: number;
  timestamp: string;
}> {
  try {
    console.log('🧹 Starting complete analytics data cleanup...');
    
    const [submissionsDeleted, eventsDeleted] = await Promise.all([
      clearCollection('submissions'),
      clearCollection('events')
    ]);
    
    const result = {
      submissionsDeleted,
      eventsDeleted,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Analytics data cleanup completed');
    console.log(`📊 Deleted: ${submissionsDeleted} submissions, ${eventsDeleted} events`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error during analytics data cleanup:', error);
    throw error;
  }
}

/**
 * Complete backup and cleanup workflow
 */
export async function backupAndCleanup(options: {
  downloadBackup?: boolean;
  confirmCleanup?: boolean;
} = {}): Promise<{
  backup: any;
  cleanup?: any;
}> {
  try {
    console.log('🚀 Starting backup and cleanup workflow...');
    
    // Step 1: Create backup
    const backup = await createDataBackup();
    
    // Step 2: Download backup if requested
    if (options.downloadBackup) {
      downloadBackupAsJSON(backup);
    }
    
    // Step 3: Cleanup if confirmed
    let cleanup;
    if (options.confirmCleanup) {
      console.log('⚠️ Starting data cleanup in 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      cleanup = await clearAllAnalyticsData();
    }
    
    console.log('🎉 Backup and cleanup workflow completed successfully');
    
    return { backup, cleanup };
    
  } catch (error) {
    console.error('❌ Error in backup and cleanup workflow:', error);
    throw error;
  }
}

/**
 * Verify collections are empty
 */
export async function verifyCleanup(): Promise<{
  submissions: number;
  events: number;
  isEmpty: boolean;
}> {
  try {
    const [submissionsSnapshot, eventsSnapshot] = await Promise.all([
      getDocs(collection(db, 'submissions')),
      getDocs(collection(db, 'events'))
    ]);
    
    const result = {
      submissions: submissionsSnapshot.size,
      events: eventsSnapshot.size,
      isEmpty: submissionsSnapshot.empty && eventsSnapshot.empty
    };
    
    if (result.isEmpty) {
      console.log('✅ Cleanup verification passed - all collections are empty');
    } else {
      console.log(`⚠️ Cleanup verification: ${result.submissions} submissions, ${result.events} events remaining`);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error verifying cleanup:', error);
    throw error;
  }
}

/**
 * Initialize fresh analytics collections with proper indexes
 */
export async function initializeFreshCollections(): Promise<void> {
  try {
    console.log('🆕 Initializing fresh analytics collections...');
    
    // Note: Firestore collections are created automatically when first document is added
    // Indexes need to be created via Firebase Console or CLI
    
    console.log('📋 Fresh collections ready for enhanced analytics data');
    console.log('💡 Remember to set up Firestore indexes for optimal query performance');
    
  } catch (error) {
    console.error('❌ Error initializing fresh collections:', error);
    throw error;
  }
}

/**
 * Browser-friendly cleanup interface
 */
export class FirebaseCleanupManager {
  private isProcessing = false;
  
  async createBackup(): Promise<any> {
    if (this.isProcessing) throw new Error('Another operation is in progress');
    
    this.isProcessing = true;
    try {
      return await createDataBackup();
    } finally {
      this.isProcessing = false;
    }
  }
  
  async downloadBackup(): Promise<void> {
    const backup = await this.createBackup();
    downloadBackupAsJSON(backup);
  }
  
  async clearData(confirm: boolean = false): Promise<any> {
    if (!confirm) {
      throw new Error('Data cleanup requires explicit confirmation');
    }
    
    if (this.isProcessing) throw new Error('Another operation is in progress');
    
    this.isProcessing = true;
    try {
      return await clearAllAnalyticsData();
    } finally {
      this.isProcessing = false;
    }
  }
  
  async fullReset(confirm: boolean = false): Promise<any> {
    if (!confirm) {
      throw new Error('Full reset requires explicit confirmation');
    }
    
    return await backupAndCleanup({
      downloadBackup: true,
      confirmCleanup: true
    });
  }
  
  async verify(): Promise<any> {
    return await verifyCleanup();
  }
  
  isOperationInProgress(): boolean {
    return this.isProcessing;
  }
}

// Export singleton instance
export const cleanupManager = new FirebaseCleanupManager();
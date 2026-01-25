/**
 * Firebase Data Cleanup Script (Node.js ES Module)
 * 
 * Run this script to backup and clear existing Firebase data
 * before starting fresh with the enhanced analytics system.
 * 
 * Usage:
 * node scripts/cleanup-firebase.js
 * node scripts/cleanup-firebase.js --force
 * node scripts/cleanup-firebase.js --skip-backup
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration (same as in src/firebase.ts)
const firebaseConfig = {
    apiKey: "AIzaSyC3PLA3VC8vmSDJQXPt_cPFf2LtHvkhwpc",
    authDomain: "mortgage-85413.firebaseapp.com",
    projectId: "mortgage-85413",
    storageBucket: "mortgage-85413.firebasestorage.app",
    messagingSenderId: "681228583046",
    appId: "1:681228583046:web:d1f6764984c5100b5a9107",
    measurementId: "G-T0YVZQ97G1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Export data from a Firestore collection to JSON
 */
async function exportCollectionData(collectionName) {
    try {
        console.log(`📤 Exporting data from collection: ${collectionName}`);
        
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        const data = [];
        snapshot.forEach((doc) => {
            const docData = doc.data();
            data.push({
                id: doc.id,
                ...docData,
                // Convert Firestore timestamps to ISO strings for JSON serialization
                createdAt: docData.createdAt?.toDate?.()?.toISOString() || docData.createdAt,
                updatedAt: docData.updatedAt?.toDate?.()?.toISOString() || docData.updatedAt,
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
async function createDataBackup() {
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
 * Save backup data to a JSON file
 */
function saveBackupToFile(backup, filename) {
    try {
        const backupDir = path.join(process.cwd(), 'backups');
        
        // Create backups directory if it doesn't exist
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const filePath = path.join(backupDir, filename || `firebase-backup-${new Date().toISOString().split('T')[0]}.json`);
        const jsonString = JSON.stringify(backup, null, 2);
        
        fs.writeFileSync(filePath, jsonString, 'utf8');
        console.log(`💾 Backup saved to: ${filePath}`);
        
        return filePath;
        
    } catch (error) {
        console.error('❌ Error saving backup:', error);
        throw error;
    }
}

/**
 * Delete all documents from a collection
 */
async function clearCollection(collectionName) {
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
        let deletedCount = 0;
        
        for (let i = 0; i < snapshot.docs.length; i += batchSize) {
            const batch = writeBatch(db);
            const batchDocs = snapshot.docs.slice(i, i + batchSize);
            
            batchDocs.forEach((docSnapshot) => {
                batch.delete(docSnapshot.ref);
            });
            
            await batch.commit();
            deletedCount += batchDocs.length;
            console.log(`🗑️ Deleted batch: ${deletedCount}/${snapshot.docs.length} documents`);
        }
        
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
async function clearAllAnalyticsData() {
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
 * Verify collections are empty
 */
async function verifyCleanup() {
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
 * Main cleanup function
 */
async function main() {
    const args = process.argv.slice(2);
    const force = args.includes('--force');
    const skipBackup = args.includes('--skip-backup');
    
    console.log('🧹 Firebase Data Cleanup Script');
    console.log('================================');
    console.log(`🔧 Arguments: ${args.join(', ')}`);
    console.log(`🔧 Force mode: ${force}`);
    console.log(`🔧 Skip backup: ${skipBackup}`);
    
    try {
        console.log('🔗 Initializing Firebase connection...');
        
        if (!force) {
            console.log('⚠️  WARNING: This will delete ALL existing analytics data!');
            console.log('📊 Current data will be backed up before deletion.');
            console.log('🔄 Run with --force to skip this warning.');
            
            // Wait 3 seconds for user to read the warning
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Step 1: Create and save backup (unless skipped)
        if (!skipBackup) {
            console.log('\n📤 Step 1: Creating backup...');
            const backup = await createDataBackup();
            const backupPath = saveBackupToFile(backup);
            console.log(`✅ Backup saved to: ${backupPath}`);
        } else {
            console.log('\n⏭️ Step 1: Skipping backup (--skip-backup flag)');
        }
        
        // Step 2: Clear all data
        console.log('\n🗑️  Step 2: Clearing analytics data...');
        const cleanup = await clearAllAnalyticsData();
        console.log(`✅ Cleanup completed: ${cleanup.submissionsDeleted} submissions, ${cleanup.eventsDeleted} events deleted`);
        
        // Step 3: Verify cleanup
        console.log('\n🔍 Step 3: Verifying cleanup...');
        const verification = await verifyCleanup();
        
        if (verification.isEmpty) {
            console.log('✅ Verification passed - all data cleared successfully');
        } else {
            console.log(`⚠️  Verification warning: ${verification.submissions} submissions, ${verification.events} events remaining`);
        }
        
        console.log('\n🎉 Firebase cleanup completed successfully!');
        console.log('💡 You can now start collecting fresh data with the enhanced analytics system.');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Cleanup failed:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 Starting cleanup script...');
    main().catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
}

export { main };
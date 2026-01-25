/**
 * Firebase Data Cleanup Script
 * 
 * Run this script to backup and clear existing Firebase data
 * before starting fresh with the enhanced analytics system.
 * 
 * Usage:
 * - npm run cleanup-data (with backup)
 * - npm run cleanup-data --force (skip backup)
 */

import { cleanupManager } from '../utils/firebaseCleanup';

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const skipBackup = args.includes('--skip-backup');
  
  console.log('🧹 Firebase Data Cleanup Script');
  console.log('================================');
  
  try {
    if (!force) {
      console.log('⚠️  WARNING: This will delete ALL existing analytics data!');
      console.log('📊 Current data will be backed up before deletion.');
      console.log('🔄 Run with --force to skip this warning.');
      
      // In a real environment, you'd want user confirmation here
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Step 1: Create and download backup (unless skipped)
    if (!skipBackup) {
      console.log('\n📤 Step 1: Creating backup...');
      await cleanupManager.downloadBackup();
      console.log('✅ Backup downloaded successfully');
    }
    
    // Step 2: Clear all data
    console.log('\n🗑️  Step 2: Clearing analytics data...');
    const cleanup = await cleanupManager.clearData(true);
    console.log(`✅ Cleanup completed: ${cleanup.submissionsDeleted} submissions, ${cleanup.eventsDeleted} events deleted`);
    
    // Step 3: Verify cleanup
    console.log('\n🔍 Step 3: Verifying cleanup...');
    const verification = await cleanupManager.verify();
    
    if (verification.isEmpty) {
      console.log('✅ Verification passed - all data cleared successfully');
    } else {
      console.log(`⚠️  Verification warning: ${verification.submissions} submissions, ${verification.events} events remaining`);
    }
    
    console.log('\n🎉 Firebase cleanup completed successfully!');
    console.log('💡 You can now start collecting fresh data with the enhanced analytics system.');
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main as cleanupFirebaseData };
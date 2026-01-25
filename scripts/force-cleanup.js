/**
 * Force Firebase Data Cleanup
 * This script will forcefully delete all data from submissions and events collections
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

console.log('🧹 Force Firebase Data Cleanup');
console.log('==============================');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3PLA3VC8vmSDJQXPt_cPFf2LtHvkhwpc",
    authDomain: "mortgage-85413.firebaseapp.com",
    projectId: "mortgage-85413",
    storageBucket: "mortgage-85413.firebasestorage.app",
    messagingSenderId: "681228583046",
    appId: "1:681228583046:web:d1f6764984c5100b5a9107",
    measurementId: "G-T0YVZQ97G1"
};

async function forceCleanup() {
    try {
        console.log('🔗 Initializing Firebase...');
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        // Clear submissions collection
        console.log('🗑️ Clearing submissions collection...');
        const submissionsRef = collection(db, 'submissions');
        const submissionsSnapshot = await getDocs(submissionsRef);
        console.log(`📊 Found ${submissionsSnapshot.size} submissions to delete`);
        
        if (!submissionsSnapshot.empty) {
            const batch = writeBatch(db);
            submissionsSnapshot.docs.forEach((docSnapshot) => {
                batch.delete(docSnapshot.ref);
            });
            await batch.commit();
            console.log(`✅ Deleted ${submissionsSnapshot.size} submissions`);
        }
        
        // Clear events collection
        console.log('🗑️ Clearing events collection...');
        const eventsRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsRef);
        console.log(`📊 Found ${eventsSnapshot.size} events to delete`);
        
        if (!eventsSnapshot.empty) {
            const batch = writeBatch(db);
            eventsSnapshot.docs.forEach((docSnapshot) => {
                batch.delete(docSnapshot.ref);
            });
            await batch.commit();
            console.log(`✅ Deleted ${eventsSnapshot.size} events`);
        }
        
        // Verify cleanup
        console.log('🔍 Verifying cleanup...');
        const submissionsCheck = await getDocs(collection(db, 'submissions'));
        const eventsCheck = await getDocs(collection(db, 'events'));
        
        console.log(`📊 After cleanup: ${submissionsCheck.size} submissions, ${eventsCheck.size} events`);
        
        if (submissionsCheck.empty && eventsCheck.empty) {
            console.log('✅ Cleanup successful - all collections are now empty');
        } else {
            console.log('⚠️ Some documents may remain');
        }
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        console.error('Error details:', error.message);
    }
}

forceCleanup();
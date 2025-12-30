import admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        // Optionally specify databaseURL if needed
    });
}

export const adminAuth = admin.auth();
export const db = admin.firestore();

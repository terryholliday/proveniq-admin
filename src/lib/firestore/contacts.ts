import { db } from "../firebase-admin";

export async function getContacts(orgId: string) {
    const snapshot = await db
        .collection("admin_contacts")
        .where("organizationId", "==", orgId)
        .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createContact(contactData: any) {
    const docRef = await db.collection("admin_contacts").add({
        ...contactData,
        createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...contactData };
}

export async function updateContact(contactId: string, updates: any) {
    const docRef = db.collection("admin_contacts").doc(contactId);
    await docRef.update({ ...updates, updatedAt: new Date().toISOString() });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
}

export async function deleteContact(contactId: string) {
    await db.collection("admin_contacts").doc(contactId).delete();
    return { success: true };
}

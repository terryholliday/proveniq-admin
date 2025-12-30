import admin from 'firebase-admin';

let db: any;
let adminAuth: any;

if (process.env.NODE_ENV === "development" && !process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_CONFIG) {
    console.warn("Firebase Admin: No credentials found, using in-memory MOCK for local development.");

    // In-memory data store for the mock
    const _store: Record<string, any[]> = {
        admin_contacts: [
            {
                id: "seed-1",
                name: "Sarah Chen",
                email: "sarah.chen@acmecorp.com",
                phone: "+1 555-0101",
                title: "VP of Operations",
                department: "Operations",
                accountId: "acc-1",
                accountName: "Acme Corporation",
                role: "CHAMPION",
                influence: "HIGH",
                sentiment: "POSITIVE",
                lastContacted: new Date(Date.now() - 86400000).toISOString(),
                linkedIn: "https://linkedin.com/in/sarahchen",
                deals: [{ id: "deal-1", name: "Acme Corp Enterprise", role: "CHAMPION" }],
                organizationId: "cmjs30y0k0000tuacerbsp0o9" // Matching the org found in seed
            },
            {
                id: "seed-2",
                name: "Michael Johnson",
                email: "michael.j@acmecorp.com",
                phone: "+1 555-0102",
                title: "CFO",
                department: "Finance",
                accountId: "acc-1",
                accountName: "Acme Corporation",
                role: "ECONOMIC_BUYER",
                influence: "HIGH",
                sentiment: "NEUTRAL",
                lastContacted: new Date(Date.now() - 604800000).toISOString(),
                deals: [{ id: "deal-1", name: "Acme Corp Enterprise", role: "ECONOMIC_BUYER" }],
                organizationId: "cmjs30y0k0000tuacerbsp0o9"
            }
        ]
    };

    const mockDb: any = {
        collection(name: string) {
            if (!_store[name]) _store[name] = [];
            const collData = _store[name];

            const query: any = {
                _filters: [] as any[],
                where(field: string, op: string, val: any) {
                    this._filters.push({ field, op, val });
                    return this;
                },
                async get() {
                    let results = [...collData];
                    for (const f of this._filters) {
                        results = results.filter(d => d[f.field] === f.val); // Simplified op check
                    }
                    return {
                        docs: results.map(d => ({
                            id: d.id,
                            data: () => d,
                            ref: { id: d.id }
                        })),
                        empty: results.length === 0,
                        size: results.length
                    };
                },
                async add(data: any) {
                    const id = Math.random().toString(36).substr(2, 9);
                    const doc = { ...data, id };
                    collData.push(doc);
                    return { id };
                },
                doc(id: string) {
                    return {
                        id,
                        async update(updates: any) {
                            const index = collData.findIndex(d => d.id === id);
                            if (index !== -1) collData[index] = { ...collData[index], ...updates };
                        },
                        async delete() {
                            const index = collData.findIndex(d => d.id === id);
                            if (index !== -1) collData.splice(index, 1);
                        },
                        async get() {
                            const doc = collData.find(d => d.id === id);
                            return {
                                exists: !!doc,
                                dataStatus: () => doc, // Simplified
                                data: () => doc,
                                id
                            };
                        },
                        async set(data: any) {
                            const index = collData.findIndex(d => d.id === id);
                            if (index !== -1) collData[index] = { ...data, id };
                            else collData.push({ ...data, id });
                        }
                    };
                }
            };
            return query;
        }
    };

    db = mockDb;
    adminAuth = {
        verifyIdToken: async (token: string) => ({ uid: "dev-user", email: "dev@proveniq.com" }),
    };
} else {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    }
    adminAuth = admin.auth();
    db = admin.firestore();
}

export { adminAuth, db };

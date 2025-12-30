import { adminAuth } from "./firebase-admin";

export async function verifyServiceAuth(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("Unauthorized: Missing token");
    }
    const token = authHeader.split("Bearer ")[1];
    try {
        const decoded = await adminAuth.verifyIdToken(token);
        // Optionally, enforce organization membership here
        return decoded;
    } catch (err) {
        throw new Error("Unauthorized: Invalid token");
    }
}

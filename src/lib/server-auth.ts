import { adminAuth } from "./firebase-admin";

export async function verifyServiceAuth(req: Request) {
    const authHeader = req.headers.get("authorization");

    // In development/demo mode, allow bypass if no real token provided
    if (process.env.NODE_ENV === "development") {
        if (!authHeader?.startsWith("Bearer ")) {
            return { uid: "dev-user", email: "dev@proveniq.com", name: "Dev User" };
        }
    }

    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("Unauthorized: Missing token");
    }
    const token = authHeader.split("Bearer ")[1];
    try {
        const decoded = await adminAuth.verifyIdToken(token);
        return decoded;
    } catch (err) {
        if (process.env.NODE_ENV === "development") {
            return { uid: "dev-user", email: "dev@proveniq.com", name: "Dev User" };
        }
        throw new Error("Unauthorized: Invalid token");
    }
}

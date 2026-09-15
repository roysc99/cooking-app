import admin from "firebase-admin";
import { readFileSync } from "node:fs";

// credentials are loaded from the file path in backend/.env
export function connectFirestore() {
  const serviceAccount = JSON.parse(
    readFileSync(process.env.FIREBASE_CREDENTIALS_PATH, "utf8"),
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin.firestore();
}

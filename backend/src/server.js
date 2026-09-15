import { createApp } from "./app.js";
import { connectFirestore } from "./firebase.js";

// allow the phone to connect over the local Wi-Fi network
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
try {
  const db = connectFirestore();
  createApp(db).listen(port, host, () => {
    console.log(`Recipe backend running at http://${host}:${port}`);
  });
} catch (error) {
  console.error("Could not start backend");
  console.error(error.message);
  process.exitCode = 1;
}

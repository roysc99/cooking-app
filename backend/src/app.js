import express from "express";
import cors from "cors";

export function createApp(db) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "16kb" }));

  // this only checks that the server is running
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // get all saved recipes from the shared favorites collection
  app.get("/favorites", async (_req, res) => {
    const snapshot = await db.collection("favorites").get();
    const favorites = snapshot.docs.map((doc) => ({
      ...doc.data(),
      mealId: doc.id,
    }));
    res.json(favorites);
  });

  app.post("/favorites", async (req, res) => {
    const { mealId, name, image } = req.body || {};
    try {
      if (new URL(image).protocol !== "https:") throw new Error();
    } catch {
      return res.status(400).json({ error: "The image must be an HTTPS URL." });
    }
    const favorite = { mealId, name: name.trim(), image };
    // using the meal id prevents duplicate favorites
    await db.collection("favorites").doc(mealId).set(favorite);
    res.status(200).json(favorite);
  });

  app.delete("/favorites/:mealId", async (req, res) => {
    await db.collection("favorites").doc(req.params.mealId).delete();
    res.sendStatus(204);
  });

  return app;
}

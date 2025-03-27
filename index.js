// index.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Pour accepter du JSON dans le body des requêtes
app.use(express.json());

// Exemple d'une route GET pour tester
app.get("/", (req, res) => {
  res.send("Hello from License Checker!");
});

// Route POST /check-license
// (on attend un body avec { licenseKey: "CO-1Y-xxx-..." })
app.post("/check-license", (req, res) => {
  const { licenseKey } = req.body;

  // Ici tu feras ta logique de vérification
  // (ex: comparer à une base, vérifier date expiration, etc.)
  // Pour l’instant, simulons une réponse :
  if (!licenseKey) {
    return res.status(400).json({ valid: false, reason: "No licenseKey provided" });
  }

  // Exemple bidon : si la clé contient "ABCD" on dit valide, sinon non
  if (licenseKey.includes("ABCD")) {
    return res.json({ valid: true, message: "License valid" });
  } else {
    return res.json({ valid: false, reason: "Invalid key" });
  }
});

app.listen(PORT, () => {
  console.log(`License Checker API listening on port ${PORT}`);
});

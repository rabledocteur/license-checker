// Serveur de vérification de licences pour Rabbytech

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = 'https://kusrbhhojsbibclikjpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3JiaGhvanNiaWJjbGlranBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA5NzAzNCwiZXhwIjoyMDU4NjczMDM0fQ.3mLYftk8CFi0tBsy09jMR7MehKdkSPTZ3cnbfcWRDmk';
const supabase = createClient(supabaseUrl, supabaseKey);

const SECRET_KEY = 'Clients_Oiseaux_RabbyTech2025!';

app.use(express.json());

app.post('/checkLicense', async (req, res) => {
  const { licenseKey } = req.body;
  const version = "pro"; // codé en dur


  if (!licenseKey || !version) {
    return res.status(400).json({ valid: false, message: 'Clé de licence ou version manquante.' });
  }

  try {
    const { data, error } = await supabase
      .from('licences')
      .select('*')
      .eq('license_key', licenseKey)
      .single();

    if (error || !data) {
      return res.status(404).json({ valid: false, message: 'Licence non trouvée.' });
    }

    // ✅ Vérification de la version
    if (data.version !== version) {
      return res.status(403).json({ valid: false, message: 'Cette licence ne correspond pas à cette version du workflow.' });
    }

    const now = new Date();
    const expirationDate = new Date(data.expiration_date);

    if (data.type !== 'LT' && expirationDate < now) {
      return res.status(400).json({ valid: false, message: 'Licence expirée.' });
    }

    const token = jwt.sign(
      {
        licenseKey,
        version,
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
      },
      SECRET_KEY
    );

    res.json({
      valid: true,
      message: 'Licence valide.',
      type: data.type,
      expiration_date: data.expiration_date,
      token,
    });

  } catch (err) {
    res.status(500).json({ valid: false, message: 'Erreur serveur.' });
  }
});

// 🔒 Route pour les actions sensibles
app.post('/actionSensible', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token manquant.' });

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, SECRET_KEY);
    res.json({ message: 'Action réalisée avec succès !' });
  } catch (err) {
    res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
});

// 🚀 Démarrage du serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

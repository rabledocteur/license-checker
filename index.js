const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const app = express(); // ← CETTE LIGNE EST ESSENTIELLE

const port = process.env.PORT || 3000;

const supabaseUrl = 'https://kusrbhhojsbibclikjpa.supabase.co';
const supabaseKey = 'eyJh...WRDmk';
const supabase = createClient(supabaseUrl, supabaseKey);

const SECRET_KEY = 'Clients_Oiseaux_RabbyTech2025!';

app.use(express.json());

app.post('/checkLicense', async (req, res) => {
  const { licenseKey, version } = req.body;

  if (!licenseKey || !version) {
    return res.status(400).json({ valid: false, message: 'Clé de licence ou version manquante.' });
  }

  try {
    // 🔐 On vérifie la clé ET la version
    const { data, error } = await supabase
      .from('licences')
      .select('*')
      .eq('license_key', licenseKey)
      .eq('version', version)
      .single();

    if (error || !data) {
      return res.status(404).json({ valid: false, message: 'Licence non trouvée ou version incorrecte.' });
    }

    const now = new Date();
    const expirationDate = new Date(data.expiration_date);

    if (data.type !== 'LT' && expirationDate < now) {
      return res.status(400).json({ valid: false, message: 'Licence expirée.' });
    }

    // ✅ Génération du JWT sécurisé
    const token = jwt.sign(
      { licenseKey, version, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, // valable 1h
      SECRET_KEY
    );

    res.json({
      valid: true,
      message: 'Licence valide.',
      type: data.type,
      version: data.version,
      expiration_date: data.expiration_date,
      token
    });

  } catch (err) {
    res.status(500).json({ valid: false, message: 'Erreur serveur.' });
  }
});

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Configuration Supabase
const supabaseUrl = 'https://kusrbhhojsbibclikjpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3JiaGhvanNiaWJjbGlranBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA5NzAzNCwiZXhwIjoyMDU4NjczMDM0fQ.3mLYftk8CFi0tBsy09jMR7MehKdkSPTZ3cnbfcWRDmk';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// Endpoint de vérification de licence
app.post('/checkLicense', async (req, res) => {
  const { licenseKey } = req.body;
  
  if (!licenseKey) {
    return res.status(400).json({ valid: false, message: 'Clé de licence manquante.' });
  }

  try {
    const { data, error } = await supabase
      .from('licences')
      .select('*')
      .eq('license_key', licenseKey)
      .single();

    if (error) {
      return res.status(500).json({ valid: false, message: error.message });
    }
    if (!data) {
      return res.status(404).json({ valid: false, message: 'Licence non trouvée.' });
    }

    // Vérification de la licence selon son type
    const now = new Date();
    const expirationDate = new Date(data.expiration_date);

    if (data.type !== 'LT' && expirationDate < now) {
      return res.status(400).json({ valid: false, message: 'Licence expirée.' });
    }

    res.json({ valid: true, message: 'Licence valide.', type: data.type, expiration_date: data.expiration_date });

  } catch (err) {
    res.status(500).json({ valid: false, message: 'Erreur serveur.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

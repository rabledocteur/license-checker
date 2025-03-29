require('dotenv').config();
const { Pool } = require('pg');

// On construit l'objet de configuration à partir des variables d'env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // Supabase nécessite souvent cette config
  }
});

// Petite fonction utilitaire pour exécuter des requêtes
function query(text, params, callback) {
  return pool.query(text, params, callback);
}

// Test de la connexion au démarrage
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('TOP ! Connexion établie, date/heure:', res.rows[0].now);
  } catch (error) {
    console.error('Erreur lors de la connexion ou de la requête:', error);
  }
})();

module.exports = {
  query,
};
